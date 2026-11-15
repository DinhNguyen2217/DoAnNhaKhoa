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
            return qs.filter(patient=patient, is_hidden_by_patient=False).order_by('-appointment_date', '-id')
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
        if self.action in ['confirm_deposit', 'check_in']:
            return [IsAdminOrReceptionist()]
        if self.action in ['cancel_appointment', 'patient_delete']:
            return [IsAuthenticated()]
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
        serializer.save(patient=patient, status='confirmed', deposit_amount=0, deposit_status='not_paid')

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

    @action(detail=True, methods=['post'], url_path='cancel', permission_classes=[IsAuthenticated])
    def cancel_appointment(self, request, pk=None):
        """Hủy lịch hẹn (Bệnh nhân tự hủy trong 30 phút; Lễ tân/Admin hủy bất cứ lúc nào)"""
        appointment = self.get_object()
        user = request.user

        if user.role == 'patient':
            from patients.models import Patient
            patient, _ = Patient.objects.get_or_create(user=user)
            if appointment.patient != patient:
                return Response({'detail': 'Bạn không có quyền thao tác trên lịch hẹn này.'}, status=status.HTTP_403_FORBIDDEN)
            if appointment.status in ['cancelled', 'completed', 'checked_in', 'in_progress']:
                return Response({'detail': f'Không thể hủy lịch hẹn đã ở trạng thái {appointment.get_status_display()}.'}, status=status.HTTP_400_BAD_REQUEST)
            if appointment.created_at:
                diff = timezone.now() - appointment.created_at
                if diff.total_seconds() > 30 * 60:
                    return Response({
                        'detail': 'Đã quá thời hạn 30 phút kể từ lúc đặt lịch. Quý khách vui lòng liên hệ nhân viên lễ tân (Hotline/Zalo 0901.234.567) để được hỗ trợ hủy hoặc điều chỉnh thông tin!'
                    }, status=status.HTTP_400_BAD_REQUEST)

        serializer = AppointmentCancelSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        appointment.status = 'cancelled'
        appointment.cancellation_reason = serializer.validated_data.get('cancellation_reason', '')
        if appointment.deposit_status == 'verified':
            appointment.deposit_status = 'forfeited'
        appointment.save()
        return Response(AppointmentSerializer(appointment).data)

    @action(detail=False, methods=['get'], url_path='booked-slots')
    def booked_slots(self, request):
        """
        Lấy danh sách các khung giờ 30 phút đã được đặt theo ngày, ca, bác sĩ.
        Nếu doctor='auto' hoặc rỗng, trả về các khung giờ mà TẤT CẢ bác sĩ trực đều đã kín.
        """
        date_str = request.query_params.get('date')
        doctor_id = request.query_params.get('doctor')
        session = request.query_params.get('session')

        if not date_str:
            return Response({'booked_slots': []})

        from .serializers import MORNING_SLOTS, AFTERNOON_SLOTS
        from schedules.models import DoctorSchedule
        from doctors.models import Doctor

        if session == 'morning':
            slots_to_check = MORNING_SLOTS
        elif session == 'afternoon':
            slots_to_check = AFTERNOON_SLOTS
        else:
            slots_to_check = MORNING_SLOTS + AFTERNOON_SLOTS

        if doctor_id and doctor_id not in ['auto', '', 'null', 'undefined']:
            booked = list(Appointment.objects.filter(
                appointment_date=date_str,
                doctor_id=doctor_id,
                time_slot__in=slots_to_check
            ).exclude(status='cancelled').values_list('time_slot', flat=True))
            return Response({'booked_slots': booked})
        else:
            active_doctors = Doctor.objects.filter(is_active=True)
            eligible_doctors = []
            for doc in active_doctors:
                sched = DoctorSchedule.objects.filter(doctor=doc, date=date_str, is_working=True).first()
                if sched:
                    if session == 'morning' and not sched.has_morning():
                        continue
                    if session == 'afternoon' and not sched.has_afternoon():
                        continue
                eligible_doctors.append(doc)

            if not eligible_doctors:
                return Response({'booked_slots': slots_to_check})

            booked = []
            for slot in slots_to_check:
                booked_doc_count = Appointment.objects.filter(
                    appointment_date=date_str,
                    doctor__in=eligible_doctors,
                    time_slot=slot
                ).exclude(status='cancelled').values('doctor').distinct().count()

                if booked_doc_count >= len(eligible_doctors):
                    booked.append(slot)

            return Response({'booked_slots': booked})

    @action(detail=True, methods=['post', 'delete'], url_path='patient-delete', permission_classes=[IsAuthenticated])
    def patient_delete(self, request, pk=None):
        """Bệnh nhân xóa lịch sử đặt lịch (Chỉ cho phép xóa lịch đã khám xong hoặc đã hủy)"""
        appointment = self.get_object()
        user = request.user

        if user.role == 'patient':
            from patients.models import Patient
            patient, _ = Patient.objects.get_or_create(user=user)
            if appointment.patient != patient:
                return Response({'detail': 'Bạn không có quyền thao tác trên lịch hẹn này.'}, status=status.HTTP_403_FORBIDDEN)

        if appointment.status not in ['completed', 'cancelled']:
            return Response({
                'detail': 'Chỉ có thể xóa lịch sử những buổi hẹn đã khám hoàn tất hoặc đã hủy. Lịch hẹn đang đợi khám hoặc đang trong quá trình khám không được phép xóa!'
            }, status=status.HTTP_400_BAD_REQUEST)

        appointment.is_hidden_by_patient = True
        appointment.save()
        return Response({'detail': 'Đã xóa lịch hẹn khỏi danh sách lịch sử thành công.'}, status=status.HTTP_200_OK)

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
        appointments = Appointment.objects.filter(
            patient=patient,
            is_hidden_by_patient=False
        ).select_related(
            'doctor__user', 'service', 'schedule'
        ).order_by('-appointment_date', '-id')
        page = self.paginate_queryset(appointments)
        if page is not None:
            serializer = AppointmentSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        return Response(AppointmentSerializer(appointments, many=True).data)
