from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from ..models import AppUser, Application, Program, ConfidentialNote
import json
from datetime import date, timedelta
from django.db import connection


class ConfidentialNotesAPITests(TestCase):
    def setUp(self):
        # Create admin user
        self.admin_user = User.objects.create_user(
            username='admin_test',
            email='admin@test.com',
            password='adminpassword'
        )
        self.admin_app_user = AppUser.objects.create(
            user=self.admin_user,
            display_name='Admin Test',
            roles=['Administrator','Faculty'] # Explicitly set as Admin
        )
        
        # Create student user
        self.student_user = User.objects.create_user(
            username='student_test',
            email='student@test.com',
            password='studentpassword'
        )
        self.student_app_user = AppUser.objects.create(
            user=self.student_user,
            display_name='Student Test',
            roles=['Student']  # Explicitly set as Student
        )
        
        # Verify the user types
        self.admin_app_user.refresh_from_db()
        self.student_app_user.refresh_from_db()
        
        # Create a program
        today = date.today()
        self.program = Program.objects.create(
            title='Test Program',
            year=2025,
            semester='Fall',
            location='Test Location',
            description='Test Description',
            start_date=today + timedelta(days=60),
            end_date=today + timedelta(days=90),
            open_date=today - timedelta(days=30),
            deadline=today + timedelta(days=30),
            essential_doc_deadline=today + timedelta(days=45)
        )
        self.program.faculty_leads.add(self.admin_app_user)
        
        # Create an application
        self.application = Application.objects.create(
            student=self.student_app_user,
            program=self.program,
            status='Applied',
        )
        
        # Create API clients
        self.admin_client = APIClient()
        self.admin_client.force_authenticate(user=self.admin_user)
        
        self.student_client = APIClient()
        self.student_client.force_authenticate(user=self.student_user)

    def test_admin_can_create_note(self):
        """Test that an admin can create a confidential note"""
        url = f'/api/applications/{self.application.id}/notes/'
        data = {'content': 'Test confidential note'}
        
        response = self.admin_client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ConfidentialNote.objects.count(), 1)
        
        note = ConfidentialNote.objects.first()
        self.assertEqual(note.content, 'Test confidential note')
        self.assertEqual(note.application, self.application)
        self.assertEqual(note.author, self.admin_app_user)
    
    def test_student_cannot_create_note(self):
        """Test that a student cannot create a confidential note"""
        url = f'/api/applications/{self.application.id}/notes/'
        data = {'content': 'Test confidential note'}
        
        response = self.student_client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(ConfidentialNote.objects.count(), 0)
    
    def test_admin_can_view_notes(self):
        """Test that an admin can view confidential notes"""
        # Create a note
        note = ConfidentialNote.objects.create(
            application=self.application,
            author=self.admin_app_user,
            content='Test confidential note'
        )
        
        url = f'/api/applications/{self.application.id}/notes/'
        response = self.admin_client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['content'], 'Test confidential note')
    
    def test_student_cannot_view_notes(self):
        """Test that a student cannot view confidential notes"""
        # Create a note
        note = ConfidentialNote.objects.create(
            application=self.application,
            author=self.admin_app_user,
            content='Test confidential note'
        )
        
        url = f'/api/applications/{self.application.id}/notes/'
        response = self.student_client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_admin_can_update_note(self):
        """Test that an admin can update a confidential note"""
        # Create a note
        note = ConfidentialNote.objects.create(
            application=self.application,
            author=self.admin_app_user,
            content='Test confidential note'
        )
        
        url = f'/api/applications/{self.application.id}/notes/{note.id}/'
        data = {'content': 'Updated confidential note'}
        
        response = self.admin_client.put(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        note.refresh_from_db()
        self.assertEqual(note.content, 'Updated confidential note')
    
    def test_student_cannot_update_note(self):
        """Test that a student cannot update a confidential note"""
        # Create a note
        note = ConfidentialNote.objects.create(
            application=self.application,
            author=self.admin_app_user,
            content='Test confidential note'
        )
        
        url = f'/api/applications/{self.application.id}/notes/{note.id}/'
        data = {'content': 'Updated confidential note'}
        
        response = self.student_client.put(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        note.refresh_from_db()
        self.assertEqual(note.content, 'Test confidential note')  # Content unchanged
    
    def test_admin_can_delete_note(self):
        """Test that an admin can delete a confidential note"""
        # Create a note
        note = ConfidentialNote.objects.create(
            application=self.application,
            author=self.admin_app_user,
            content='Test confidential note'
        )
        
        url = f'/api/applications/{self.application.id}/notes/{note.id}/'
        
        response = self.admin_client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        self.assertEqual(ConfidentialNote.objects.count(), 0)
    
    def test_student_cannot_delete_note(self):
        """Test that a student cannot delete a confidential note"""
        # Create a note
        note = ConfidentialNote.objects.create(
            application=self.application,
            author=self.admin_app_user,
            content='Test confidential note'
        )
        
        url = f'/api/applications/{self.application.id}/notes/{note.id}/'
        
        response = self.student_client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(ConfidentialNote.objects.count(), 1)  # Note still exists 