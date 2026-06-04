from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MaxValueValidator, MinValueValidator
from django.contrib.auth.hashers import make_password, check_password
from decimal import Decimal
from datetime import datetime
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver
from datetime import datetime, timedelta
from decimal import Decimal
from django.contrib.postgres.fields import ArrayField

# Create your models here.

class UserProfile(models.Model):
    major=models.CharField(max_length=100,blank=True,null=True)
    gpa = models.DecimalField(
            validators=[
                MinValueValidator(Decimal("0.0")),
                MaxValueValidator(Decimal("4.0")) 
            ],
            max_digits=3,
            decimal_places=2,
            blank=True,
            null=True
        )

    def __str__(self):
        # Access the related AppUser through the reverse relationship
        if hasattr(self, 'user'):
            return f"Profile for {self.user.display_name}"
        return "Unassigned Profile"
    
class AppUser(models.Model):
    def validate_dob(value):
        # Ensure the date is not more recent than 10 years ago
        ten_years_ago = datetime.now().date() - timedelta(days=365 * 10)
        if value > ten_years_ago:
            raise ValidationError("Date of birth must be at least 10 years ago.")
    def get_default_roles():
        return ['Student']

    USER_ROLES = [
        ('Student', 'Student'),
        ('Administrator', 'Administrator'),
        ('Reviewer', 'Reviewer'),
        ('Faculty', 'Faculty'),
        ('Partner', 'Partner')
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="info")
    display_name = models.CharField(max_length=50)
    roles = ArrayField(models.CharField(max_length=20, choices=USER_ROLES), default=get_default_roles)
    dob = models.DateField(validators=[validate_dob],blank=True,null=True)
    is_sso = models.BooleanField(default=False)
    profile = models.OneToOneField(UserProfile, on_delete=models.SET_NULL,related_name="user", null=True, blank=True)
    use_mfa = models.BooleanField(default=False, 
                                 verbose_name="Enable MFA")
    ulink_username = models.CharField(max_length=50, unique=True,null=True,blank=True)

    def save(self, *args, **kwargs):
        if self.is_sso:
            self.ulink_username = self.user.username  # Ensure ulink_username matches user.username if SSO is enabled
        # Enforce mutually exclusive roles
        if 'Student' in self.roles and len(self.roles) > 1:
            raise ValidationError("A Student cannot have any other role.")
        
        if 'Partner' in self.roles and len(self.roles) > 1:
            raise ValidationError("A Partner cannot have any other role.")
        
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        print(f"Deleting AppUser: {self.pk}, username: {self.user.username}")
        # Delete the associated User instance
        self.user.delete()  # This will delete the related User instance
        if hasattr(self, "profile") and self.profile:
            self.profile.delete()        
        super().delete(*args, **kwargs)  # Then delete the AppUser instance itself

    def requires_otp(self):
        """Determine if user needs OTP verification"""
        return self.use_mfa and not self.is_sso
    def __str__(self):
        return self.user.username
    
