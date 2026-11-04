from django.contrib import admin
from .models import Doctor


@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ['user', 'specialty', 'experience_years', 'consultation_fee', 'is_available', 'created_at']
    list_filter = ['specialty', 'is_available']
    search_fields = ['user__first_name', 'user__last_name', 'specialty']
    list_editable = ['is_available']
