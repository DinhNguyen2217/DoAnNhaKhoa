from django.utils import timezone
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from accounts.permissions import IsAdmin, IsAdminOrReceptionist, IsAdminOrDoctorOrReceptionist, IsPatient
from .models import Appointment
from .serializers import (
    AppointmentSerializer,
    AppointmentCreateSerializer,
    AppointmentUpdateStatusSerializer,
    DepositConfirmSerializer,
    CheckInSerializer,
    AppointmentCancelSerializer,
)


class AppointmentViewSet(viewsets.ModelViewSet):
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'session', 'deposit_status', 'doctor', 'appointment_date']
    search_fields = [
        'patient__user__first_name', 'patient__user__last_name',
        'doctor__user__first_name', 'doctor__user__last_name',
    ]
    ordering_fields = ['appointment_date', 'created_at', 'status']

    def get_queryset(self):
        user = self.request.user
        qs = Appointment.objects.select_related(
            'patient__user', 'doctor__user', 'service', 'schedule'
        )
        date_param = self.request.query_params.get('date')
        if date_param:
            qs = qs.filter(appointment_date=date_param)

        if user.role == 'patient':
            from patients.models import Patient
            patient, _ = Patient.objects.get_or_create(user=user)
            return qs.filter(patient=patient).order_by('-appointment_date')
        if user.role == 'doctor':
            from doctors.models import Doctor
            doctor, _ = Doctor.objects.get_or_create(user=user)
            return qs.filter(doctor=doctor).order_by('-appointment_date')
        return qs.all().order_by('-appointment_date')

    def get_permissions(self):
        if self.action == 'create':
            return [IsAuthenticated()]
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        if self.action in ['update', 'partial_update']:
            return [IsAdminOrReceptionist()]
        if self.action in ['confirm_deposit', 'check_in', 'cancel_appointment']:
            return [IsAdminOrReceptionist()]
        if self.action == 'destroy':
            return [IsAdmin()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == 'create':
            return AppointmentCreateSerializer
        if self.action in ['update', 'partial_update']:
            return AppointmentUpdateStatusSerializer
        return AppointmentSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        instance = serializer.instance
        return Response(AppointmentSerializer(instance).data, status=status.HTTP_201_CREATED)

    def perform_create(self, serializer):
        user = self.request.user
        from patients.models import Patient
        patient, _ = Patient.objects.get_or_create(user=user)
        serializer.save(patient=patient, status='pending', deposit_status='not_paid')

    # ── Actions ──────────────────────────────────────────────────────────────

    @action(detail=True, methods=['post'], url_path='notify-deposit')
    def notify_deposit(self, request, pk=None):
        """Bệnh nhân báo đã chuyển khoản đặt cọc"""
        appointment = self.get_object()
        user = request.user
        from patients.models import Patient
        patient, _ = Patient.objects.get_or_create(user=user)
        if user.role == 'patient' and appointment.patient != patient:
            return Response({'detail': 'Không có quyền.'}, status=status.HTTP_403_FORBIDDEN)
        appointment.deposit_status = 'pending_verification'
        appointment.status = 'deposited'
        note = request.data.get('note', '')
        if note:
            appointment.deposit_note = note
        appointment.save()
        return Response(AppointmentSerializer(appointment).data)

    @action(detail=True, methods=['post'], url_path='confirm-deposit', permission_classes=[IsAdminOrReceptionist])
    def confirm_deposit(self, request, pk=None):
        """Lễ tân xác nhận / từ chối đặt cọc"""
        appointment = self.get_object()
        serializer = DepositConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        appointment.deposit_status = data.get('deposit_status', 'verified')
        appointment.deposit_note = data.get('deposit_note', '')
        appointment.deposit_confirmed_at = timezone.now()

        if data.get('deposit_status', 'verified') == 'verified':
            appointment.status = 'confirmed'

        appointment.save()
        return Response(AppointmentSerializer(appointment).data)

    @action(detail=True, methods=['post'], url_path='check-in', permission_classes=[IsAdminOrReceptionist])
    def check_in(self, request, pk=None):
        """Lễ tân tiếp nhận bệnh nhân đến khám"""
        appointment = self.get_object()
        if appointment.status not in ['confirmed', 'deposited', 'pending']:
            return Response(
                {'detail': 'Trạng thái lịch hẹn không hợp lệ để tiếp nhận.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        serializer = CheckInSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        appointment.status = 'checked_in'
        appointment.checked_in_at = timezone.now()
        if serializer.validated_data.get('notes'):
            appointment.notes = serializer.validated_data['notes']
        appointment.save()
        return Response(AppointmentSerializer(appointment).data)

    @action(detail=True, methods=['post'], url_path='start-exam', permission_classes=[IsAdminOrDoctorOrReceptionist])
    def start_exam(self, request, pk=None):
        """Bắt đầu khám"""
        appointment = self.get_object()
        appointment.status = 'in_progress'
        appointment.save()
        return Response(AppointmentSerializer(appointment).data)

    @action(detail=True, methods=['post'], url_path='complete', permission_classes=[IsAdminOrDoctorOrReceptionist])
    def complete(self, request, pk=None):
        """Hoàn thành lịch hẹn"""
        appointment = self.get_object()
        appointment.status = 'completed'
        appointment.completed_at = timezone.now()
        appointment.save()
        return Response(AppointmentSerializer(appointment).data)

    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel_appointment(self, request, pk=None):
        """Hủy lịch hẹn"""
        appointment = self.get_object()
        user = request.user

        serializer = AppointmentCancelSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        appointment.status = 'cancelled'
        appointment.cancellation_reason = serializer.validated_data.get('cancellation_reason', '')
        if appointment.deposit_status == 'verified':
            appointment.deposit_status = 'forfeited'
        appointment.save()
        return Response(AppointmentSerializer(appointment).data)

    @action(detail=True, methods=['post'], url_path='mark-no-show', permission_classes=[IsAdminOrReceptionist])
    def mark_no_show(self, request, pk=None):
        """Đánh dấu bệnh nhân không đến"""
        appointment = self.get_object()
        appointment.status = 'no_show'
        if appointment.deposit_status == 'verified':
            appointment.deposit_status = 'forfeited'
        appointment.save()
        return Response(AppointmentSerializer(appointment).data)

    @action(detail=False, methods=['get'], url_path='my-appointments')
    def my_appointments(self, request):
        user = request.user
        from patients.models import Patient
        patient, _ = Patient.objects.get_or_create(user=user)
        appointments = Appointment.objects.filter(patient=patient).select_related(
            'doctor__user', 'service', 'schedule'
        ).order_by('-appointment_date')
        page = self.paginate_queryset(appointments)
        if page is not None:
            serializer = AppointmentSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        return Response(AppointmentSerializer(appointments, many=True).data)
