from django.contrib import admin
from .models import Invoice, InvoiceItem


class InvoiceItemInline(admin.TabularInline):
    model = InvoiceItem
    extra = 1
    readonly_fields = ['subtotal']


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ['id', 'patient', 'status', 'payment_method', 'subtotal',
                    'deposit_deducted', 'total_amount', 'paid_at', 'created_at']
    list_filter = ['status', 'payment_method']
    search_fields = ['patient__user__first_name', 'patient__user__last_name']
    readonly_fields = ['subtotal', 'total_amount', 'created_at', 'updated_at', 'paid_at']
    inlines = [InvoiceItemInline]
