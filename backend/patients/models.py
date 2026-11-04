from django.db import models


class Patient(models.Model):
    GENDER_CHOICES = [('M', 'Nam'), ('F', 'Nữ'), ('O', 'Khác')]

    user = models.OneToOneField('accounts.User', on_delete=models.CASCADE, related_name='patient_profile')
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True)
    blood_type = models.CharField(max_length=5, blank=True)
    allergies = models.TextField(blank=True)
    medical_history = models.TextField(blank=True)
    emergency_contact = models.CharField(max_length=100, blank=True)
    emergency_phone = models.CharField(max_length=15, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'patients'

    def __str__(self):
        return f"{self.user.get_full_name()} ({self.user.username})"