class Course(models.Model):
    number = models.IntegerField() # Example: "SPAN 101", "CHEM 203"
    department = models.CharField(max_length=8)

    def clean(self):
        """Custom validation before saving."""
        self.department = self.department.upper()  # Auto-capitalize department
        
        if not (100 <= self.number <= 999):  # Ensure it's exactly 3 digits
            raise ValidationError("Course number must be exactly 3 digits long.")

    def save(self, *args, **kwargs):
        """Override save to validate and auto-capitalize before saving."""
        self.clean()  # Apply validation and transformations
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.department} {self.number}"

    
class Program(models.Model):
    SEMESTER_CHOICES = [    
        ('Fall', 'Fall'),
        ('Spring', 'Spring'),
        ('Summer', 'Summer'),
    ]
    title = models.CharField(max_length=80)
    year = models.PositiveSmallIntegerField()
    semester = models.CharField(max_length=20, choices=SEMESTER_CHOICES, default='Fall')
    location = models.CharField(max_length=100)
    faculty_leads = models.ManyToManyField(AppUser, related_name='programs_led') 
    description = models.TextField()
    start_date = models.DateField()
    end_date = models.DateField()
    open_date = models.DateField()
    deadline = models.DateField()
    essential_doc_deadline = models.DateField()
    payment_deadline = models.DateField(blank=True, null=True)
    provider_partners = models.ManyToManyField(AppUser, related_name='provider_programs',blank=True) 
    prerequisites = models.ManyToManyField(Course, blank=True, related_name="required_for_programs")
    track_payment = models.BooleanField(default=False)

    
    def update_completed_applications(self):
        """Update status of enrolled applications if program has ended"""
        updated_count = 0
        if self.end_date and timezone.now().date() > self.end_date:
            applications = self.application_set.filter(status='Enrolled')
            for app in applications:
                app.status = 'Completed'
                updated_count +=1
                app.save()  # Ensure save() is called on each instance

        elif self.end_date and timezone.now().date() <= self.end_date:
            applications = self.application_set.filter(status='Completed')
            for app in applications:
                app.status = 'Enrolled'
                app.save()
        return updated_count
    
    def update_null_paid_applications(self):
        """Update status of enrolled applications if program has ended"""
        updated_count = 0
        if self.track_payment:
            applications = self.application_set.filter(payment_status='Null')
            for app in applications:
                app.payment_status = 'Unpaid'
                updated_count += 1
                app.save()  # Ensure save() is called on each instance

        elif not self.track_payment:
            # This line is causing the error - you need to add .all() or a filter
            applications = self.application_set.all()  # Use .all() to make it iterable
            for app in applications:
                app.payment_status = 'Null'
                app.save()
        return updated_count


    def clean(self):
        # Ensure end_date is after start_date
        if self.start_date > self.end_date:
            raise ValidationError("Start date must be before end date.")
        # Ensure open_date is before deadline
        if self.open_date > self.deadline:
            raise ValidationError("Open date must be before deadline.")
        # Ensure deadline is before start_date
        if self.deadline > self.start_date:
            raise ValidationError("Deadline must be before start date.")
        if self.track_payment and not self.payment_deadline:
            raise ValidationError("Payment deadline must be set if payments are being tracked.")

    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
        self.update_null_paid_applications()
        # Check for completed applications on save
        self.update_completed_applications()
    
def get_upload_path(instance, filename):
    # Get the file extension from the original filename
    file_extension = filename.split('.')[-1]
    
    # Map field names to standardized document names
    document_names = {
        'assumption_of_risk_form': 'risk_form',
        'acknowledgement_of_code_of_conduct': 'code_of_conduct',
        'housing_questionnaire': 'housing',
        'medical_health_history_and_immunization_records': 'medical_records'
    }
    
    # Determine which field triggered the upload by checking which field's file matches the filename
    for field_name in document_names.keys():
        field = getattr(instance, field_name, None)
        if field and field.name and filename in field.name:
            doc_name = document_names[field_name]
            return f'essential_documents/{instance.id}/{doc_name}.{file_extension}'
    
    # Fallback case (shouldn't normally happen)
    return f'essential_documents/application_{instance.id}/{filename}'

class Question(models.Model):
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name="questions")
    text = models.TextField()

    def __str__(self):
        return f"Question for {self.program.title}: {self.text[:50]}"

