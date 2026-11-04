from datetime import date, timedelta
from decimal import Decimal

from django.db.models import Count, Sum, Q, Avg
from django.db.models.functions import TruncMonth, TruncWeek, TruncDate

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from accounts.permissions import IsAdmin, IsAdminOrReceptionist
from appointments.models import Appointment
from doctors.models import Doctor
from invoices.models import Invoice
from patients.models import Patient
from schedules.models import DoctorSchedule


class DashboardStatsView(APIView):
    """Tổng quan dashboard dành cho Admin"""
    permission_classes = [IsAdmin]

    def get(self, request):
        today = date.today()
        month_start = today.replace(day=1)

        # Tổng quan chung
        total_patients = Patient.objects.count()
        total_doctors = Doctor.objects.filter(is_available=True).count()
        total_appointments = Appointment.objects.count()

        # Hôm nay
        today_appointments = Appointment.objects.filter(appointment_date=today)
        today_count = today_appointments.count()
        today_confirmed = today_appointments.filter(status='confirmed').count()
        today_completed = today_appointments.filter(status='completed').count()
        today_no_show = today_appointments.filter(status='no_show').count()

        # Tháng này
        month_appointments = Appointment.objects.filter(appointment_date__gte=month_start)
        month_revenue = Invoice.objects.filter(
            status='paid', paid_at__date__gte=month_start
        ).aggregate(total=Sum('total_amount'))['total'] or Decimal('0')
        month_new_patients = Patient.objects.filter(created_at__date__gte=month_start).count()

        # Lịch hẹn theo trạng thái (tổng)
        appointment_by_status = dict(
            Appointment.objects.values('status').annotate(count=Count('id')).values_list('status', 'count')
        )

        return Response({
            'overview': {
                'total_patients': total_patients,
                'total_doctors': total_doctors,
                'total_appointments': total_appointments,
            },
            'today': {
                'date': today,
                'total': today_count,
                'confirmed': today_confirmed,
                'completed': today_completed,
                'no_show': today_no_show,
            },
            'this_month': {
                'appointments': month_appointments.count(),
                'revenue': month_revenue,
                'new_patients': month_new_patients,
            },
            'appointment_by_status': appointment_by_status,
        })


class RevenueStatsView(APIView):
    """Thống kê doanh thu theo thời gian"""
    permission_classes = [IsAdmin]

    def get(self, request):
        period = request.query_params.get('period', 'monthly')  # monthly | weekly | daily
        year = int(request.query_params.get('year', date.today().year))
        month = request.query_params.get('month')

        base_qs = Invoice.objects.filter(status='paid')

        if period == 'monthly':
            # Doanh thu 12 tháng của năm được chọn
            data = (
                base_qs.filter(paid_at__year=year)
                .annotate(period=TruncMonth('paid_at'))
                .values('period')
                .annotate(revenue=Sum('total_amount'), count=Count('id'))
                .order_by('period')
            )
        elif period == 'weekly':
            # Doanh thu theo tuần của tháng được chọn
            if not month:
                month = date.today().month
            data = (
                base_qs.filter(paid_at__year=year, paid_at__month=month)
                .annotate(period=TruncWeek('paid_at'))
                .values('period')
                .annotate(revenue=Sum('total_amount'), count=Count('id'))
                .order_by('period')
            )
        else:
            # Doanh thu theo ngày của tháng được chọn
            if not month:
                month = date.today().month
            data = (
                base_qs.filter(paid_at__year=year, paid_at__month=month)
                .annotate(period=TruncDate('paid_at'))
                .values('period')
                .annotate(revenue=Sum('total_amount'), count=Count('id'))
                .order_by('period')
            )

        total_revenue = base_qs.filter(paid_at__year=year).aggregate(
            total=Sum('total_amount')
        )['total'] or Decimal('0')

        return Response({
            'period': period,
            'year': year,
            'total_revenue_year': total_revenue,
            'data': list(data),
        })


