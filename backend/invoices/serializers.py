from rest_framework import serializers
from decimal import Decimal
from .models import Invoice, InvoiceItem


class InvoiceItemSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source='service.name', read_only=True, allow_null=True)

    class Meta:
        model = InvoiceItem
        fields = ['id', 'service', 'service_name', 'description', 'quantity', 'unit_price', 'subtotal']
        read_only_fields = ['id', 'subtotal']


class InvoiceItemCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceItem
        fields = ['service', 'description', 'quantity', 'unit_price']

    def validate(self, data):
        # Nếu không nhập description mà có service, tự lấy tên service
        if not data.get('description') and data.get('service'):
            data['description'] = data['service'].name
        elif not data.get('description'):
            raise serializers.ValidationError({'description': 'Vui lòng nhập mô tả dịch vụ.'})
        return data


class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True, read_only=True)
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()
    invoice_number = serializers.SerializerMethodField()
    final_amount = serializers.DecimalField(source='total_amount', max_digits=12, decimal_places=2, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    has_medical_record = serializers.SerializerMethodField()
    medical_record_info = serializers.SerializerMethodField()
    appointment_info = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'appointment', 'appointment_info',
            'patient', 'patient_name', 'doctor_name', 'created_by',
            'status', 'status_display',
            'payment_method', 'payment_method_display',
            'subtotal', 'deposit_deducted', 'discount', 'total_amount', 'final_amount',
            'has_medical_record', 'medical_record_info',
            'notes', 'items',
            'paid_at', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'invoice_number', 'subtotal', 'total_amount', 'final_amount', 'created_at', 'updated_at']

    def get_patient_name(self, obj):
        return obj.patient.user.get_full_name() or obj.patient.user.username

    def get_doctor_name(self, obj):
        doc = obj.appointment.doctor if hasattr(obj, 'appointment') and obj.appointment else None
        return doc.user.get_full_name() or doc.user.username if doc else ''

    def get_invoice_number(self, obj):
        return f"HD{obj.id:04d}"

    def get_has_medical_record(self, obj):
        return hasattr(obj.appointment, 'medical_record')

    def get_medical_record_info(self, obj):
        if not hasattr(obj.appointment, 'medical_record'):
            return None
        rec = obj.appointment.medical_record
        return {
            'id': rec.id,
            'diagnosis': rec.diagnosis,
            'treatment_performed': rec.treatment_performed,
            'tooth_status': rec.tooth_status,
            'notes': rec.notes,
            'follow_up_date': rec.follow_up_date,
            'is_completed': rec.is_completed,
            'has_prescription': hasattr(rec, 'prescription'),
        }

    def get_appointment_info(self, obj):
        app = obj.appointment
        return {
            'id': app.id,
            'appointment_date': app.appointment_date,
            'session': app.session,
            'session_display': app.get_session_display(),
            'service_name': app.service.name if app.service else '',
            'service_price': app.service.price if app.service else 0,
            'status': app.status,
            'status_display': app.get_status_display(),
            'deposit_status': app.deposit_status,
            'deposit_amount': app.deposit_amount,
            'patient_phone': getattr(app.patient.user, 'phone', ''),
        }


class InvoiceCreateSerializer(serializers.ModelSerializer):
    items = InvoiceItemCreateSerializer(many=True)

    class Meta:
        model = Invoice
        fields = ['appointment', 'items', 'discount', 'notes']

    def validate_appointment(self, value):
        if hasattr(value, 'invoice'):
            raise serializers.ValidationError('Lịch hẹn này đã có hóa đơn.')
        return value

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        appointment = validated_data['appointment']

        # Tự động điền deposit nếu đã cọc
        deposit_deducted = Decimal('0')
        if appointment.deposit_status == 'verified':
            deposit_deducted = appointment.deposit_amount

        invoice = Invoice.objects.create(
            patient=appointment.patient,
            deposit_deducted=deposit_deducted,
            **validated_data,
        )

        for item_data in items_data:
            InvoiceItem.objects.create(invoice=invoice, **item_data)

        invoice.calculate_total()
        invoice.save()
        return invoice


class InvoiceUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = ['discount', 'notes', 'payment_method']


class PaymentSerializer(serializers.Serializer):
    """Lễ tân xác nhận thanh toán"""
    payment_method = serializers.ChoiceField(choices=['cash', 'transfer'])
    notes = serializers.CharField(required=False, allow_blank=True)
