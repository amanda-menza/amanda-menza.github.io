import logging
import datetime
import json
from io import BytesIO
import os
import stat
import platform
import subprocess

logger = logging.getLogger("audit_logger")
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # Gets 'backend/' directory
LOG_FILE = os.path.join(BASE_DIR, "backend", "audit.log")
def log_request(request):
        try:
            log_data = {
                "method": request.method,
                "path": request.path,
                "user": request.user.username if request.user.is_authenticated else "Anonymous",
                "ip": request.META.get("REMOTE_ADDR"),
                "headers": {k: v for k, v in request.META.items() if k.startswith("HTTP_")},
                "body": request.body.decode("utf-8") if request.body else None
            }
        except Exception as e:
            logger.error(f"Error logging request: {str(e)}")
class AuditLoggingMiddleware:
    """Middleware to log all user actions and modifications."""
  

    def __init__(self, get_response):
        self.get_response = get_response

        # Ensure log file exists
        if not os.path.exists(LOG_FILE):
            with open(LOG_FILE, "w") as f:
                f.write("")  # Create an empty file if it doesn't exist

    def __call__(self, request):
        """Intercepts the request and logs actions."""
        log_request(request)


        # Save the request body before it's consumed
        if request.method in ["POST", "PUT", "DELETE", "PATCH"]:
            request._body = request.body if hasattr(request, 'body') else ""
            logger.debug(f"Captured request body: {request._body}")

        # Process the request
        response = self.get_response(request)

        # Retrieve user and client IP
        ip = self.get_client_ip(request)
        timestamp = datetime.datetime.now().isoformat()
        request_data = self.get_request_data(request)

        
        if request.user.is_authenticated:
            user = request.user.username
            logger.debug(f"Authenticated User: {user}")

            if request.method in ["POST", "PUT", "DELETE", "PATCH"]:
                logger.info(
                    f"[{timestamp}] IP: {ip}, User: {user}, Method: {request.method}, "
                    f"Path: {request.path}, Data: {request_data}"
                )

        # Check if it's a login or SSO-related request
        elif (request.method == "POST" and "token" in request.path) or (request.method == "GET" and "sso-token-redirect" in request.path):
            logger.debug("Detected potential SSO or token-related request.")

            username_from_body = self.get_username_from_request(request)
            username = username_from_body if username_from_body else "unknown"
            logger.info(
                f"[{timestamp}] IP: {ip}, User: {username}, Method: {request.method}, "
                f"Path: {request.path}, Data: {request_data}"
            )

        else:
            logger.debug(f"No logging conditions met for {request.method} {request.path}")

        return response
    
    def get_client_ip(self, request):
        """Extracts the real IP address from request headers."""
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            ip = x_forwarded_for.split(",")[0]
        else:
            ip = request.META.get("REMOTE_ADDR")
        return ip

    def get_request_data(self, request):
        """Extracts request data safely, avoiding sensitive fields."""
        if request.method in ["POST", "PUT", "DELETE", "PATCH"]:
            try:
                data = {}
                
                # Use the saved body if available
                if hasattr(request, '_body') and request._body:
                    if request.content_type == "application/json":
                        try:
                            data = json.loads(request._body)
                        except json.JSONDecodeError:
                            data = {}
                else:
                    # Handle form-encoded data
                    data = request.POST.dict() if request.POST else {}

                # Include files (if any)
                if request.FILES:
                    files = {file.name: file.size for file in request.FILES.values()}
                    data['files'] = files

                # Optionally, mask sensitive fields (like passwords)
                sensitive_fields = ["password", "token"]
                for field in sensitive_fields:
                    if field in data:
                        data[field] = "****"

                return json.dumps(data) if data else "{}"

            except Exception as e:
                return f"Error parsing request data: {str(e)}"

        return "{}"  # Return empty data if not a POST, PUT, DELETE, or PATCH
    
    def get_username_from_request(self, request):
            """Extracts the username from the request body for login attempts."""
            username_from_body = None
            try:
                if hasattr(request, '_body') and request._body:
                    if request.content_type == "application/json":
                        data = json.loads(request._body)
                        username_from_body = data.get("username", None)
            except json.JSONDecodeError:
                pass
            return username_from_body