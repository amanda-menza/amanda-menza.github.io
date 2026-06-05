from django.test import TestCase
from django.contrib.auth.models import User
from abroadhub.models import AppUser, UserProfile, Program, Application, Content, ConfidentialNote,DocumentTemplate
from abroadhub.serializers import (
    UserSerializer,
    UserProfileSerializer,
    AppUserSerializer,
    ProgramSerializer,
    ApplicationSerializer,
    ContentSerializer,
    ConfidentialNoteSerializer,
    DocumentUploadSerializer
)
from datetime import date
from decimal import Decimal
from django.core.files.uploadedfile import SimpleUploadedFile
import os
from django.conf import settings




class SerializerTestCase(TestCase):
    def setUp(self):
        # Create a user
        self.user = User.objects.create_user(
            username="testuser", email="test@example.com", password="password123"
        )

        self.alt_user = User.objects.create_user(
            username="alttestuser", email="alttest@example.com", password="password123"
        )
        self.admin_user = User.objects.create_user(
            username="admin", email="admin@example.com", password="password123"
        )

        # Create an AppUser for the user
        self.app_user = AppUser.objects.create(
            user=self.user,
            roles=['Student'],
            display_name="Test User",
            dob="2002-02-02"
        )

        self.alt_app_user = AppUser.objects.create(
            user=self.alt_user,
            roles=["Student"],
            display_name="Alt Test User",
            dob="2000-01-01"

        )
        self.admin_appuser = AppUser.objects.create(
            user = self.admin_user,
            roles=['Administrator','Faculty'],
            display_name="Administrator",
            dob="2002-02-02"
        )

        # Create a UserProfile for the AppUser
        self.user_profile = UserProfile.objects.create(
            major="CS",
            gpa=3.5
        )
        self.app_user.profile=self.user_profile

 # Convert string dates to datetime.date
       # Use datetime.date directly
        start_date = date(2025, 9, 1)
        end_date = date(2025, 12, 15)
        open_date = date(2025, 3, 1)
        deadline = date(2025, 6, 1)
        essential_doc_deadline = date(2025, 6, 1)

        self.program = Program.objects.create(
            title="Study Abroad",
            year=2025,
            semester="Fall",
            location="Paris",
            description="An amazing opportunity to study abroad.",
            start_date=start_date,
            end_date=end_date,
            open_date=open_date,
            deadline=deadline,
            essential_doc_deadline=essential_doc_deadline
        )
    
        self.program.faculty_leads.set([self.admin_appuser.id])


        # Create an application
        self.application = Application.objects.create(
            student=self.app_user,
            program=self.program,
            status="Applied",
            submission_date=date.today(),
        )

        # Create content
        self.content = Content.objects.create(content="Some sample content.")
        
        self.note = ConfidentialNote.objects.create(
            application=self.application,
            author=self.admin_appuser,
            content="This is a confidential note."
        )
    

    def test_user_serializer(self):
        # Serialize the user instance
        serializer = UserSerializer(instance=self.user)
        data = serializer.data
        self.assertEqual(data["username"], "testuser")
        self.assertEqual(data["email"], "test@example.com")

        # Test user creation (deserialization)
        new_user_data = {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "password456",
        }
        serializer = UserSerializer(data=new_user_data)
        self.assertTrue(serializer.is_valid())  # Test deserialization validity
        new_user = serializer.save()  # Deserialize data and save it
        self.assertEqual(new_user.username, "newuser")
        self.assertTrue(new_user.check_password("password456"))

        # Additional test: Deserialization failure (missing password)
        invalid_data = {
            "username": "userwithoutpassword",
            "email": "no_password@example.com",
        }
        serializer = UserSerializer(data=invalid_data)
        self.assertTrue(serializer.is_valid())

    def test_user_profile_serializer(self):
        # Serialize the user profile instance
        serializer = UserProfileSerializer(instance=self.user_profile)
        data = serializer.data
        self.assertEqual(data["major"], "CS")
        self.assertEqual(data["gpa"], "3.50")

        # Test profile deserialization (create)
        new_profile_data = {
            "major": "Mathematics",
            "gpa": 3.98,
        }
        serializer = UserProfileSerializer(data=new_profile_data)
        self.assertTrue(serializer.is_valid())
        new_profile = serializer.save()  # Save deserialized data to create UserProfile
        self.alt_app_user.profile = new_profile
        self.assertEqual(new_profile.major, "Mathematics")
        self.assertEqual(new_profile.gpa, Decimal('3.98'))

    def test_app_user_serializer(self):
        # Serialize the AppUser instance
        serializer = AppUserSerializer(instance=self.app_user)
        data = serializer.data
        self.assertEqual(data["display_name"], self.app_user.display_name)
        self.assertEqual(data["profile"]["major"], "CS")

        # Test AppUser deserialization (create)
        app_user_data = {
            "user": {
                "username": "deserializeduser",
                "email": "deserializeduser@example.com",
                "password": "password789",
                "dob": "1998-07-15",

            },
            "display_name": "Deserialized User",
            "profile": {
                "major": "Physics",
                "gpa": 3.7,
            },
        }
        serializer = AppUserSerializer(data=app_user_data)
        self.assertTrue(serializer.is_valid())
        app_user = serializer.save()  # Deserialize data and save it to create AppUser
        self.assertEqual(app_user.display_name, "Deserialized User")
        self.assertEqual(app_user.profile.major, "Physics")

    def test_program_serializer(self):
        # Serialize the Program instance
        serializer = ProgramSerializer(instance=self.program)
        data = serializer.data
        self.assertEqual(data["title"], "Study Abroad")
        self.assertEqual(data["year"], 2025)
        self.assertEqual(data["semester"], "Fall")

        # Test Program deserialization (create)
        program_data = {
            "title": "Exchange Program",
            "year": 2025,
            "semester": "Spring",
            "location": "London",
            "faculty_leads": [self.admin_appuser.id],
            "description": "An exciting semester abroad in London.",
            "start_date": "2025-01-15",
            "end_date": "2025-05-15",
            "open_date": "2024-09-01",
            "deadline": "2024-10-01",
            "essential_doc_deadline":"2025-10-01"
        }
        serializer = ProgramSerializer(data=program_data)
        self.assertTrue(serializer.is_valid())
        program = serializer.save()  # Deserialize data and create the Program
        self.assertEqual(program.title, "Exchange Program")
        self.assertEqual(program.location, "London")

    def test_application_serializer(self):
        # Serialize the Application instance
        serializer = ApplicationSerializer(instance=self.application)
        data = serializer.data
        self.assertEqual(data["status"], "Applied")

        # Test Application deserialization (create)
        application_data = {
            "status": "Enrolled",
            "submission_date": date.today(),
            "answers": [],
        }

        # Ensure you are passing data to the serializer here
        serializer = ApplicationSerializer(data=application_data)
        
        self.assertTrue(serializer.is_valid())  # Ensure serializer is valid

        # Save the application instance if valid
        application = serializer.save(student=self.app_user, program=self.program)

        # Check that the fields are correctly saved
        self.assertEqual(application.student, self.app_user)
        self.assertEqual(application.program, self.program)
        self.assertEqual(application.status, "Enrolled")


    def test_content_serializer(self):
        # Serialize the Content instance
        serializer = ContentSerializer(instance=self.content)
        data = serializer.data
        self.assertEqual(data["content"], "Some sample content.")

        # Test Content deserialization (create)
        content_data = {
            "content": "New content for the platform.",
        }
        serializer = ContentSerializer(Content.objects.first(), data=content_data)
        self.assertTrue(serializer.is_valid())
        content = serializer.save()  # Deserialize and create Content
        self.assertEqual(content.content, "New content for the platform.")

    def test_nested_create_app_user(self):
        # Test creating an AppUser with nested data
        data = {
            "user": {
                "username": "nesteduser",
                "email": "nested@example.com",
                "password": "nestedpassword",
            },
            "display_name": "Nested User",
            "dob": "1999-12-31",
            "profile": {
                "major": "Biology",
                "gpa": 3.8,
            },
        }
        serializer = AppUserSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        app_user = serializer.save()
        self.assertEqual(app_user.user.username, "nesteduser")
        self.assertEqual(app_user.profile.major, "Biology")

    def test_confidential_note_serialization(self):
        serializer = ConfidentialNoteSerializer(instance=self.note)
        expected_data = {
            'id': self.note.id,
            'application': self.note.application.id,
            'author': {
                'id': self.admin_appuser.id,
                'display_name': self.admin_appuser.display_name,
                'username': self.admin_appuser.user.username
            },
            'content': self.note.content,
            'timestamp': serializer.data['timestamp']  # auto-generated
        }
        self.assertEqual(serializer.data, expected_data)
    
    def test_confidential_note_deserialization(self):
        """Test that serializer correctly handles data without read-only fields"""
        data = {
            'content': "New confidential note.",
        }
        request = self.client.post(f'/api/applications/{self.application.id}/notes/', user=self.admin_appuser)
        
        # Create context that would normally be provided by the viewset
        context = {
            'application_id': self.application.id,
            'request': request
        }
        
        serializer = ConfidentialNoteSerializer(data=data, context=context)
        self.assertTrue(serializer.is_valid())
        
        # Save with required fields that would normally be set by viewset
        instance = serializer.save(
            author=self.admin_appuser,
            application=self.application
        )
        
        # Verify the instance was created correctly
        self.assertEqual(instance.content, "New confidential note.")
        self.assertEqual(instance.author, self.admin_appuser)
        self.assertEqual(instance.application, self.application)

    def test_valid_document_upload(self):
        file = SimpleUploadedFile("test.pdf", b"file_content")
        data = {
            'document': file,
            'document_type': "Housing Questionnaire"
        }
        serializer = DocumentUploadSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        file_path = os.path.join(settings.MEDIA_ROOT, "document_templates", "test.pdf")
        if os.path.exists(file_path):
            os.remove(file_path)
    
    def test_invalid_document_type(self):
        file = SimpleUploadedFile("test.pdf", b"file_content")
        data = {
            'document': file,
            'document_type': "Invalid Type"
        }
        serializer = DocumentUploadSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('document_type', serializer.errors)
    
    def test_missing_document(self):
        data = {
            'document_type': "Medical/Health History and Immunization Records"
        }
        serializer = DocumentUploadSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('document', serializer.errors)