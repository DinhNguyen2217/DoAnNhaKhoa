from django.contrib import admin
from .models import MedicalRecord, TreatmentPlan, TreatmentSession, Prescription, PrescriptionItem


class PrescriptionItemInline(admin.TabularInline):
    model = PrescriptionItem
    extra = 1


class TreatmentSessionInline(admin.TabularInline):
    model = TreatmentSession
    extra = 1


@admin.register(MedicalRecord)
class MedicalRecordAdmin(admin.ModelAdmin):
    list_display = ['id', 'patient', 'doctor', 'appointment', 'is_completed', 'created_at']
    list_filter = ['is_completed', 'doctor']
    search_fields = ['patient__user__first_name', 'patient__user__last_name', 'diagnosis']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(TreatmentPlan)
class TreatmentPlanAdmin(admin.ModelAdmin):
    list_display = ['title', 'patient', 'doctor', 'status', 'estimated_sessions', 'completed_sessions']
    list_filter = ['status']
    search_fields = ['title', 'patient__user__first_name', 'patient__user__last_name']
    inlines = [TreatmentSessionInline]


@admin.register(Prescription)
class PrescriptionAdmin(admin.ModelAdmin):
    list_display = ['id', 'patient', 'doctor', 'created_at']
    search_fields = ['patient__user__first_name', 'patient__user__last_name']
    inlines = [PrescriptionItemInline]
