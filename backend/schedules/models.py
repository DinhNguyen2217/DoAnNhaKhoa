from django.db import models


class DoctorSchedule(models.Model):
    """
    Lịch làm việc do bác sĩ tự đăng ký.
    Mặc định bác sĩ làm cả ngày hành chính.
    Nếu bận buổi sáng hoặc chiều thì tick vào ô tương ứng để báo vắng.
    Admin có thể xem, sửa, xóa để đối chiếu thực tế.
    """
    SESSION_CHOICES = [
        ('full', 'Cả ngày'),
        ('morning', 'Buổi sáng'),
        ('afternoon', 'Buổi chiều'),
    ]

    STATUS_CHOICES = [
        ('registered', 'Đã đăng ký'),
        ('approved', 'Đã duyệt'),
        ('modified', 'Đã chỉnh sửa bởi Admin'),
        ('cancelled', 'Đã hủy'),
    ]

    doctor = models.ForeignKey('doctors.Doctor', on_delete=models.CASCADE, related_name='schedules')
    date = models.DateField()
    session = models.CharField(max_length=20, choices=SESSION_CHOICES, default='full')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='registered')
    note = models.TextField(blank=True, help_text='Ghi chú của bác sĩ hoặc admin')
    # Admin ghi chú khi sửa
    admin_note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'doctor_schedules'
        # Mỗi bác sĩ chỉ đăng ký 1 record cho mỗi ngày
        unique_together = ['doctor', 'date']
        ordering = ['-date']

    def __str__(self):
        return f"BS. {self.doctor.user.get_full_name()} - {self.date} ({self.get_session_display()})"

    def has_morning(self):
        """Bác sĩ có làm buổi sáng không"""
        return self.session in ['full', 'morning']

    def has_afternoon(self):
        """Bác sĩ có làm buổi chiều không"""
        return self.session in ['full', 'afternoon']
