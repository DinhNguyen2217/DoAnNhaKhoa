from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from accounts.permissions import IsAdmin, IsDoctor, IsAdminOrDoctorOrReceptionist, IsAdminOrReceptionist
from .models import MedicalRecord, TreatmentPlan, TreatmentSession, Prescription, PrescriptionItem
from .serializers import (
    MedicalRecordSerializer, MedicalRecordCreateSerializer, MedicalRecordUpdateSerializer,
    TreatmentPlanSerializer, TreatmentPlanCreateSerializer,
    TreatmentSessionSerializer,
    PrescriptionSerializer, PrescriptionCreateSerializer,
)


class MedicalRecordViewSet(viewsets.ModelViewSet):
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['doctor', 'patient', 'is_completed']
    search_fields = [
        'patient__user__first_name', 'patient__user__last_name',
        'diagnosis', 'chief_complaint',
    ]
    ordering_fields = ['created_at']

    def get_queryset(self):
        user = self.request.user
        qs = MedicalRecord.objects.select_related(
            'appointment', 'appointment__service', 'appointment__invoice',
            'doctor__user', 'patient__user'
        ).prefetch_related('prescription__items', 'treatment_plans')
        if user.role == 'doctor':
            try:
                return qs.filter(doctor=user.doctor_profile)
            except Exception:
                return qs.none()
        if user.role == 'patient':
            try:
                patient = user.patient_profile
            except Exception:
                from patients.models import Patient
                patient, _ = Patient.objects.get_or_create(user=user)
            return qs.filter(patient=patient)
        return qs.all()

    def get_permissions(self):
        if self.action == 'create':
            return [IsDoctor()]
        if self.action in ['update', 'partial_update']:
            return [IsDoctor()]
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsAdmin()]

    def get_serializer_class(self):
        if self.action == 'create':
            return MedicalRecordCreateSerializer
        if self.action in ['update', 'partial_update']:
            return MedicalRecordUpdateSerializer
        return MedicalRecordSerializer

    def perform_create(self, serializer):
        from django.utils import timezone
        from decimal import Decimal
        from invoices.models import Invoice, InvoiceItem

        appointment = serializer.validated_data['appointment']
        doctor = self.request.user.doctor_profile
        patient = appointment.patient
        record = serializer.save(doctor=doctor, patient=patient, is_completed=True)

        # 1. Cập nhật trạng thái lịch hẹn sang 'completed' (đã khám xong)
        appointment.status = 'completed'
        appointment.completed_at = timezone.now()
        appointment.save()

        # 2. Xử lý đơn thuốc nếu có trong request.data
        medicines_text = self.request.data.get('medicines') or self.request.data.get('prescription')
        advice_text = self.request.data.get('advice') or self.request.data.get('prescription_notes') or ''
        if medicines_text:
            prescription, _ = Prescription.objects.get_or_create(
                medical_record=record,
                defaults={
                    'doctor': doctor,
                    'patient': patient,
                    'notes': advice_text
                }
            )
            if isinstance(medicines_text, str) and medicines_text.strip():
                prescription.items.all().delete()
                lines = [l.strip() for l in medicines_text.split('\n') if l.strip()]
                for line in lines:
                    PrescriptionItem.objects.create(
                        prescription=prescription,
                        medicine_name=line,
                        dosage='',
                        instructions=advice_text
                    )
            elif isinstance(medicines_text, list):
                prescription.items.all().delete()
                for item in medicines_text:
                    if isinstance(item, dict):
                        PrescriptionItem.objects.create(
                            prescription=prescription,
                            medicine_name=item.get('medicine_name', ''),
                            dosage=item.get('dosage', ''),
                            frequency=item.get('frequency', ''),
                            duration=item.get('duration', ''),
                            instructions=item.get('instructions', ''),
                            quantity=item.get('quantity', '')
                        )

        # 3. Tự động lập hóa đơn (Invoice) chờ lễ tân thu tiền
        if not hasattr(appointment, 'invoice'):
            subtotal = Decimal('0')
            deposit_deducted = Decimal('100000') if appointment.deposit_status == 'verified' else Decimal('0')

            invoice = Invoice.objects.create(
                appointment=appointment,
                patient=patient,
                status='pending',
                deposit_deducted=deposit_deducted,
                created_by=self.request.user
            )

            # Thêm dòng dịch vụ đã đăng ký
            if appointment.service:
                service_price = appointment.service.price
                InvoiceItem.objects.create(
                    invoice=invoice,
                    service=appointment.service,
                    description=f'Dịch vụ: {appointment.service.name}',
                    quantity=1,
                    unit_price=service_price,
                    subtotal=service_price
                )
                subtotal += service_price

            # Thêm công khám của bác sĩ nếu có
            if doctor.consultation_fee and doctor.consultation_fee > 0:
                InvoiceItem.objects.create(
                    invoice=invoice,
                    description=f'Công khám chuyên khoa - BS. {doctor.user.get_full_name() or doctor.user.username}',
                    quantity=1,
                    unit_price=doctor.consultation_fee,
                    subtotal=doctor.consultation_fee
                )
                subtotal += doctor.consultation_fee

            invoice.subtotal = subtotal
            invoice.total_amount = max(Decimal('0'), subtotal - deposit_deducted)
            invoice.save()

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        user = request.user
        # Bác sĩ chỉ sửa hồ sơ của mình
        if user.role == 'doctor' and instance.doctor != user.doctor_profile:
            return Response({'detail': 'Không có quyền.'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    @action(detail=True, methods=['post'], url_path='complete', permission_classes=[IsDoctor])
    def complete_record(self, request, pk=None):
        """Bác sĩ hoàn tất hồ sơ khám"""
        record = self.get_object()
        if record.doctor != request.user.doctor_profile:
            return Response({'detail': 'Không có quyền.'}, status=status.HTTP_403_FORBIDDEN)
        record.is_completed = True
        record.save()
        # Cập nhật trạng thái lịch hẹn nếu chưa complete
        if record.appointment.status == 'in_progress':
            record.appointment.status = 'completed'
            record.appointment.save()
        return Response(MedicalRecordSerializer(record).data)


class TreatmentPlanViewSet(viewsets.ModelViewSet):
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['patient', 'doctor', 'status']
    search_fields = ['title', 'description', 'patient__user__first_name', 'patient__user__last_name']

    def get_queryset(self):
        user = self.request.user
        qs = TreatmentPlan.objects.select_related(
            'patient__user', 'doctor__user'
        ).prefetch_related('sessions')
        if user.role == 'doctor':
            return qs.filter(doctor=user.doctor_profile)
        if user.role == 'patient':
            return qs.filter(patient=user.patient_profile)
        return qs.all()

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update']:
            return [IsDoctor()]
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsAdmin()]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return TreatmentPlanCreateSerializer
        return TreatmentPlanSerializer

    def perform_create(self, serializer):
        serializer.save(doctor=self.request.user.doctor_profile)

    @action(detail=True, methods=['post'], url_path='add-session', permission_classes=[IsDoctor])
    def add_session(self, request, pk=None):
        """Thêm một buổi điều trị vào kế hoạch"""
        plan = self.get_object()
        if plan.doctor != request.user.doctor_profile:
            return Response({'detail': 'Không có quyền.'}, status=status.HTTP_403_FORBIDDEN)
        next_number = plan.sessions.count() + 1
        serializer = TreatmentSessionSerializer(data={
            **request.data,
            'plan': plan.id,
            'session_number': next_number,
        })
        serializer.is_valid(raise_exception=True)
        session = serializer.save(plan=plan, session_number=next_number)
        if session.is_completed:
            plan.completed_sessions = plan.sessions.filter(is_completed=True).count()
            if plan.completed_sessions >= plan.estimated_sessions:
                plan.status = 'completed'
            else:
                plan.status = 'in_progress'
            plan.save()
        return Response(TreatmentSessionSerializer(session).data, status=status.HTTP_201_CREATED)


class PrescriptionViewSet(viewsets.ModelViewSet):
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['doctor', 'patient', 'medical_record']

    def get_queryset(self):
        user = self.request.user
        qs = Prescription.objects.select_related(
            'doctor__user', 'patient__user'
        ).prefetch_related('items')
        if user.role == 'doctor':
            return qs.filter(doctor=user.doctor_profile)
        if user.role == 'patient':
            return qs.filter(patient=user.patient_profile)
        return qs.all()

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsDoctor()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return PrescriptionCreateSerializer
        return PrescriptionSerializer

    def perform_create(self, serializer):
        medical_record = serializer.validated_data.get('medical_record')
        if medical_record:
            serializer.save(
                doctor=self.request.user.doctor_profile,
                patient=medical_record.patient,
                medical_record=medical_record,
            )
        else:
            serializer.save(doctor=self.request.user.doctor_profile)