class AppointmentStatsView(APIView):
    """Thống kê lịch hẹn"""
    permission_classes = [IsAdminOrReceptionist]

    def get(self, request):
        today = date.today()
        start_date = request.query_params.get('start_date', str(today.replace(day=1)))
        end_date = request.query_params.get('end_date', str(today))

        qs = Appointment.objects.filter(
            appointment_date__gte=start_date,
            appointment_date__lte=end_date,
        )

        # Theo trạng thái
        by_status = list(
            qs.values('status').annotate(count=Count('id')).order_by('status')
        )

        # Theo ca
        by_session = list(
            qs.values('session').annotate(count=Count('id'))
        )

        # Theo ngày
        by_date = list(
            qs.annotate(day=TruncDate('appointment_date'))
            .values('day')
            .annotate(count=Count('id'))
            .order_by('day')
        )

        # Tỉ lệ không đến
        total = qs.count()
        no_show = qs.filter(status='no_show').count()
        no_show_rate = round((no_show / total * 100), 1) if total > 0 else 0

        return Response({
            'date_range': {'start': start_date, 'end': end_date},
            'total': total,
            'no_show_rate': no_show_rate,
            'by_status': by_status,
            'by_session': by_session,
            'by_date': by_date,
        })


class DoctorScheduleStatsView(APIView):
    """
    Thống kê ca làm việc của bác sĩ – hỗ trợ tính lương.
    Mỗi ca = 0.5 ngày công (sáng hoặc chiều), cả ngày = 1 ngày công.
    """
    permission_classes = [IsAdmin]

    def get(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        doctor_id = request.query_params.get('doctor_id')

        if not start_date or not end_date:
            # Mặc định tháng hiện tại
            today = date.today()
            start_date = str(today.replace(day=1))
            end_date = str(today)

        qs = DoctorSchedule.objects.filter(
            date__gte=start_date,
            date__lte=end_date,
            status__in=['registered', 'approved', 'modified'],
        )

        if doctor_id:
            qs = qs.filter(doctor_id=doctor_id)

        # Tổng hợp theo bác sĩ
        doctors = Doctor.objects.select_related('user')
        if doctor_id:
            doctors = doctors.filter(id=doctor_id)

        result = []
        for doctor in doctors:
            doctor_schedules = qs.filter(doctor=doctor)
            full_days = doctor_schedules.filter(session='full').count()
            morning_only = doctor_schedules.filter(session='morning').count()
            afternoon_only = doctor_schedules.filter(session='afternoon').count()

            # Ngày công: cả ngày = 1, sáng/chiều = 0.5
            total_working_days = full_days + (morning_only * 0.5) + (afternoon_only * 0.5)

            result.append({
                'doctor_id': doctor.id,
                'doctor_name': doctor.user.get_full_name(),
                'specialty': doctor.specialty,
                'schedule_count': doctor_schedules.count(),
                'full_day_count': full_days,
                'morning_only_count': morning_only,
                'afternoon_only_count': afternoon_only,
                'total_working_days': total_working_days,
                'schedules': list(doctor_schedules.values('date', 'session', 'status')),
            })

        return Response({
            'date_range': {'start': start_date, 'end': end_date},
            'doctors': result,
        })


class PatientStatsView(APIView):
    """Thống kê bệnh nhân"""
    permission_classes = [IsAdmin]

    def get(self, request):
        today = date.today()
        year = int(request.query_params.get('year', today.year))

        # Bệnh nhân mới theo tháng
        new_by_month = list(
            Patient.objects.filter(created_at__year=year)
            .annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(count=Count('id'))
            .order_by('month')
        )

        # Top bác sĩ theo số lịch hẹn
        top_doctors = list(
            Appointment.objects.filter(
                appointment_date__year=year,
                status='completed'
            )
            .values('doctor__user__first_name', 'doctor__user__last_name', 'doctor_id')
            .annotate(total=Count('id'))
            .order_by('-total')[:10]
        )

        # Top dịch vụ được dùng nhiều nhất
        top_services = list(
            Appointment.objects.filter(
                appointment_date__year=year,
                service__isnull=False,
            )
            .values('service__name', 'service_id')
            .annotate(total=Count('id'))
            .order_by('-total')[:10]
        )

        return Response({
            'year': year,
            'total_patients': Patient.objects.count(),
            'new_patients_by_month': new_by_month,
            'top_doctors': top_doctors,
            'top_services': top_services,
        })
