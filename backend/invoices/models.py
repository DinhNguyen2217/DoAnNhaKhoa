from django.db import models
from decimal import Decimal


class Invoice(models.Model):
    """
    Hóa đơn thanh toán sau khi khám.
    - Tiền cọc đã đặt sẽ được trừ vào tổng tiền.
    - Một hóa đơn có nhiều dịch vụ (InvoiceItem).
    - Thanh toán tại phòng khám (tiền mặt hoặc chuyển khoản).
    """
    PAYMENT_METHOD_CHOICES = [
        ('cash', 'Tiền mặt'),
        ('transfer', 'Chuyển khoản'),
    ]

    STATUS_CHOICES = [
        ('draft', 'Nháp'),               # Vừa tạo, chưa hoàn tất
        ('pending', 'Chờ thanh toán'),   # Đã lên hóa đơn, chờ bệnh nhân trả
        ('paid', 'Đã thanh toán'),       # Đã thanh toán đủ
        ('cancelled', 'Đã hủy'),
    ]

    appointment = models.OneToOneField(
        'appointments.Appointment', on_delete=models.CASCADE, related_name='invoice'
    )
    patient = models.ForeignKey(
        'patients.Patient', on_delete=models.CASCADE, related_name='invoices'
    )
    created_by = models.ForeignKey(
        'accounts.User', on_delete=models.SET_NULL, null=True, related_name='created_invoices'
    )

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, blank=True)

    # Tiền
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0,
                                   help_text='Tổng tiền trước khi trừ cọc')
    deposit_deducted = models.DecimalField(max_digits=10, decimal_places=2, default=0,
                                           help_text='Tiền cọc đã được trừ')
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0,
                                   help_text='Giảm giá (nếu có)')
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0,
                                       help_text='Tổng tiền phải trả = subtotal - deposit - discount')

    notes = models.TextField(blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'invoices'
        ordering = ['-created_at']

    def __str__(self):
        return f"Hóa đơn #{self.id} - {self.patient.user.get_full_name()} - {self.total_amount:,.0f}đ"

    def calculate_total(self):
        """Tính lại tổng tiền"""
        self.subtotal = sum(item.subtotal for item in self.items.all())
        self.total_amount = max(Decimal('0'), self.subtotal - self.deposit_deducted - self.discount)
        return self.total_amount


class InvoiceItem(models.Model):
    """
    Từng dòng dịch vụ trong hóa đơn.
    """
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='items')
    service = models.ForeignKey(
        'services.Service', on_delete=models.SET_NULL, null=True, blank=True
    )
    description = models.CharField(max_length=300, help_text='Tên dịch vụ / mô tả')
    quantity = models.IntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        db_table = 'invoice_items'

    def save(self, *args, **kwargs):
        self.subtotal = self.unit_price * self.quantity
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.description} x{self.quantity} = {self.subtotal:,.0f}đ"
