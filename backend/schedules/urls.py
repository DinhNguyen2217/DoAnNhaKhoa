from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DoctorScheduleViewSet

router = DefaultRouter()
router.register('', DoctorScheduleViewSet, basename='schedule')

urlpatterns = [path('', include(router.urls))]
