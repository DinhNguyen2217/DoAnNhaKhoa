from datetime import date
from decimal import Decimal
from django.utils import timezone
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from accounts.models import User
from accounts.permissions import IsAdmin, IsDoctor, IsAdminOrReceptionist
from appointments.models import Appointment
from .models import DoctorSchedule, StaffSalaryConfig, PayrollRecord
from .serializers import (
    DoctorScheduleSerializer,
    DoctorScheduleCreateSerializer,
    DoctorScheduleAdminUpdateSerializer,
    StaffSalaryConfigSerializer,
    PayrollRecordSerializer,
)


class DoctorScheduleViewSet(viewsets.ModelViewSet):
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['doctor', 'date', 'session', 'status']
    search_fields = ['doctor__user__first_name', 'doctor__user__last_name']
    ordering_fields = ['date', 'created_at']

    def get_queryset(self):
        user = self.request.user
        # Bác sĩ chỉ xem lịch của mình
        if user.role == 'doctor':
            return DoctorSchedule.objects.filter(
                doctor=user.doctor_profile
            ).select_related('doctor__user').order_by('-date')
        # Admin, lễ tân xem tất cả
        return DoctorSchedule.objects.select_related('doctor__user').all().order_by('-date')

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'by_date', 'daily_overview']:
            return [IsAuthenticated()]
        if self.action == 'create':
            return [IsDoctor()]
        if self.action in ['update', 'partial_update', 'destroy']:
            # Bác sĩ sửa lịch của mình, Admin sửa tất cả
            return [IsAuthenticated()]
        return [IsAdmin()]

    def get_serializer_class(self):
        if self.action == 'create':
            return DoctorScheduleCreateSerializer
        if self.action in ['update', 'partial_update']:
            user = self.request.user
            if user.role == 'admin':
                return DoctorScheduleAdminUpdateSerializer
            return DoctorScheduleCreateSerializer
        return DoctorScheduleSerializer

    def perform_create(self, serializer):
        doctor = self.request.user.doctor_profile
        serializer.save(doctor=doctor, status='registered')

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        user = request.user
        # Bác sĩ chỉ được sửa lịch của mình
        if user.role == 'doctor' and instance.doctor != user.doctor_profile:
            return Response({'detail': 'Bạn không có quyền sửa lịch này.'}, status=status.HTTP_403_FORBIDDEN)
        # Khi admin sửa, đánh dấu status là modified
        partial = kwargs.pop('partial', False)
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        if user.role == 'admin':
            serializer.save(status='modified')
        else:
            serializer.save()
        return Response(DoctorScheduleSerializer(instance).data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        user = request.user
        # Bác sĩ chỉ xóa lịch của mình, admin xóa tất cả
        if user.role == 'doctor' and instance.doctor != user.doctor_profile:
            return Response({'detail': 'Bạn không có quyền xóa lịch này.'}, status=status.HTTP_403_FORBIDDEN)
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'], url_path='my-schedules')
    def my_schedules(self, request):
        """Bác sĩ xem lịch của mình"""
        if request.user.role != 'doctor':
            return Response({'detail': 'Chỉ dành cho bác sĩ.'}, status=status.HTTP_403_FORBIDDEN)
        schedules = DoctorSchedule.objects.filter(
            doctor=request.user.doctor_profile
        ).order_by('-date')
        serializer = DoctorScheduleSerializer(schedules, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='by-date')
    def by_date(self, request):
        """Lấy lịch làm việc theo ngày - dùng cho trang đặt lịch hẹn"""
        date_param = request.query_params.get('date')
        if not date_param:
            return Response({'detail': 'Vui lòng cung cấp ngày (date).'}, status=status.HTTP_400_BAD_REQUEST)
        schedules = DoctorSchedule.objects.filter(
            date=date_param, status__in=['registered', 'approved', 'modified']
        ).select_related('doctor__user')
        serializer = DoctorScheduleSerializer(schedules, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='daily-overview')
    def daily_overview(self, request):
        """
        Admin xem giám sát ca làm việc theo ngày:
        Biết được ngày hôm đó có ai đi làm và làm gì (danh sách bệnh nhân, công việc phụ trách).
        """
        target_date_str = request.query_params.get('date')
        if target_date_str:
            try:
                target_date = date.fromisoformat(target_date_str)
            except ValueError:
                target_date = date.today()
        else:
            target_date = date.today()

        schedules = DoctorSchedule.objects.filter(
            date=target_date,
            status__in=['registered', 'approved', 'modified']
        ).select_related('doctor__user')

        schedule_data = []
        total_patients_today = 0
        total_completed_today = 0

        for s in schedules:
            doctor = s.doctor
            apps = Appointment.objects.filter(
                doctor=doctor,
                appointment_date=target_date
            ).exclude(status='cancelled').select_related('patient__user', 'service')

            patient_list = []
            for a in apps:
                diag = ''
                if hasattr(a, 'medical_record'):
                    diag = a.medical_record.diagnosis

                inv_status = 'none'
                inv_total = 0
                if hasattr(a, 'invoice'):
                    inv_status = a.invoice.status
                    inv_total = float(a.invoice.total_amount)

                patient_list.append({
                    'id': a.id,
                    'patient_name': a.patient.user.get_full_name() or a.patient.user.username,
                    'phone': getattr(a.patient.user, 'phone', ''),
                    'service_name': a.service.name if a.service else 'Khám nha khoa tổng quát',
                    'session': a.session,
                    'session_display': a.get_session_display(),
                    'status': a.status,
                    'status_display': a.get_status_display(),
                    'reason': a.reason,
                    'has_medical_record': hasattr(a, 'medical_record'),
                    'diagnosis': diag,
                    'invoice_status': inv_status,
                    'invoice_total': inv_total,
                })

            completed_cnt = apps.filter(status='completed').count()
            total_patients_today += apps.count()
            total_completed_today += completed_cnt

            schedule_data.append({
                'schedule_id': s.id,
                'doctor_id': doctor.id,
                'doctor_name': doctor.user.get_full_name() or doctor.user.username,
                'specialty': doctor.specialty,
                'phone': getattr(doctor.user, 'phone', ''),
                'session': s.session,
                'session_display': s.get_session_display(),
                'status': s.status,
                'status_display': s.get_status_display(),
                'note': s.note,
                'total_booked': apps.count(),
                'morning_booked': apps.filter(session='morning').count(),
                'afternoon_booked': apps.filter(session='afternoon').count(),
                'completed_count': completed_cnt,
                'patients': patient_list,
            })

        # Danh sách nhân viên lễ tân hỗ trợ ngày hôm đó
        receptionists = User.objects.filter(role='receptionist', is_active=True)
        receptionist_list = [
            {
                'id': r.id,
                'name': r.get_full_name() or r.username,
                'phone': r.phone,
                'role': 'Lễ tân tiếp đón & Thu ngân viện phí',
                'task': f'Tiếp nhận bệnh nhân, xác nhận cọc và thu ngân cho {total_patients_today} lượt khám'
            }
            for r in receptionists
        ]

        return Response({
            'date': str(target_date),
            'total_doctors_working': len(schedule_data),
            'total_patients_booked': total_patients_today,
            'total_completed': total_completed_today,
            'doctors_working': schedule_data,
            'receptionists': receptionist_list,
        })


class StaffSalaryConfigViewSet(viewsets.ModelViewSet):
    """
    Admin quản lý và tùy chỉnh mức lương cho Bác sĩ & Nhân viên.
    Admin có thể định giá riêng: Lương ca trực, lương cứng, hoa hồng lượt khám.
    """
    permission_classes = [IsAdmin]
    serializer_class = StaffSalaryConfigSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['user__first_name', 'user__last_name', 'user__username']

    def get_queryset(self):
        # Đảm bảo tất cả bác sĩ và lễ tân đều có bản ghi config
        staff_users = User.objects.filter(role__in=['doctor', 'receptionist'])
        for u in staff_users:
            StaffSalaryConfig.objects.get_or_create(
                user=u,
                defaults={
                    'base_salary': 5000000 if u.role == 'receptionist' else 0,
                    'shift_rate': 400000 if u.role == 'doctor' else 200000,
                    'commission_per_patient': 50000 if u.role == 'doctor' else 10000,
                    'allowance': 500000,
                    'note': 'Chế độ đãi ngộ phòng khám'
                }
            )
        return StaffSalaryConfig.objects.select_related('user').all().order_by('user__role', 'user__first_name')


class PayrollRecordViewSet(viewsets.ModelViewSet):
    """
    Admin xem, tự động tính toán và quản lý bảng lương hàng tháng.
    """
    permission_classes = [IsAdmin]
    serializer_class = PayrollRecordSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['month', 'year', 'status']
    ordering_fields = ['year', 'month', 'net_salary']

    def get_queryset(self):
        return PayrollRecord.objects.select_related('user').all().order_by('-year', '-month', 'user__role')

    @action(detail=False, methods=['post'], url_path='calculate')
    def calculate(self, request):
        """
        Tự động tính toán bảng lương tháng cho tất cả nhân sự:
        Số ca làm việc thực tế * Đơn giá lương ca + Lương cứng + Hoa hồng lượt khám + Phụ cấp.
        """
        today = date.today()
        month = int(request.data.get('month', today.month))
        year = int(request.data.get('year', today.year))

        staff_users = User.objects.filter(role__in=['doctor', 'receptionist'], is_active=True)
        results = []

        for u in staff_users:
            cfg, _ = StaffSalaryConfig.objects.get_or_create(
                user=u,
                defaults={
                    'base_salary': 5000000 if u.role == 'receptionist' else 0,
                    'shift_rate': 400000 if u.role == 'doctor' else 200000,
                    'commission_per_patient': 50000 if u.role == 'doctor' else 10000,
                    'allowance': 500000,
                    'note': 'Chế độ đãi ngộ phòng khám'
                }
            )

            if u.role == 'doctor':
                schedules = DoctorSchedule.objects.filter(
                    doctor__user=u,
                    date__year=year,
                    date__month=month,
                    status__in=['registered', 'approved', 'modified']
                )
                morning_cnt = schedules.filter(session__in=['morning', 'full']).count()
                afternoon_cnt = schedules.filter(session__in=['afternoon', 'full']).count()
                total_shifts = Decimal(str(morning_cnt + afternoon_cnt))

                total_patients = Appointment.objects.filter(
                    doctor__user=u,
                    appointment_date__year=year,
                    appointment_date__month=month,
                    status='completed'
                ).count()
            else:
                # Lễ tân: tính theo số ca làm việc chuẩn
                total_shifts = Decimal('44.0')
                morning_cnt = 22
                afternoon_cnt = 22
                total_patients = Appointment.objects.filter(
                    appointment_date__year=year,
                    appointment_date__month=month,
                    status='completed'
                ).count()

            shift_salary = total_shifts * cfg.shift_rate
            base_sal = cfg.base_salary
            comm_amt = total_patients * cfg.commission_per_patient
            allowance_amt = cfg.allowance

            payroll, created = PayrollRecord.objects.get_or_create(
                user=u,
                month=month,
                year=year,
                defaults={
                    'total_shifts': total_shifts,
                    'morning_shifts': morning_cnt,
                    'afternoon_shifts': afternoon_cnt,
                    'total_patients_examined': total_patients,
                    'shift_rate_applied': cfg.shift_rate,
                    'shift_salary': shift_salary,
                    'base_salary': base_sal,
                    'commission_amount': comm_amt,
                    'allowance': allowance_amt,
                    'bonus': Decimal('0'),
                    'deduction': Decimal('0'),
                    'net_salary': shift_salary + base_sal + comm_amt + allowance_amt,
                    'status': 'draft',
                }
            )

            if not created:
                # Cập nhật số công và đơn giá mới nhất, giữ nguyên bonus/deduction do admin đã chỉnh sửa
                payroll.total_shifts = total_shifts
                payroll.morning_shifts = morning_cnt
                payroll.afternoon_shifts = afternoon_cnt
                payroll.total_patients_examined = total_patients
                payroll.shift_rate_applied = cfg.shift_rate
                payroll.shift_salary = shift_salary
                payroll.base_salary = base_sal
                payroll.commission_amount = comm_amt
                payroll.allowance = allowance_amt
                payroll.net_salary = max(
                    Decimal('0'),
                    shift_salary + base_sal + comm_amt + allowance_amt + payroll.bonus - payroll.deduction
                )
                payroll.save()

            results.append(PayrollRecordSerializer(payroll).data)

        return Response({
            'month': month,
            'year': year,
            'total_staff': len(results),
            'payrolls': results
        })

    @action(detail=True, methods=['post'], url_path='mark-paid')
    def mark_paid(self, request, pk=None):
        """Xác nhận đã chi trả lương cho nhân sự"""
        payroll = self.get_object()
        payment_method = request.data.get('payment_method', 'Chuyển khoản')
        note = request.data.get('note', '')

        payroll.status = 'paid'
        payroll.paid_at = timezone.now()
        payroll.payment_method = payment_method
        if note:
            payroll.note = note
        payroll.save()

        return Response(PayrollRecordSerializer(payroll).data)
