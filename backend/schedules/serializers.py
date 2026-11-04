from rest_framework import serializers
from doctors.serializers import DoctorSerializer
from .models import DoctorSchedule, StaffSalaryConfig, PayrollRecord


class DoctorScheduleSerializer(serializers.ModelSerializer):
    doctor_info = DoctorSerializer(source='doctor', read_only=True)
    session_display = serializers.CharField(source='get_session_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    patient_count = serializers.SerializerMethodField()
    morning_count = serializers.SerializerMethodField()
    afternoon_count = serializers.SerializerMethodField()
    patients_summary = serializers.SerializerMethodField()

    class Meta:
        model = DoctorSchedule
        fields = [
            'id', 'doctor', 'doctor_info', 'date', 'session', 'session_display',
            'status', 'status_display', 'note', 'admin_note',
            'patient_count', 'morning_count', 'afternoon_count', 'patients_summary',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_patient_count(self, obj):
        return obj.doctor.appointments.filter(
            appointment_date=obj.date
        ).exclude(status='cancelled').count()

    def get_morning_count(self, obj):
        return obj.doctor.appointments.filter(
            appointment_date=obj.date,
            session='morning'
        ).exclude(status='cancelled').count()

    def get_afternoon_count(self, obj):
        return obj.doctor.appointments.filter(
            appointment_date=obj.date,
            session='afternoon'
        ).exclude(status='cancelled').count()

    def get_patients_summary(self, obj):
        apps = obj.doctor.appointments.filter(
            appointment_date=obj.date
        ).exclude(status='cancelled').select_related('patient__user', 'service')
        return [
            {
                'id': a.id,
                'patient_name': a.patient.user.get_full_name() or a.patient.user.username,
                'phone': getattr(a.patient.user, 'phone', ''),
                'service_name': a.service.name if a.service else 'Khám nha khoa',
                'session': a.session,
                'session_display': a.get_session_display(),
                'status': a.status,
                'status_display': a.get_status_display(),
                'reason': a.reason,
                'has_medical_record': hasattr(a, 'medical_record'),
            }
            for a in apps
        ]


class DoctorScheduleCreateSerializer(serializers.ModelSerializer):
    """Bác sĩ tự đăng ký lịch của mình"""
    class Meta:
        model = DoctorSchedule
        fields = ['date', 'session', 'note']

    def validate_date(self, value):
        from datetime import date
        if value < date.today():
            raise serializers.ValidationError('Không thể đăng ký lịch cho ngày đã qua.')
        return value

    def validate(self, data):
        request = self.context.get('request')
        doctor = request.user.doctor_profile
        date = data.get('date')
        # Kiểm tra nếu đã có lịch cho ngày này (khi tạo mới)
        if self.instance is None:
            if DoctorSchedule.objects.filter(doctor=doctor, date=date).exists():
                raise serializers.ValidationError({'date': 'Bạn đã đăng ký lịch cho ngày này rồi.'})
        return data


class DoctorScheduleAdminUpdateSerializer(serializers.ModelSerializer):
    """Admin chỉnh sửa lịch của bác sĩ"""
    class Meta:
        model = DoctorSchedule
        fields = ['session', 'status', 'admin_note']


# ── Salary & Payroll Serializers ──────────────────────────────────────────────

class StaffSalaryConfigSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    user_role = serializers.CharField(source='user.role', read_only=True)
    user_role_display = serializers.CharField(source='user.get_role_display', read_only=True)
    phone = serializers.CharField(source='user.phone', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    specialty = serializers.SerializerMethodField()

    class Meta:
        model = StaffSalaryConfig
        fields = [
            'id', 'user', 'user_name', 'user_role', 'user_role_display',
            'phone', 'email', 'specialty',
            'base_salary', 'shift_rate', 'commission_per_patient', 'allowance',
            'note', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def get_user_name(self, obj):
        return obj.user.get_full_name() or obj.user.username

    def get_specialty(self, obj):
        if hasattr(obj.user, 'doctor_profile'):
            return obj.user.doctor_profile.specialty
        return ''


class PayrollRecordSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    user_role = serializers.CharField(source='user.role', read_only=True)
    user_role_display = serializers.CharField(source='user.get_role_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    phone = serializers.CharField(source='user.phone', read_only=True)
    specialty = serializers.SerializerMethodField()

    class Meta:
        model = PayrollRecord
        fields = [
            'id', 'user', 'user_name', 'user_role', 'user_role_display', 'status_display',
            'phone', 'specialty',
            'month', 'year',
            'total_shifts', 'morning_shifts', 'afternoon_shifts', 'total_patients_examined',
            'shift_rate_applied', 'shift_salary', 'base_salary', 'commission_amount',
            'allowance', 'bonus', 'deduction', 'net_salary',
            'status', 'payment_method', 'paid_at', 'note', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user', 'created_at', 'updated_at'
        ]

    def get_user_name(self, obj):
        return obj.user.get_full_name() or obj.user.username

    def get_specialty(self, obj):
        if hasattr(obj.user, 'doctor_profile'):
            return obj.user.doctor_profile.specialty
        return ''
