from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from accounts.permissions import IsAdmin, IsAdminOrReceptionist, IsAdminOrDoctorOrReceptionist
from .models import Patient
from .serializers import PatientSerializer, PatientCreateSerializer, PatientUpdateSerializer


class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.select_related('user').all().order_by('-created_at')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['gender']
    search_fields = ['user__first_name', 'user__last_name', 'user__phone', 'user__username']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAdminOrDoctorOrReceptionist()]
        if self.action == 'create':
            return [IsAdminOrReceptionist()]
        if self.action in ['update', 'partial_update']:
            return [IsAdminOrReceptionist()]
        return [IsAdmin()]

    def get_serializer_class(self):
        if self.action == 'create':
            return PatientCreateSerializer
        if self.action in ['update', 'partial_update']:
            return PatientUpdateSerializer
        return PatientSerializer

    def create(self, request, *args, **kwargs):
        serializer = PatientCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        patient = serializer.save()
        return Response(PatientSerializer(patient).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_profile(self, request):
        try:
            patient = Patient.objects.get(user=request.user)
            return Response(PatientSerializer(patient).data)
        except Patient.DoesNotExist:
            return Response({'detail': 'Không tìm thấy hồ sơ bệnh nhân.'}, status=404)
