from django.urls import path
from .views import (
    DashboardStatsView,
    RevenueStatsView,
    AppointmentStatsView,
    DoctorScheduleStatsView,
    PatientStatsView,
)

urlpatterns = [
    path('dashboard/', DashboardStatsView.as_view(), name='stats-dashboard'),
    path('revenue/', RevenueStatsView.as_view(), name='stats-revenue'),
    path('appointments/', AppointmentStatsView.as_view(), name='stats-appointments'),
    path('doctor-schedules/', DoctorScheduleStatsView.as_view(), name='stats-doctor-schedules'),
    path('patients/', PatientStatsView.as_view(), name='stats-patients'),
]
