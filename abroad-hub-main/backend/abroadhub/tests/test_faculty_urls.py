from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework import status
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from abroadhub.models import AppUser, Program, Application, UserProfile, ConfidentialNote, DocumentTemplate
from datetime import date

class TestUrlsWithFacultyUser(TestCase):

    def setUp(self):
        self.student_user = get_user_model().objects.create_user(
            username='teststudent',
            password='testUrlPassword458!'
        )

        self.student_appuser = AppUser.objects.create(
            user=self.student_user,
            display_name='Test Student',
            dob='2000-01-01',
        )
        self.student_user2 = get_user_model().objects.create_user(
            username='teststudent2',
            password='testUrlPassword458!'
        )

        self.student_appuser2 = AppUser.objects.create(
            user=self.student_user2,
            display_name='Test Student2',
            dob='2000-01-01',
        )
        self.faculty_user = get_user_model().objects.create_user(
            username='testfaculty',
            password='testUrlPassword458!'
        )

        self.faculty_appuser = AppUser.objects.create(
            user=self.faculty_user,
            display_name='Test Faculty',
            dob='2000-01-01',
            roles=['Faculty']

        )
        self.admin_user = get_user_model().objects.create_user(
            username="admin", email="admin@example.com", password="password123"
        )
        self.admin_appuser = AppUser.objects.create(
            user = self.admin_user,
            roles=['Administrator','Faculty'],
            display_name="Administrator",
            dob="2002-02-02"
        )

        self.user_profile = UserProfile.objects.create(
            gpa='3.50',
            major='ECE'
        )
        self.student_appuser.profile=self.user_profile
        self.student_appuser.save()  # Ensure the profile is saved properly

        self.user_profile2 = UserProfile.objects.create(
            gpa='3.50',
            major='ECE'
        )
        self.student_appuser2.profile=self.user_profile2
        self.student_appuser2.save()  # Ensure the profile is saved properly

        # Log the user in using the APIClient
        self.client = APIClient()
        self.client.force_authenticate(user=self.faculty_user)
        
        start_date = date(2025, 9, 1)
        end_date = date(2025, 12, 15)
        open_date = date(2025, 3, 1)
        deadline = date(2025, 6, 1)
        essential_doc_deadline = date(2025, 6, 1)

        self.program1_data = {
            "title": "Study Abroad 1",
            "year": 2025,
            "semester": "Fall",
            "location": "Paris",
            "description": "An amazing opportunity to study abroad.",
            "start_date": start_date,
            "end_date": end_date,
            "open_date": open_date,
            "deadline": deadline,
            "essential_doc_deadline":essential_doc_deadline
        }

        self.program2_data = {
            "title": "Study Abroad 2",
            "year": 2025,
            "semester": "Fall",
            "location": "Paris",
            "description": "An amazing opportunity to study abroad.",
           "start_date": start_date,
            "end_date": end_date,
            "open_date": open_date,
            "deadline": deadline,
            "essential_doc_deadline":essential_doc_deadline
        }
    

                # Create the program without faculty_leads first
        self.program1 = Program.objects.create(**self.program1_data)
        # Now set the faculty_leads for the program using the set() method
        self.program1.faculty_leads.set([self.admin_appuser])

        # Repeat for other programs
        self.program2 = Program.objects.create(**self.program2_data)
        self.program2.faculty_leads.set([self.admin_appuser,self.faculty_appuser])

        self.application1_applied = Application.objects.create(
            student=self.student_appuser,
            program=self.program1,
            status="Applied",
            submission_date=date.today(),
        )
        
        self.application2_enrolled = Application.objects.create(
            student=self.student_appuser,
            program=self.program2,
            status="Enrolled",
            submission_date=date.today(),
        )

        self.application2_applied = Application.objects.create(
            student=self.student_appuser2,
            program=self.program2,
            status="Applied",
            submission_date=date.today(),
        )


        self.confidential_note = ConfidentialNote.objects.create(
            application=self.application2_applied,
            author=self.faculty_appuser,
            content="This is a confidential note."
        )
        

    def test_application_list_url(self):
        url = reverse('abroadhub:application-list')
        response = self.client.get(url)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_application_create_url_fail(self):
        url = reverse('abroadhub:application-create', args=[self.program1.id])
        application_data = {
            "status": "Enrolled",
            "submission_date": date.today(),
    }
        response = self.client.post(url, data=application_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_application_detail_url(self):
        url = reverse('abroadhub:application-detail', args=[self.application2_applied.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_application_detail_url_fail(self):
        url = reverse('abroadhub:application-detail', args=[self.application1_applied.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_faculty_can_change_status_to_allowed(self):
        url = reverse('abroadhub:application-change-status', args=[self.application2_applied.id])
        response = self.client.patch(url, data={"status": "Eligible"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_faculty_can_change_status_to_invalid(self):
        url = reverse('abroadhub:application-change-status', args=[self.application2_enrolled.id])
        response = self.client.patch(url, data={"status": "Cancelled"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_prevent_application_deletion(self):
        url = reverse('abroadhub:application-detail', args=[self.application2_applied.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_check_application_url_fail(self):
        url = reverse('abroadhub:check-application', args=[self.program2.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_retrieve_user_profile(self):
        url = reverse('abroadhub:user-profile-list-create')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_current_user_url(self):
        url = reverse('abroadhub:current-user')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_program_list_create_url(self):           
        program_data = {
            "title": "New Study Abroad",
            "year": 2026,
            "semester": "Spring",
            "location": "London",
            "faculty_leads": [self.faculty_appuser.id],
            "description": "An amazing opportunity to study abroad.",
            "start_date": "2025-09-01",
            "end_date": "2025-12-15",
            "open_date": "2025-03-01",
            "deadline": "2025-06-01",
            "essential_doc_deadline": "2025-06-01",

        }
        url = reverse('abroadhub:program-list-create')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.post(url, data=program_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_program_student_list_url(self):
        url = reverse('abroadhub:programs-student-list', args=[])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_program_application_counts_url(self):
        url = reverse('abroadhub:program_application_counts')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(len(response.data), 2)
    
    def test_my_programs_url(self):
        url = reverse('abroadhub:my-programs')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
   
    def test_admin_program_view_url(self):
        url = reverse('abroadhub:admin-program-view', args=[self.program2.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_admin_program_view_url(self):
        url = reverse('abroadhub:admin-program-view', args=[self.program1.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_change_password_success(self):
            url = reverse('abroadhub:change_password')
            data = {
                'old_password': 'testUrlPassword458!',
                'new_password': 'newTestUrlPassword458!',
                'confirm_password': 'newTestUrlPassword458!',
            }
            response = self.client.post(url, data)
            self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_content_view_url(self):
        url = reverse('abroadhub:content-view')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_user_application_counts_url(self):
        url = reverse('abroadhub:user-application-counts')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_user_program_counts_url(self):
        url = reverse('abroadhub:user-program-counts')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_user_management(self):
        url = reverse('abroadhub:user-management')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_user_role_fail(self):
        url = reverse('abroadhub:change-user-status', kwargs={'pk': self.student_appuser.pk})
        response = self.client.patch(url, {"roles": ["Administrator"]}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_user_query_url(self):
        # Check if the API returns the correct list of admin users
        url = reverse('abroadhub:faculty-user-query')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_confidential_note_list_create_url_success(self):
        application_id = self.application2_applied.id  # Ensure this application exists in the database
        note_data = {
            'content': 'Test confidential note',
        }
        
        url = reverse('abroadhub:application-notes', kwargs={'application_id': application_id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        
        response = self.client.post(url, data=note_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['content'], note_data['content'])

    def test_confidential_note_list_create_url_fail(self):
        application_id = self.application1_applied.id  # Ensure this application exists in the database
        note_data = {
            'content': 'Test confidential note',
        }
        
        url = reverse('abroadhub:application-notes', kwargs={'application_id': application_id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        response = self.client.post(url, data=note_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_confidential_note_retrieve_update_partial_update_delete_url(self):
        application_id = self.application2_applied.id  # Ensure this application exists in the database
        note_id = self.confidential_note.id  # Ensure this note exists for the application
        note_data = {
            'content': 'Updated confidential note',
        }
        
        # Retrieve the note
        url = reverse('abroadhub:application-note-detail', kwargs={'application_id': application_id, 'pk': note_id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Update the note
        response = self.client.put(url, data=note_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['content'], note_data['content'])
        
        # Partial update the note
        partial_update_data = {'content': 'Partially updated note'}
        response = self.client.patch(url, data=partial_update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['content'], partial_update_data['content'])
        
        # Delete the note
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_change_payment_status_url_fail(self):
        url = reverse('abroadhub:application-change-payment-status', args=[self.application2_enrolled.id])
        response = self.client.patch(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_partner_program_list_url_fail(self):
        url = reverse('abroadhub:partner-programs')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_partner_program_detail_url_fail(self):
        url = reverse('abroadhub:partner-program-detail',args=[self.program2.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_partner_query_url_fail(self):
        url = reverse('abroadhub:partner-user-query')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_program_remove_payment_info_url_fail(self):
        url = reverse('abroadhub:remove-payment-tracking',args=[self.program2.id])
        response = self.client.patch(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

