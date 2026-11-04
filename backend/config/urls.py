from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    # Auth & User management
    path('api/auth/', include('accounts.urls')),

    # Core management
    path('api/doctors/', include('doctors.urls')),
    path('api/patients/', include('patients.urls')),
    path('api/services/', include('services.urls')),

    # Schedules & Appointments
    path('api/schedules/', include('schedules.urls')),
    path('api/appointments/', include('appointments.urls')),

    # Medical records
    path('api/medical/', include('medical.urls')),

    # Invoices
    path('api/invoices/', include('invoices.urls')),

    # Statistics
    path('api/stats/', include('stats.urls')),

    # Chatbot
    path('api/chatbot/', include('chatbot.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
