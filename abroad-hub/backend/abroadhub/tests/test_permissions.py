from django.test import TestCase
from rest_framework.test import APIRequestFactory
from unittest.mock import MagicMock
from rest_framework.permissions import SAFE_METHODS
from abroadhub.permissions import ApplicationPermissions, ProgramPermissions, IsAdmin, IsStudent

class PermissionsTest(TestCase):
    def setUp(self):
        # Create mock users with different user types
        self.admin_user = MagicMock()
        self.admin_user.info.roles= ['Administrator','Faculty']
        
        self.student_user = MagicMock()
        self.student_user.info.roles = ['Student']

        # Mock view object
        self.view = MagicMock()

    def test_admin_permissions_application(self):
        """Admins should have permission for list, retrieve, partial_update, and change_status actions."""
        self.permissions = ApplicationPermissions()
        actions = ['list', 'retrieve', 'partial_update', 'change_status']
        for action in actions:
            self.view.action = action
            request = APIRequestFactory().get('/')
            request.user = self.admin_user
            self.assertTrue(self.permissions.has_permission(request, self.view))

    def test_admin_cannot_create_application(self):
        """Admins should not have permission for create action."""
        self.permissions = ApplicationPermissions()
        self.view.action = 'create'
        request = APIRequestFactory().post('/')
        request.user = self.admin_user
        self.assertFalse(self.permissions.has_permission(request, self.view))

    def test_student_permissions_application(self):
        """Students should have permission for create, list, retrieve, change_status, and partial_update actions"""
        self.permissions = ApplicationPermissions()
        actions = ['create', 'list', 'retrieve', 'change_status', 'partial_update']
        for action in actions:
            self.view.action = action
            request = APIRequestFactory().get('/')
            request.user = self.student_user
            self.assertTrue(self.permissions.has_permission(request, self.view))

    def test_admin_has_object_permission_application(self):
        """Admins should have object-level permission for all applications."""
        self.permissions = ApplicationPermissions()
        obj = MagicMock()  # Mock application object
        request = APIRequestFactory().get('/')
        request.user = self.admin_user
        self.assertTrue(self.permissions.has_object_permission(request, self.view, obj))

    def test_student_has_object_permission_for_own_application(self):
        """Students should only have object-level permission for their own applications."""
        self.permissions = ApplicationPermissions()
        obj = MagicMock()
        obj.student = self.student_user.info
        request = APIRequestFactory().get('/')
        request.user = self.student_user
        self.assertTrue(self.permissions.has_object_permission(request, self.view, obj))

    def test_student_does_not_have_object_permission_for_others_application(self):
        """Students should not have object-level permission for others' applications."""
        self.permissions = ApplicationPermissions()
        obj = MagicMock()
        obj.student = MagicMock()  # Someone else
        request = APIRequestFactory().get('/')
        request.user = self.student_user
        self.assertFalse(self.permissions.has_object_permission(request, self.view, obj))

    def test_invalid_user_role_has_no_permission_application(self):
        """Invalid or missing user types should have no permission."""
        self.permissions = ApplicationPermissions()
        invalid_user = MagicMock()
        invalid_user.info.roles = ['InvalidType']
        request = APIRequestFactory().get('/')
        request.user = invalid_user
        self.assertFalse(self.permissions.has_permission(request, self.view))

    def test_admin_permissions_program(self):
        """Test that Admins have all permissions"""
        self.permissions = ProgramPermissions()
        # Mock view actions for Admin
        actions = ['retrieve', 'list', 'create', 'update', 'delete']
        
        for action in actions:
            self.view.action = action
            request = APIRequestFactory().get('/')  # We are testing the permission based on methods, so HTTP method doesn't matter.
            request.user = self.admin_user
            self.assertTrue(self.permissions.has_permission(request, self.view))

    def test_student_permissions_program(self):
        """Test that Students can only view programs, not modify them."""
        self.permissions = ProgramPermissions()
        # Mock view actions for Students
        actions = ['retrieve', 'list']
        
        for action in actions:
            self.view.action = action
            request = APIRequestFactory().get('/')
            request.user = self.student_user
            self.assertTrue(self.permissions.has_permission(request, self.view))
        
        # Test that students cannot create, update, or delete programs
        actions = ['create', 'update', 'delete']
        
        for action in actions:
            self.view.action = action
            request = APIRequestFactory().post('/')
            request.user = self.student_user
            self.assertFalse(self.permissions.has_permission(request, self.view))

    def test_object_permission_for_student_program(self):
        """Test that students can view their program but not modify it."""
        self.permissions = ProgramPermissions()
        # For GET (view) actions, students should have permission
        request = APIRequestFactory().get('/')
        request.user = self.student_user
        obj = MagicMock()  # Create a mock program object
        obj.student = self.student_user.info  # Mock the student owning the program
        
        self.assertTrue(self.permissions.has_object_permission(request, self.view, obj))

        # For actions that modify the program, students should not have permission
        actions = ['update', 'delete']
        for action in actions:
            self.view.action = action
            request = APIRequestFactory().post('/')
            request.user = self.student_user
            self.assertFalse(self.permissions.has_object_permission(request, self.view, obj))

    def test_object_permission_for_admin_program(self):
        """Test that admins can modify any program."""
        self.permissions = ProgramPermissions()
        request = APIRequestFactory().get('/')
        request.user = self.admin_user
        obj = MagicMock()  # Create a mock program object
        obj.student = self.student_user.info  # Mock the student owning the program
        
        # Admins can modify programs regardless of ownership
        self.assertTrue(self.permissions.has_object_permission(request, self.view, obj))

    def test_is_admin_permission(self):
        self.permissions = IsAdmin()
        request = APIRequestFactory().get('/')
        request.user = self.admin_user
        self.assertTrue(self.permissions.has_permission(request, self.view))

        request.user = self.student_user
        self.assertFalse(self.permissions.has_permission(request, self.view))

    def test_is_student_permission(self):
        self.permissions = IsStudent()
        request = APIRequestFactory().get('/')
        request.user = self.student_user
        self.assertTrue(self.permissions.has_permission(request, self.view))

        request.user = self.admin_user
        self.assertFalse(self.permissions.has_permission(request, self.view))

