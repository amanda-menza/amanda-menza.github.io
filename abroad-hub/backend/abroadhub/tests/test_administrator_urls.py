from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework import status
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from abroadhub.models import AppUser, Program, Application, UserProfile, ConfidentialNote, DocumentTemplate
from datetime import date

class TestUrlsWithAdminUser(TestCase):

    def setUp(self):

        self.admin_user = get_user_model().objects.create_user(
            username='admin',
            password='testAdminPassword458!'
        )

        self.student1 = get_user_model().objects.create_user(
            username='student1',
            password='student1password!'
        )

        self.student2 = get_user_model().objects.create_user(
            username='student2',
            password='student2password!'
        )

        self.student3 = get_user_model().objects.create_user(
            username='student3',
            password='student3password!'
        )

        self.student4 = get_user_model().objects.create_user(
            username='student4',
            password='student4password!'
        )

        self.app_user = AppUser.objects.create(
            user=self.admin_user,
            roles=['Administrator','Faculty'],
            )
        self.app_user_student1 = AppUser.objects.create(
            user=self.student1,
            roles=['Student'],
            dob='2000-01-01',

            )
        self.app_user_student2 = AppUser.objects.create(
            user=self.student2,
            roles=['Student'],
            dob='2000-02-02',

        )
        self.app_user_student3 = AppUser.objects.create(
            user=self.student3,
            roles=['Student'],
            dob='2000-03-03',

        )
        self.app_user_student4 = AppUser.objects.create(
            user=self.student4,
            roles=['Student'],
            dob='2000-04-04',

            
        )

            # Ensure that user profiles are saved before assignment
        user_profile1 = UserProfile.objects.create(
            gpa='3.51',
            major='CS'
        )
        user_profile1.save()  # Save the profile
        self.app_user_student1.profile = user_profile1
        self.app_user_student1.save()  # Save the AppUser

        user_profile2 = UserProfile.objects.create(
            gpa='3.52',
            major='PubPol'
        )
        user_profile2.save()  # Save the profile
        self.app_user_student2.profile = user_profile2
        self.app_user_student2.save()  # Save the AppUser

        user_profile3 = UserProfile.objects.create(
            gpa='3.53',
            major='Econ'
        )
        user_profile3.save()  # Save the profile
        self.app_user_student3.profile = user_profile3
        self.app_user_student3.save()  # Save the AppUser

        user_profile4 = UserProfile.objects.create(
            gpa='3.54',
            major='Bio'
        )
        user_profile4.save()  # Save the profile
        self.app_user_student4.profile = user_profile4
        self.app_user_student4.save()  # Save the AppUser

        start_date = date(2025, 9, 1)
        end_date = date(2025, 12, 15)
        open_date = date(2025, 3, 1)
        deadline = date(2025, 6, 1)
        essential_doc_deadline = date(2025, 6, 1)
        
        self.program1 = Program.objects.create(
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
        self.program1.faculty_leads.set([self.app_user])


        self.program2 = Program.objects.create(
            title="Study Abroad 2",
            year=2026,
            semester="Fall",
            location="Paris",
            description="An amazing opportunity to study abroad.",
            start_date=start_date,
            end_date=end_date,
            open_date=open_date,
            deadline=deadline,
            essential_doc_deadline=essential_doc_deadline
        )
        self.program2.faculty_leads.set([self.app_user])


        self.application_applied = Application.objects.create(
            student=self.app_user_student1,
            program=self.program1,
            status="Applied",
            submission_date=date.today(),
        )

        self.application_enrolled = Application.objects.create(
            student=self.app_user_student2,
            program=self.program1,
            status="Enrolled",
            submission_date=date.today(),
        )

        self.application_withdrawn = Application.objects.create(
            student=self.app_user_student3,
            program=self.program2,
            status="Withdrawn",
            submission_date=date.today(),
        )

        self.application_canceled = Application.objects.create(
            student=self.app_user_student4,
            program=self.program2,
            status="Canceled",
            submission_date=date.today(),
        )

        self.confidential_note = ConfidentialNote.objects.create(
            application=self.application_applied,
            author=self.app_user,
            content="This is a confidential note."
        )
        
        # Log the user in using the APIClient
        self.client = APIClient()
        self.client.force_authenticate(user=self.admin_user)

    def test_application_list_url(self):
        url = reverse('abroadhub:application-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_application_create_url(self):
        url = reverse('abroadhub:application-create', args=[self.program1.id])
        application_data = {
            "status": "Enrolled",
            "submission_date": date.today(),
    }
        response = self.client.post(url, data=application_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_application_detail_url(self):
        url = reverse('abroadhub:application-detail', args=[self.application_applied.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_application_change_status_url(self):
        url = reverse('abroadhub:application-change-status', args=[self.application_applied.id])
        response = self.client.patch(url, data={"status": "Enrolled"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_prevent_application_deletion(self):
        url = reverse('abroadhub:application-detail', args=[self.application_applied.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_check_application_url(self):
        url = reverse('abroadhub:check-application', args=[self.program1.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_user_profile_list_create_url(self):
        url = reverse('abroadhub:user-profile-list-create')
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_retrieve_user_profile(self):
        url = reverse('abroadhub:user-profile-list-create')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

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

    def test_current_user_url(self):
        url = reverse('abroadhub:current-user')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    # def test_user_detail_url(self):
    #     url = reverse('abroadhub:user-detail', args=[self.admin_user.id])
    #     response = self.client.get(url)
    #     self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_program_list_create_url(self):           
        program_data = {
            "title": "New Study Abroad",
            "year": 2026,
            "semester": "Spring",
            "location": "London",
            "faculty_leads": [self.app_user.id],
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
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_program_create_url(self):
        program_data = {
            "title": "New Study Abroad",
            "year": 2026,
            "semester": "Spring",
            "location": "London",
            "faculty_leads": [self.app_user.id],
            "description": "An amazing opportunity to study abroad.",
            "start_date": "2025-09-01",
            "end_date": "2025-12-15",
            "open_date": "2025-03-01",
            "deadline": "2025-06-01",
            "essential_doc_deadline": "2025-06-01",

        }
        url = reverse('abroadhub:program-create')
        response = self.client.post(url, data=program_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

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
            "faculty_leads": [self.app_user.id],
            "description": "An amazing opportunity to study abroad.",
            "start_date": "2025-09-01",
            "end_date": "2025-12-15",
            "open_date": "2025-03-01",
            "deadline": "2025-06-01",
            "essential_doc_deadline": "2025-06-01",
        }
        response = self.client.put(url, data=program_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_program_application_counts_url(self):
        url = reverse('abroadhub:program_application_counts')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(len(response.data), 2)
        
        program1_data = next(p for p in response.data if p['id'] == self.program1.id)
        program2_data = next(p for p in response.data if p['id'] == self.program2.id)
        
        self.assertEqual(program1_data['applied_count'], 1)
        self.assertEqual(program1_data['enrolled_count'], 1)
        self.assertEqual(program2_data['canceled_count'], 1)
        self.assertEqual(program2_data['withdrawn_count'], 1)

    def test_my_programs_url(self):
        url = reverse('abroadhub:my-programs')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_program_view_url(self):
        url = reverse('abroadhub:admin-program-view', args=[self.program1.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_change_password_success(self):
            url = reverse('abroadhub:change_password')
            data = {
                'old_password': 'testAdminPassword458!',
                'new_password': 'newTestAdminPassword458!',
                'confirm_password': 'newTestAdminPassword458!',
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
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        expected_usernames = {
            self.admin_user.username,
            self.student1.username,
            self.student2.username,
            self.student3.username,
            self.student4.username
        }

        response_data = response.json()

        response_usernames = {user["username"] for user in response_data}
        self.assertSetEqual(expected_usernames, response_usernames)

    def test_update_user_role_successful(self):
        """Test updating only the roles field successfully"""
        url = reverse('abroadhub:change-user-status', kwargs={'pk': self.student1.pk})
        response = self.client.patch(url, {"roles": ["Administrator"]}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_disallowed_field_fails(self):
        """Test that updating a field other than roles fails"""
        url = reverse('abroadhub:change-user-status', args=[self.student1.id])
        response = self.client.patch(url, {"email": "new@example.com"}, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_no_data_fails(self):
        """Test that sending no data fails"""
        url = reverse('abroadhub:change-user-status', args=[self.student1.id])
        response = self.client.patch(url, {}, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_multiple_fields_fails(self):
        """Test that updating multiple fields at once fails"""
        url = reverse('abroadhub:change-user-status', args=[self.student1.id])
        response = self.client.patch(url, {"roles": ["Administrator"], "email": "new@example.com"}, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_non_existent_user_fails(self):
        """Test that updating a non-existent user returns 404"""
        invalid_url = reverse('abroadhub:change-user-status', kwargs={'pk': 9999})
        response = self.client.patch(invalid_url, {"roles": ["Administrator"]}, format='json')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_admin_user_query_url(self):
        # Check if the API returns the correct list of admin users
        url = reverse('abroadhub:faculty-user-query')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) > 0)

    def test_confidential_note_list_create_url(self):
        application_id = self.application_applied.id  # Ensure this application exists in the database
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
    
    def test_confidential_note_retrieve_update_partial_update_delete_url(self):
        application_id = self.application_applied.id  # Ensure this application exists in the database
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
    
    def test_change_payment_status_url(self):
        url = reverse('abroadhub:application-change-payment-status', args=[self.application_enrolled.id])
        response = self.client.patch(url,data={"payment_status": "Fully Paid"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_partner_program_list_url_fail(self):
        url = reverse('abroadhub:partner-programs')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_partner_program_detail_url_fail(self):
        url = reverse('abroadhub:partner-program-detail',args=[self.program2.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_partner_query_url(self):
        url = reverse('abroadhub:partner-user-query')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_program_remove_payment_info_url(self):
        url = reverse('abroadhub:remove-payment-tracking',args=[self.program2.id])
        response = self.client.patch(url)
        self.assertEqual(response.status_code,  status.HTTP_200_OK)

class SSOAuthRedirectTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = '/api/sso-auth-redirect/'
    
    @override_settings(SSO_AUTH_URL='https://sso.example.com/auth', SSO_REDIRECT_URL='https://app.example.com/callback', SSO_CLIENT_ID='test_client_id')
    def test_sso_auth_redirect(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        expected_url = "https://sso.example.com/auth?client_id=test_client_id&redirect_uri=https%3A//app.example.com/callback&response_type=code"
        self.assertEqual(response.json()["request_url"], expected_url)