from django.test import TestCase
from django.core.exceptions import ValidationError
from abroadhub.models import AppUser, UserProfile, Program, Application, Content, ConfidentialNote,DocumentTemplate
from django.contrib.auth.models import User
from datetime import datetime, timedelta
from django.utils import timezone
from decimal import Decimal

class AppUserTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.profile = UserProfile.objects.create()
        
    def test_validate_dob(self):
        # Test valid date of birth
        valid_user = AppUser(
            user=self.user,
            display_name='Test User',
            dob=datetime.now().date() - timedelta(days=365 * 15)
        )
        valid_user.full_clean()  # Should not raise ValidationError
        
        # Test invalid date of birth
        invalid_user = AppUser(
            user=self.user,
            display_name='Test User',
            dob=datetime.now().date() - timedelta(days=365 * 5)
        )
        with self.assertRaises(ValidationError):
            invalid_user.full_clean()
            
    def test_defaults(self):
        user = AppUser.objects.create(
            user=self.user,
            display_name='Test User'
        )
        self.assertEqual(user.roles, ['Student'])
        self.assertEqual(user.use_mfa, False)
        self.assertEqual(user.is_sso, False)
        self.assertEqual(user.profile, None)
        self.assertEqual(user.ulink_username, None)
        
    def test_profile_relationship(self):
        user = AppUser.objects.create(
            user=self.user,
            display_name='Test User',
            profile=self.profile
        )
    def test_sso_and_ulink(self):
        user = AppUser.objects.create(
            user=self.user,
            display_name='Test User',
            roles = ["Student"],
            dob=datetime.now().date() - timedelta(days=365 * 15),
            is_sso = True,
            use_mfa = False,
            profile = None, 
        )
        self.assertEqual(user.ulink_username, user.user.username)
        
    def test_invalid_roles(self):
        # Test valid date of birth
        invalid_user = AppUser(
            user=self.user,
            display_name='Test User',
            dob=datetime.now().date() - timedelta(days=365 * 15),
            roles = ["Student","Faculty"]
        )
        with self.assertRaises(ValidationError):
            invalid_user.save()
    def test_invalid_roles_2(self):
        # Test valid date of birth
        invalid_user = AppUser(
            user=self.user,
            display_name='Test User',
            dob=datetime.now().date() - timedelta(days=365 * 15),
            roles = ["Partner","Faculty"]
        )
        with self.assertRaises(ValidationError):
            invalid_user.save()
class UserProfileTestCase(TestCase):
    def setUp(self):
        # Create a Django User first
        self.django_user = User.objects.create_user(
            username="testuser",
            password="testpass123",
            email="test@example.com"
        )
        
        # Create an AppUser
        self.app_user = AppUser.objects.create(
            user=self.django_user,
            display_name="Test User"
        )
        
        # Create a basic valid profile
        self.profile = UserProfile.objects.create(
            major="Computer Science",
            gpa=Decimal("3.50")
        )
        # Link profile to app_user after creation
        self.app_user.profile = self.profile
        self.app_user.save()

    def test_profile_creation(self):
        """Test that a profile can be created with valid data"""
        self.assertEqual(self.profile.major, "Computer Science")
        self.assertEqual(self.profile.gpa, Decimal("3.50"))
        self.assertEqual(self.app_user.profile, self.profile)

    def test_profile_str_representation(self):
        """Test the string representation of the profile"""
        expected_str = f"Profile for {self.app_user.display_name}"
        self.assertEqual(str(self.profile), expected_str)

    def test_profile_str_representation_no_user(self):
        """Test string representation when no user is attached"""
        profile = UserProfile.objects.create(
            major="Biology",
            gpa=Decimal("3.00")
        )
        self.assertEqual(str(profile), "Unassigned Profile")

    def test_optional_fields(self):
        """Test that major and GPA are optional"""
        profile = UserProfile.objects.create()
        self.assertIsNone(profile.major)
        self.assertIsNone(profile.gpa)
        profile.full_clean()  # Shouldn't raise ValidationError

    def test_gpa_validation(self):
        """Test GPA validation rules"""
        # Test valid GPAs
        valid_gpas = ["0.00", "2.50", "3.75", "4.00"]
        for gpa in valid_gpas:
            self.profile.gpa = Decimal(gpa)
            self.profile.full_clean()  # Shouldn't raise ValidationError

        # Test invalid GPAs
        invalid_gpas = ["-0.01", "4.01", "5.00"]
        for gpa in invalid_gpas:
            self.profile.gpa = Decimal(gpa)
            with self.assertRaises(ValidationError):
                self.profile.full_clean()

    def test_gpa_decimal_places(self):
        """Test GPA decimal place restrictions"""
        # Test valid decimal places
        self.profile.gpa = Decimal("3.50")
        self.profile.full_clean()  # Shouldn't raise ValidationError

        # Test too many decimal places
        self.profile.gpa = Decimal("3.555")
        with self.assertRaises(ValidationError):
            self.profile.full_clean()

    def test_major_max_length(self):
        """Test major field max length"""
        # Test valid length
        self.profile.major = "A" * 100
        self.profile.full_clean()  # Shouldn't raise ValidationError

        # Test exceeding max length
        self.profile.major = "A" * 101
        with self.assertRaises(ValidationError):
            self.profile.full_clean()

    def test_profile_update(self):
        """Test updating profile fields"""
        self.profile.major = "Physics"
        self.profile.gpa = Decimal("3.90")
        self.profile.save()
        
        # Refresh from database
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.major, "Physics")
        self.assertEqual(self.profile.gpa, Decimal("3.90"))

    def test_profile_deletion(self):
        """Test profile deletion"""
        profile_id = self.profile.id
        self.profile.delete()
        
        # Verify profile is deleted
        with self.assertRaises(UserProfile.DoesNotExist):
            UserProfile.objects.get(id=profile_id)
        
        # Verify app_user still exists but profile is unlinked
        self.app_user.refresh_from_db()
        self.assertIsNone(self.app_user.profile)

