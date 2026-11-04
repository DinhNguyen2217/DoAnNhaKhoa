from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MedicalRecordViewSet, TreatmentPlanViewSet, PrescriptionViewSet

router = DefaultRouter()
router.register('records', MedicalRecordViewSet, basename='medical-record')
router.register('treatment-plans', TreatmentPlanViewSet, basename='treatment-plan')
router.register('prescriptions', PrescriptionViewSet, basename='prescription')

urlpatterns = [path('', include(router.urls))]
