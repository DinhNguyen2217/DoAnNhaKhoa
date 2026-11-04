from rest_framework import serializers
from accounts.serializers import UserSerializer
from accounts.models import User
from .models import Patient


class PatientSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()
    age = serializers.SerializerMethodField()

    class Meta:
        model = Patient
        fields = ['id', 'user', 'full_name', 'age', 'date_of_birth', 'gender',
                  'blood_type', 'allergies', 'medical_history',
                  'emergency_contact', 'emergency_phone', 'created_at']

    def get_full_name(self, obj):
        return obj.user.get_full_name() or obj.user.username

    def get_age(self, obj):
        if obj.date_of_birth:
            from datetime import date
            today = date.today()
            return today.year - obj.date_of_birth.year - (
                (today.month, today.day) < (obj.date_of_birth.month, obj.date_of_birth.day)
            )
        return None


class PatientCreateSerializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.EmailField(required=False, allow_blank=True)
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    password = serializers.CharField(write_only=True, default='patient123')
    phone = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    gender = serializers.ChoiceField(choices=['M', 'F', 'O'], required=False, allow_blank=True)
    blood_type = serializers.CharField(required=False, allow_blank=True)
    allergies = serializers.CharField(required=False, allow_blank=True)
    medical_history = serializers.CharField(required=False, allow_blank=True)
    emergency_contact = serializers.CharField(required=False, allow_blank=True)
    emergency_phone = serializers.CharField(required=False, allow_blank=True)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('Tên đăng nhập đã tồn tại.')
        return value

    def create(self, validated_data):
        patient_fields = ['date_of_birth', 'gender', 'blood_type', 'allergies',
                          'medical_history', 'emergency_contact', 'emergency_phone']
        patient_data = {k: validated_data.pop(k) for k in patient_fields if k in validated_data}
        password = validated_data.pop('password')
        user = User(**validated_data, role='patient')
        user.set_password(password)
        user.save()
        patient = Patient.objects.create(user=user, **patient_data)
        return patient


class PatientUpdateSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name', required=False)
    last_name = serializers.CharField(source='user.last_name', required=False)
    email = serializers.EmailField(source='user.email', required=False)
    phone = serializers.CharField(source='user.phone', required=False)
    address = serializers.CharField(source='user.address', required=False)

    class Meta:
        model = Patient
        fields = ['first_name', 'last_name', 'email', 'phone', 'address',
                  'date_of_birth', 'gender', 'blood_type', 'allergies',
                  'medical_history', 'emergency_contact', 'emergency_phone']

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        for attr, value in user_data.items():
            setattr(instance.user, attr, value)
        instance.user.save()
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
