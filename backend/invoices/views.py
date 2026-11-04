from django.utils import timezone
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from accounts.permissions import IsAdmin, IsAdminOrReceptionist
from .models import Invoice, InvoiceItem
from .serializers import (
    InvoiceSerializer, InvoiceCreateSerializer, InvoiceUpdateSerializer,
    InvoiceItemSerializer, InvoiceItemCreateSerializer, PaymentSerializer,
)


class InvoiceViewSet(viewsets.ModelViewSet):
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'payment_method', 'patient']
    search_fields = ['patient__user__first_name', 'patient__user__last_name']
    ordering_fields = ['created_at', 'total_amount', 'paid_at']

    def get_queryset(self):
        user = self.request.user
        qs = Invoice.objects.select_related(
            'appointment', 'patient__user', 'created_by'
        ).prefetch_related('items__service')
        if user.role == 'patient':
            return qs.filter(patient=user.patient_profile)
        return qs.all()

    def get_permissions(self):
        if self.action == 'create':
            return [IsAdminOrReceptionist()]
        if self.action in ['update', 'partial_update']:
            return [IsAdminOrReceptionist()]
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        if self.action in ['confirm_payment', 'add_item', 'remove_item']:
            return [IsAdminOrReceptionist()]
        return [IsAdmin()]

    def get_serializer_class(self):
        if self.action == 'create':
            return InvoiceCreateSerializer
        if self.action in ['update', 'partial_update']:
            return InvoiceUpdateSerializer
        return InvoiceSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, status='pending')

    @action(detail=False, methods=['post'], url_path='create-from-appointment')
    def create_from_appointment(self, request):
        """Tạo hóa đơn từ một lịch hẹn (Bắt buộc phải có hồ sơ bệnh án)"""
        appointment_id = request.data.get('appointment_id')
        from appointments.models import Appointment
        from decimal import Decimal
        try:
            appointment = Appointment.objects.get(id=appointment_id)
        except Appointment.DoesNotExist:
            return Response({'detail': 'Lịch hẹn không tồn tại.'}, status=status.HTTP_404_NOT_FOUND)

        if not hasattr(appointment, 'medical_record'):
            return Response(
                {'detail': 'Bác sĩ chưa hoàn tất hồ sơ bệnh án cho lượt khám này. Lễ tân chưa thể lập hóa đơn tính tiền!'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if hasattr(appointment, 'invoice'):
            return Response(InvoiceSerializer(appointment.invoice).data)

        deposit_deducted = Decimal('100000') if appointment.deposit_status == 'verified' else Decimal('0')
        invoice = Invoice.objects.create(
            appointment=appointment,
            patient=appointment.patient,
            status='pending',
            deposit_deducted=deposit_deducted,
            created_by=request.user
        )
        subtotal = Decimal('0')
        if appointment.service:
            InvoiceItem.objects.create(
                invoice=invoice,
                service=appointment.service,
                description=f"Dịch vụ: {appointment.service.name}",
                quantity=1,
                unit_price=appointment.service.price,
                subtotal=appointment.service.price
            )
            subtotal += appointment.service.price

        if appointment.doctor and appointment.doctor.consultation_fee:
            InvoiceItem.objects.create(
                invoice=invoice,
                description=f"Công khám chuyên khoa - BS. {appointment.doctor.user.get_full_name() or appointment.doctor.user.username}",
                quantity=1,
                unit_price=appointment.doctor.consultation_fee,
                subtotal=appointment.doctor.consultation_fee
            )
            subtotal += appointment.doctor.consultation_fee

        invoice.subtotal = subtotal
        invoice.total_amount = max(Decimal('0'), subtotal - deposit_deducted)
        invoice.save()
        return Response(InvoiceSerializer(invoice).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='confirm-payment')
    def confirm_payment(self, request, pk=None):
        """Lễ tân xác nhận bệnh nhân đã thanh toán"""
        invoice = self.get_object()
        if invoice.status == 'paid':
            return Response({'detail': 'Hóa đơn đã được thanh toán.'}, status=status.HTTP_400_BAD_REQUEST)
        if invoice.status == 'cancelled':
            return Response({'detail': 'Hóa đơn đã bị hủy.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = PaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        invoice.payment_method = serializer.validated_data['payment_method']
        invoice.status = 'paid'
        invoice.paid_at = timezone.now()
        if serializer.validated_data.get('notes'):
            invoice.notes = serializer.validated_data['notes']
        invoice.save()
        return Response(InvoiceSerializer(invoice).data)

    @action(detail=True, methods=['post'], url_path='add-item')
    def add_item(self, request, pk=None):
        """Thêm dịch vụ vào hóa đơn (chỉ khi chưa thanh toán)"""
        invoice = self.get_object()
        if invoice.status in ['paid', 'cancelled']:
            return Response(
                {'detail': 'Không thể chỉnh sửa hóa đơn đã thanh toán hoặc đã hủy.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        serializer = InvoiceItemCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        item = InvoiceItem.objects.create(invoice=invoice, **serializer.validated_data)
        invoice.calculate_total()
        invoice.save()
        return Response(InvoiceItemSerializer(item).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete'], url_path='remove-item/(?P<item_id>[^/.]+)')
    def remove_item(self, request, pk=None, item_id=None):
        """Xóa một dịch vụ khỏi hóa đơn"""
        invoice = self.get_object()
        if invoice.status in ['paid', 'cancelled']:
            return Response(
                {'detail': 'Không thể chỉnh sửa hóa đơn đã thanh toán hoặc đã hủy.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            item = invoice.items.get(id=item_id)
            item.delete()
            invoice.calculate_total()
            invoice.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except InvoiceItem.DoesNotExist:
            return Response({'detail': 'Dịch vụ không tồn tại.'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel_invoice(self, request, pk=None):
        """Hủy hóa đơn"""
        invoice = self.get_object()
        if invoice.status == 'paid':
            return Response({'detail': 'Không thể hủy hóa đơn đã thanh toán.'}, status=status.HTTP_400_BAD_REQUEST)
        invoice.status = 'cancelled'
        invoice.save()
        return Response(InvoiceSerializer(invoice).data)
