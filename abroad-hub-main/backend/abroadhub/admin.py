from django.urls import path
from . import views
from django.contrib.auth.models import User, Group
from django.contrib.auth.admin import UserAdmin as DefaultUserAdmin
from .models import AppUser, UserProfile, Application, Program, ConfidentialNote, DocumentTemplate, RecommendationLetter
from django.core.exceptions import ObjectDoesNotExist
from django.db import transaction

from django.contrib import admin
from .models import AppUser, UserProfile, Application,Program, DocumentTemplate, Question, Answer
from django.forms import ModelForm
from django import forms

# Custom AdminSite class
class AbroadHubAdminSite(admin.AdminSite):
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('audit-logs/', self.admin_view(views.view_audit_logs), name='audit_logs'),
        ]
        return custom_urls + urls

# Create an instance of the custom admin site
admin_site = AbroadHubAdminSite(name='abroadhub_admin')


class AppUserForm(ModelForm):
    class Meta:
        model = AppUser
        fields = ['user', 'display_name', 'roles', 'dob', 'is_sso', 'profile', 'use_mfa','ulink_username']
    
    roles = forms.MultipleChoiceField(
        choices=AppUser.USER_ROLES,  # You can get these choices from the model
        widget=forms.CheckboxSelectMultiple,  # This will display checkboxes for multiple selections
        required=False
    )

# Customize the AppUserAdmin to use the custom form
class AppUserAdmin(admin.ModelAdmin):
    list_display = ('user', 'display_name', 'profile', 'dob', 'roles', 'is_sso', 'use_mfa','ulink_username')
    form = AppUserForm  # Use the custom form for this model
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
        

    def delete_model(self, request, obj):
        if 'Faculty' in obj.roles:
            result = self.remove_faculty_lead_and_assign_admin_for_all_programs(obj.id)
        obj.delete()
        # Proceed with the default deletion process
        # super().delete_model(request, obj)
    def delete_queryset(self, request, queryset):
        for obj in queryset:
            obj.delete()  # This will now call AppUser.delete()

class ProgramAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'year', 'semester', 'location', 
        'get_faculty_leads', 'description', 'start_date', 
        'end_date', 'open_date', 'deadline', 'essential_doc_deadline','payment_deadline','track_payment','get_provider_partners'
    )
    
    filter_horizontal = ('faculty_leads',)  # Enables a multi-select widget for M2M fields

    def get_faculty_leads(self, obj):
        return ", ".join([faculty.user.username for faculty in obj.faculty_leads.all()])  
    def get_provider_partners(self, obj):
        return ", ".join([partner.user.username for partner in obj.provider_partners.all()])

    get_faculty_leads.short_description = "Faculty Leads"  # Set column name in admin
    get_provider_partners.short_description = "Faculty Leads"

class QuestionAdmin(admin.ModelAdmin):
    list_display = ("text", "program")
    list_filter = ("program",)

class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('student','program', 'status','assumption_of_risk_form','assumption_of_risk_form_timestamp','acknowledgement_of_code_of_conduct','acknowledgement_of_code_of_conduct_timestamp', 'housing_questionnaire','medical_health_history_and_immunization_records','medical_health_history_and_immunization_records_timestamp')

class AnswerAdmin(admin.ModelAdmin):
    list_display = ("application", "question", "response")
    list_filter = ("application",)

class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('major', 'gpa')

class DocumentTemplateAdmin(admin.ModelAdmin):
    list_display=('document_type','template_file','updated_at')
    
class ConfidentialNoteAdmin(admin.ModelAdmin):
    list_display = ('application', 'author', 'content', 'timestamp')
    
class RecommendationLetterAdmin(admin.ModelAdmin):
    list_display = ('application', 'status', 'letter_file', 'fulfilled_date')

# Register models with the custom admin site
admin_site.register(User, DefaultUserAdmin)
admin_site.register(Group)

admin.site.register(AppUser, AppUserAdmin)
admin.site.register(UserProfile, UserProfileAdmin)
admin.site.register(Program, ProgramAdmin)
admin.site.register(Application, ApplicationAdmin)
admin.site.register(DocumentTemplate, DocumentTemplateAdmin)
admin.site.register(RecommendationLetter, RecommendationLetterAdmin)
# Register models with custom admin site

admin_site.register(AppUser, AppUserAdmin)
admin_site.register(UserProfile, UserProfileAdmin)
admin_site.register(Program, ProgramAdmin)
admin_site.register(Application, ApplicationAdmin)
admin_site.register(ConfidentialNote, ConfidentialNoteAdmin)
admin_site.register(DocumentTemplate, DocumentTemplateAdmin)

admin_site.register(Question, QuestionAdmin)
admin_site.register(Answer, AnswerAdmin)


admin_site.register(RecommendationLetter, RecommendationLetterAdmin)




