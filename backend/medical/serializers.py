from rest_framework import serializers
from .models import MedicalRecord, TreatmentPlan, TreatmentSession, Prescription, PrescriptionItem


# ── Prescription ─────────────────────────────────────────────────────────────

class PrescriptionItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrescriptionItem
        fields = ['id', 'medicine_name', 'dosage', 'frequency', 'duration', 'instructions', 'quantity']


class PrescriptionSerializer(serializers.ModelSerializer):
    items = PrescriptionItemSerializer(many=True, read_only=True)
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()

    class Meta:
        model = Prescription
        fields = ['id', 'medical_record', 'doctor', 'patient', 'patient_name',
                  'doctor_name', 'notes', 'items', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_patient_name(self, obj):
        return obj.patient.user.get_full_name()

    def get_doctor_name(self, obj):
        return obj.doctor.user.get_full_name()


class PrescriptionCreateSerializer(serializers.ModelSerializer):
    items = PrescriptionItemSerializer(many=True)

    class Meta:
        model = Prescription
        fields = ['notes', 'items']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        prescription = Prescription.objects.create(**validated_data)
        for item in items_data:
            PrescriptionItem.objects.create(prescription=prescription, **item)
        return prescription

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        instance.notes = validated_data.get('notes', instance.notes)
        instance.save()
        if items_data is not None:
            instance.items.all().delete()
            for item in items_data:
                PrescriptionItem.objects.create(prescription=instance, **item)
        return instance


# ── Treatment Plan ────────────────────────────────────────────────────────────

class TreatmentSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TreatmentSession
        fields = ['id', 'plan', 'medical_record', 'session_number', 'description',
                  'result', 'is_completed', 'date', 'created_at']
        read_only_fields = ['id', 'created_at']


class TreatmentPlanSerializer(serializers.ModelSerializer):
    sessions = TreatmentSessionSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()
    progress_percent = serializers.SerializerMethodField()

    class Meta:
        model = TreatmentPlan
        fields = ['id', 'patient', 'patient_name', 'doctor', 'doctor_name', 'medical_record',
                  'title', 'description', 'status', 'status_display',
                  'estimated_sessions', 'completed_sessions', 'progress_percent',
                  'notes', 'start_date', 'end_date', 'sessions', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'completed_sessions']

    def get_patient_name(self, obj):
        return obj.patient.user.get_full_name()

    def get_doctor_name(self, obj):
        return obj.doctor.user.get_full_name()

    def get_progress_percent(self, obj):
        if obj.estimated_sessions == 0:
            return 0
        return round((obj.completed_sessions / obj.estimated_sessions) * 100)


class TreatmentPlanCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TreatmentPlan
        fields = ['patient', 'medical_record', 'title', 'description',
                  'estimated_sessions', 'notes', 'start_date', 'end_date']


# ── Medical Record ────────────────────────────────────────────────────────────

class MedicalRecordSerializer(serializers.ModelSerializer):
    prescription = PrescriptionSerializer(read_only=True)
    treatment_plans = TreatmentPlanSerializer(many=True, read_only=True)
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()
    doctor_specialty = serializers.SerializerMethodField()
    appointment_date = serializers.DateField(source='appointment.appointment_date', read_only=True)
    appointment_session = serializers.SerializerMethodField()
    service_name = serializers.SerializerMethodField()

    # Financial details
    subtotal = serializers.SerializerMethodField()
    deposit_deducted = serializers.SerializerMethodField()
    final_amount = serializers.SerializerMethodField()
    payment_status = serializers.SerializerMethodField()
    payment_status_display = serializers.SerializerMethodField()
    payment_method = serializers.SerializerMethodField()
    payment_method_display = serializers.SerializerMethodField()
    invoice_number = serializers.SerializerMethodField()
    invoice_id = serializers.SerializerMethodField()
    paid_at = serializers.SerializerMethodField()

    class Meta:
        model = MedicalRecord
        fields = [
            'id', 'appointment', 'appointment_date', 'appointment_session', 'service_name',
            'doctor', 'doctor_name', 'doctor_specialty',
            'patient', 'patient_name',
            'chief_complaint', 'diagnosis', 'treatment_performed',
            'tooth_status', 'notes',
            'follow_up_date', 'follow_up_notes',
            'is_completed',
            'prescription', 'treatment_plans',
            'subtotal', 'deposit_deducted', 'final_amount',
            'payment_status', 'payment_status_display',
            'payment_method', 'payment_method_display',
            'invoice_number', 'invoice_id', 'paid_at',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_patient_name(self, obj):
        try:
            return obj.patient.user.get_full_name() or obj.patient.user.username
        except Exception:
            return ''

    def get_doctor_name(self, obj):
        try:
            return obj.doctor.user.get_full_name() or obj.doctor.user.username
        except Exception:
            return ''

    def get_doctor_specialty(self, obj):
        try:
            return obj.doctor.specialty or 'Bác sĩ Răng Hàm Mặt'
        except Exception:
            return 'Bác sĩ Răng Hàm Mặt'

    def get_appointment_session(self, obj):
        try:
            return obj.appointment.get_session_display() if obj.appointment else ''
        except Exception:
            return ''

    def get_service_name(self, obj):
        try:
            if obj.appointment and obj.appointment.service:
                return obj.appointment.service.name
            return 'Khám & Điều trị nha khoa'
        except Exception:
            return 'Khám & Điều trị nha khoa'

    def _get_invoice(self, obj):
        if not hasattr(self, '_cached_invoices'):
            self._cached_invoices = {}
        if obj.id not in self._cached_invoices:
            inv = getattr(obj.appointment, 'invoice', None) if obj.appointment else None
            self._cached_invoices[obj.id] = inv
        return self._cached_invoices[obj.id]

    def get_subtotal(self, obj):
        inv = self._get_invoice(obj)
        if inv:
            return float(inv.subtotal)
        if obj.appointment and obj.appointment.service:
            fee = float(obj.doctor.consultation_fee) if obj.doctor else 0.0
            return float(obj.appointment.service.price) + fee
        return 0.0

    def get_deposit_deducted(self, obj):
        inv = self._get_invoice(obj)
        if inv:
            return float(inv.deposit_deducted)
        return 100000.0

    def get_final_amount(self, obj):
        inv = self._get_invoice(obj)
        if inv:
            return float(inv.total_amount)
        sub = self.get_subtotal(obj)
        dep = self.get_deposit_deducted(obj)
        return max(0.0, sub - dep)

    def get_payment_status(self, obj):
        inv = self._get_invoice(obj)
        if inv:
            return inv.status
        return 'pending'

    def get_payment_status_display(self, obj):
        inv = self._get_invoice(obj)
        if inv:
            return inv.get_status_display()
        return 'Chờ thanh toán tại quầy'

    def get_payment_method(self, obj):
        inv = self._get_invoice(obj)
        if inv:
            return inv.payment_method
        return ''

    def get_payment_method_display(self, obj):
        inv = self._get_invoice(obj)
        if inv and inv.payment_method:
            return inv.get_payment_method_display()
        return 'Chưa thanh toán'

    def get_invoice_number(self, obj):
        inv = self._get_invoice(obj)
        if inv:
            return f"HD{inv.id:04d}"
        return ''

    def get_invoice_id(self, obj):
        inv = self._get_invoice(obj)
        return inv.id if inv else None

    def get_paid_at(self, obj):
        inv = self._get_invoice(obj)
        return inv.paid_at if inv else None


class MedicalRecordCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalRecord
        fields = ['appointment', 'chief_complaint', 'diagnosis', 'treatment_performed',
                  'tooth_status', 'notes', 'follow_up_date', 'follow_up_notes']

    def validate_appointment(self, value):
        if hasattr(value, 'medical_record'):
            raise serializers.ValidationError('Lịch hẹn này đã có hồ sơ khám.')
        if value.status not in ['checked_in', 'in_progress', 'confirmed', 'deposited']:
            raise serializers.ValidationError('Lịch hẹn chưa ở trạng thái tiếp nhận hoặc đang khám.')
        return value


class MedicalRecordUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalRecord
        fields = ['chief_complaint', 'diagnosis', 'treatment_performed',
                  'tooth_status', 'notes', 'follow_up_date', 'follow_up_notes', 'is_completed']
