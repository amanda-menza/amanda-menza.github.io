from rest_framework.permissions import BasePermission
from rest_framework import permissions
from .models import Application

class ApplicationPermissions(BasePermission):
    def has_permission(self, request, view):
        if "Partner" in request.user.info.roles:
            if view.action in ['change_payment_status']:
                return True
        if "Administrator" in request.user.info.roles:
            if view.action in ['change_payment_status']:
                return True
        if any(role in request.user.info.roles for role in ["Administrator", "Reviewer", "Faculty"]):
            # Admins can view all applications (GET action)
            if view.action in ['list', 'retrieve', 'partial_update', 'change_status', 'notes']:  # Added 'notes' action
                return True

            # Admins cannot create applications
            if view.action == 'create':
                return False

        if any(role in request.user.info.roles for role in ["Student"]):
            if view.action == 'create':
                return True
            if view.action in ['retrieve', 'list', 'change_status', 'partial_update', 'upload_document']:
                return True
        return False

    def has_object_permission(self, request, view, obj):
        # Object-level permissions ensure that a student can only access their own application
        if any(role in request.user.info.roles for role in ["Administrator","Reviewer"]):
            return True  # Admins can access all applications
        
        if "Faculty" in request.user.info.roles and obj.program.faculty_leads.contains(request.user.info):
            
            return True

        if any(role in request.user.info.roles for role in ["Student"]):
            return obj.student == request.user.info  # Students can only access their own application

        if view.action == 'upload_document':
            return obj.student == request.user.info or any(role in request.user.info.roles for role in ["Administrator"])

        return False


class ConfidentialNotesPermissions(BasePermission):
    def has_permission(self, request, view):
        user_roles = request.user.info.roles
        application_id = request.parser_context['kwargs'].get('application_id')

        # Fetch the application (if it exists)
        application = Application.objects.filter(id=application_id).first()

        if not application:
            return False  # No application found, deny access

        # Admins & Reviewers can access all notes
        if any(role in user_roles for role in ["Administrator", "Reviewer"]):
            return True  

        # Faculty can only access notes if they are a faculty lead for the program
        if "Faculty" in user_roles:
            return application.program.faculty_leads.filter(id=request.user.info.id).exists()

        # Students are denied access entirely
        if "Student" in user_roles:
            return False  

        return False  # Default deny


    def has_object_permission(self, request, view, obj):
        user_roles = request.user.info.roles

        # Admins & Reviewers can access all notes
        if any(role in user_roles for role in ["Administrator", "Reviewer"]):
            return True  

        # Faculty can access notes only if they are a faculty lead for the program
        if "Faculty" in user_roles and obj.application.program.faculty_leads.filter(id=request.user.info.id).exists():
            return True  

        # Students **cannot** access notes at all
        if "Student" in user_roles:
            return False  

        return False  # Default deny



class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return any(role in request.user.info.roles for role in ["Administrator"])
    
class IsStudent(BasePermission):
    def has_permission(self, request, view):
        return any(role in request.user.info.roles for role in ["Student"])
    
class IsPartner(BasePermission):
    def has_permission(self, request, view):
        return any(role in request.user.info.roles for role in ["Partner"])

class IsNotPartner(BasePermission):
    def has_permission(self, request, view):
        return not any(role in request.user.info.roles for role in ["Partner"])
    
class IsFaculty(BasePermission):
    def has_permission(self, request, view):
        return any(role in request.user.info.roles for role in ["Faculty"])

class IsReviewer(BasePermission):
    def has_permission(self, request, view):
        return any(role in request.user.info.roles for role in ["Reviewer"])

class NotStudent(BasePermission):
    def has_permission(self,request,view):
        return any(role in request.user.info.roles for role in ["Administrator","Faculty","Reviewer"])

class Not_SSO(BasePermission):
    def has_permission(self, request, view):
        return request.user.info.is_sso == False

class ProgramPermissions(BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return any(role in request.user.info.roles for role in ["Administrator"])

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return any(role in request.user.info.roles for role in ["Administrator"])
    
class ProgramApplicationCountsPermission(BasePermission):
    def has_permission(self, request, view):
        # Allow only Admin users to access the application counts
        return any(role in request.user.info.roles for role in ["Administrator"])

class StudentApplicationsViewPermission(BasePermission):
    def has_permission(self, request, view):
        # Allow only students to access their application pages
        return any(role in request.user.info.roles for role in ["Student"])
    
class ApplicationCountPermission(BasePermission):
    def has_permission(self, request, view):
        # Allow only students to access their application counts
        return any(role in request.user.info.roles for role in ["Student"])
    
class ProgramCountPermission(BasePermission):
    def has_permission(self, request, view):
        # Allow only students to access their program counts
        return any(role in request.user.info.roles for role in ["Student"])

class AdminUserQueryPermission(BasePermission):
    def has_permission(self, request, view):
        # Allow only Admin users to access the application counts
        return any(role in request.user.info.roles for role in ["Administrator"])

class StudentApplicationsViewPermission(BasePermission):
    def has_permission(self, request, view):
        # Allow only students to access their application pages
        return any(role in request.user.info.roles for role in ["Student"])
    
class ApplicationCountPermission(BasePermission):
    def has_permission(self, request, view):
        # Allow only students to access their application counts
        return any(role in request.user.info.roles for role in ["Student"])
    
class ProgramCountPermission(BasePermission):
    def has_permission(self, request, view):
        # Allow only students to access their program counts
        return any(role in request.user.info.roles for role in ["Student"])
    
class RecommendationLetterPermission(BasePermission):
    """
    Permission class for recommendation letters:
    - Students can only request and view letters for their own applications
    - Admins can view all letters
    - Reviewers can view all letters
    - Faculty can only view letters for programs they are assigned to
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated or not hasattr(request.user, 'info'):
            return False
            
        user_info = request.user.info
        
        # For list and retrieve actions
        if view.action in ['list', 'retrieve']:
            return True  # Fine-grained filtering happens in get_queryset or has_object_permission
            
        # For create action - only students and admins can create (checked in perform_create)
        if view.action == 'create':
            return 'Administrator' in user_info.roles or 'Student' in user_info.roles
            
        # For destroy action - students can only delete their own; admins can delete any
        if view.action == 'destroy':
            return True  # Checked in destroy method
            
        return False
        
    def has_object_permission(self, request, view, obj):
        user_info = request.user.info
        
        # Admins and Reviewers can access all
        if 'Administrator' in user_info.roles or 'Reviewer' in user_info.roles:
            return True
            
        # Faculty can only access letters for programs they are assigned to
        if 'Faculty' in user_info.roles:
            return obj.application.program.faculty_leads.filter(id=user_info.id).exists()
            
        # Students can only access their own applications' letters
        if 'Student' in user_info.roles:
            return obj.application.student == user_info
            
        return False