class ProgramModelTest(TestCase):
    def setUp(self):
     # Create reusable test data
        self.valid_year = datetime.now().year
        
        # Create a User and AppUser for faculty lead
        self.faculty_user = User.objects.create_user(
            username="faculty",
            password="testpass123",
            email="faculty@test.com"
        )
        self.faculty_lead = AppUser.objects.create(
            user=self.faculty_user,
            display_name="Faculty Lead",
            roles=['Administrator','Faculty']
        )

        self.partner_user = User.objects.create_user(
            username="partner",
            password="testpass123",
            email="partner@test.com"
        )
        self.provider_partner = AppUser.objects.create(
            user=self.partner_user,
            display_name="Provider Partner",
            roles=['Partner']
        )
        
        self.valid_data = {
            "title": "Study Abroad Program",
            "year": self.valid_year,
            "semester": "Fall",
            "location": "Paris, France",
            "description": "An amazing study abroad experience",
            "start_date": datetime.now().date() + timedelta(days=30),
            "end_date": datetime.now().date() + timedelta(days=90),
            "open_date": datetime.now().date() - timedelta(days=10),
            "deadline": datetime.now().date() + timedelta(days=20),
            "essential_doc_deadline": datetime.now().date() + timedelta(days=15),
        }

        self.invalid_data = {
            "title": "Study Abroad Program",
            "year": self.valid_year,
            "semester": "Fall",
            "location": "Paris, France",
            "description": "An amazing study abroad experience",
            "start_date": datetime.now().date() + timedelta(days=30),
            "end_date": datetime.now().date() + timedelta(days=90),
            "open_date": datetime.now().date() - timedelta(days=10),
            "deadline": datetime.now().date() + timedelta(days=20),
            "essential_doc_deadline": datetime.now().date() + timedelta(days=15),
            "track_payment":True,
        }
        self.valid_tracking_data = {
            "title": "Study Abroad Program",
            "year": self.valid_year,
            "semester": "Fall",
            "location": "Paris, France",
            "description": "An amazing study abroad experience",
            "start_date": datetime.now().date() + timedelta(days=30),
            "end_date": datetime.now().date() + timedelta(days=90),
            "open_date": datetime.now().date() - timedelta(days=10),
            "deadline": datetime.now().date() + timedelta(days=20),
            "essential_doc_deadline": datetime.now().date() + timedelta(days=15),
            "track_payment":True,
            "payment_deadline":datetime.now().date() + timedelta(days=30),
        }

    def test_valid_program(self):
        """Test creating a valid Program object."""
        program = Program(**self.valid_data)
        program.save()
        program.faculty_leads.set([self.faculty_lead])
        try:
            program.full_clean()
        except ValidationError:
            self.fail("Valid Program object raised ValidationError")

    def test_semester_choices(self):
        """Test valid and invalid semester choices."""
        for semester in ["Fall", "Spring", "Summer"]:
            data_with_semester = {**self.valid_data, 'semester': semester}
            program = Program(**data_with_semester)
            program.save()
            program.faculty_leads.set([self.faculty_lead]) 
            try:
                program.full_clean()
            except ValidationError:
                self.fail(f"Valid semester choice '{semester}' raised ValidationError.")

        # Test invalid semester choice
        invalid_data = self.valid_data.copy()
        invalid_data["semester"] = "Winter"
        program = Program(**invalid_data)
        program.save()
        program.faculty_leads.set([self.faculty_lead]) 
        with self.assertRaises(ValidationError):
            program.full_clean()

    def test_end_date_after_start_date(self):
        """Test that the end date is after the start date."""
        program = Program(**self.valid_data)
        program.save()
        program.faculty_leads.set([self.faculty_lead]) 
        program.end_date = program.start_date - timedelta(days=1)
        with self.assertRaises(ValidationError):
            program.clean()

    def test_open_date_before_deadline(self):
        """Test that the open date is before the deadline."""
        program = Program(**self.valid_data)
        program.save()
        program.faculty_leads.set([self.faculty_lead])  
        program.open_date = program.deadline + timedelta(days=1)
        with self.assertRaises(ValidationError):
            program.clean()

    def test_deadline_before_start_date(self):
        """Test that the deadline is before the start date."""
        program = Program(**self.valid_data)
        program.save()
        program.faculty_leads.set([self.faculty_lead])  
        program.deadline = program.start_date + timedelta(days=1)
        with self.assertRaises(ValidationError):
            program.clean()

    def test_str_method(self):
        """Test the string representation of Program."""
        program = Program.objects.create(**self.valid_data)
        program.save()
        program.faculty_leads.set([self.faculty_lead]) 
        self.assertEqual(str(program), program.title)

    def test_update_completed_applications(self):
        """Test that enrolled applications are marked as completed after program end date."""
        program = Program.objects.create(**self.valid_data)
        program.save()
        program.faculty_leads.set([self.faculty_lead])  
        program.start_date=datetime.now().date() - timedelta(days=30)
        program.deadline=datetime.now().date() - timedelta(days=60)
        program.open_date=datetime.now().date() - timedelta(days=90)
        program.end_date = timezone.now().date() - timedelta(days=1)  # Past end date
        program.save()
        
        updated_count = program.update_completed_applications()
        self.assertGreaterEqual(updated_count, 0)
    
    def test_missing_payment_deadline(self):
        program = Program(**self.invalid_data)
        with self.assertRaises(ValidationError):
            program.clean()

    def test_valid_tracking_program(self):
        """Test creating a valid Program object."""
        program = Program(**self.valid_tracking_data)
        program.save()
        program.faculty_leads.set([self.faculty_lead])
        program.provider_partners.set([self.provider_partner])
        try:
            program.full_clean()
        except ValidationError:
            self.fail("Valid Program object raised ValidationError")


