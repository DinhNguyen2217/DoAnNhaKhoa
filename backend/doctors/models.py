from django.db import models


class Doctor(models.Model):
    user = models.OneToOneField('accounts.User', on_delete=models.CASCADE, related_name='doctor_profile')
    specialty = models.CharField(max_length=100)
    experience_years = models.IntegerField(default=0)
    description = models.TextField(blank=True)
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'doctors'

    def __str__(self):
        return f"BS. {self.user.get_full_name()} - {self.specialty}"
