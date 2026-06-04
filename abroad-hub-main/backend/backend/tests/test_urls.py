from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from abroadhub.models import AppUser, User

class TestAdminUrl(TestCase):
    """Test for admin URL access"""

    def setUp(self):
        """Set up an admin user for the admin URL test"""
        self.admin_user = get_user_model().objects.create_superuser(
            username='admin',
            password='adminpassword'
        )
        self.admin_url = reverse('admin:index')  # Admin URL
        self.client.login(username='admin', password='adminpassword')

    def test_admin_url(self):
        """Test the admin URL is accessible"""
        response = self.client.get(self.admin_url)
        self.assertEqual(response.status_code, 200)

class TestApiAuthUrl(TestCase):
    """Test for API authentication URL"""

    def setUp(self):
        """Set up necessary data for API auth test"""
        # Your setup for API auth testing here
        self.api_auth_url = reverse('api-auth:login')

    def test_api_auth_url(self):
        """Test the API auth URL"""
        response = self.client.get(self.api_auth_url)
        self.assertEqual(response.status_code, 200)
    
class AbroadhubURLsTest(APITestCase):
    """Test for redirect to AbroadHub URLs"""

    def setUp(self):
        """Set up necessary data for AbroadHub URL test"""
        self.user = get_user_model().objects.create_user(
            username='testuser',
            password='testUrlPassword458!'
        )
        
        # Ceate the corresponding AppUser instance (which will populate the necessary'info' field)
        self.app_user = AppUser.objects.create(user=self.user)
        
        # Log the user in using the APIClient
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_application_list_view(self):
        """Test the Application list URL in AbroadHub URLs"""
        url = reverse('abroadhub:application-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

class TestTokenUrls(TestCase):

    def setUp(self):
        """Set up a test user for obtaining tokens"""
        self.user = get_user_model().objects.create_user(
            username='testuser',
            password='testUrlPassword458!'
        )
        self.token_url = reverse('get_token')  # URL for obtaining JWT token
        self.refresh_url = reverse('refresh')  # URL for refreshing the JWT token

    def test_token(self):
        """Test the token URL for obtaining JWT token"""
        url = self.token_url
        data = {
            'username': 'testuser',
            'password': 'testUrlPassword458!'  # Same password as in setUp
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, 200)  # Expecting 200 OK
        self.assertIn('access', response.data)  # Check if access token is returned
        self.assertIn('refresh', response.data)  # Check if refresh token is returned

    def test_token_invalid_credentials(self):
        """Test obtaining JWT token with invalid credentials"""
        url = self.token_url
        # Attempting to log in with invalid credentials
        invalid_data = {
            'username': 'testuser',  # Correct username
            'password': 'wrongpassword123'  # Incorrect password
        }
        response = self.client.post(url, invalid_data, format='json')
        self.assertEqual(response.status_code, 401)  # Expecting 401 Unauthorized
        self.assertNotIn('access', response.data)  # No access token should be returned
        self.assertNotIn('refresh', response.data)  # No refresh token should be returned

    def test_token_refresh(self):
        """Test the refresh URL to get a new access token using a refresh token"""
        url = self.refresh_url 
        data = {'refresh': 'dummyrefresh_token'}  # Use an invalid or mock refresh token
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, 401)  # Invalid token should return 401 Unauthorized

    def test_token_refresh_with_valid_refresh_token(self):
        """Test the refresh URL with a valid refresh token"""
        
        # Step 1: Obtain an access token and refresh token for the user
        login_data = {
            'username': 'testuser',
            'password': 'testUrlPassword458!'
        }
        response = self.client.post(self.token_url, login_data, format='json')
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)  # Ensure an access token is returned
        self.assertIn('refresh', response.data)  # Ensure a refresh token is returned

        # Extract the valid refresh token from the response
        valid_refresh_token = response.data['refresh']

        # Step 2: Use the valid refresh token to get a new access token
        refresh_data = {'refresh': valid_refresh_token}
        refresh_response = self.client.post(self.refresh_url, refresh_data, format='json')

        # Step 3: Verify the response
        self.assertEqual(refresh_response.status_code, 200)  # Expect 200 OK
        self.assertIn('access', refresh_response.data)  # Ensure a new access token is returned
        self.assertNotEqual(refresh_response.data['access'], response.data['access'])  # Check that the access token is different from the previous one

    def test_csrf_token_url(self):
        """Test the csrf token URL"""
        url = reverse('csrf_token') 
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)  # Should return CSRF token as expected

        self.assertIn('csrfToken', response.json()) # Check if 'csrfToken' is present in the JSON response

        token = response.json().get('csrfToken')
        self.assertTrue(token)  # Ensure that the token is not empty

class CreateAppUserViewTest(APITestCase):
    def setUp(self):
        self.url = reverse('register')

    def test_create_app_user_valid(self):
        data = {
            "user": {
                "username": "testuser",
                "email": "testuser@example.com",
                "password": "securepassword123"
            },
            "roles": ["Student"],
            "display_name": "Test User",
            "profile": {
                "dob": "2000-01-01",
                "gpa": "3.50",
                "major": "ECE"
            }
        }

        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(AppUser.objects.filter(user__username="testuser").exists())

    def test_create_app_user_missing_fields(self):
        data = {
            "user": {
                "username": "incompleteuser",
            },
            "roles": ["Student"],
           
        }

        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('display_name', response.data)  # Ensure the error message points to the user field

    def test_create_app_user_duplicate_username(self):
        # First, create a user manually
        existing_user = get_user_model().objects.create_user(
            username="duplicateuser", 
            email="duplicateuser@example.com", 
            password="password123"
        )

        # Try creating an AppUser with the same username
        data = {
            "user": {
                "username": "duplicateuser",  # Duplicate username
                "email": "newuser@example.com",
                "password": "newpassword123"
            },
            "roles": ["Student"],
            "display_name": "Duplicate User"
        }

        response = self.client.post(self.url, data, format='json')

        # Assert that the response status code is HTTP 400 BAD REQUEST for duplicate username
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('user', response.data)  # Ensure the error is correctly returned