class ApplicationModelTest(TestCase):
    def setUp(self):
        # Set up reusable data
        self.student_user = AppUser.objects.create(user=User.objects.create_user(username="studentuser", password="testModelPassword458!", roles=['Student']))
        self.admin_user = AppUser.objects.create(user=User.objects.create_user(username="admin", password="testAdminModelPassword458!", roles=['Administrator','Faculty']))

        self.program = Program.objects.create(
            title="Study Abroad Program",
            year=2025,
            semester="Fall",
            location="Paris, France",
            description="An amazing study abroad experience",
            start_date=datetime.now().date() + timedelta(days=30),
            end_date=datetime.now().date() + timedelta(days=90),
            open_date=datetime.now().date() - timedelta(days=10),
            deadline=datetime.now().date() + timedelta(days=20),
        )
        self.program.faculty_leads.set([self.admin_user])


        self.valid_data = {
            "student": self.student_user,
            "program": self.program,
            "status": "Applied",
        }

        self.program2 = Program.objects.create(
            title="Study Abroad Program",
            year=2025,
            semester="Fall",
            location="Paris, France",
            description="An amazing study abroad experience",
            start_date=datetime.now().date() + timedelta(days=30),
            end_date=datetime.now().date() + timedelta(days=90),
            open_date=datetime.now().date() - timedelta(days=10),
            deadline=datetime.now().date() + timedelta(days=20),
            essential_doc_deadline=datetime.now().date() + timedelta(days=20),
            track_payment=True,
            payment_deadline=datetime.now().date() + timedelta(days=20),

        )
        self.program.faculty_leads.set([self.admin_user])


        self.valid_data2 = {
            "student": self.student_user,
            "program": self.program2,
            "status": "Applied",
        }
   
    def test_application_creation(self):
        """Test the creation of an application"""
        application = Application.objects.create(**self.valid_data)
        application.save()

        self.assertEqual(application.student, self.student_user)
        self.assertEqual(application.program, self.program)
        self.assertEqual(application.status, "Applied")
        self.assertTrue(application.submission_date)
        self.assertEqual(application.payment_status,"Null")

    def test_application_str_method(self):
        """Test the __str__ method of Application"""
        application = Application.objects.create(**self.valid_data)
        application.save()
        self.assertEqual(str(application), f"{self.student_user} - {self.program} (Applied)")

    def test_clean_method_for_admin_user(self):
        """Test that an admin cannot have an application"""
        invalid_data = self.valid_data.copy()
        invalid_data["student"] = self.admin_user
        application = Application.objects.create(**invalid_data)
        application.save()
        with self.assertRaises(ValidationError):
            application.clean()  # Will raise ValidationError if student is an admin
