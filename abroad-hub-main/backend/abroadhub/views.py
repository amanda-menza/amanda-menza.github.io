import base64
import jwt
import requests
import json
import os
from django.conf import settings
from django.shortcuts import render, redirect, get_object_or_404
from rest_framework import viewsets, generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
import urllib
from rest_framework.decorators import action, api_view, permission_classes
from .serializers import AppUserSerializer, UserProfileSerializer, ApplicationSerializer,ProgramSerializer,UserSerializer, ContentSerializer, DocumentUploadSerializer, ConfidentialNoteSerializer, DocumentTemplateSerializer, RecommendationLetterSerializer
from .models import AppUser, InstitutionName, LogoImage, SecondaryColor, UserProfile, Application,Program,Content, PrimaryColor, ConfidentialNote, DocumentTemplate, RecommendationLetter
from rest_framework.response import Response
from rest_framework import status
from .models import Application
from .serializers import ApplicationSerializer
from .permissions import ApplicationPermissions,IsAdmin, IsStudent,ConfidentialNotesPermissions, ProgramPermissions, NotStudent, Not_SSO, IsReviewer,IsFaculty, RecommendationLetterPermission, IsPartner,IsNotPartner
from rest_framework.exceptions import PermissionDenied, NotFound, ValidationError
from django.contrib import messages
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.forms import PasswordChangeForm
from django.middleware.csrf import get_token
from django.contrib.postgres.fields import ArrayField
from django.db.models.fields.json import JSONField
from django.db import IntegrityError

from django.http import JsonResponse, FileResponse, Http404
from django.utils import timezone
from django.db.models import Count, Case, When, IntegerField, F, OuterRef,Exists, Value,Subquery, Q
from django.db.models.functions import Coalesce
from django.contrib.auth.decorators import login_required
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from django.core.exceptions import ObjectDoesNotExist

from django.contrib.postgres.aggregates import ArrayAgg
from rest_framework.parsers import MultiPartParser, FormParser

from django.contrib.admin.views.decorators import staff_member_required
 
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from datetime import timedelta, datetime
from django.utils.timezone import now
from django.db.models.functions import Cast  # Import Cast for type conversion

import mimetypes

import mailchimp_transactional as MailchimpTransactional
from mailchimp_transactional.api_client import ApiClientError

from .ulink import verify_ulink_account, get_student_transcript
from .models import TranscriptCache

import logging

# Configure logging
logger = logging.getLogger(__name__)

# Create user.
class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated, Not_SSO]  # Only allow authenticated users

    def post(self, request):
        # Get the old and new passwords from the request
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        # Get the currently logged-in user
        user = request.user
        
        # Check if the old password is correct
        if not user.check_password(old_password):
            raise ValidationError("Old password is incorrect.")

        # Set the new password
        user.set_password(new_password)
        user.save()

        # Return a response indicating the password was changed successfully
        return Response({"message": "Password updated successfully."}, status=status.HTTP_200_OK)
    
