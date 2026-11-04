from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DoctorScheduleViewSet,
    StaffSalaryConfigViewSet,
    PayrollRecordViewSet,
)

router = DefaultRouter()
router.register('salary-configs', StaffSalaryConfigViewSet, basename='salary-config')
router.register('payrolls', PayrollRecordViewSet, basename='payroll')
router.register('', DoctorScheduleViewSet, basename='schedule')

urlpatterns = [path('', include(router.urls))]
