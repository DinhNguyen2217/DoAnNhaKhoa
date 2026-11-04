from django.contrib import admin
from .models import Patient


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ['user', 'date_of_birth', 'gender', 'blood_type', 'emergency_contact', 'created_at']
    list_filter = ['gender', 'blood_type']
    search_fields = ['user__first_name', 'user__last_name', 'user__phone']
    readonly_fields = ['created_at', 'updated_at']
