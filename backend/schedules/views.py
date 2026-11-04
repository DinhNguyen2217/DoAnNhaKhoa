from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from accounts.permissions import IsAdmin, IsDoctor, IsAdminOrReceptionist
from .models import DoctorSchedule
from .serializers import (
    DoctorScheduleSerializer,
    DoctorScheduleCreateSerializer,
    DoctorScheduleAdminUpdateSerializer,
)


class DoctorScheduleViewSet(viewsets.ModelViewSet):
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['doctor', 'date', 'session', 'status']
    search_fields = ['doctor__user__first_name', 'doctor__user__last_name']
    ordering_fields = ['date', 'created_at']

    def get_queryset(self):
        user = self.request.user
        # Bác sĩ chỉ xem lịch của mình
        if user.role == 'doctor':
            return DoctorSchedule.objects.filter(
                doctor=user.doctor_profile
            ).select_related('doctor__user').order_by('-date')
        # Admin, lễ tân xem tất cả
        return DoctorSchedule.objects.select_related('doctor__user').all().order_by('-date')

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        if self.action == 'create':
            return [IsDoctor()]
        if self.action in ['update', 'partial_update', 'destroy']:
            # Bác sĩ sửa lịch của mình, Admin sửa tất cả
            return [IsAuthenticated()]
        return [IsAdmin()]

    def get_serializer_class(self):
        if self.action == 'create':
            return DoctorScheduleCreateSerializer
        if self.action in ['update', 'partial_update']:
            user = self.request.user
            if user.role == 'admin':
                return DoctorScheduleAdminUpdateSerializer
            return DoctorScheduleCreateSerializer
        return DoctorScheduleSerializer

    def perform_create(self, serializer):
        doctor = self.request.user.doctor_profile
        serializer.save(doctor=doctor, status='registered')

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        user = request.user
        # Bác sĩ chỉ được sửa lịch của mình
        if user.role == 'doctor' and instance.doctor != user.doctor_profile:
            return Response({'detail': 'Bạn không có quyền sửa lịch này.'}, status=status.HTTP_403_FORBIDDEN)
        # Khi admin sửa, đánh dấu status là modified
        partial = kwargs.pop('partial', False)
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        if user.role == 'admin':
            serializer.save(status='modified')
        else:
            serializer.save()
        return Response(DoctorScheduleSerializer(instance).data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        user = request.user
        # Bác sĩ chỉ xóa lịch của mình, admin xóa tất cả
        if user.role == 'doctor' and instance.doctor != user.doctor_profile:
            return Response({'detail': 'Bạn không có quyền xóa lịch này.'}, status=status.HTTP_403_FORBIDDEN)
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'], url_path='my-schedules')
    def my_schedules(self, request):
        """Bác sĩ xem lịch của mình"""
        if request.user.role != 'doctor':
            return Response({'detail': 'Chỉ dành cho bác sĩ.'}, status=status.HTTP_403_FORBIDDEN)
        schedules = DoctorSchedule.objects.filter(
            doctor=request.user.doctor_profile
        ).order_by('-date')
        serializer = DoctorScheduleSerializer(schedules, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='by-date')
    def by_date(self, request):
        """Lấy lịch làm việc theo ngày - dùng cho trang đặt lịch hẹn"""
        date = request.query_params.get('date')
        if not date:
            return Response({'detail': 'Vui lòng cung cấp ngày (date).'}, status=status.HTTP_400_BAD_REQUEST)
        schedules = DoctorSchedule.objects.filter(
            date=date, status__in=['registered', 'approved']
        ).select_related('doctor__user')
        serializer = DoctorScheduleSerializer(schedules, many=True)
        return Response(serializer.data)
