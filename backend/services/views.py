from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from accounts.permissions import IsAdmin
from .models import Service
from .serializers import ServiceSerializer, ServiceCreateUpdateSerializer


class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category', 'is_active']
    search_fields = ['name', 'description', 'category']

    def get_permissions(self):
        # Bệnh nhân và mọi người có thể xem dịch vụ (kể cả chưa đăng nhập)
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdmin()]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ServiceCreateUpdateSerializer
        return ServiceSerializer