class UpdateDOBView(generics.UpdateAPIView):
    serializer_class = AppUserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        """Ensure the user can only update their own profile."""
        return self.request.user.info  # Assuming AppUser is the user model

    def patch(self, request, *args, **kwargs):
        user = self.get_object()
        dob = request.data.get("dob")  # Ensure dob is sent in the request
        if not dob:
            return Response({"error": "DOB field is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        user.dob = dob  # Update the user's dob
        user.save()
        
        return Response({"message": "DOB updated successfully", "dob": user.dob}, status=status.HTTP_200_OK)


class ResetStudentPassword(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, user_id):
        try:
            appUser = AppUser.objects.get(id=user_id)
            user = appUser.user;
        except AppUser.DoesNotExist:
            raise ValidationError("User not found.")

        if user == request.user:
            raise ValidationError("This view is for resetting other user passwords.")
        
        if appUser.is_sso:
            raise ValidationError("Cannot reset SSO user passwords.")

        new_password = request.data.get('new_password')

        # Set the new password
        user.set_password(new_password)
        user.save()

        # Return a response indicating the password was changed successfully
        return Response({"message": "Password updated successfully."}, status=status.HTTP_200_OK)


#create app user.
class CreateAppUserView(generics.CreateAPIView):
    serializer_class = AppUserSerializer
    queryset = AppUser.objects.all()
    permission_classes = [AllowAny]

class CurrentAppUserView(generics.RetrieveAPIView):
    serializer_class = AppUserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # Return the currently authenticated user
        return self.request.user.info
class AppUserDetailView(generics.RetrieveAPIView):
    serializer_class = AppUserSerializer
    queryset = AppUser.objects.all()
    lookup_field = 'pk' 

class FacultyUserQuery(generics.ListAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AppUserSerializer
    queryset = AppUser.objects.filter(roles__contains=["Faculty"]).order_by("display_name")

class PartnerUserQuery(generics.ListAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AppUserSerializer
    queryset = AppUser.objects.filter(roles__contains=["Partner"]).order_by("display_name")
###########################################################

#list or create applications with custom permissions
class ApplicationView(viewsets.ModelViewSet):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = [ ApplicationPermissions,IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        response = self.perform_create(serializer)
        
        # If perform_create returned application instance, serialize it
        if isinstance(response, Application):
            serializer = self.get_serializer(response)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        
        # If perform_create returned a Response, return it directly
        elif isinstance(response, Response):
            return response
        

    def perform_create(self, serializer):
        program_id = self.kwargs.get('program_id')
        
        # Associate the student (user) and the program with the application
        if serializer.is_valid():
            
            program = Program.objects.get(id=program_id)  # Find the program by its ID
            
            # Server-side date validation
            current_server_time = timezone.now()
            current_date = current_server_time.date()  # Extract just the date part
            
            # Check if program is currently open (between start_date and end_date)
            if current_date < program.open_date:  # Remove .date() call
                return Response({
                    'message': 'This program is not yet open for applications.'
                }, status=status.HTTP_400_BAD_REQUEST)
                
            if current_date > program.deadline:  # Remove .date() call
                return Response({
                    'message': 'This program is no longer accepting applications.'
                }, status=status.HTTP_400_BAD_REQUEST)
                
            # Check if application deadline has passed
            if program.deadline and current_date > program.deadline:  # Remove .date() call
                return Response({
                    'message': 'The application deadline for this program has passed.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if Application.objects.filter(student=self.request.user.info, program=program).exists():
                return JsonResponse({
                    'message': 'You have already applied to this program.'
                }, status=400)
            
            # Save the application and get the instance
            application = serializer.save(student=self.request.user.info, program=program)
            # Make sure the created application is available in the response
            return application

        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        response = self.perform_update(serializer)

        # If perform_create returned application instance, serialize it
        if isinstance(response, Application):
            serializer = self.get_serializer(response)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_200_OK, headers=headers)
        
        # If perform_create returned a Response, return it directly
        elif isinstance(response, Response):
            return response
        
    def perform_update(self, serializer):
        application = self.get_object()
        program = application.program
    
        if serializer.is_valid():
            
            # Server-side date validation
            current_server_time = timezone.now()
            current_date = current_server_time.date()  # Extract just the date part
            
            # Check if program is currently open (between start_date and end_date)
            if current_date < program.open_date:  # Remove .date() call
                return Response({
                    'message': 'This program is not yet open for applications.'
                }, status=status.HTTP_400_BAD_REQUEST)
                
            if current_date > program.deadline:  # Remove .date() call
                return Response({
                    'message': 'This program is no longer accepting applications.'
                }, status=status.HTTP_400_BAD_REQUEST)
                
            # Check if application deadline has passed
            if program.deadline and current_date > program.deadline:  # Remove .date() call
                return Response({
                    'message': 'The application deadline for this program has passed.'
                }, status=status.HTTP_400_BAD_REQUEST)   

            application = serializer.save(student=self.request.user.info)

            return application

        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



    def get_queryset(self):
        user = self.request.user
        if any(role in user.info.roles for role in ["Administrator", "Reviewer"]):
            return Application.objects.select_related('student', 'program')  # Admins can view all applications
        # Faculty can view applications for programs where they are listed as a faculty lead
        if "Faculty" in user.info.roles:
            return Application.objects.filter(program__faculty_leads__id=user.info.id).select_related('student', 'program')

        
        return Application.objects.filter(student=user.info).select_related('student', 'program')  # Students can view only their own applications

    def get_object(self):
        obj = Application.objects.select_related('student', 'program').get(id=self.kwargs["pk"])  # Fetch without filtering queryset

        # Perform object-level permission check manually
        self.check_object_permissions(self.request, obj)

        return obj
    
    @action(detail=True, methods=['patch'])
    def change_status(self, request, pk):
        ROLE_STATUS_MAP = {
            'Administrator': ['Applied', 'Eligible', 'Approved', 'Enrolled', 'Canceled'],
            'Faculty': ['Applied', 'Eligible', 'Approved'],
            'Reviewer': ['Applied', 'Eligible'],
            'Student': ['Withdrawn', 'Applied'],  # Only allows withdrawal or re-application after withdrawal
        }
        application = Application.objects.get(id=pk)
        new_status = request.data.get('status')
        user_roles = request.user.info.roles  # Assuming user roles are stored in `info.roles`

        # Check for Administrator permissions
        if any(role in user_roles for role in ['Administrator']):
            if new_status in ROLE_STATUS_MAP['Administrator']:
                application.status = new_status
                application.save()
                return Response(ApplicationSerializer(application,context={'request': request}).data, status=status.HTTP_200_OK)

        # Check for Faculty permissions
        elif any(role in user_roles for role in ['Faculty']):
            if new_status in ROLE_STATUS_MAP['Faculty'] and application.status not in ['Withdrawn']:
                application.status = new_status
                application.save()
                return Response(ApplicationSerializer(application,context={'request': request}).data, status=status.HTTP_200_OK)

        # Check for Reviewer permissions
        elif any(role in user_roles for role in ['Reviewer']):
            if new_status in ROLE_STATUS_MAP['Reviewer'] and application.status not in ['Withdrawn', 'Enrolled']:
                application.status = new_status
                application.save()
                return Response(ApplicationSerializer(application,context={'request': request}).data, status=status.HTTP_200_OK)

        # Check for Student permissions
        elif any(role in user_roles for role in ['Student']):
            if new_status in ROLE_STATUS_MAP['Student'] and (new_status == 'Withdrawn' or (application.status == 'Withdrawn' and new_status == 'Applied')):
                application.status = new_status
                application.save()
                return Response(ApplicationSerializer(application,context={'request': request}).data, status=status.HTTP_200_OK)

        # If none of the conditions match, return an error
        return Response({"detail": "Invalid status transition."}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['patch'])
    def change_payment_status(self, request, pk):

        application = Application.objects.get(id=pk)
        new_status = request.data.get('payment_status')
        user_roles = request.user.info.roles  # Assuming user roles are stored in `info.roles`
      
        # Check for Administrator permissions
        if 'Administrator' in user_roles or (
    'Partner' in user_roles and self.request.user.info in application.program.provider_partners.all()
):
            application.payment_status = new_status
            application.save()
            return Response(ApplicationSerializer(application,context={'request': request}).data, status=status.HTTP_200_OK)
        else:
                raise PermissionDenied("Only administrators and authorized partners can change payment status.")


    def destroy(self, request, *args, **kwargs):
        # Deny delete operation for both Admins and Students
        raise PermissionDenied("Deletion is not allowed.")
    
    @action(detail=True, methods=['post'], url_path='upload-document',
            parser_classes=[MultiPartParser, FormParser])
    def upload_document(self, request, pk=None):
        try:
            application = self.get_object()
            serializer = DocumentUploadSerializer(data=request.data)
            
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            document = request.FILES['document']
            document_type = serializer.validated_data['document_type']
            
            # Validate file is a PDF
            if not document.name.lower().endswith('.pdf'):
                return Response(
                    {'error': 'Only PDF files are allowed.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check MIME type to ensure it's a PDF
            if document.content_type != 'application/pdf':
                return Response(
                    {'error': 'File must be a valid PDF document.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validate file size (limit to 10MB)
            max_size = 10 * 1024 * 1024  # 10MB in bytes
            if document.size > max_size:
                return Response(
                    {'error': f'File size cannot exceed 10MB. Current size: {document.size / (1024 * 1024):.2f}MB'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Basic content validation by checking first few bytes of the file
            # PDF files start with "%PDF-"
            file_header = document.read(5)
            document.seek(0)  # Reset file pointer after reading
            if file_header != b'%PDF-':
                return Response(
                    {'error': 'Invalid PDF file format.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Map document types to model fields
            field_mapping = {
                'Assumption of Risk Form': ('assumption_of_risk_form', 'assumption_of_risk_form_timestamp'),
                'Acknowledgement of the Code of Conduct': ('acknowledgement_of_code_of_conduct', 'acknowledgement_of_code_of_conduct_timestamp'),
                'Housing Questionnaire': ('housing_questionnaire', 'housing_questionnaire_timestamp'),
                'Medical/Health History and Immunization Records': ('medical_health_history_and_immunization_records', 'medical_health_history_and_immunization_records_timestamp'),
            }
            
            if document_type not in field_mapping:
                return Response(
                    {'error': 'Invalid document type'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Set the file field and timestamp on the application
            file_field, timestamp_field = field_mapping[document_type]
            setattr(application, file_field, document)
            setattr(application, timestamp_field, timezone.now())
            application.save()
            
            return Response({
                'status': 'success',
                'file_url': getattr(application, file_field).url,
                'timestamp': getattr(application, timestamp_field)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get', 'post', 'put', 'delete'])
    def notes(self, request, pk=None, note_id=None):
        """
        Handle CRUD operations for confidential notes
        GET: Retrieve all notes for an application
        POST: Create a new note for an application
        PUT: Update an existing note
        DELETE: Delete a note
        """
        application = self.get_object()
        
        # GET - Retrieve notes
        if request.method == 'GET':
            # Only admins can view notes
            if 'Administrator' not in request.user.info.roles:
                raise PermissionDenied("Only administrators can view confidential notes.")
                
            notes = ConfidentialNote.objects.filter(application=application)
            serializer = ConfidentialNoteSerializer(notes, many=True)
            return Response(serializer.data)
        
        # POST - Create note
        elif request.method == 'POST':
            # Only admins can create notes
            if 'Administrator' not in request.user.info.roles:
                raise PermissionDenied("Only administrators can add confidential notes.")
                
            serializer = ConfidentialNoteSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(
                    application=application,
                    author=request.user
                )
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # PUT - Update note
        elif request.method == 'PUT':
            # Get the note to update
            try:
                note_id = self.kwargs.get('note_id')
                note = ConfidentialNote.objects.get(id=note_id, application=application)
                
                # Check if the user is the author or an admin
                if note.author != request.user and 'Administrator' not in request.user.info.roles:
                    raise PermissionDenied("You do not have permission to edit this note.")
                    
                serializer = ConfidentialNoteSerializer(note, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            except ConfidentialNote.DoesNotExist:
                return Response({"detail": "Note not found."}, status=status.HTTP_404_NOT_FOUND)
        
        # DELETE - Delete note
        elif request.method == 'DELETE':
            try:
                note_id = self.kwargs.get('note_id')
                note = ConfidentialNote.objects.get(id=note_id, application=application)
                
                # Check if the user is the author or an admin
                if note.author != request.user and 'Administrator' not in request.user.info.roles:
                    raise PermissionDenied("You do not have permission to delete this note.")
                    
                note.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)
            except ConfidentialNote.DoesNotExist:
                return Response({"detail": "Note not found."}, status=status.HTTP_404_NOT_FOUND)

class ConfidentialNoteViewSet(viewsets.ModelViewSet):
    serializer_class = ConfidentialNoteSerializer
    permission_classes = [IsAuthenticated, ConfidentialNotesPermissions]

    def get_queryset(self):
        application_id = self.kwargs.get('application_id')
        return ConfidentialNote.objects.filter(application_id=application_id).order_by('-timestamp')

    def get_serializer_context(self):
        """Add application_id to serializer context"""
        context = super().get_serializer_context()
        context['application_id'] = self.kwargs.get('application_id')
        return context

    def perform_create(self, serializer):
        user = self.request.user.info
        application_id = self.kwargs.get('application_id')
        
        try:
            application = Application.objects.get(id=application_id)
        except Application.DoesNotExist:
            raise NotFound("Application not found.")
        
        serializer.save(
            author=user,
            application=application
        )

    def perform_update(self, serializer):
        note = self.get_object()
        user = self.request.user.info
        
        # Ensure only the author or an admin can edit the note
        if note.author != user:
            raise PermissionDenied("You do not have permission to edit this note.")
        
        serializer.save()

    def perform_destroy(self, instance):
        note = self.get_object()
        user = self.request.user.info
        
        # Ensure only the author or an admin can edit the note
        if not 'Administrator' in user.roles and note.author != user:
            raise PermissionDenied("You do not have permission to edit this note.")
        
        instance.delete()
            
            
            
class ProgramApplicationCountsView(APIView):
    permission_classes = [IsAuthenticated, NotStudent]

    def get(self, request, *args, **kwargs):
        # Query to get count of applications by status for each program using Case and When
        programs = Program.objects.annotate(
            applied_count=Count(
                Case(When(application__status='Applied', then=1), output_field=IntegerField())
            ),
            eligible_count=Count(
                Case(When(application__status='Eligible', then=1), output_field=IntegerField())
            ),
            approved_count=Count(
                Case(When(application__status='Approved', then=1), output_field=IntegerField())
            ),
            enrolled_count=Count(
                Case(When(application__status='Enrolled', then=1), output_field=IntegerField())
            ),
            canceled_count=Count(
                Case(When(application__status='Canceled', then=1), output_field=IntegerField())
            ),
            withdrawn_count=Count(
                Case(When(application__status='Withdrawn', then=1), output_field=IntegerField())
            ),
            completed_count=Count(
                Case(When(application__status='Completed', then=1), output_field=IntegerField())
            ),
            active_count=F('applied_count') + F('enrolled_count') + F('approved_count') + F('eligible_count'),
            year_int=Cast('year', IntegerField()),  # Ensure year is sorted as an integer
            semester_order=Case(
                When(semester='Spring', then=1),
                When(semester='Summer', then=2),
                When(semester='Fall', then=3),
                default=4,
                output_field=IntegerField()
            )
        ).order_by('year_int', 'semester_order')

        serialized_data = []
        for program in programs:
            # Serialize the program
            serializer = ProgramSerializer(program, context={'request': request})
            program_data = serializer.data

            # Append additional fields to the serialized data
            program_data['applied_count'] = program.applied_count
            program_data['eligible_count'] = program.eligible_count
            program_data['approved_count'] = program.approved_count
            program_data['enrolled_count'] = program.enrolled_count
            program_data['canceled_count'] = program.canceled_count
            program_data['withdrawn_count'] = program.withdrawn_count
            program_data['completed_count'] = program.completed_count
            program_data['active_count'] = program.active_count

            # Add the modified data to the result list
            serialized_data.append(program_data)

        # Return the serialized data as a JSON response
        return Response(serialized_data)

class UserProgramCountsView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request, *args, **kwargs):
        current_user = request.user.info  # Get the logged-in user

        # Query to count distinct programs for each status
        counts = (
            Application.objects.filter(student=current_user)
            .values("status")
            .annotate(program_count=Count("program", distinct=True))
        )

        # Convert queryset to dictionary
        status_counts = {entry["status"]: entry["program_count"] for entry in counts}

        # Ensure all statuses exist in the response (even if count is 0)
        all_statuses = ["Applied", "Eligible","Approved","Enrolled", "Canceled", "Withdrawn"]
        response_data = {status: status_counts.get(status, 0) for status in all_statuses}

        # Compute active applications count (applied + enrolled)
        response_data["active_count"] = response_data["Applied"] + response_data["Enrolled"]
        response_data["total_count"] = response_data["Applied"] + response_data["Enrolled"] + + response_data["Canceled"] + response_data["Withdrawn"]

        return Response(response_data)
    
class FacultyLeadProgramCounts(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, *args, **kwargs):
        # Retrieve the lead_to_remove_id from the URL parameters
        lead_to_remove_id = kwargs.get('pk')

        try:
            # Get the AppUser object for the given lead ID
            lead_to_remove = AppUser.objects.get(id=lead_to_remove_id)

            # Get all programs where the faculty_leads field contains the lead_to_remove
            programs = Program.objects.filter(faculty_leads__in=[lead_to_remove])

            # Extract the program titles and return them as a list
            program_titles = [program.title for program in programs]

            return Response(program_titles)

        except AppUser.DoesNotExist:
            return Response({"error": "Faculty lead not found"}, status=404)
    

class UserApplicationCountsView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request, *args, **kwargs):
        current_user = request.user.info

        # Count programs by status for logged in user
        application_counts = Application.objects.filter(student=current_user).aggregate(
            applied_count=Count(Case(When(status='Applied', then=1), output_field=IntegerField())),
            enrolled_count=Count(Case(When(status='Enrolled', then=1), output_field=IntegerField())),
            canceled_count=Count(Case(When(status='Canceled', then=1), output_field=IntegerField())),
            withdrawn_count=Count(Case(When(status='Withdrawn', then=1), output_field=IntegerField())),
        )

        # Calculate active applications (Applied + Enrolled)
        application_counts['active_count'] = application_counts['applied_count'] + application_counts['enrolled_count']

        return Response(application_counts)


class StudentApplicationsView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        # Get the current user
        current_user = request.user.info

        # Fetch applications for the authenticated student
        applications = Application.objects.filter(student=current_user).select_related("program").order_by(
            "program__year", "program__semester"
        )
        # Initialize the response data list
        response_data = []

        # For each application, serialize the program and add application details
        for application in applications:
            # Serialize the program using ProgramSerializer
            program_data = ProgramSerializer(application.program, context={'request': request}).data
            # Add application-specific fields
            program_data.update({
                'application_id': application.id,
                'status': application.status,
                'assumption_of_risk_form': application.assumption_of_risk_form.url if application.assumption_of_risk_form else None,
                'acknowledgement_of_code_of_conduct': application.acknowledgement_of_code_of_conduct.url if application.acknowledgement_of_code_of_conduct else None,
                'housing_questionnaire': application.housing_questionnaire.url if application.housing_questionnaire else None,
                'medical_health_history_and_immunization_records': application.medical_health_history_and_immunization_records.url if application.medical_health_history_and_immunization_records else None,
                'payment_status': application.payment_status
            })
            
            response_data.append(program_data)

        return Response(response_data)
    
class CheckApplication(APIView):
    permission_classes= [IsAuthenticated,IsStudent]
    def get(self, request, program_id):
        try:
            # Retrieve the program by its ID
            program = Program.objects.get(id=program_id)

            # Retrieve the user by its ID
            user = request.user.info

            # Check if the user has an application for the given program
            application = Application.objects.filter(student=user, program=program).first()

            if application:
                return Response({"id":application.id,"has_application": True, "application_status": application.status}, status=status.HTTP_200_OK)
            else:
                return Response({"id":-1,"has_application": False, "application_status": "Not Applied"}, status=status.HTTP_200_OK)

        except Program.DoesNotExist:
            return Response({"error": "Program not found"}, status=status.HTTP_404_NOT_FOUND)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    
###########################################################

class UserProfileView(viewsets.ModelViewSet):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        user_info = self.request.user.info

        # Check if the user already has a profile
        if hasattr(user_info, "profile") and user_info.profile is not None:
            return user_info.profile
            
        # Create new profile and assign it to the user
        profile = UserProfile.objects.create()
        user_info.profile = profile
        user_info.save()
        return profile

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def perform_create(self, serializer):
        # Get or create the profile
        profile = self.get_object()
        serializer.update(profile, serializer.validated_data)
        # Update the profile with the serializer data
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        instance.refresh_from_db()
        return Response(serializer.data)
    
    def perform_update(self, serializer):
        serializer.save()
###########################################################

class ProgramView(viewsets.ModelViewSet):
    serializer_class = ProgramSerializer
    queryset = Program.objects.all()
    permission_classes=[ProgramPermissions]

    def get_queryset(self):
        user = self.request.user
        if any(role in user.info.roles for role in ["Administrator","Faculty", "Reviewer"]):
            return Program.objects.all()
        if any(role in user.info.roles for role in ["Partner"]):
            return Program.objects.filter(provider_partners=user.info)
        else:
            now = timezone.now()  # Get the current time
        # Get all programs where the end date is greater than or equal to the current time
            return Program.objects.filter(end_date__gte=now).order_by('deadline')
    def get_serializer_context(self):
        """
        Override this method to include the request context in the serializer.
        """
        context = super().get_serializer_context()  # Get the default context
        context['request'] = self.request  # Add request context
        return context

        
class UserManagementView(viewsets.ModelViewSet):
    serializer_class = AppUserSerializer
    queryset = AppUser.objects.all()
    permission_classes=[IsAuthenticated, IsAdmin]

    def get_involved_programs(self, user):
        """Helper function to get involved programs based on user type."""
        if 'Faculty' in user.roles:
            return list(user.programs_led.values_list("title", flat=True))
        elif 'Student' in user.roles:
            return list(Program.objects.filter(application__student=user).values_list("title", flat=True))
        elif 'Partner' in user.roles:
            return list(user.provider_programs.values_list("title", flat=True))
        return []

    def list(self, request, *args, **kwargs):
        """Override list to append involved programs dynamically."""
        response = super().list(request, *args, **kwargs)
        for user_data in response.data:
            user = AppUser.objects.get(id=user_data["id"])
            user_data["involved_programs"] = self.get_involved_programs(user)
        return response

    def retrieve(self, request, *args, **kwargs):
        """Override retrieve to append involved programs dynamically."""
        response = super().retrieve(request, *args, **kwargs)
        user = self.get_object()
        response.data["involved_programs"] = self.get_involved_programs(user)
        return response

    def remove_faculty_lead_and_assign_admin_for_all_programs(self, lead_to_remove_id):
        try:
            # Start a transaction to ensure atomicity
            with transaction.atomic():
                # Retrieve the faculty lead to remove by their ID
                lead_to_remove = AppUser.objects.get(id=lead_to_remove_id)
                # Get all programs that have this lead as a faculty lead
                programs = Program.objects.filter(faculty_leads__in=[lead_to_remove])

                # Loop through all programs and remove the faculty lead
                for program in programs:
                    program.faculty_leads.remove(lead_to_remove)  # Remove the lead from the program
                    program.save()

                    # Check if the program now has no faculty leads and assign admin if necessary
                    if program.faculty_leads.count() == 0:
                        admin_user = AppUser.objects.filter(user__username="admin").first()
                        if admin_user:
                            program.faculty_leads.add(admin_user)  # Add the admin as faculty lead
                            program.save()
                            
                        else:
                            return {"error": "No admin found to assign as lead for program ID: {}".format(program.id)}

                return {"message": "Faculty lead removed from all programs and admin assigned where necessary."}

        except ObjectDoesNotExist as e:
            return {"error": str(e)}
        except Exception as e:
            return {"error": "An unexpected error occurred: " + str(e)}
    def remove_partner_for_all_programs(self, partner_to_remove_id):
        try:
            # Start a transaction to ensure atomicity
            with transaction.atomic():
                # Retrieve the faculty lead to remove by their ID
                partner_to_remove = AppUser.objects.get(id=partner_to_remove_id)
                # Get all programs that have this lead as a faculty lead
                programs = Program.objects.filter(provider_partners__in=[partner_to_remove])

                # Loop through all programs and remove the faculty lead
                for program in programs:
                    program.provider_partners.remove(partner_to_remove)  # Remove the lead from the program
                    program.save()

                return {"message": "Partnerremoved from all programs"}

        except ObjectDoesNotExist as e:
            return {"error": str(e)}
        except Exception as e:
            return {"error": "An unexpected error occurred: " + str(e)}
        
        
    def destroy(self, request, pk=None):
        user_to_remove = get_object_or_404(AppUser, pk=pk)

        if 'Faculty' in user_to_remove.roles:
            result = self.remove_faculty_lead_and_assign_admin_for_all_programs(user_to_remove.id)
        
            if result.get('error'):
                return Response({"error": result['error']}, status=status.HTTP_400_BAD_REQUEST)
        if 'Partner' in user_to_remove.roles:
            result = self.remove_partner_for_all_programs(user_to_remove.id)
        
            if result.get('error'):
                return Response({"error": result['error']}, status=status.HTTP_400_BAD_REQUEST)
            
        # Proceed to delete the user if no issues found
        user_to_remove.delete()
        
        return Response({"message": "User removed"}, status=status.HTTP_200_OK)

        
    def delete_user_applications(self, user_id):
        try:
            # Start a transaction to ensure atomicity
            with transaction.atomic():
                user = AppUser.objects.get(id=user_id)

                applications = Application.objects.filter(student=user)

                # Delete the applications
                applications.delete()

                # Optionally, return a success message
                return {"success": "Applications deleted successfully."}

        except ObjectDoesNotExist as e:

            return {"error": str(e)}
        except Exception as e:
            return {"error": "An unexpected error occurred: " + str(e)}

  
    @action(detail=True, methods=['patch'])
    def change_user_role(self, request, pk):
        
        if str(request.user.id) == pk:
            return Response({"error": "You cannot modify your own account."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            app_user = AppUser.objects.get(id=pk)
        except AppUser.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        # Ensure only "roles" is being modified
        allowed_fields = {"roles"}
        extra_fields = set(request.data.keys()) - allowed_fields

        if extra_fields:
            return Response({"error": f"Unexpected fields in request: {', '.join(extra_fields)}"}, status=status.HTTP_400_BAD_REQUEST)

        # Extract new roles
        new_user_roles = request.data.get('roles')

        if not new_user_roles:
            return Response({"error": "User role is required."}, status=status.HTTP_400_BAD_REQUEST)
        

        if 'Faculty' in app_user.roles and 'Faculty' not in new_user_roles:
            self.remove_faculty_lead_and_assign_admin_for_all_programs(pk)
        if 'Student' in app_user.roles and 'Student' not in new_user_roles:
            self.delete_user_applications(pk)

        
        app_user.roles=new_user_roles  # Use `extend` for lists
        app_user.save()
        return Response(AppUserSerializer(app_user).data, status=status.HTTP_200_OK)
        

class StudentProgramBrowseView(APIView):
    permission_classes = [IsAuthenticated,IsNotPartner]

    def get_queryset(self, user):
        # Get current server time for date comparisons
        current_server_time = timezone.now()
        
        # Subquery to fetch application status
        applied_status = Application.objects.filter(
            program=OuterRef('pk'),
            student=user
        ).values('status')[:1]

        application_id = Application.objects.filter(
            program=OuterRef('pk'),
            student=user
        ).values('id')[:1]

        # Main queryset
        programs_queryset = Program.objects.filter(
            end_date__gte=current_server_time
        ).annotate(
            has_applied=Exists(
                Application.objects.filter(
                    program=OuterRef('pk'),
                    student=user
                )
            ),
            application_status=Coalesce(Subquery(applied_status), Value('Not Applied')),
            application_id=Coalesce(Subquery(application_id), Value(None)),
        ).order_by('deadline')

        return programs_queryset

    def get(self, request):
        programs = self.get_queryset(request.user.info)
        serialized_data = []

        for program in programs:
                serializer = ProgramSerializer(program, context={'request': request})
                program_data = serializer.data

                # Append additional fields to the serialized data
                program_data['has_applied'] = program.has_applied
                program_data['application_status'] = program.application_status
                program_data['application_id'] = program.application_id

                serialized_data.append(program_data)

        return Response(serialized_data)
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class AdminProgramDetailsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, program_id):
        if any(role in self.request.user.info.roles for role in ["Administrator","Faculty", "Reviewer"]):
            try:
                # Check if the program exists
                program = Program.objects.get(id=program_id)
            except Program.DoesNotExist:
                return Response({"error": "Program not found"}, status=404)
            if not any(role in self.request.user.info.roles for role in ["Administrator", "Reviewer"]) and not any(lead == self.request.user.info for lead in program.faculty_leads.all()):
                return Response({"error": "Unauthorized"}, status=403)

            # Fetch all applications for the given program
            applications = (
                Application.objects.filter(program=program)
                .select_related("student__user", "student__profile")  # Optimize queries
                .values(
                    "id",                          # Application ID
                    "student__display_name",       # Student's display name
                    "student__user__username",     # Username
                    "student__user__email",        # Email
                    "student__dob",                # Date of Birth
                    "student__profile__major",     # Major
                    "student__profile__gpa",       # GPA
                    "status",                      # Application status
                    "assumption_of_risk_form",
                    "acknowledgement_of_code_of_conduct",
                    "housing_questionnaire",
                    "medical_health_history_and_immunization_records",
                    "payment_status"
                )
            )

            # Format the data to match AdminProgramDetailsTableData
            formatted_data = []
            
            for app in applications:
                # Get confidential notes for this application
                notes = ConfidentialNote.objects.filter(application_id=app["id"]).order_by('-timestamp')
                notes_serializer = ConfidentialNoteSerializer(notes, many=True)
                
                # Get recommendation letters for this application
                recommendation_letters = RecommendationLetter.objects.filter(application_id=app["id"])
                rec_letters_serializer = RecommendationLetterSerializer(recommendation_letters, many=True)
                
                app_data = {
                    "application_id": app["id"],
                    "display_name": app["student__display_name"],
                    "username": app["student__user__username"],
                    "email": app["student__user__email"],
                    "dob": app["student__dob"],
                    "major": app["student__profile__major"],
                    "gpa": app["student__profile__gpa"],
                    "status": app["status"],
                    "assumption_of_risk_form": app["assumption_of_risk_form"],
                    "acknowledgement_of_code_of_conduct": app["acknowledgement_of_code_of_conduct"],
                    "housing_questionnaire": app["housing_questionnaire"],
                    "medical_health_history_and_immunization_records": app["medical_health_history_and_immunization_records"],
                    "confidential_notes": notes_serializer.data,
                    "recommendation_letters": rec_letters_serializer.data,
                    "payment_status":app["payment_status"]
                }
                formatted_data.append(app_data)
                
            return Response(formatted_data)
        else:
            return JsonResponse({"error": "Forbidden"}, status=403)

###########################################################

def change_password(request):
    if request.method == 'POST':
        form = PasswordChangeForm(request.user, request.POST)
        if form.is_valid():
            user = form.save()
            update_session_auth_hash(request, user)  # Important!
            messages.success(request, 'Your password was successfully updated!')
            return redirect('change_password')
        else:
            messages.error(request, 'Please correct the error below.')
    else:
        form = PasswordChangeForm(request.user)
    return render(request, 'change_password.html', {
        'form': form
    })

def csrf_token(request):
    return JsonResponse({'csrfToken': get_token(request)})



class ContentView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        content = Content.objects.first()

        if not content:
            content = Content.objects.create(content="Discover amazing study abroad opportunities and expand your horizons.")

        return Response({"content": content.content}, status=status.HTTP_200_OK)

    def put(self, request):
        if self.request.user:
            if 'Administrator' in self.request.user.info.roles: 
                content_data = request.data.get("content")

                if content_data:
                    content = Content.objects.first()

                    if content:
                        content.content = content_data
                        content.save()
                        content.refresh_from_db()
                        print(f"Updated content: {content.content}")  # Debugging
                        return Response({"content": content.content}, status=status.HTTP_200_OK)
                    else:
                        content = Content.objects.create(content=content_data)
                        print(f"Created new content: {content.content}")  # Debugging
                        return Response({"content": content.content}, status=status.HTTP_201_CREATED)

                return Response({"error": "Content is required."}, status=status.HTTP_400_BAD_REQUEST)
        return JsonResponse({"error": "Forbidden"}, status=403)
    
class InstitutionNameView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        name = InstitutionName.objects.first()

        if not name:
            name = InstitutionName.objects.create(name="Your Institution")

        return Response({"name": name.name}, status=status.HTTP_200_OK)

    def put(self, request):
        if self.request.user:
            if self.request.user.username == "admin": 
                name_data = request.data.get("name")

                if name_data:
                    name = InstitutionName.objects.first()

                    if name:
                        name.name = name_data
                        name.save()
                        name.refresh_from_db()
                        return Response({"name": name.name}, status=status.HTTP_200_OK)
                    else:
                        name = InstitutionName.objects.create(name=name_data)
                        return Response({"name": name.name}, status=status.HTTP_201_CREATED)

                return Response({"error": "Name is required."}, status=status.HTTP_400_BAD_REQUEST)
        return JsonResponse({"error": "Forbidden"}, status=403)
    
class PrimaryColorView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        color = PrimaryColor.objects.first()

        if not color:
            color = PrimaryColor.objects.create(color="#D3D3D3")

        return Response({"color": color.color}, status=status.HTTP_200_OK)

    def put(self, request):
        if self.request.user:
            if self.request.user.username == "admin":
                color_data = request.data.get("color")
                if color_data:
                    color = PrimaryColor.objects.first()

                    if color:
                        color.color = color_data
                        color.save()
                        color.refresh_from_db()
                        return Response({"color": color.color}, status=status.HTTP_200_OK)
        return JsonResponse({"error": "Forbidden"}, status=403)
    
class SecondaryColorView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        color = SecondaryColor.objects.first()

        if not color:
            color = SecondaryColor.objects.create(color="#000000")

        return Response({"color": color.color}, status=status.HTTP_200_OK)

    def put(self, request):
        if self.request.user:
            if self.request.user.username == "admin":
                color_data = request.data.get("color")
                if color_data:
                    color = SecondaryColor.objects.first()

                    if color:
                        color.color = color_data
                        print(color_data)
                        color.save()
                        color.refresh_from_db()
                        return Response({"color": color.color}, status=status.HTTP_200_OK)
        return JsonResponse({"error": "Forbidden"}, status=403)


class SSOAuthRedirect(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        base_url = settings.SSO_AUTH_URL

        encoded_redirect_url = urllib.parse.quote(settings.SSO_REDIRECT_URL.encode('utf-8'))  # Ensure it's encoded as bytes first

        request_url = "{}?client_id={}&redirect_uri={}&response_type=code".format(
            base_url,
            settings.SSO_CLIENT_ID,
            encoded_redirect_url
        )
        
        # return redirect(request_url)
        return Response({"request_url": request_url})

class SSOTokenRedirect(APIView):
    permission_classes = [AllowAny]

    def format_auth_string(self):
        try:
            string = "{}:{}".format(settings.SSO_CLIENT_ID, settings.SSO_SECRET)
            data = base64.b64encode(string.encode())
            return data.decode("utf-8")
        except Exception as e:
            logger.error(f"Error in format_auth_string: {str(e)}")
            raise

    def get_display_name(self, access_token):
        userinfo_url = settings.SSO_USER_INFO_URL

        headers = {
            'Authorization': f'Bearer {access_token}'
        }

        try:
            logger.info(f"Making request to {userinfo_url} for user info")
            response = requests.get(userinfo_url, headers=headers)
            response.raise_for_status()
            user_info = response.json()
            logger.info(f"Successfully retrieved user info with keys: {', '.join(user_info.keys())}")
            return user_info.get('name', 'N/A')
        except requests.exceptions.RequestException as e:
            logger.error(f"Error getting display name: {str(e)}")
            raise
    
    def get(self, request, code):
        logger.info(f"SSOTokenRedirect.get called with code: {code[:5]}...")
        try:
            auth = self.format_auth_string()
            logger.info("Auth string formatted successfully")

            base_url = settings.SSO_TOKEN_URL
            logger.info(f"Using token URL: {base_url}")

            # Prepare the payload for the POST request
            payload = urllib.parse.urlencode({
                'grant_type': "authorization_code", 
                'redirect_uri': settings.SSO_REDIRECT_URL,
                'code': code,
            })

            headers = {
                'content-type': "application/x-www-form-urlencoded",
                'authorization': f"Basic {auth}"
            }

            logger.info(f"Making token request to {base_url}")
            try:
                # Send the POST request to get the access token
                response = requests.post(base_url, data=payload, headers=headers)
                status_code = response.status_code
                logger.info(f"Token request returned status code: {status_code}")
                
                if status_code != 200:
                    logger.error(f"Non-200 response from token endpoint: {status_code}, Response: {response.text[:200]}")
                    return Response({"error": f"Error in token request: Status {status_code}"}, status=500)
                
                try:
                    response_data = response.json()
                    logger.info(f"Token response parsed successfully with keys: {', '.join(response_data.keys())}")
                except ValueError as e:
                    logger.error(f"Error parsing token response as JSON: {str(e)}, Response: {response.text[:200]}")
                    return Response({"error": "Invalid JSON response from token endpoint"}, status=500)
            except requests.exceptions.RequestException as e:
                logger.error(f"Error in token request: {str(e)}")
                return Response({"error": "Error in token request"}, status=500)

            access_token = response_data.get("access_token")
            id_token = response_data.get("id_token")

            if not access_token:
                logger.error("Missing access_token in response")
                return Response({"error": "Missing access token"}, status=500)
                
            if not id_token:
                logger.error("Missing id_token in response")
                return Response({"error": "Missing ID token"}, status=500)

            logger.info("Successfully obtained access_token and id_token")
            
            try:
                logger.info("Attempting to decode ID token")
                decoded_id_token = jwt.decode(id_token, options={"verify_signature": False})
                logger.info(f"ID token decoded successfully with keys: {', '.join(decoded_id_token.keys())}")
            except jwt.ExpiredSignatureError as e:
                logger.error(f"Expired ID token: {str(e)}")
                return Response({"error": "Expired ID token"}, status=400)
            except jwt.JWTError as e:
                logger.error(f"Error decoding ID token: {str(e)}")
                return Response({"error": "Error decoding ID token"}, status=400)

            # Extract netid from the subject claim
            try:
                sub_claim = decoded_id_token.get("sub", "")
                logger.info(f"Sub claim from token: {sub_claim}")
                if "@" in sub_claim:
                    netid = sub_claim.split("@")[0]
                else:
                    netid = sub_claim
                
                logger.info(f"Extracted netid: {netid}")
            except Exception as e:
                logger.error(f"Error extracting netid: {str(e)}")
                netid = None

            if not netid:
                logger.error("Netid missing or couldn't be extracted from ID token")
                return Response({"error": "Netid missing in ID token"}, status=500)

            # Get user display name
            try:
                logger.info("Getting display name")
                display_name = self.get_display_name(access_token)
                logger.info(f"Got display name: {display_name}")
            except Exception as e:
                logger.error(f"Error getting display name: {str(e)}")
                display_name = netid  # Fallback to using netid as display name
                logger.info(f"Using netid as display name: {display_name}")

            # Database operations 
            try:
                logger.info(f"Starting database operations for netid: {netid}")
                
                # Check for ULink username conflicts
                logger.info("Checking for ULink username conflicts")
                try:
                    existing_ulink_users = AppUser.objects.filter(ulink_username=netid)
                    logger.info(f"Found {existing_ulink_users.count()} users with ULink username {netid}")
                    
                    for existing_user in existing_ulink_users:
                        logger.info(f"Clearing ULink username for user {existing_user.id}")
                        existing_user.ulink_username = None
                        existing_user.save()
                except Exception as e:
                    logger.error(f"Error handling ULink conflicts: {str(e)}")
                
                # Handle existing user with this username
                logger.info(f"Checking for existing user with username {netid}")
                app_user = AppUser.objects.filter(user__username=netid).first()
                
                if app_user:
                    logger.info(f"Found existing user with id {app_user.id}")
                    if not app_user.is_sso:
                        logger.info(f"Converting non-SSO user to SSO user: {app_user.id}")
                        app_user.is_sso = True
                        app_user.save()
                    
                    if app_user.display_name != display_name:
                        logger.info(f"Updating display name from '{app_user.display_name}' to '{display_name}'")
                        app_user.display_name = display_name
                        app_user.save()
                else:
                    logger.info(f"Creating new user with username {netid}")
                    try:
                        user = User.objects.create(username=netid, email=decoded_id_token.get("sub", ""))
                        logger.info(f"Created new user with id {user.id}")
                        
                        app_user = AppUser.objects.create(
                            user=user,
                            display_name=display_name,
                            is_sso=True
                        )
                        logger.info(f"Created new AppUser with id {app_user.id}")
                    except Exception as e:
                        logger.error(f"Error creating new user: {str(e)}")
                        raise
            except Exception as e:
                logger.error(f"Database operation failed: {str(e)}")
                # Try to provide more specific error info
                if "duplicate key" in str(e).lower():
                    logger.error("This appears to be a database uniqueness constraint error")
                return Response({"error": f"Database operation failed: {str(e)}"}, status=500)
            
            logger.info("SSO authentication completed successfully")
            return Response({
                "access_token": access_token, 
                "id_token": id_token,
            })
        except Exception as e:
            logger.error(f"Unexpected error in SSOTokenRedirect: {str(e)}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            return Response({"error": "An unexpected error occurred"}, status=500)




###########################################################

def change_password(request):
    if request.method == 'POST':
        form = PasswordChangeForm(request.user, request.POST)
        if form.is_valid():
            user = form.save()
            update_session_auth_hash(request, user)  # Important!
            messages.success(request, 'Your password was successfully updated!')
            return redirect('change_password')
        else:
            messages.error(request, 'Please correct the error below.')
    else:
        form = PasswordChangeForm(request.user)
    return render(request, 'change_password.html', {
        'form': form
    })

def csrf_token(request):
    return JsonResponse({'csrfToken': get_token(request)})



        

@api_view(['GET'])
@permission_classes([IsAuthenticated])  # Ensure only logged-in users can access
def get_application_documents(request, application_id):
    try:
        application = Application.objects.get(id=application_id)
        user_roles = request.user.info.roles  # Assuming roles are stored here
        has_access = False  # Default: deny access
        is_limited = False  # Default: full access if allowed

        # Role-based access logic
        if "Administrator" in user_roles:
            has_access = True  # Admins get full access
        elif "Faculty" in user_roles and request.user.info in application.program.faculty_leads.all():
            has_access = True  # Faculty can access if they are the lead
        elif "Student" in user_roles and application.student == request.user.info:
            has_access = True  # Students can access their own applications
        elif "Reviewer" in user_roles:
            has_access = True  # Reviewers get access but in a limited way
            is_limited = True  # Prevent them from seeing file URLs

        if not has_access:
            return Response({'error': 'Permission denied'}, status=403)  # Block unauthorized users

        # Map model fields to document types
        document_fields = {
            'assumption_of_risk_form': 'Assumption of Risk Form',
            'acknowledgement_of_code_of_conduct': 'Acknowledgement of the Code of Conduct',
            'housing_questionnaire': 'Housing Questionnaire',
            'medical_health_history_and_immunization_records': 'Medical/Health History and Immunization Records'
        }

        documents = []
        for field, doc_type in document_fields.items():
            file_field = getattr(application, field)
            timestamp_field = getattr(application, f'{field}_timestamp')

            if file_field:
                document_info = {
                    'document_type': doc_type,
                    'timestamp': timestamp_field
                }
                if not is_limited:  # If the user has full access, include file URL
                    document_info['file_url'] = file_field.url

                documents.append(document_info)

        return Response(documents)

    except Application.DoesNotExist:
        return Response({'error': 'Application not found'}, status=404)


        

class DocumentTemplateView(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = DocumentTemplate.objects.all()
    serializer_class = DocumentTemplateSerializer

    def list(self, request):
        templates = self.get_queryset()
        data = [{
            'document_type': template.document_type,
            'file_url': request.build_absolute_uri(template.template_file.url)
        } for template in templates]
        return Response(data)

@staff_member_required
def view_audit_logs(request):
    """Allows only admins to view the audit logs."""
    log_file_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'backend', 'audit.log')

    with open(log_file_path, "r") as log_file:
        logs = log_file.readlines()
    return JsonResponse({"logs": logs[-100:]})  # Show the last 100 logs

@api_view(['GET'])
def serve_secure_document(request, application_id, document_type):
    """
    Securely serve document files with proper permission checks.
    Only authenticated users with permission to access the specific application can view its documents.
    """
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        application = Application.objects.get(id=application_id)
        
        # Check permissions - only allow access if user is admin or the application's student
        user_info = request.user.info
        if 'Administrator' not in user_info.roles and application.student != user_info and not application.program.faculty_leads.filter(id=user_info.id).exists():
            return Response({'error': 'You do not have permission to access this document'}, 
                           status=status.HTTP_403_FORBIDDEN)
        
        # Map document types to model fields
        document_fields = {
            'risk_form': 'assumption_of_risk_form',
            'code_of_conduct': 'acknowledgement_of_code_of_conduct',
            'housing': 'housing_questionnaire',
            'medical_records': 'medical_health_history_and_immunization_records'
        }
        
        if document_type not in document_fields:
            return Response({'error': 'Invalid document type'}, status=status.HTTP_400_BAD_REQUEST)
        
        field_name = document_fields[document_type]
        document_file = getattr(application, field_name)
        
        if not document_file:
            return Response({'error': 'Document not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Get the file path
        file_path = document_file.path
        
        if not os.path.exists(file_path):
            return Response({'error': 'File not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Determine content type
        content_type, encoding = mimetypes.guess_type(file_path)
        content_type = content_type or 'application/octet-stream'
        
        # Use FileResponse for efficient file serving
        response = FileResponse(open(file_path, 'rb'), content_type=content_type)
        response['Content-Disposition'] = f'inline; filename="{os.path.basename(file_path)}"'
        
        return response
        
    except Application.DoesNotExist:
        return Response({'error': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def serve_secure_recommendation_letter(request, letter_id):
    """
    Securely serve recommendation letter files with proper permission checks.
    Only authenticated users with appropriate permissions can view recommendation letters.
    
    Permissions:
    - Admin and Reviewers can view all recommendation letters
    - Faculty can only view letters for programs they are assigned to
    - Students can only view their own applications' letters
    """
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        letter = RecommendationLetter.objects.select_related('application__student', 'application__program').get(id=letter_id)
        
        # Check permissions
        user_info = request.user.info
        
        # Admin and Reviewers can access all letters
        if not any(role in user_info.roles for role in ['Administrator', 'Reviewer']):
            # Faculty can only view letters for programs they are assigned to
            if 'Faculty' in user_info.roles:
                if not letter.application.program.faculty_leads.filter(id=user_info.id).exists():
                    return Response({'error': 'You do not have permission to access this recommendation letter'}, 
                                   status=status.HTTP_403_FORBIDDEN)
            # Students can only view their own applications' letters
            elif 'Student' in user_info.roles:
                if letter.application.student != user_info:
                    return Response({'error': 'You do not have permission to access this recommendation letter'}, 
                                   status=status.HTTP_403_FORBIDDEN)
            else:
                return Response({'error': 'You do not have permission to access this recommendation letter'}, 
                               status=status.HTTP_403_FORBIDDEN)
        
        # Make sure there's a file to serve
        if not letter.letter_file:
            return Response({'error': 'Recommendation letter file not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Get the file path
        file_path = letter.letter_file.path
        
        if not os.path.exists(file_path):
            return Response({'error': 'File not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Determine content type
        content_type, encoding = mimetypes.guess_type(file_path)
        content_type = content_type or 'application/octet-stream'
        
        # Use FileResponse for efficient file serving
        response = FileResponse(open(file_path, 'rb'), content_type=content_type)
        response['Content-Disposition'] = f'inline; filename="{os.path.basename(file_path)}"'
        
        return response
        
    except RecommendationLetter.DoesNotExist:
        return Response({'error': 'Recommendation letter not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#helper method for recommendation letter view
def get_institution_name():
    try:
        return InstitutionName.objects.first().name
    except AttributeError:
        return "Your Institution"
        
class RecommendationLetterViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing recommendation letters.
    
    GET /api/applications/{application_id}/recommendation-letters/ - List all recommendation letters for authenticated user's applications
    GET /api/applications/{application_id}/recommendation-letters/?application_id=123 - List recommendation letters for a specific application
    POST /api/applications/{application_id}/recommendation-letters/ - Create a new recommendation letter request
    GET /api/applications/{application_id}/recommendation-letters/{id}/ - Get details of a specific recommendation letter
    DELETE /api/applications/{application_id}/recommendation-letters/{id}/ - Delete a recommendation letter request
    """
    serializer_class = RecommendationLetterSerializer
    permission_classes = [IsAuthenticated, RecommendationLetterPermission]
    
    def get_queryset(self):
        """
        Filter recommendation letters based on user role:
        - Students see only letters for their applications
        - Admins/Reviewers see all letters
        - Faculty see letters for programs they are assigned to
        """
        user = self.request.user
        app_user = getattr(user, 'info', None)
        
        if not app_user:
            return RecommendationLetter.objects.none()
            
        # Get application_id from the URL parameter
        application_id = self.kwargs.get('application_id')
        
        # Base queryset - will be filtered based on role
        queryset = RecommendationLetter.objects.all()
        
        # If application_id is provided in the URL, filter by it
        if application_id:
            queryset = queryset.filter(application_id=application_id)

        # Apply role-based filtering
        if 'Administrator' in app_user.roles or 'Reviewer' in app_user.roles:
            # Admins and Reviewers can see all letters (with application filter if provided)
            return queryset
        elif 'Faculty' in app_user.roles:
            # Faculty can only see letters for programs they are assigned to
            return queryset.filter(application__program__faculty_leads=app_user)
        else:
            # Students can only see their own applications' letters
            return queryset.filter(application__student=app_user)
    
    def perform_create(self, serializer):
        """Create a recommendation letter request"""
        # Check if the application exists and user has permission
        application_id = self.request.data.get('application_id')
        if not application_id:
            raise ValidationError({"application_id": "Application ID is required"})
            
        try:
            application = Application.objects.get(id=application_id)
        except Application.DoesNotExist:
            raise NotFound("Application not found")
            
        # Check permissions - only student who owns the application or admin can create
        user = self.request.user
        app_user = getattr(user, 'info', None)
        
        if not app_user:
            raise PermissionDenied("User profile not found")
            
        if not ('Administrator' in app_user.roles or application.student == app_user):
            raise PermissionDenied("You don't have permission to create this recommendation letter request")
        
        
        # Create the letter
        recommendation_letter = serializer.save(application_id=application_id)
        
        self.send_email(recommendation_letter)
    
    def send_email(self, letter):
        """Send email to the writer of the letter"""
        try: 
            mailchimp = MailchimpTransactional.Client(api_key=settings.MAILCHIMP_API_KEY)
            
            # Build the submission URL with the token
            base_url = settings.BASE_URL if hasattr(settings, 'BASE_URL') else "http://localhost:3000"
            submission_url = f"{base_url}/recommendation-letter/submit/{letter.application.id}/{letter.token}/"
            institution_name = get_institution_name()
            
            # Create a more comprehensive email message
            email_text = f"""Dear {letter.writer_name},

                You have received a request to provide a recommendation letter for {letter.application.student.display_name} for their application to {letter.application.program.title} at {institution_name}.

                Please submit your recommendation letter using the following link:
                {submission_url}

                This link is unique to you and does not require a login. Please do not share it with others.

                Thank you for your time and support for this student's study abroad application.

                Best regards,
                Abroad Hub
                """
            
            message = {
                "from_email": "joao.carvalho@duke.edu",
                "from_name": "Abroad Hub",
                "subject": f"Recommendation Letter Request for {letter.application.student.display_name}",
                "text": email_text,
                "to": [{"email": letter.writer_email, "name": letter.writer_name}],
            }
            
            # Print the message for debugging
            print(f"Sending email with message: {message}")
            
            response = mailchimp.messages.send({"message": message})
            
            # Print full response for debugging
            print(f"Email sent with full response: {response}")
        except ApiClientError as e:
            print(f"An API Client Exception occurred: {e}")
            # Print the error details
            if hasattr(e, 'text'):
                print(f"Error details: {e.text}")
        except Exception as e:
            print(f"An unexpected exception occurred: {e}")
            import traceback
            traceback.print_exc()       
    
    def destroy(self, request, *args, **kwargs):
        """Delete a recommendation letter"""
        letter = self.get_object()
        
        # Check permissions - only student who owns the application or admin can delete
        user = self.request.user
        app_user = getattr(user, 'info', None)
        
        if not app_user:
            raise PermissionDenied("User profile not found")
            
        if not ('Administrator' in app_user.roles or letter.application.student == app_user):
            raise PermissionDenied("You don't have permission to delete this recommendation letter")
        
        # Check if letter is pending and send a cancellation email
        if letter.status == 'Pending':
            self.send_cancellation_email(letter)
            
        return super().destroy(request, *args, **kwargs)
        
    def send_cancellation_email(self, letter):
        """Send email to the writer informing them that the recommendation request has been canceled"""
        try: 
            mailchimp = MailchimpTransactional.Client(api_key=settings.MAILCHIMP_API_KEY)
            institution_name = get_institution_name()
            
            # Create a cancellation email message
            email_text = f"""Dear {letter.writer_name},
            

                This is to inform you that the recommendation letter request for {letter.application.student.display_name}'s application to {letter.application.program.title} at {institution_name} has been canceled.

                You do not need to take any further action. The student may contact you directly if they wish to provide more information.

                Thank you for your understanding.

                Best regards,
                Abroad Hub
                """
            
            message = {
                "from_email": "joao.carvalho@duke.edu",
                "from_name": "Abroad Hub",
                "subject": f"Recommendation Letter Request Canceled - {letter.application.student.display_name}",
                "text": email_text,
                "to": [{"email": letter.writer_email, "name": letter.writer_name}],
            }
            
            # Print the message for debugging
            print(f"Sending cancellation email with message: {message}")
            
            response = mailchimp.messages.send({"message": message})
            
            # Print full response for debugging
            print(f"Cancellation email sent with full response: {response}")
        except ApiClientError as e:
            print(f"An API Client Exception occurred: {e}")
            # Print the error details
            if hasattr(e, 'text'):
                print(f"Error details: {e.text}")
        except Exception as e:
            print(f"An unexpected exception occurred: {e}")
            import traceback
            traceback.print_exc()

class RecommendationLetterSubmissionView(APIView):
    """
    Public API endpoint for verifying and submitting recommendation letters using a token.
    No authentication required - security is based on the unique token.
    
    GET: Verify token and return student/program info
    POST: Upload a recommendation letter file and mark as fulfilled
    """
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]
    
    def get(self, request, token):
        """Verify token and return context info for the recommendation letter form"""
        try:
            # Find the recommendation letter by token
            letter = RecommendationLetter.objects.select_related('application__student', 'application__program').get(token=token)
            institution_name = get_institution_name()
            
            # If already fulfilled, return that info
            response_data = {
                'student_name': letter.application.student.display_name,
                'program_title': letter.application.program.title,
                'university': {institution_name},  # Could be stored in settings or on the Program model
                'already_submitted': letter.status == 'Fulfilled',
                'writer_name': letter.writer_name,
            }
            
            return Response(response_data)
            
        except RecommendationLetter.DoesNotExist:
            return Response(
                {"error": "Invalid recommendation letter token or expired link."},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def post(self, request, token):
        """Submit a recommendation letter and mark it as fulfilled"""
        try:
            # Find the recommendation letter by token
            letter = RecommendationLetter.objects.get(token=token)
            
            # Check if already fulfilled
            if letter.status == 'Fulfilled':
                return Response(
                    {"error": "This recommendation letter has already been submitted."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get the uploaded file
            letter_file = request.FILES.get('letter_file')
            if not letter_file:
                return Response(
                    {"error": "No file uploaded. Please provide a PDF file."},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            # Validate file is a PDF
            if not letter_file.name.lower().endswith('.pdf'):
                return Response(
                    {"error": "Invalid file type. Only PDF files are allowed."},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            # Validate file size (10MB limit)
            max_size = 50 * 1024 * 1024  # 10MB in bytes
            if letter_file.size > max_size:
                return Response(
                    {"error": f"File size cannot exceed 50MB. Current size: {letter_file.size / (1024 * 1024):.2f}MB"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Update the letter
            letter.letter_file = letter_file
            letter.status = 'Fulfilled'
            letter.fulfilled_date = timezone.now()
            letter.save()
            
            return Response({"success": True, "message": "Recommendation letter submitted successfully."})
            
        except RecommendationLetter.DoesNotExist:
            return Response(
                {"error": "Invalid recommendation letter token or expired link."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"Error submitting recommendation letter: {str(e)}")
            return Response(
                {"error": "An error occurred while submitting your recommendation letter."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class PartnerProgramView(APIView):
    permission_classes = [IsAuthenticated, IsPartner]

    def get(self, request):
        # Get the current user
        current_user = request.user.info
        # Fetch programs for the authenticated partner
        programs = Program.objects.filter(provider_partners=current_user).annotate(
           approved_enrolled_count=Count(
        Case(
            When(application__status__in=['Approved', 'Enrolled'], then=Value(1)),
            output_field=IntegerField(),
        )
    ),
    fully_paid_count=Count(
        Case(
            When(
                Q(application__status__in=['Approved', 'Enrolled']) & 
                Q(application__payment_status='Fully Paid'),
                then=Value(1)
            ),
            output_field=IntegerField(),
        )
    )
        ) # Serialize the programs using the existing ProgramSerializer
        
        serialized_data = []
        # Modify the serialized data
        for program in programs:
            serializer = ProgramSerializer(program, context={"request": request})
            program_data = serializer.data  # Get the serialized data

            program_data["approved_enrolled_count"] = program.approved_enrolled_count
            program_data["fully_paid_count"] = program.fully_paid_count
            serialized_data.append(program_data)

        return Response(serialized_data)

class PartnerProgramDetailsView(APIView):
    permission_classes = [IsAuthenticated,IsPartner]

    def get(self, request, program_id):
            try:
                # Check if the program exists
                program = Program.objects.get(id=program_id)
            except Program.DoesNotExist:
                return Response({"error": "Program not found"}, status=404)
            if not any(partner == self.request.user.info for partner in program.provider_partners.all()):
                return Response({"error": "Forbidden"}, status=403)

            applications = (
            Application.objects.filter(
        Q(status="Enrolled") | Q(status="Approved"),  # Apply OR filter correctly
        program=program  # Ensure program filter is applied
    ).select_related("student__user")  
            .values(
                "id",                          # Application ID
                "student__display_name",       # Student's display name
                "student__user__username",     # Username
                "student__user__email",        # Email
                "status",                      # Application status
                "payment_status"
            )
        )

            formatted_data = []
            
            for app in applications:
                
                app_data = {
                    "application_id": app["id"],
                    "display_name": app["student__display_name"],
                    "username": app["student__user__username"],
                    "email": app["student__user__email"],
                    "status": app["status"],
                    "payment_status":app["payment_status"]
                }
                formatted_data.append(app_data)
                
            return Response(formatted_data)

class RemovePaymentTracking(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]  # Ensure the user is logged in

    def patch(self, request, pk):
        """Removes payment tracking settings from a program and updates related applications."""
        try:
            program = Program.objects.get(id=pk)
        except ObjectDoesNotExist:
            return Response({"error": "Program not found."}, status=status.HTTP_404_NOT_FOUND)

        # Update program settings
        program.track_payment = False
        program.payment_deadline = None  # Use `None` instead of `null`
        if hasattr(program, 'provider_partners'):
            program.provider_partners.clear()  # Clear provider partners list  # Clear provider partners list
        program.save()

        # Bulk update applications' payment_status
        Application.objects.filter(program=program).update(payment_status="Null")  # Bulk update for efficiency

        return Response({"message": "Payment tracking removed successfully."}, status=status.HTTP_200_OK)
    

@api_view(['POST'])
@permission_classes([IsAuthenticated])  # This exempts the view from authentication
def verify_ulink_account_view(request):
    if request.method == 'POST':
        print(request.data)
        ulink_username = request.data.get('ulink_username')
        pin = request.data.get('pin')
        
        if not ulink_username or not pin:
            return JsonResponse({'error': 'Missing ulink_username or pin'}, status=400)
        
        try:
            # Call the function to verify the account
            is_verified = verify_ulink_account(ulink_username, pin)
            
            if is_verified:
                return JsonResponse({'success': True})
            else:
                return JsonResponse({'success': False, 'message': 'Invalid U-link credentials'}, status=401)
        except ConnectionError as e:
            # Handle connection errors specifically
            logger.error(f"ConnectionError in verify_ulink_account_view: {str(e)}")
            return JsonResponse(
                {'success': False, 'message': 'Unable to connect to Ulink system. Please contact an administrator for assistance.'}, 
                status=503  # Service Unavailable
            )
        except Exception as e:
            # Handle other unexpected errors
            logger.error(f"Error in verify_ulink_account_view: {str(e)}")
            return JsonResponse(
                {'success': False, 'message': 'An error occurred while verifying Ulink credentials. Please contact an administrator.'}, 
                status=500  # Internal Server Error
            )
            
    return JsonResponse({'error': 'Invalid request method'}, status=405)

class UlinkConnect(APIView):
    permission_classes = [IsAuthenticated,Not_SSO]

    def post(self, request):
        # Get the ulink_username from the request
        ulink_username = request.data.get('ulink_username')
        user = request.user.info
        print("user",user)
        print("Request Data:", request.data)
        # Check if the ulink account is already connected
        if user.ulink_username:
            return Response({"error": "Ulink account already connected"}, status=400)

        user.ulink_username = ulink_username
        try:
            user.save()
            
            # Fetch transcript data after successfully connecting the account
            try:
                get_student_transcript(ulink_username, force_refresh=True)
            except ConnectionError as e:
                logger.error(f"ConnectionError in UlinkConnect.post: {str(e)}")
                return Response(
                    {"error": "Unable to connect to Ulink system. Please contact an administrator for assistance."},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
            except Exception as e:
                logger.error(f"Error in UlinkConnect.post while getting transcript: {str(e)}")
                # Don't fail the connection if transcript retrieval fails
                logger.info(f"Continuing despite transcript retrieval error for {ulink_username}")
            
        except IntegrityError:
            return Response(
                {"error": "This Ulink username is already connected to another account."},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error in UlinkConnect.post: {str(e)}")
            return Response(
                {"error": f"An error occurred while connecting your Ulink account. Please contact an administrator."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Return a response indicating the ulink account was connected successfully
        return Response({"message": "Ulink connected successfully."}, status=status.HTTP_200_OK)
    
class LogoUploadView(APIView):
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        logo = LogoImage.objects.first()
        if logo and logo.image_file:
            return Response({"logo_url": request.build_absolute_uri(logo.image_file.url)})
        return Response({"logo_url": None})

    def post(self, request):
        if self.request.user:
            if self.request.user.username == "admin": 
                # Get the uploaded image file
                logo_file = request.FILES.get('logo_file')
                if not logo_file:
                    return Response(
                        {"error": "No file uploaded. Please provide an image file."},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                # Validate file is an image
                if not logo_file.name.lower().endswith(('.png', '.jpg', '.jpeg', '.svg')):
                    return Response(
                        {"error": "Invalid file type. Only image files (PNG, JPG, JPEG, SVG) are allowed."},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                # Validate file size (5MB limit for logo)
                max_size = 5 * 1024 * 1024  # 5MB in bytes
                if logo_file.size > max_size:
                    return Response(
                        {"error": f"File size cannot exceed 5MB. Current size: {logo_file.size / (1024 * 1024):.2f}MB"},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                logo = LogoImage.objects.first()

                if logo:
                    logo.image_file = logo_file
                    logo.save()
                    logo.refresh_from_db()
                else:
                    logo = LogoImage.objects.create(image_file=logo_file)

                return Response(
                    {"success": True, "message": "Logo uploaded successfully."},
                    status=status.HTTP_200_OK
                )
            
            return JsonResponse({"error": "Forbidden"}, status=403)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_transcript(request):
    """
    Retrieve transcript data for the authenticated user.
    
    Returns a list of course records with their details.
    """
    user = request.user.info
    
    # Check if user has a linked ULINK account
    if not user.ulink_username:
        return Response({"error": "No ULINK account connected"}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if force refresh is requested
    force_refresh = request.query_params.get('force_refresh', 'false').lower() == 'true'
    
    # Get the transcript data
    transcript_result = get_student_transcript(user.ulink_username, force_refresh=force_refresh)
    
    # Handle new return structure
    course_records = transcript_result.get('course_records')
    validation_errors = transcript_result.get('validation_errors', [])
    is_valid = transcript_result.get('is_valid', False)
    
    if not course_records:
        return Response({
            "error": "Could not retrieve transcript data", 
            "validation_errors": validation_errors,
            "is_valid": is_valid
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Get the timestamp when the transcript was last refreshed
    try:
        transcript_cache = TranscriptCache.objects.get(user=user)
        last_refreshed = transcript_cache.last_refreshed
    except TranscriptCache.DoesNotExist:
        last_refreshed = None
    
    # Format the transcript data for the response
    transcript_data = []
    for record in course_records:
        transcript_data.append({
            'department': record.course.department,
            'number': record.course.number,
            'title': record.title,
            'grade': record.grade,
            'term': record.term,
            'year': record.year
        })
    
    response_data = {
        "transcript": transcript_data,
        "validation_errors": validation_errors,
        "is_valid": is_valid
    }
    
    # Add the timestamp if available
    if last_refreshed:
        response_data["last_refreshed"] = last_refreshed.isoformat()
    
    return Response(response_data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsStudent])
def check_prerequisites(request, program_id):
    """
    Check if the authenticated student meets all prerequisites for a program.
    
    Returns a list of completed and missing prerequisites.
    """
    user = request.user.info
    force_refresh = request.query_params.get('force_refresh', 'false').lower() == 'true'
    
    # Check if user has a linked ULINK account
    if not user.ulink_username:
        return Response(
            {"error": "No ULINK account connected", "ulink_connected": False}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Get the program
        program = Program.objects.get(id=program_id)
        
        # Get prerequisites
        prerequisites = program.prerequisites.all()
        
        if not prerequisites:
            return Response(
                {"satisfied": True, "completed": [], "missing": [], "ulink_connected": True},
                status=status.HTTP_200_OK
            )
        
        # Use the verify_prerequisites function from ulink.py
        from abroadhub.ulink import verify_prerequisites
        result = verify_prerequisites(user.ulink_username, prerequisites, force_refresh)
        result["ulink_connected"] = True
        
        return Response(result, status=status.HTTP_200_OK)
        
    except Program.DoesNotExist:
        return Response(
            {"error": "Program not found"}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_check_application_prerequisites(request, application_id):
    """
    Admin endpoint to check if a student meets the prerequisites for a program.
    
    Returns a list of completed and missing prerequisites.
    """
    force_refresh = request.query_params.get('force_refresh', 'false').lower() == 'true'
    
    try:
        # Get the application
        application = Application.objects.get(id=application_id)
        
        # Get student
        student = application.student
        
        # Get program
        program = application.program
        
        # Get prerequisites
        prerequisites = program.prerequisites.all()
        
        if not prerequisites:
            return Response(
                {"satisfied": True, "completed": [], "missing": [], "ulink_connected": True},
                status=status.HTTP_200_OK
            )
        
        # Check if student has a linked ULINK account
        if not student.ulink_username:
            return Response(
                {"error": "Student has no ULINK account connected", "ulink_connected": False}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Use the verify_prerequisites function from ulink.py
        from abroadhub.ulink import verify_prerequisites
        result = verify_prerequisites(student.ulink_username, prerequisites, force_refresh)
        result["ulink_connected"] = True
        
        return Response(result, status=status.HTTP_200_OK)
        
    except Application.DoesNotExist:
        return Response(
            {"error": "Application not found"}, 
            status=status.HTTP_404_NOT_FOUND
        )
