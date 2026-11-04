from django.contrib import admin
from .models import DoctorSchedule


@admin.register(DoctorSchedule)
class DoctorScheduleAdmin(admin.ModelAdmin):
    list_display = ['doctor', 'date', 'session', 'status', 'created_at']
    list_filter = ['session', 'status', 'date']
    search_fields = ['doctor__user__first_name', 'doctor__user__last_name']
    list_editable = ['status']
    ordering = ['-date']
