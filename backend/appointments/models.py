from django.db import models


class Appointment(models.Model):
    """
    Lịch hẹn khám của bệnh nhân.
    - Bệnh nhân chọn bác sĩ, ngày, ca (sáng/chiều), dịch vụ
    - Mỗi ca tối đa 7 bệnh nhân / bác sĩ
    - Cần đặt cọc 100.000đ để xác nhận lịch hẹn
    """
    SESSION_CHOICES = [
        ('morning', 'Buổi sáng (8:00 - 12:00)'),
        ('afternoon', 'Buổi chiều (13:00 - 17:00)'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Chờ xác nhận cọc'),       # Bệnh nhân vừa đặt, chưa cọc
        ('deposited', 'Đã đặt cọc'),             # Đã chuyển khoản, chờ lễ tân xác nhận
        ('confirmed', 'Đã xác nhận'),            # Lễ tân đã xác nhận cọc và lịch hẹn
        ('checked_in', 'Đã đến khám'),           # Bệnh nhân đã đến, lễ tân tiếp nhận
        ('in_progress', 'Đang khám'),            # Đang trong quá trình khám với bác sĩ
        ('completed', 'Hoàn thành'),             # Khám xong, hóa đơn đã được tạo
        ('cancelled', 'Đã hủy'),                 # Bệnh nhân hoặc phòng khám hủy
        ('no_show', 'Không đến'),                # Có lịch đã xác nhận nhưng không đến
    ]

    DEPOSIT_STATUS_CHOICES = [
        ('not_paid', 'Chưa đặt cọc'),
        ('pending_verification', 'Chờ xác nhận'),   # Bệnh nhân báo đã chuyển khoản
        ('verified', 'Đã xác nhận'),                 # Lễ tân xác nhận
        ('refunded', 'Đã hoàn cọc'),                 # Trường hợp đặc biệt hoàn cọc
        ('forfeited', 'Mất cọc'),                    # Hủy lịch / không đến, mất cọc
    ]

    patient = models.ForeignKey('patients.Patient', on_delete=models.CASCADE, related_name='appointments')
    doctor = models.ForeignKey('doctors.Doctor', on_delete=models.CASCADE, related_name='appointments')
    service = models.ForeignKey('services.Service', on_delete=models.SET_NULL, null=True, blank=True, related_name='appointments')
    schedule = models.ForeignKey('schedules.DoctorSchedule', on_delete=models.SET_NULL, null=True, blank=True, related_name='appointments')

    appointment_date = models.DateField()
    session = models.CharField(max_length=20, choices=SESSION_CHOICES)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='pending')

    # Đặt cọc
    deposit_amount = models.DecimalField(max_digits=10, decimal_places=2, default=100000)
    deposit_status = models.CharField(max_length=30, choices=DEPOSIT_STATUS_CHOICES, default='not_paid')
    deposit_note = models.TextField(blank=True, help_text='Ghi chú xác nhận cọc của lễ tân')
    deposit_confirmed_at = models.DateTimeField(null=True, blank=True)

    # Thông tin thêm
    reason = models.TextField(blank=True, help_text='Lý do khám / triệu chứng ban đầu')
    notes = models.TextField(blank=True, help_text='Ghi chú thêm')
    cancellation_reason = models.TextField(blank=True)

    # Tracking
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    checked_in_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'appointments'
        ordering = ['-appointment_date', 'session']

    def __str__(self):
        return (f"Lịch hẹn #{self.id} - {self.patient.user.get_full_name()} "
                f"với BS. {self.doctor.user.get_full_name()} "
                f"ngày {self.appointment_date} {self.get_session_display()}")
