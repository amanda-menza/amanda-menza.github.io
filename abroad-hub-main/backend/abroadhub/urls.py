from django.urls import path
from . import views

app_name = 'abroadhub'

urlpatterns = [
    path('api/applications/', views.ApplicationView.as_view({'get': 'list'}), name='application-list'),
    path('api/applications/create/<int:program_id>/', views.ApplicationView.as_view({'post': 'create'}), name='application-create'),
    path('api/applications/<int:pk>/', views.ApplicationView.as_view({'get': 'retrieve', 'delete': 'destroy','put': 'update','patch': 'partial_update'}), name='application-detail'),
    path('api/applications/<int:pk>/change_status/', views.ApplicationView.as_view({'patch': 'change_status'}), name='application-change-status'),
    path('api/applications/<int:pk>/upload-document/', 
         views.ApplicationView.as_view({'post': 'upload_document'}),
         name='application-upload-document'),

    path('api/check-application/<int:program_id>/', views.CheckApplication.as_view(), name='check-application'),

    path('api/user/profile/', views.UserProfileView.as_view({'get': 'list', 'post': 'create','get': 'retrieve', 'put': 'update','patch': 'partial_update'}), name='user-profile-list-create'),
    
    path('api/current-user/', views.CurrentAppUserView.as_view(), name='current-user'),
    path('api/user/<int:pk>/', views.AppUserDetailView.as_view(), name='user-detail'),


    path('api/programs/', views.ProgramView.as_view({'get': 'list', 'post': 'create'}), name='program-list-create'),
    path('api/programs/create/', views.ProgramView.as_view({'post': 'create'}), name='program-create'),

    path('api/programs-student-list/',views.StudentProgramBrowseView.as_view(),name='programs-student-list' ),

    path('api/programs/<int:pk>/', views.ProgramView.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy','patch': 'partial_update'}), name='program-detail'),
    path('api/programs/<int:pk>/edit/', views.ProgramView.as_view({'put': 'update'}), name='program-edit'),

    path('api/program-application-counts/', views.ProgramApplicationCountsView.as_view(), name='program_application_counts'),

    path("api/myprograms/", views.StudentApplicationsView.as_view(), name = 'my-programs'),

    path("api/programs/<int:program_id>/admin/",views.AdminProgramDetailsView.as_view(), name= "admin-program-view"),

    path('api/change-password/', views.ChangePasswordView.as_view(), name='change_password'),
    
    path('api/reset-password/<int:user_id>/', views.ResetStudentPassword.as_view(), name='reset-student-password'),

    path('api/content/', views.ContentView.as_view(), name='content-view'),
    
    path('api/institution-name/', views.InstitutionNameView.as_view(), name='institution-name-view'),

    path('api/primary-color/', views.PrimaryColorView.as_view(), name='primary-color-view'),

    path('api/secondary-color/', views.SecondaryColorView.as_view(), name='secondary-color-view'),

    path('api/user-application-counts/', views.UserApplicationCountsView.as_view(), name='user-application-counts'),

    path('api/user-program-counts/', views.UserProgramCountsView.as_view(), name = 'user-program-counts'),


    path('api/user-management/', views.UserManagementView.as_view({'get': 'list'}), name='user-management'),
    path('api/user-management/<int:pk>/', views.UserManagementView.as_view({'patch': 'change_user_role', 'delete': 'destroy'}), name='change-user-status'),

    path('api/faculty-lead-program-counts/<int:pk>/', views.FacultyLeadProgramCounts.as_view(), name='faculty-lead-program-counts'),

    path('api/faculty-user-query/', views.FacultyUserQuery.as_view(), name = "faculty-user-query"),
    
    path('api/sso-auth-redirect/', views.SSOAuthRedirect.as_view(), name = "sso-auth-redirect"),
    path('api/sso-token-redirect/<str:code>/', views.SSOTokenRedirect.as_view(), name = "sso-token-redirect"),

    path('api/applications/<int:application_id>/documents/', views.get_application_documents, name='get-application-documents'),

    path('api/applications/<int:application_id>/notes/', views.ConfidentialNoteViewSet.as_view({'get': 'list', 'post': 'create'}), name='application-notes'),
    path('api/applications/<int:application_id>/notes/<int:pk>/', views.ConfidentialNoteViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update','delete': 'destroy'}), name='application-note-detail'),
    path("api/update-dob/", views.UpdateDOBView.as_view(), name="update-dob"),
    # path('api/applications/<int:pk>/notes/', views.ApplicationView.as_view({'get': 'notes', 'post': 'notes'})),
    # path('api/applications/<int:pk>/notes/<int:note_id>/', views.ApplicationView.as_view({'put': 'notes', 'delete': 'notes'})),

    path('api/document-templates/', views.DocumentTemplateView.as_view({'get': 'list'}), name='document-templates'),

    # Secure document serving endpoint
    path('api/secure-document/<int:application_id>/<str:document_type>/', views.serve_secure_document, name='serve-secure-document'),
    
    # Secure recommendation letter serving endpoint
    path('api/secure-recommendation-letter/<int:letter_id>/', views.serve_secure_recommendation_letter, name='secure-recommendation-letter'),
    
    # Recommendation Letters endpoints
    path('api/applications/<int:application_id>/recommendation-letters/', views.RecommendationLetterViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='recommendation-letters-list'),
    
    path('api/recommendation-letters/<int:pk>/', views.RecommendationLetterViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'delete': 'destroy'
    }), name='recommendation-letter-detail'),
    
    # Public recommendation letter submission endpoint (token-based, no auth required)
    path('api/recommendation-letters/token/<uuid:token>/', views.RecommendationLetterSubmissionView.as_view(), name='recommendation-letter-submission'),
    path('api/applications/<int:pk>/change_payment_status/', views.ApplicationView.as_view({'patch': 'change_payment_status'}), name='application-change-payment-status'),
    
    path("api/partner-programs/", views.PartnerProgramView.as_view(), name = 'partner-programs'),
    path("api/programs/<int:program_id>/partner/",views.PartnerProgramDetailsView.as_view(), name= "partner-program-detail"),

    path('api/partner-user-query/', views.PartnerUserQuery.as_view(), name = "partner-user-query"),

    path('api/programs/<int:pk>/remove-payment-tracking/', views.RemovePaymentTracking.as_view(), name = "remove-payment-tracking"),

    path('api/verify-ulink-account/', views.verify_ulink_account_view, name='verify-ulink-account'),
    path('api/connect-ulink-account/', views.UlinkConnect.as_view(), name='update-ulink-account'),
    path('api/user-transcript/', views.get_user_transcript, name='user-transcript'),
    path('api/programs/<int:program_id>/check-prerequisites/', views.check_prerequisites, name='check-prerequisites'),
    path('api/applications/<int:application_id>/admin-check-prerequisites/', views.admin_check_application_prerequisites, name='admin-check-prerequisites'),

    path('api/logo-image/', views.LogoUploadView.as_view(), name='upload-logo-image'),

]