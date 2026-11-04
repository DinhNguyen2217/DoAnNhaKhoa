from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from accounts.permissions import IsAdmin, IsAdminOrReceptionist
from .models import Doctor
from .serializers import DoctorSerializer, DoctorCreateSerializer, DoctorUpdateSerializer


class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.select_related('user').all().order_by('user__first_name')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['specialty', 'is_available']
    search_fields = ['user__first_name', 'user__last_name', 'specialty']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdmin()]

    def get_serializer_class(self):
        if self.action == 'create':
            return DoctorCreateSerializer
        if self.action in ['update', 'partial_update']:
            return DoctorUpdateSerializer
        return DoctorSerializer

    def create(self, request, *args, **kwargs):
        serializer = DoctorCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        doctor = serializer.save()
        return Response(DoctorSerializer(doctor).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def toggle_available(self, request, pk=None):
        doctor = self.get_object()
        doctor.is_available = not doctor.is_available
        doctor.save()
        return Response({'is_available': doctor.is_available})
