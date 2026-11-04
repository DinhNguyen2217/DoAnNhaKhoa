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


class StaffSalaryConfig(models.Model):
    """
    Cấu hình mức lương riêng cho từng Bác sĩ và Nhân viên.
    Admin có quyền tùy chỉnh giá lương theo ca, lương cứng, hoa hồng.
    """
    user = models.OneToOneField('accounts.User', on_delete=models.CASCADE, related_name='salary_config')
    base_salary = models.DecimalField(max_digits=12, decimal_places=2, default=0, help_text='Lương cứng/cơ bản theo tháng')
    shift_rate = models.DecimalField(max_digits=12, decimal_places=2, default=300000, help_text='Mức lương cho 1 ca trực (buổi)')
    commission_per_patient = models.DecimalField(max_digits=12, decimal_places=2, default=50000, help_text='Thù lao/hoa hồng mỗi lượt bệnh nhân hoàn thành khám')
    allowance = models.DecimalField(max_digits=12, decimal_places=2, default=0, help_text='Phụ cấp ăn trưa / trách nhiệm')
    note = models.TextField(blank=True, help_text='Ghi chú của Admin về chế độ lương')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'staff_salary_configs'

    def __str__(self):
        return f"Cấu hình lương: {self.user.get_full_name() or self.user.username} ({self.user.get_role_display()})"


class PayrollRecord(models.Model):
    """
    Bảng tính lương tháng cho Bác sĩ và Nhân viên.
    Tự động tính từ số ca làm việc thực tế, số bệnh nhân khám và đơn giá lương do Admin cài đặt.
    """
    STATUS_CHOICES = [
        ('draft', 'Dự thảo / Chờ duyệt'),
        ('approved', 'Đã duyệt'),
        ('paid', 'Đã thanh toán'),
    ]

    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='payrolls')
    month = models.IntegerField(help_text='Tháng (1-12)')
    year = models.IntegerField(help_text='Năm tính lương')

    # Thống kê công việc thực tế trong tháng
    total_shifts = models.DecimalField(max_digits=6, decimal_places=1, default=0, help_text='Tổng số ca làm việc')
    morning_shifts = models.IntegerField(default=0, help_text='Số ca sáng')
    afternoon_shifts = models.IntegerField(default=0, help_text='Số ca chiều')
    total_patients_examined = models.IntegerField(default=0, help_text='Số lượt bệnh nhân đã khám trong tháng')

    # Các khoản lương & phụ cấp
    shift_rate_applied = models.DecimalField(max_digits=12, decimal_places=2, default=0, help_text='Đơn giá ca trực áp dụng')
    shift_salary = models.DecimalField(max_digits=12, decimal_places=2, default=0, help_text='Tiền lương theo ca trực = total_shifts * shift_rate')
    base_salary = models.DecimalField(max_digits=12, decimal_places=2, default=0, help_text='Lương cứng cơ bản')
    commission_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0, help_text='Hoa hồng lượt khám')
    allowance = models.DecimalField(max_digits=12, decimal_places=2, default=0, help_text='Phụ cấp')
    bonus = models.DecimalField(max_digits=12, decimal_places=2, default=0, help_text='Thưởng thêm do Admin duyệt')
    deduction = models.DecimalField(max_digits=12, decimal_places=2, default=0, help_text='Khấu trừ / Phạt')
    net_salary = models.DecimalField(max_digits=12, decimal_places=2, default=0, help_text='Tổng lương thực lĩnh')

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    payment_method = models.CharField(max_length=20, blank=True, help_text='Hình thức chi trả (Tiền mặt / Chuyển khoản)')
    paid_at = models.DateTimeField(null=True, blank=True, help_text='Thời điểm thực hiện chi trả lương')
    note = models.TextField(blank=True, help_text='Ghi chú bảng lương')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'payroll_records'
        unique_together = ['user', 'month', 'year']
        ordering = ['-year', '-month', 'user__role']

    def __str__(self):
        return f"Bảng lương T{self.month}/{self.year} - {self.user.get_full_name() or self.user.username} ({self.net_salary:,.0f}đ)"
