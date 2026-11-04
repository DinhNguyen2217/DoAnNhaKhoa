from rest_framework import serializers
from accounts.serializers import UserSerializer, UserCreateSerializer
from accounts.models import User
from .models import Doctor


class DoctorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Doctor
        fields = ['id', 'user', 'full_name', 'specialty', 'experience_years',
                  'description', 'consultation_fee', 'is_available', 'created_at']

    def get_full_name(self, obj):
        return obj.user.get_full_name() or obj.user.username


class DoctorCreateSerializer(serializers.Serializer):
    # User fields
    username = serializers.CharField()
    email = serializers.EmailField(required=False, allow_blank=True)
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    password = serializers.CharField(write_only=True, min_length=6)
    phone = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    # Doctor fields
    specialty = serializers.CharField()
    experience_years = serializers.IntegerField(default=0)
    description = serializers.CharField(required=False, allow_blank=True)
    consultation_fee = serializers.DecimalField(max_digits=10, decimal_places=2, default=0)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('Tên đăng nhập đã tồn tại.')
        return value

    def create(self, validated_data):
        doctor_fields = ['specialty', 'experience_years', 'description', 'consultation_fee']
        doctor_data = {k: validated_data.pop(k) for k in doctor_fields if k in validated_data}
        password = validated_data.pop('password')
        user = User(**validated_data, role='doctor')
        user.set_password(password)
        user.save()
        doctor = Doctor.objects.create(user=user, **doctor_data)
        return doctor


class DoctorUpdateSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name', required=False)
    last_name = serializers.CharField(source='user.last_name', required=False)
    email = serializers.EmailField(source='user.email', required=False)
    phone = serializers.CharField(source='user.phone', required=False)
    address = serializers.CharField(source='user.address', required=False)

    class Meta:
        model = Doctor
        fields = ['first_name', 'last_name', 'email', 'phone', 'address',
                  'specialty', 'experience_years', 'description', 'consultation_fee', 'is_available']

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        for attr, value in user_data.items():
            setattr(instance.user, attr, value)
        instance.user.save()
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