class Application(models.Model):
    STATUS_CHOICES = [
        ('Applied', 'Applied'),
        ("Eligible", "Eligible"),
        ("Approved", "Approved"),
        ('Enrolled', 'Enrolled'),
        ('Completed', 'Completed'),
        ('Canceled', 'Canceled'),
        ('Withdrawn', 'Withdrawn'),
    ]
    PAYMENT_CHOICES = [
        ('Null','Null'),
        ('Unpaid', 'Unpaid'),
        ('Partially Paid', 'Partially Paid'),
        ('Fully Paid', 'Fully Paid'),
    ]
    student = models.ForeignKey(AppUser, on_delete=models.CASCADE,related_name="applications" )
    program = models.ForeignKey(Program, on_delete=models.CASCADE)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Applied')
    submission_date = models.DateTimeField(auto_now_add=True)
    payment_status = models.CharField(max_length=50, choices=PAYMENT_CHOICES, default='Null')
    
    # Essential documents
    assumption_of_risk_form = models.FileField(
        upload_to=get_upload_path, 
        blank=True, 
        null=True
    )
    assumption_of_risk_form_timestamp = models.DateTimeField(null=True, blank=True)
    
    acknowledgement_of_code_of_conduct = models.FileField(
        upload_to=get_upload_path, 
        blank=True, 
        null=True
    )
    acknowledgement_of_code_of_conduct_timestamp = models.DateTimeField(null=True, blank=True)
    
    housing_questionnaire = models.FileField(
        upload_to=get_upload_path, 
        blank=True, 
        null=True
    )
    housing_questionnaire_timestamp = models.DateTimeField(null=True, blank=True)
    
    medical_health_history_and_immunization_records = models.FileField(
        upload_to=get_upload_path, 
        blank=True, 
        null=True
    )
    medical_health_history_and_immunization_records_timestamp = models.DateTimeField(null=True, blank=True)
    

    def clean(self):
        super().clean()
        # Check if program has ended when status is being set to Enrolled
        if self.status == 'Enrolled' and self.program.end_date:
            if timezone.now().date() > self.program.end_date:
                self.status = 'Completed'
        if self.status == 'Completed' and self.program.end_date:
            if timezone.now().date() < self.program.end_date:
                self.status = 'Enrolled'
        if self.payment_status == "Null" and self.program.track_payment:
            self.payment_status = "Unpaid"
        if any(role in self.student.roles for role in ["Administrator", "Faculty", "Reviewer"]):
            raise ValidationError("Admins cannot have applications.")
    def save(self, *args, **kwargs):
        """
        Before saving, check if the program tracks payments. 
        If it does, set payment_status to 'Pending' if it's still 'Null'.
        """
        if self.program.track_payment and self.payment_status == "Null":
            self.payment_status = 'Unpaid'
        
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.student} - {self.program} ({self.status})"  
    
    
class Answer(models.Model):
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name="answers")
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    response = models.TextField()

    def __str__(self):
        return f"Answer for {self.application.student} - {self.question.text[:50]}"
    
    
     # Signals
@receiver(post_save, sender=Program)
def check_program_end_date(sender, instance, **kwargs):
    """
    Check if program has ended and update application statuses accordingly
    """
    instance.update_completed_applications()

    
class Content(models.Model):
    content = models.TextField(default="Discover amazing study abroad opportunities and expand your horizons. Join our community of global learners today!")

    # Ensure there's only one object
    def save(self, *args, **kwargs):
        if not self.pk:  # If object doesn't exist yet
            if Content.objects.exists():  # Check if there is already a content object
                raise ValueError("There can only be one content object.")
        super(Content, self).save(*args, **kwargs)

    def __str__(self):
        return self.content[:50]  # Show only the first 50 chars
    
class InstitutionName(models.Model):
    name = models.TextField(default="Your Institution")

    # Ensure there's only one object
    def save(self, *args, **kwargs):
        if not self.pk:  # If object doesn't exist yet
            if InstitutionName.objects.exists():  # Check if there is already a content object
                raise ValueError("There can only be one institution name object.")
        super(InstitutionName, self).save(*args, **kwargs)

    def __str__(self):
        return self.name
    
class PrimaryColor(models.Model):
    color = models.TextField(default="#D3D3D3")

    # Ensure there's only one object
    def save(self, *args, **kwargs):
        if not self.pk:  # If object doesn't exist yet
            if PrimaryColor.objects.exists():  # Check if there is already a color object
                raise ValueError("There can only be one color object.")
        super(PrimaryColor, self).save(*args, **kwargs)

    def __str__(self):
        return self.color
    
class SecondaryColor(models.Model):
    color = models.TextField(default="#000000")

    # Ensure there's only one object
    def save(self, *args, **kwargs):
        if not self.pk:  # If object doesn't exist yet
            if SecondaryColor.objects.exists():  # Check if there is already a color object
                raise ValueError("There can only be one color object.")
        super(SecondaryColor, self).save(*args, **kwargs)

    def __str__(self):
        return self.color

class ConfidentialNote(models.Model):
    application = models.ForeignKey(Application, on_delete=models.CASCADE, null=True, related_name='notes')
    author = models.ForeignKey(AppUser, on_delete=models.SET_NULL, null=True, blank=True)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-timestamp']

