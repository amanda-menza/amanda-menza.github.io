"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from abroadhub.admin import admin_site
from abroadhub import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static
from abroadhub.mfa import mfa_views
from django.views.static import serve
import os


urlpatterns = [
    path('admin/', admin_site.urls),
    path("api/user/register/", views.CreateAppUserView.as_view(), name="register"),
    # path("api/token/", TokenObtainPairView.as_view(), name="get_token"),
    path("api/token/", mfa_views.CustomTokenObtainPairView.as_view(), name="get_token"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("api-auth/", include("rest_framework.urls", namespace='api-auth')), 
    path("", include("abroadhub.urls", namespace='abroadhub')),
    path("api/password-reset/", views.change_password, name='change_password'),
    path('api/csrf-token/', views.csrf_token, name='csrf_token'),
    path("admin/audit-logs/", views.view_audit_logs, name="audit_logs"),
    path("api/verify-otp/", mfa_views.VerifyOTPView.as_view(), name="verify_otp"),
    path("api/mfa-settings/", mfa_views.UpdateMFASettingsView.as_view(), name="mfa_settings"),
]

# Serve media files but protect essential documents directory
if settings.DEBUG:
    # Allow Django to serve media files in debug mode, except for essential documents
    urlpatterns += [
        # Serve media files but block direct access to essential documents and recommendation letters
        re_path(r'^media/(?!essential_documents/)(?!recommendation_letters/)(?P<path>.*)$', serve, {
            'document_root': settings.MEDIA_ROOT,
        }),
        # Document templates are public, so we serve them directly
        re_path(r'^media/document_templates/(?P<path>.*)$', serve, {
            'document_root': os.path.join(settings.MEDIA_ROOT, 'document_templates'),
        }),
    ]
else:
    # In production, all media should be served by the web server with appropriate rules
    # This is just a fallback for Django to handle requests that reach it
    urlpatterns += [
        # Block direct access to essential documents and recommendation letters in production too
        re_path(r'^media/(?!essential_documents/)(?!recommendation_letters/)(?P<path>.*)$', serve, {
            'document_root': settings.MEDIA_ROOT,
        }),
    ]
