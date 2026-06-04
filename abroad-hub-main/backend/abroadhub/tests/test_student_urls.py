from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework import status
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from abroadhub.models import Answer, AppUser, Program, Application, Question, UserProfile, ConfidentialNote, DocumentTemplate
from datetime import date

class TestUrlsWithStudentUser(TestCase):

    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username='testuser',
            password='testUrlPassword458!'
        )

        self.app_user = AppUser.objects.create(
            user=self.user,
            display_name='Student',
            dob='2000-01-01'

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
        self.app_user.profile=self.user_profile
        self.app_user.save()  # Ensure the profile is saved properly

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
    
        self.program3_data = {
            "title": "Study Abroad 3",
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

        
        self.program4_data = {
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

        self.program5_data = {
            "title": "Study Abroad 5",
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
        self.program2.faculty_leads.set([self.admin_appuser])

        self.program3 = Program.objects.create(**self.program3_data)
        self.program3.faculty_leads.set([self.admin_appuser])

        self.program4 = Program.objects.create(**self.program4_data)
        self.program4.faculty_leads.set([self.admin_appuser])

        self.program5 = Program.objects.create(**self.program5_data)
        self.program5.faculty_leads.set([self.admin_appuser])

        self.application_applied = Application.objects.create(
            student=self.app_user,
            program=self.program1,
            status="Applied",
            submission_date=date.today(),
        )
        
        self.application_enrolled = Application.objects.create(
            student=self.app_user,
            program=self.program2,
            status="Enrolled",
            submission_date=date.today(),
        )

        self.application_withdrawn = Application.objects.create(
            student=self.app_user,
            program=self.program3,
            status="Withdrawn",
            submission_date=date.today(),
        )

        self.application_canceled = Application.objects.create(
            student=self.app_user,
            program=self.program4,
            status="Canceled",
            submission_date=date.today(),
        )
        
        # Log the user in using the APIClient
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        self.confidential_note = ConfidentialNote.objects.create(
            application=self.application_applied,
            author=self.app_user,
            content="This is a confidential note."
        )
        

    def test_application_list_url(self):
        url = reverse('abroadhub:application-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_application_create_url(self):
        url = reverse('abroadhub:application-create', args=[self.program5.id])
        application_data = {
            "status": "Enrolled",
            "submission_date": date.today(),
            "answers" : [],
    }
        response = self.client.post(url, data=application_data, format='json')

        print(response.data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_application_detail_url(self):
        url = reverse('abroadhub:application-detail', args=[self.application_applied.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_application_change_status_to_applied_url(self):
        url = reverse('abroadhub:application-change-status', args=[self.application_applied.id])
        response = self.client.patch(url, data={"status": "Applied"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_application_change_status_to_withdrawn_url(self):
        url = reverse('abroadhub:application-change-status', args=[self.application_applied.id])
        response = self.client.patch(url, data={"status": "Withdrawn"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_prevent_application_deletion(self):
        url = reverse('abroadhub:application-detail', args=[self.application_applied.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_check_application_url(self):
        url = reverse('abroadhub:check-application', args=[self.program1.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {
            "id": self.application_applied.id,
            "has_application": True,
            "application_status": "Applied"
        })

    def test_check_application_program_does_not_exist(self):
        response = self.client.get("/api/check-application/9999/")  # Nonexistent program ID
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data, {"error": "Program not found"})

    def test_user_profile_list_create_url(self):
        url = reverse('abroadhub:user-profile-list-create')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_retrieve_user_profile(self):
        url = reverse('abroadhub:user-profile-list-create')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["gpa"], "3.50")
        self.assertEqual(response.data["major"], "ECE")

    def test_update_user_profile(self):
        url = reverse('abroadhub:user-profile-list-create')
        updated_data = {
            "gpa": "3.60",
            "major": "CS"
        }
        response = self.client.put(url, updated_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["gpa"], "3.60")
        self.assertEqual(response.data["major"], "CS")

    def test_partial_update_user_profile(self):
        url = reverse('abroadhub:user-profile-list-create')
        updated_data = {"major": "ECE/CS"}
        response = self.client.patch(url, updated_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["major"], "ECE/CS")
        self.assertEqual(response.data["gpa"], "3.50")  # gpa should remain unchanged

    def test_current_user_url(self):
        url = reverse('abroadhub:current-user')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_program_list_create_url(self):
        url = reverse('abroadhub:program-list-create')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK) 

    def test_program_create_url(self):
        program_data = {
            "title": "New Study Abroad",
            "year": 2026,
            "semester": "Spring",
            "location": "London",
            "faculty_leads": [1],
            "description": "An amazing opportunity to study abroad.",
            "start_date": "2025-09-01",
            "end_date": "2025-12-15",
            "open_date": "2025-03-01",
            "deadline": "2025-06-01",
            "essential_doc_deadline": "2025-06-01",

        }
        url = reverse('abroadhub:program-create')
        response = self.client.post(url, data=program_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_program_student_list_url(self):
        url = reverse('abroadhub:programs-student-list', args=[])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_program_detail_url(self):
        url = reverse('abroadhub:program-detail', args=[self.program1.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_program_edit_url(self):
        url = reverse('abroadhub:program-edit', args=[self.program1.id])
        program_data = {
            "title": "Study Abroad",
            "year": 2026,
            "semester": "Fall",
            "location": "Paris",
            "faculty_leads": [self.admin_user.id],
            "description": "An amazing opportunity to study abroad.",
            "start_date": "2025-09-01",
            "end_date": "2025-12-15",
            "open_date": "2025-03-01",
            "deadline": "2025-06-01",
            "essential_doc_deadline": "2025-06-01",

        }
        response = self.client.put(url, data=program_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_program_application_counts_url(self):
        url = reverse('abroadhub:program_application_counts')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_program_view_url(self):
        url = reverse('abroadhub:admin-program-view', args=[self.program1.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


    def test_change_password_success(self):
            url = reverse('abroadhub:change_password')
            data = {
                'old_password': 'testUrlPassword458!',
                'new_password': 'newTestPassword458!',
                'confirm_password': 'newTestPassword458!',
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
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(response.data["applied_count"], 1)
        self.assertEqual(response.data["enrolled_count"], 1)
        self.assertEqual(response.data["canceled_count"], 1)
        self.assertEqual(response.data["withdrawn_count"], 1)
        self.assertEqual(response.data["active_count"], 2)

    def test_user_program_counts_url(self):
        url = reverse('abroadhub:user-program-counts')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(response.data["Applied"], 1)
        self.assertEqual(response.data["Enrolled"], 1)
        self.assertEqual(response.data["Canceled"], 1)
        self.assertEqual(response.data["Withdrawn"], 1)
        self.assertEqual(response.data["active_count"], 2)
        self.assertEqual(response.data["total_count"], 4)

    def test_user_management_list_users(self):
        url = reverse('abroadhub:user-management')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_user_query_url(self):
        # Check if the API returns the correct list of admin users
        url = reverse('abroadhub:faculty-user-query')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_confidential_note_list_create_url(self):
        application_id = self.application_applied.id  # Ensure this application exists in the database
        note_data = {
            'content': 'Test confidential note',
        }
        
        url = reverse('abroadhub:application-notes', kwargs={'application_id': application_id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    def test_confidential_note_retrieve_update_partial_update_delete_url(self):
        application_id = self.application_applied.id  # Ensure this application exists in the database
        note_id = self.confidential_note.id  # Ensure this note exists for the application
        note_data = {
            'content': 'Updated confidential note',
        }
        
        # Retrieve the note
        url = reverse('abroadhub:application-note-detail', kwargs={'application_id': application_id, 'pk': note_id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Update the note
        response = self.client.put(url, data=note_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Partial update the note
        partial_update_data = {'content': 'Partially updated note'}
        response = self.client.patch(url, data=partial_update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Delete the note
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_change_payment_status_url_fail(self):
        url = reverse('abroadhub:application-change-payment-status', args=[self.application_enrolled.id])
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



