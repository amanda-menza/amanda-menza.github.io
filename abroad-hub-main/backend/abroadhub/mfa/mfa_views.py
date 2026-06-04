# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
import json
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_otp.plugins.otp_totp.models import TOTPDevice
import pyotp


from abroadhub.models import AppUser

User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom JWT token view that handles MFA for local users
    """
    def post(self, request, *args, **kwargs):
        # First try to authenticate and get token as usual
        serializer = self.get_serializer(data=request.data)
        
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        
        # The user is stored directly on the serializer instance after validation
        # Not in validated_data
        user = serializer.user
        
        
        try:
            app_user = AppUser.objects.get(user=user)
            
            # Check if user needs MFA
            if app_user.requires_otp():
                # Create or get the user's TOTP device
                device, created = TOTPDevice.objects.get_or_create(user=user)

                # Generate the OTP URL and pass it back as a QR code URL for the user to scan
                otp_url = device.config_url  # This URL contains the secret key for the user
                 # Store user_id for OTP verification in session
                request.session['user_id_for_otp'] = user.id

                return Response({
                    'detail': 'MFA required',
                    'mfa_required': True,
                    'otp_url': otp_url  # Return URL to display the QR code
                }, status=status.HTTP_200_OK)

                
        except AppUser.DoesNotExist:
            # If no AppUser exists, proceed with regular login
            pass
        
        # No MFA needed or MFA is not configured for this user
        # Return the token response
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class VerifyOTPView(APIView):
    """
    Verify OTP code and return token
    """
    permission_classes = [AllowAny]
    def post(self, request):
        data = request.data
        otp_code = data.get('otp_code')
        user_id = request.session.get('user_id_for_otp')
        
        if not user_id:
            return Response({
                "detail": "No pending OTP verification"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(id=user_id)
            app_user = AppUser.objects.get(user=user)
            
            device = TOTPDevice.objects.get(user=user)
            
            if device and device.verify_token(otp_code):
                # OTP verified, generate tokens
                refresh = RefreshToken.for_user(user)
                
                # Clean up session
                if 'user_id_for_otp' in request.session:
                    del request.session['user_id_for_otp']
                
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    "detail": "Invalid OTP code"
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except (User.DoesNotExist, AppUser.DoesNotExist):
            return Response({
                "detail": "User not found"
            }, status=status.HTTP_404_NOT_FOUND)


class UpdateMFASettingsView(APIView):
    """
    Update MFA settings for current user
    """
    def post(self, request):
        if not request.user.is_authenticated:
            return Response({
                "detail": "Authentication required"
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            app_user = AppUser.objects.get(user=request.user)
            
            # SSO users can't modify MFA settings
            if app_user.is_sso:
                return Response({
                    "detail": "SSO users cannot modify MFA settings"
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Update MFA settings
            enable_mfa = request.data.get('enable_mfa', False)
            app_user.use_mfa = enable_mfa
            app_user.save()
            
            if enable_mfa:
                
                device, created = TOTPDevice.objects.get_or_create(user=request.user, defaults={'confirmed': True})
                if device:
                    device.confirmed = True  # Use `confirmed`, not `created`
                    device.save()
            
            return Response({
                "detail": "MFA settings updated successfully",
                "use_mfa": app_user.use_mfa
            }, status=status.HTTP_200_OK)
            
        except AppUser.DoesNotExist:
            return Response({
                "detail": "User profile not found"
            }, status=status.HTTP_404_NOT_FOUND)