class DocumentTemplate(models.Model):
    DOCUMENT_TYPES = [
        ('Assumption of Risk Form', 'Assumption of Risk Form'),
        ('Acknowledgement of the Code of Conduct', 'Acknowledgement of the Code of Conduct'),
        ('Housing Questionnaire', 'Housing Questionnaire'),
        ('Medical/Health History and Immunization Records', 'Medical/Health History and Immunization Records'),
    ]
    
    document_type = models.CharField(max_length=100, choices=DOCUMENT_TYPES, unique=True)
    template_file = models.FileField(upload_to='document_templates/')
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.document_type

class RecommendationLetter(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Fulfilled', 'Fulfilled'),
    ]
    
    application = models.ForeignKey(
        Application, 
        on_delete=models.CASCADE,
        related_name="recommendation_letters"
    )
    writer_name = models.CharField(max_length=100)
    writer_email = models.EmailField()
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='Pending'
    )
    token = models.UUIDField(unique=True)
    requested_date = models.DateTimeField(auto_now_add=True)
    fulfilled_date = models.DateTimeField(blank=True, null=True)
    letter_file = models.FileField(
        upload_to="recommendation_letters/",
        blank=True,
        null=True
    )
    
    def __str__(self):
        return f"Recommendation for {self.application.student} by {self.writer_name}"
        
    def delete(self, *args, **kwargs):
        # Delete the physical file if it exists
        if self.letter_file:
            # Get the storage backend
            storage = self.letter_file.storage
            
            # Get the file name
            file_name = self.letter_file.name
            
            # Delete the file if it exists
            if storage.exists(file_name):
                storage.delete(file_name)
                
        # Call the parent delete method to delete the database record
        super().delete(*args, **kwargs)

class TranscriptCache(models.Model):
    user = models.OneToOneField('AppUser', on_delete=models.CASCADE, related_name='transcript')
    last_refreshed = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Transcript for {self.user.user.username}"

def get_default_course():
    """
    Gets or creates a default Course to use when none is specified.
    This is used as the default value for CourseRecord.course
    """
    from django.apps import apps
    Course = apps.get_model('abroadhub', 'Course')
    default_course, created = Course.objects.get_or_create(
        department='UNDEF',
        number=999,
    )
    return default_course.id

class CourseRecord(models.Model):
    TERM_CHOICES = [
        ('Fall', 'Fall'),
        ('Spring', 'Spring'),
        ('Summer', 'Summer'),
    ]
    GRADE_CHOICES = [
        ('A+', 'A+'), ('A', 'A'), ('A-', 'A-'),
        ('B+', 'B+'), ('B', 'B'), ('B-', 'B-'),
        ('C+', 'C+'), ('C', 'C'), ('C-', 'C-'),
        ('D+', 'D+'), ('D', 'D'), ('D-', 'D-'),
        ('F', 'F'), ('IP', 'In Progress'), ('W', 'Withdrawn')
    ]
    
    transcript = models.ForeignKey(TranscriptCache, on_delete=models.CASCADE, related_name="courses")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="course_records", default=get_default_course)
    title = models.CharField(max_length=100)     # e.g., "GENERAL BIOLOGY"
    grade = models.CharField(max_length=3, choices=GRADE_CHOICES)
    term = models.CharField(max_length=10, choices=TERM_CHOICES)
    year = models.PositiveSmallIntegerField()
    
    def __str__(self):
        return f"{self.course.department} {self.course.number} - {self.grade}"


def validate_image(file):
    # Add image file type validation if required
    if not file.name.lower().endswith(('.png', '.jpg', '.jpeg', '.svg')):
        raise ValidationError("Only PNG, SVG, JPG, or JPEG files are allowed.")
      
class LogoImage(models.Model):
    image_file = models.ImageField(
        upload_to="logo/",
        blank=True,
        null=True,
        validators=[validate_image],  # Validate that file is an image
    )

    def __str__(self):
        return f"Logo Image ({self.image_file.name if self.image_file else 'No logo uploaded'})"

    def save(self, *args, **kwargs):
        # Ensure that only one logo image is allowed
        if not self.pk:  # Only check if this is a new instance
            if LogoImage.objects.exists():
                raise ValidationError("There can only be one logo image.")
        super().save(*args, **kwargs)

