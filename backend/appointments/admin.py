from django.contrib import admin
from .models import Appointment


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ['id', 'patient', 'doctor', 'appointment_date', 'session',
                    'status', 'deposit_status', 'created_at']
    list_filter = ['status', 'session', 'deposit_status', 'appointment_date']
    search_fields = [
        'patient__user__first_name', 'patient__user__last_name',
        'doctor__user__first_name', 'doctor__user__last_name',
    ]
    ordering = ['-appointment_date']
    readonly_fields = ['created_at', 'updated_at', 'checked_in_at', 'completed_at', 'deposit_confirmed_at']