class ApplicationModelTest(TestCase):
    def setUp(self):
        # Set up reusable data
        self.student_user = AppUser.objects.create(user=User.objects.create_user(
            username="studentuser", password="testModelPassword458!"
        ),  roles=['Student'], dob = "2000-01-01")
        self.admin_user = AppUser.objects.create(user=User.objects.create_user(
            username="admin", password="testAdminModelPassword458!"), roles=['Administrator','Faculty'], dob="2001-01-01"
        )
        
        self.program = Program.objects.create(
            title="Study Abroad Program",
            year=2025,
            semester="Fall",
            location="Paris, France",
            description="An amazing study abroad experience",
            start_date=datetime.now().date() + timedelta(days=30),
            end_date=datetime.now().date() + timedelta(days=90),
            open_date=datetime.now().date() - timedelta(days=10),
            deadline=datetime.now().date() + timedelta(days=20),
            essential_doc_deadline=datetime.now().date() + timedelta(days=20),
            track_payment=False,
        )
        self.program.faculty_leads.set([self.admin_user])

        self.valid_data = {
            "student": self.student_user,
            "program": self.program,
            "status": "Applied",
        }

        self.program2 = Program.objects.create(
            title="Study Abroad Program",
            year=2025,
            semester="Fall",
            location="Paris, France",
            description="An amazing study abroad experience",
            start_date=datetime.now().date() + timedelta(days=30),
            end_date=datetime.now().date() + timedelta(days=90),
            open_date=datetime.now().date() - timedelta(days=10),
            deadline=datetime.now().date() + timedelta(days=20),
            essential_doc_deadline=datetime.now().date() + timedelta(days=20),
            track_payment=True,
            payment_deadline=datetime.now().date() + timedelta(days=20),

        )
        self.program.faculty_leads.set([self.admin_user])


        self.valid_data2 = {
            "student": self.student_user,
            "program": self.program2,
            "status": "Applied",
        }
   

    def test_application_creation(self):
        """Test the creation of an application"""
        application = Application.objects.create(**self.valid_data)
        application.save()
        self.assertEqual(application.student, self.student_user)
        self.assertEqual(application.program, self.program)
        self.assertEqual(application.status, "Applied")
        self.assertTrue(application.submission_date)
        self.assertEqual(application.payment_status,"Null")

    def test_application_creation_with_payment(self):
        """Test the creation of an application"""
        application = Application.objects.create(**self.valid_data2)
        application.save()
        self.assertEqual(application.student, self.student_user)
        self.assertEqual(application.program, self.program2)
        self.assertEqual(application.status, "Applied")
        self.assertTrue(application.submission_date)
        self.assertEqual(application.payment_status,"Unpaid")

    def test_application_str_method(self):
        """Test the __str__ method of Application"""
        application = Application.objects.create(**self.valid_data)
        application.save()
        self.assertEqual(str(application), f"{self.student_user} - {self.program} (Applied)")

    def test_clean_method_for_admin_user(self):
        """Test that an admin cannot have an application"""
        invalid_data = self.valid_data.copy()
        invalid_data["student"] = self.admin_user
        application = Application(**invalid_data)
        application.save()
        
        with self.assertRaises(ValidationError):
            application.clean()  # Will raise ValidationError if student is an admin

    def test_update_completed_applications(self):
        """Test that applications are updated to 'Completed' when the program ends"""
        application = Application.objects.create(**self.valid_data)
        application.save()
        application.status = "Enrolled"
        application.save()
        self.program.start_date=datetime.now().date() - timedelta(days=30)
        self.program.deadline=datetime.now().date() - timedelta(days=60)
        self.program.open_date=datetime.now().date() - timedelta(days=90)

        # Simulate program end
        self.program.end_date = timezone.now().date() - timedelta(days=1)
        self.program.save()

        application.refresh_from_db()
        self.assertEqual(application.status, "Completed")

