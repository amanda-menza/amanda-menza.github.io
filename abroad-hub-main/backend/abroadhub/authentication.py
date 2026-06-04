import jwt
from django.contrib.auth import get_user_model
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from .models import AppUser

User = get_user_model()

class JWTNetIDAuthentication(BaseAuthentication):
    def authenticate(self, request):
        id_token = request.headers.get("X-ID-Token")

        if not id_token:
            return None  # No authentication, DRF will try the next auth class

        try:
            # Decode the JWT without verification (for simplicity)
            decoded_token = jwt.decode(id_token, options={"verify_signature": False})
            netid = decoded_token["sub"].split("@")[0]  # Extract NetID

            if not netid:
                return None  # Skip authentication

            try:
                user = User.objects.get(username=netid)
                return (user, None)
            except User.DoesNotExist:
                return None  # Instead of raising an exception
            
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed("Token has expired")
        except jwt.InvalidTokenError:
            raise AuthenticationFailed("Invalid token")
        except KeyError:
            raise AuthenticationFailed("Invalid token structure: 'sub' missing")