from django.db import models


class MedicalRecord(models.Model):
    """
    Hồ sơ khám của một lượt khám (gắn với 1 lịch hẹn).
    Bác sĩ ghi nhận thông tin sau khi khám.
    """
    appointment = models.OneToOneField(
        'appointments.Appointment', on_delete=models.CASCADE, related_name='medical_record'
    )
    doctor = models.ForeignKey(
        'doctors.Doctor', on_delete=models.CASCADE, related_name='medical_records'
    )
    patient = models.ForeignKey(
        'patients.Patient', on_delete=models.CASCADE, related_name='medical_records'
    )

    # Thông tin khám
    chief_complaint = models.TextField(blank=True, help_text='Lý do khám chính / triệu chứng')
    diagnosis = models.TextField(blank=True, help_text='Chẩn đoán')
    treatment_performed = models.TextField(blank=True, help_text='Điều trị đã thực hiện')
    tooth_status = models.TextField(blank=True, help_text='Tình trạng răng (ghi chú cơ bản)')
    notes = models.TextField(blank=True, help_text='Ghi chú thêm của bác sĩ')
    follow_up_date = models.DateField(null=True, blank=True, help_text='Ngày tái khám')
    follow_up_notes = models.TextField(blank=True, help_text='Hướng dẫn tái khám')

    # Trạng thái
    is_completed = models.BooleanField(default=False, help_text='Bác sĩ đã hoàn tất ghi chép')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'medical_records'
        ordering = ['-created_at']

    def __str__(self):
        return f"Hồ sơ khám #{self.id} - {self.patient.user.get_full_name()} ({self.appointment.appointment_date})"


class TreatmentPlan(models.Model):
    """
    Kế hoạch điều trị cho bệnh nhân (có thể kéo dài nhiều lần khám).
    """
    STATUS_CHOICES = [
        ('planned', 'Đã lên kế hoạch'),
        ('in_progress', 'Đang thực hiện'),
        ('completed', 'Hoàn thành'),
        ('cancelled', 'Đã hủy'),
    ]

    patient = models.ForeignKey(
        'patients.Patient', on_delete=models.CASCADE, related_name='treatment_plans'
    )
    doctor = models.ForeignKey(
        'doctors.Doctor', on_delete=models.CASCADE, related_name='treatment_plans'
    )
    medical_record = models.ForeignKey(
        MedicalRecord, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='treatment_plans', help_text='Hồ sơ khám gốc tạo ra kế hoạch này'
    )

    title = models.CharField(max_length=200, help_text='Tên kế hoạch điều trị')
    description = models.TextField(blank=True, help_text='Mô tả chi tiết kế hoạch')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planned')
    estimated_sessions = models.IntegerField(default=1, help_text='Số buổi điều trị dự kiến')
    completed_sessions = models.IntegerField(default=0)
    notes = models.TextField(blank=True)

    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'treatment_plans'
        ordering = ['-created_at']

    def __str__(self):
        return f"KH điều trị: {self.title} - {self.patient.user.get_full_name()}"


class TreatmentSession(models.Model):
    """
    Một buổi thực hiện trong kế hoạch điều trị.
    """
    plan = models.ForeignKey(TreatmentPlan, on_delete=models.CASCADE, related_name='sessions')
    medical_record = models.ForeignKey(
        MedicalRecord, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='treatment_sessions'
    )
    session_number = models.IntegerField()
    description = models.TextField(blank=True, help_text='Nội dung thực hiện trong buổi này')
    result = models.TextField(blank=True, help_text='Kết quả / ghi nhận sau buổi điều trị')
    is_completed = models.BooleanField(default=False)
    date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'treatment_sessions'
        ordering = ['session_number']

    def __str__(self):
        return f"Buổi {self.session_number} - {self.plan.title}"


class Prescription(models.Model):
    """
    Đơn thuốc được bác sĩ kê sau khi khám.
    """
    medical_record = models.OneToOneField(
        MedicalRecord, on_delete=models.CASCADE, related_name='prescription'
    )
    doctor = models.ForeignKey(
        'doctors.Doctor', on_delete=models.CASCADE, related_name='prescriptions'
    )
    patient = models.ForeignKey(
        'patients.Patient', on_delete=models.CASCADE, related_name='prescriptions'
    )
    notes = models.TextField(blank=True, help_text='Hướng dẫn dùng thuốc chung')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'prescriptions'
        ordering = ['-created_at']

    def __str__(self):
        return f"Đơn thuốc #{self.id} - {self.patient.user.get_full_name()}"


class PrescriptionItem(models.Model):
    """
    Từng dòng thuốc trong đơn thuốc.
    """
    prescription = models.ForeignKey(Prescription, on_delete=models.CASCADE, related_name='items')
    medicine_name = models.CharField(max_length=200)
    dosage = models.CharField(max_length=100, blank=True, help_text='Liều dùng (vd: 500mg)')
    frequency = models.CharField(max_length=100, blank=True, help_text='Tần suất (vd: 3 lần/ngày)')
    duration = models.CharField(max_length=100, blank=True, help_text='Thời gian dùng (vd: 5 ngày)')
    instructions = models.TextField(blank=True, help_text='Hướng dẫn cụ thể')
    quantity = models.CharField(max_length=50, blank=True, help_text='Số lượng (vd: 15 viên)')

    class Meta:
        db_table = 'prescription_items'

    def __str__(self):
        return f"{self.medicine_name} - {self.dosage}"