class ContentModelTest(TestCase):
    def test_create_single_content(self):
        """Test that a single Content object can be created."""
        content_text = "Explore the world with our study abroad programs!"
        content = Content.objects.create(content=content_text)

        self.assertEqual(Content.objects.count(), 1)
        self.assertEqual(content.content, content_text)
        self.assertEqual(str(content), content_text[:50])

    def test_prevent_multiple_content_objects(self):
        """Test that creating multiple Content objects raises an error."""
        Content.objects.create(content="First content object.")
        
        with self.assertRaises(ValueError) as context:
            Content.objects.create(content="Second content object.")
        
        self.assertEqual(str(context.exception), "There can only be one content object.")

class ConfidentialNoteTestCase(TestCase):
    def setUp(self):
        self.student_user = AppUser.objects.create(user=User.objects.create_user(
            username="studentuser", password="testModelPassword458!"
        ),  roles=['Student'], dob = "2000-01-01")
        self.admin_user = AppUser.objects.create(user=User.objects.create_user(
            username="admin", password="testAdminModelPassword458!"), roles=['Administrator','Faculty'], dob="2001-01-01"
        )
        
        self.program = Program.objects.create(
            title="Study Abroad Program",
            year=2025,
            semester="Fall",
            location="Paris, France",
            description="An amazing study abroad experience",
            start_date=datetime.now().date() + timedelta(days=30),
            end_date=datetime.now().date() + timedelta(days=90),
            open_date=datetime.now().date() - timedelta(days=10),
            deadline=datetime.now().date() + timedelta(days=20),
            essential_doc_deadline=datetime.now().date() + timedelta(days=20)
        )
        self.program.faculty_leads.set([self.admin_user])

        self.valid_data = {
            "student": self.student_user,
            "program": self.program,
            "status": "Applied",
        }
        # Create test data for application, app_user, and confidential note
        self.application =Application.objects.create(**self.valid_data)
        self.author = self.admin_user
        self.note_content = "This is a confidential note."
        self.note_timestamp = timezone.now()

    def test_create_confidential_note(self):
        note = ConfidentialNote.objects.create(
            application=self.application,
            author=self.author,
            content=self.note_content
        )
        self.assertEqual(note.application, self.application)
        self.assertEqual(note.author, self.author)
        self.assertEqual(note.content, self.note_content)
        self.assertTrue(note.timestamp <= timezone.now())

    def test_note_timestamp_auto_add(self):
        note = ConfidentialNote.objects.create(
            application=self.application,
            author=self.author,
            content=self.note_content
        )
        self.assertIsNotNone(note.timestamp)

    def test_ordering(self):
        note1 = ConfidentialNote.objects.create(
            application=self.application,
            author=self.author,
            content="Note 1"
        )
        note2 = ConfidentialNote.objects.create(
            application=self.application,
            author=self.author,
            content="Note 2"
        )
        # Check that notes are ordered by timestamp
        notes = ConfidentialNote.objects.all()
        self.assertEqual(notes[0], note2)  # Most recent note comes first

    def test_confidential_note_without_author(self):
        note = ConfidentialNote.objects.create(
            application=self.application,
            content=self.note_content
        )
        self.assertIsNone(note.author)

class DocumentTemplateTestCase(TestCase):
    def setUp(self):
        # Create test data for DocumentTemplate
        self.document_type = 'Assumption of Risk Form'
        self.template_file = "path/to/template/file.pdf"

    def test_create_document_template(self):
        doc_template = DocumentTemplate.objects.create(
            document_type=self.document_type,
            template_file=self.template_file
        )
        self.assertEqual(doc_template.document_type, self.document_type)
        self.assertEqual(doc_template.template_file.name, self.template_file)

    def test_document_type_choices(self):
        doc_template = DocumentTemplate.objects.create(
            document_type='Acknowledgement of the Code of Conduct',
            template_file=self.template_file
        )
        self.assertEqual(doc_template.document_type, 'Acknowledgement of the Code of Conduct')

    def test_document_type_unique(self):
        DocumentTemplate.objects.create(
            document_type='Housing Questionnaire',
            template_file=self.template_file
        )
        with self.assertRaises(Exception):
            DocumentTemplate.objects.create(
                document_type='Housing Questionnaire',  # Should raise error because it's unique
                template_file=self.template_file
            )

    def test_document_template_str(self):
        doc_template = DocumentTemplate.objects.create(
            document_type='Medical/Health History and Immunization Records',
            template_file=self.template_file
        )
        self.assertEqual(str(doc_template), 'Medical/Health History and Immunization Records')