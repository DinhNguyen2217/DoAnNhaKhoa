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


# ── Clinic Analytics & Salary Statistics ─────────────────────────────────────

class ClinicAnalyticsView(APIView):
    """
    Phân tích toàn diện chỉ số phòng khám: Doanh thu 12 tháng, Doanh thu theo ngày,
    Cơ cấu dịch vụ, Hiệu suất bác sĩ, Tỷ lệ phương thức thanh toán.
    """
    permission_classes = [IsAdmin]

    def get(self, request):
        import calendar
        from services.models import Service

        today = date.today()
        year = int(request.query_params.get('year', today.year))
        month = int(request.query_params.get('month', today.month))

        paid_invoices = Invoice.objects.filter(status='paid')

        # 1. Doanh thu 12 tháng của năm
        monthly_revenue = []
        for m in range(1, 13):
            invs = paid_invoices.filter(paid_at__year=year, paid_at__month=m)
            rev = invs.aggregate(total=Sum('total_amount'))['total'] or Decimal('0')
            dep = invs.aggregate(total=Sum('deposit_deducted'))['total'] or Decimal('0')
            cnt = invs.count()
            monthly_revenue.append({
                'month': f'T{m}',
                'month_num': m,
                'revenue': float(rev),
                'deposit': float(dep),
                'total_revenue': float(rev + dep),
                'invoice_count': cnt,
            })

        # 2. Doanh thu theo ngày của tháng đang chọn
        days_in_month = calendar.monthrange(year, month)[1]
        daily_revenue = []
        for d in range(1, days_in_month + 1):
            day_invs = paid_invoices.filter(paid_at__year=year, paid_at__month=month, paid_at__day=d)
            day_rev = day_invs.aggregate(total=Sum('total_amount'))['total'] or Decimal('0')
            day_cnt = day_invs.count()
            daily_revenue.append({
                'day': f'{d:02d}/{month:02d}',
                'day_num': d,
                'revenue': float(day_rev),
                'invoice_count': day_cnt,
            })

        # 3. Cơ cấu doanh thu theo Dịch vụ nha khoa
        services = Service.objects.all()
        service_stats = []
        total_service_revenue = Decimal('0')

        for s in services:
            srv_invoices = paid_invoices.filter(appointment__service=s)
            rev = srv_invoices.aggregate(total=Sum('total_amount'))['total'] or Decimal('0')
            cnt = srv_invoices.count()
            total_service_revenue += rev
            if cnt > 0 or rev > 0:
                service_stats.append({
                    'id': s.id,
                    'service_name': s.name,
                    'price': float(s.price),
                    'count': cnt,
                    'revenue': float(rev),
                })

        service_stats.sort(key=lambda x: x['revenue'], reverse=True)
        for s in service_stats:
            s['percent'] = round((s['revenue'] / float(total_service_revenue) * 100), 1) if total_service_revenue > 0 else 0

        # 4. Hiệu suất & Doanh thu theo Bác sĩ
        doctors = Doctor.objects.select_related('user').all()
        doctor_stats = []
        for doc in doctors:
            doc_invoices = paid_invoices.filter(appointment__doctor=doc)
            doc_rev = doc_invoices.aggregate(total=Sum('total_amount'))['total'] or Decimal('0')
            doc_apps = Appointment.objects.filter(doctor=doc, status='completed').count()
            doctor_stats.append({
                'doctor_id': doc.id,
                'doctor_name': doc.user.get_full_name() or doc.user.username,
                'specialty': doc.specialty,
                'completed_appointments': doc_apps,
                'revenue': float(doc_rev),
            })
        doctor_stats.sort(key=lambda x: x['revenue'], reverse=True)

        # 5. Cơ cấu phương thức thanh toán
        cash_rev = paid_invoices.filter(payment_method='cash').aggregate(total=Sum('total_amount'))['total'] or Decimal('0')
        transfer_rev = paid_invoices.filter(payment_method='transfer').aggregate(total=Sum('total_amount'))['total'] or Decimal('0')
        cash_cnt = paid_invoices.filter(payment_method='cash').count()
        transfer_cnt = paid_invoices.filter(payment_method='transfer').count()

        # 6. Tổng quan năm và tháng
        year_revenue = paid_invoices.filter(paid_at__year=year).aggregate(total=Sum('total_amount'))['total'] or Decimal('0')
        month_revenue_val = paid_invoices.filter(paid_at__year=year, paid_at__month=month).aggregate(total=Sum('total_amount'))['total'] or Decimal('0')
        total_deposit_val = Appointment.objects.filter(deposit_status='verified').aggregate(total=Sum('deposit_amount'))['total'] or Decimal('0')

        return Response({
            'year': year,
            'month': month,
            'summary': {
                'year_revenue': float(year_revenue),
                'month_revenue': float(month_revenue_val),
                'total_deposit': float(total_deposit_val),
                'paid_invoices_count': paid_invoices.count(),
            },
            'monthly_revenue': monthly_revenue,
            'daily_revenue': daily_revenue,
            'service_stats': service_stats,
            'doctor_stats': doctor_stats,
            'payment_stats': [
                {'method': 'Tiền mặt tại quầy', 'amount': float(cash_rev), 'count': cash_cnt},
                {'method': 'Chuyển khoản QR ngân hàng', 'amount': float(transfer_rev), 'count': transfer_cnt},
            ]
        })


class SalaryStatsView(APIView):
    """Thống kê lương theo ca làm việc của bác sĩ và nhân viên"""
    permission_classes = [IsAdmin]

    def get(self, request):
        from schedules.models import StaffSalaryConfig, DoctorSchedule, PayrollRecord

        today = date.today()
        month = int(request.query_params.get('month', today.month))
        year = int(request.query_params.get('year', today.year))

        doctors = Doctor.objects.select_related('user').all()
        result = []

        for doc in doctors:
            cfg, _ = StaffSalaryConfig.objects.get_or_create(
                user=doc.user,
                defaults={
                    'base_salary': 0,
                    'shift_rate': 400000,
                    'commission_per_patient': 50000,
                    'allowance': 500000,
                    'note': 'Chế độ tiêu chuẩn'
                }
            )

            schedules = DoctorSchedule.objects.filter(
                doctor=doc,
                date__year=year,
                date__month=month,
                status__in=['registered', 'approved', 'modified']
            )
            morning_cnt = schedules.filter(session__in=['morning', 'full']).count()
            afternoon_cnt = schedules.filter(session__in=['afternoon', 'full']).count()
            total_shifts = morning_cnt + afternoon_cnt

            total_patients = Appointment.objects.filter(
                doctor=doc,
                appointment_date__year=year,
                appointment_date__month=month,
                status='completed'
            ).count()

            shift_salary = total_shifts * float(cfg.shift_rate)
            commission_amt = total_patients * float(cfg.commission_per_patient)
            base_sal = float(cfg.base_salary)
            allowance = float(cfg.allowance)

            result.append({
                'doctor_id': doc.id,
                'user_id': doc.user.id,
                'doctor_name': doc.user.get_full_name() or doc.user.username,
                'specialty': doc.specialty,
                'total_shifts': total_shifts,
                'morning_shifts': morning_cnt,
                'afternoon_shifts': afternoon_cnt,
                'total_patients': total_patients,
                'rate_per_shift': float(cfg.shift_rate),
                'shift_salary': shift_salary,
                'commission_amount': commission_amt,
                'base_salary': base_sal,
                'allowance': allowance,
                'estimated_salary': shift_salary + commission_amt + base_sal + allowance,
            })

        return Response(result)
