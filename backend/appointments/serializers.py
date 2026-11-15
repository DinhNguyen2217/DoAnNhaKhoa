from rest_framework import serializers
from django.utils import timezone
from patients.serializers import PatientSerializer
from doctors.serializers import DoctorSerializer
from services.serializers import ServiceSerializer
from doctors.models import Doctor
from .models import Appointment

MORNING_SLOTS = [
    '08:00 - 08:30', '08:30 - 09:00', '09:00 - 09:30', '09:30 - 10:00',
    '10:00 - 10:30', '10:30 - 11:00', '11:00 - 11:30', '11:30 - 12:00'
]

AFTERNOON_SLOTS = [
    '13:00 - 13:30', '13:30 - 14:00', '14:00 - 14:30', '14:30 - 15:00',
    '15:00 - 15:30', '15:30 - 16:00', '16:00 - 16:30', '16:30 - 17:00'
]

ALL_SLOTS = MORNING_SLOTS + AFTERNOON_SLOTS
MAX_PATIENTS_PER_SESSION = 10  # Tối đa 10 bệnh nhân/ca/bác sĩ (20 bệnh nhân/ngày)


class AppointmentSerializer(serializers.ModelSerializer):
    patient_info = PatientSerializer(source='patient', read_only=True)
    doctor_info = DoctorSerializer(source='doctor', read_only=True)
    service_info = ServiceSerializer(source='service', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    session_display = serializers.CharField(source='get_session_display', read_only=True)
    deposit_status_display = serializers.CharField(source='get_deposit_status_display', read_only=True)
    has_medical_record = serializers.SerializerMethodField()
    medical_record_id = serializers.SerializerMethodField()
    has_invoice = serializers.SerializerMethodField()
    invoice_id = serializers.SerializerMethodField()
    can_cancel = serializers.SerializerMethodField()
    minutes_since_created = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'patient_info', 'doctor', 'doctor_info',
            'service', 'service_info', 'schedule',
            'appointment_date', 'session', 'session_display', 'time_slot',
            'status', 'status_display',
            'deposit_amount', 'deposit_status', 'deposit_status_display',
            'deposit_note', 'deposit_confirmed_at',
            'reason', 'notes', 'cancellation_reason',
            'has_medical_record', 'medical_record_id',
            'has_invoice', 'invoice_id',
            'can_cancel', 'minutes_since_created',
            'created_at', 'updated_at', 'checked_in_at', 'completed_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'deposit_amount']

    def get_can_cancel(self, obj):
        """Khách hàng có thể tự hủy trong vòng 30 phút kể từ lúc đặt"""
        if obj.status in ['cancelled', 'completed', 'checked_in', 'in_progress']:
            return False
        if not obj.created_at:
            return True
        diff = timezone.now() - obj.created_at
        return diff.total_seconds() <= 30 * 60

    def get_minutes_since_created(self, obj):
        if not obj.created_at:
            return 0
        diff = timezone.now() - obj.created_at
        return int(diff.total_seconds() // 60)

    def get_has_medical_record(self, obj):
        return hasattr(obj, 'medical_record')

    def get_medical_record_id(self, obj):
        return obj.medical_record.id if hasattr(obj, 'medical_record') else None

    def get_has_invoice(self, obj):
        return hasattr(obj, 'invoice')

    def get_invoice_id(self, obj):
        return obj.invoice.id if hasattr(obj, 'invoice') else None


class AppointmentCreateSerializer(serializers.ModelSerializer):
    """Bệnh nhân tạo lịch hẹn mới (có thể chọn bác sĩ cụ thể hoặc để phòng khám tự sắp xếp)"""
    id = serializers.IntegerField(read_only=True)
    doctor = serializers.PrimaryKeyRelatedField(
        queryset=Doctor.objects.filter(is_available=True),
        required=False,
        allow_null=True
    )
    time_slot = serializers.CharField(
        required=True,
        error_messages={'required': 'Vui lòng chọn một khung giờ khám 30 phút cụ thể.'}
    )

    class Meta:
        model = Appointment
        fields = ['id', 'doctor', 'service', 'appointment_date', 'session', 'time_slot', 'reason', 'notes']

    def validate_appointment_date(self, value):
        from datetime import date
        if value < date.today():
            raise serializers.ValidationError('Không thể đặt lịch cho ngày trong quá khứ.')
        return value

    def validate(self, data):
        doctor = data.get('doctor')
        appointment_date = data.get('appointment_date')
        session = data.get('session')
        time_slot = data.get('time_slot')
        session_text = 'Buổi Sáng (8h-12h)' if session == 'morning' else 'Buổi Chiều (13h-17h)'
        date_text = appointment_date.strftime('%d/%m/%Y')

        # 1. Kiểm tra tính hợp lệ của khung giờ theo ca
        if session == 'morning' and time_slot not in MORNING_SLOTS:
            raise serializers.ValidationError(
                {'time_slot': f"Khung giờ '{time_slot}' không thuộc ca Sáng (8:00 - 12:00). Vui lòng chọn một trong các khung giờ: {', '.join(MORNING_SLOTS)}"}
            )
        if session == 'afternoon' and time_slot not in AFTERNOON_SLOTS:
            raise serializers.ValidationError(
                {'time_slot': f"Khung giờ '{time_slot}' không thuộc ca Chiều (13:00 - 17:00). Vui lòng chọn một trong các khung giờ: {', '.join(AFTERNOON_SLOTS)}"}
            )

        from schedules.models import DoctorSchedule

        # TRƯỜNG HỢP 1: Bệnh nhân để phòng khám tự sắp xếp bác sĩ (doctor is None)
        if not doctor:
            active_doctors = Doctor.objects.filter(is_available=True)
            if not active_doctors.exists():
                raise serializers.ValidationError({'doctor': 'Hiện tại không có bác sĩ nào trong hệ thống.'})

            best_doctor = None
            min_count = MAX_PATIENTS_PER_SESSION

            for doc in active_doctors:
                # Kiểm tra lịch trực của bác sĩ
                sched = DoctorSchedule.objects.filter(
                    doctor=doc,
                    date=appointment_date,
                    status__in=['registered', 'approved']
                ).first()
                if sched:
                    if session == 'morning' and not sched.has_morning():
                        continue
                    if session == 'afternoon' and not sched.has_afternoon():
                        continue

                # Kiểm tra xem bác sĩ này đã bị ai đặt khung giờ time_slot này chưa
                slot_taken = Appointment.objects.filter(
                    doctor=doc,
                    appointment_date=appointment_date,
                    time_slot=time_slot
                ).exclude(status='cancelled').exists()
                if slot_taken:
                    continue  # Bác sĩ này đã kín slot này, tìm bác sĩ khác

                count = Appointment.objects.filter(
                    doctor=doc,
                    appointment_date=appointment_date,
                    session=session,
                    status__in=['confirmed', 'pending', 'checked_in', 'in_progress'],
                ).count()

                if count < min_count:
                    min_count = count
                    best_doctor = doc

            if not best_doctor:
                raise serializers.ValidationError(
                    {'time_slot': f"Khung giờ {time_slot} ngày {date_text} đã có người đặt trước ở tất cả các bác sĩ. Quý khách vui lòng chọn khung giờ khác!"}
                )

            doctor = best_doctor
            data['doctor'] = doctor

        # TRƯỜNG HỢP 2: Bệnh nhân chọn đích danh một bác sĩ
        schedule = DoctorSchedule.objects.filter(
            doctor=doctor,
            date=appointment_date,
            status__in=['registered', 'approved']
        ).first()

        # Nếu bác sĩ chưa đăng ký trước cho ngày này, hệ thống tự động khởi tạo lịch làm việc
        if not schedule:
            schedule = DoctorSchedule.objects.create(
                doctor=doctor,
                date=appointment_date,
                session='full',
                status='approved',
                note='Ca trực được kích hoạt tự động khi bệnh nhân đặt lịch'
            )

        # Kiểm tra ca được chọn
        if session == 'morning' and not schedule.has_morning():
            raise serializers.ValidationError(
                {'session': f'Bác sĩ {doctor.user.get_full_name() or doctor.user.username} không có ca làm việc Buổi sáng ngày {date_text}. Quý khách vui lòng chọn ca Chiều hoặc để phòng khám tự sắp xếp bác sĩ.'}
            )
        if session == 'afternoon' and not schedule.has_afternoon():
            raise serializers.ValidationError(
                {'session': f'Bác sĩ {doctor.user.get_full_name() or doctor.user.username} không có ca làm việc Buổi chiều ngày {date_text}. Quý khách vui lòng chọn ca Sáng hoặc để phòng khám tự sắp xếp bác sĩ.'}
            )

        # KIỂM TRA QUY TẮC KHÓA KHUNG GIỜ: Đã có ai đặt khung giờ này của bác sĩ này chưa (trừ khi đã hủy)
        slot_conflict = Appointment.objects.filter(
            doctor=doctor,
            appointment_date=appointment_date,
            time_slot=time_slot
        ).exclude(status='cancelled').exists()

        if slot_conflict:
            doc_name = doctor.user.get_full_name() or doctor.user.username
            raise serializers.ValidationError(
                {'time_slot': f"Khung giờ {time_slot} ngày {date_text} của Bác sĩ {doc_name} đã có người đặt trước. Quý khách vui lòng chọn khung giờ khác (khung giờ này chỉ mở lại nếu khách hàng trước hủy lịch)!"}
            )

        data['schedule'] = schedule
        return data


class AppointmentUpdateStatusSerializer(serializers.ModelSerializer):
    """Lễ tân cập nhật trạng thái lịch hẹn"""
    class Meta:
        model = Appointment
        fields = ['status', 'notes', 'cancellation_reason']


class DepositConfirmSerializer(serializers.Serializer):
    """Lễ tân xác nhận đặt cọc"""
    deposit_status = serializers.ChoiceField(choices=['verified', 'forfeited'], default='verified')
    deposit_note = serializers.CharField(required=False, allow_blank=True)


class CheckInSerializer(serializers.Serializer):
    """Lễ tân tiếp nhận bệnh nhân đến khám"""
    notes = serializers.CharField(required=False, allow_blank=True)


class AppointmentCancelSerializer(serializers.Serializer):
    """Hủy lịch hẹn"""
    cancellation_reason = serializers.CharField(required=False, allow_blank=True)
