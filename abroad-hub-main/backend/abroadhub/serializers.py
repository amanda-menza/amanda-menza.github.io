from rest_framework import serializers
from django.contrib.auth.models import User
from .models import AppUser, InstitutionName, SecondaryColor, UserProfile, Application,Program,Content,PrimaryColor,ConfidentialNote, DocumentTemplate, RecommendationLetter, Question, Answer,Course


    
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]
        extra_kwargs = {"password": {"write_only": True, "required": False}}

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user
    
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ("major", "gpa")
    def update(self, instance, validated_data):
        instance.major = validated_data.get('major', instance.major)
        instance.gpa = validated_data.get('gpa', instance.gpa)
        instance.save()
        return instance


class AppUserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(required=False)
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    user = UserSerializer(write_only=True)
    roles = serializers.ListField(
        child=serializers.ChoiceField(choices=AppUser.USER_ROLES), 
        required=False
    )

    class Meta:
        model = AppUser
        fields = ["id", "display_name", "username", "email", "dob", "roles", "profile", "user", "is_sso", "use_mfa","ulink_username"]

    def create(self, validated_data):
        user_data = validated_data.pop("user", None)
        profile_data = validated_data.pop("profile", None)
        roles_data = validated_data.pop("roles", None)

        if not user_data:
            raise serializers.ValidationError({"user": "User data is required."})

        # Create the User first
        user = UserSerializer().create(user_data)

        # If we have profile data, create the profile first
        profile = None
        if profile_data:
            profile = UserProfile.objects.create(**profile_data)

        # Create the AppUser with the user and profile, including roles
        app_user = AppUser.objects.create(
            user=user,
            profile=profile,  # This will be None if no profile_data
            roles=roles_data if roles_data else ['Student'],  # Default to 'Student' if no roles are provided
            **validated_data
        )

        return app_user

    def update(self, instance, validated_data):
        profile_data = validated_data.pop("profile", None)
        roles_data = validated_data.pop("roles", None)

        # Update AppUser fields
        instance.display_name = validated_data.get("display_name", instance.display_name)
        instance.dob = validated_data.get("dob", instance.dob)
        instance.is_sso = validated_data.get("is_sso", instance.is_sso)

        # Update the roles if provided
        if roles_data is not None:
            instance.roles = roles_data

        if profile_data:
            if instance.profile:
                # Update existing profile
                for attr, value in profile_data.items():
                    setattr(instance.profile, attr, value)
                instance.profile.save()
            else:
                # Create new profile
                profile = UserProfile.objects.create(**profile_data)
                instance.profile = profile

        instance.save()
        return instance
    
class QuestionSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)  # Make id optional but allow it to be passed

    class Meta:
        model = Question
        fields = ['id', 'text']

    def to_internal_value(self, data):
        # Ensure that the 'id' is included in the validated data
        if 'id' in data:
            self.fields['id'].read_only = False
        return super().to_internal_value(data)
    
class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id','number','department']

class ProgramSerializer(serializers.ModelSerializer):
    faculty_leads = serializers.PrimaryKeyRelatedField(
        many=True, queryset=AppUser.objects.all()
    )
    questions = QuestionSerializer(many=True, required=False)
    provider_partners = serializers.PrimaryKeyRelatedField(
        many=True, queryset=AppUser.objects.all(),required=False
    )
    prerequisites = CourseSerializer(many=True, required=False)

    class Meta:
        model = Program
        fields = ('id', 'title', 'year', 'semester', 'location', 'faculty_leads', 'description', 'questions', 'start_date', 'end_date', 'open_date', 'deadline','essential_doc_deadline','payment_deadline','provider_partners','prerequisites','track_payment')
    
    def to_representation(self, instance):
        # Get the default serialized data
        data = super().to_representation(instance)
        request = self.context.get('request')
        if request:
            user = request.user
            if 'provider_partners' in data:
                if 'Student' not in user.info.roles:
                    data['provider_partners'] = [
                        {'id': partner.id, 'display_name': partner.display_name, 'username': partner.user.username}
                        for partner in instance.provider_partners.all()  # Assuming faculty_leads is a relationship
                    ]
                else:
                    data.pop('provider_partners', None)        
        
        
        # Modify the faculty_leads field if it exists
        if 'faculty_leads' in data:
            data['faculty_leads'] = [
                {'id': lead.id, 'display_name': lead.display_name, 'username': lead.user.username}
                for lead in instance.faculty_leads.all()  # Assuming faculty_leads is a relationship
            ]  
         # Modify the faculty_leads field if it exists
                          
        return data
    
    def create(self, validated_data):
        questions_data = validated_data.pop('questions', [])
        faculty_leads_data = validated_data.pop('faculty_leads', [])
        provider_partners_data = validated_data.pop('provider_partners', [])
        prerequisites_data = validated_data.pop('prerequisites', [])

        
        # Create the program instance
        program = Program.objects.create(**validated_data)
        program.faculty_leads.set(faculty_leads_data)
        program.provider_partners.set(provider_partners_data)
         # Handle prerequisites (check if course exists, create if not)
        prerequisites = []
        for course_data in prerequisites_data:
            course, created = Course.objects.get_or_create(**course_data)
            prerequisites.append(course)
        program.prerequisites.set(prerequisites)  # Set prerequisites to program


        
        # Create questions for the program
        for question in questions_data:
            Question.objects.create(program=program, **question)

        return program
    

    def update(self, instance, validated_data):

        
        # Extract questions and faculty leads from the validated data
        questions_data = validated_data.pop('questions', [])
        faculty_leads = validated_data.pop('faculty_leads', [])
        provider_partners_data = validated_data.pop('provider_partners', [])
        prerequisites_data = validated_data.pop('prerequisites', [])


        # Log faculty leads being updated

        # Update program fields dynamically
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update faculty leads (assumes faculty_leads is a Many-to-Many relation)
        instance.faculty_leads.set(faculty_leads)
        instance.provider_partners.set(provider_partners_data)
        # Handle prerequisites update
        prerequisites = []
        for course_data in prerequisites_data:
            course, created = Course.objects.get_or_create(**course_data)
            prerequisites.append(course)
        instance.prerequisites.set(prerequisites)



        # Fetch existing questions for this program
        existing_questions = {q.id: q for q in instance.questions.all()}

        updated_question_ids = set()
        new_questions = []

        # Process incoming question data
        for question_data in questions_data:
            question_id = question_data.get('id')

            if question_id and question_id in existing_questions:
                # Update existing question
                question = existing_questions[question_id]
                for attr, value in question_data.items():
                    setattr(question, attr, value)
                question.save()
                updated_question_ids.add(question_id)
            else:
                # Create new question if no matching id exists
                new_questions.append(Question(program=instance, **question_data))

        # Delete questions that were removed in the update (only those not included in the incoming data)
        questions_to_delete = [
            q for q_id, q in existing_questions.items() if q_id not in updated_question_ids
        ]
        for q in questions_to_delete:
            q.delete()

        # Bulk create new questions for efficiency
        if new_questions:
            Question.objects.bulk_create(new_questions)

        # Log the end of the update process

        return instance


class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ('id', 'question', 'response')
    

class ApplicationSerializer(serializers.ModelSerializer):
    student = AppUserSerializer(read_only=True)
    program = ProgramSerializer(read_only=True)
    answers = AnswerSerializer(many=True)

    class Meta:
        model = Application
        fields = (
            'id', 'student', 'program', 'status', 'submission_date',
            'assumption_of_risk_form', 'assumption_of_risk_form_timestamp',
            'acknowledgement_of_code_of_conduct', 'acknowledgement_of_code_of_conduct_timestamp',
            'housing_questionnaire', 'medical_health_history_and_immunization_records',
            'medical_health_history_and_immunization_records_timestamp', 'answers','payment_status'
        )
        extra_kwargs = {"student": {"read_only": True}}

    def create(self, validated_data):
        # Extract the answers data from the validated data
        answers_data = validated_data.pop('answers', [])
        
        # Create the application instance
        application = Application.objects.create(**validated_data)
        
        # Create and associate the answers with the application
        for answer_data in answers_data:
            # Make sure to associate each answer with the application and the correct question
            Answer.objects.create(application=application, **answer_data)

        return application
    
    def update(self, instance, validated_data):
        # Extract the answers data if provided
        answers_data = validated_data.pop('answers', None)

        # Update the application instance fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()  # Save the updated application

        # If answers are provided, update them
        if answers_data is not None:
            instance.answers.all().delete()  # Remove existing answers (if applicable)
            
            # Create new answers associated with the updated application
            for answer_data in answers_data:
                Answer.objects.create(application=instance, **answer_data)

        return instance



class ContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Content
        fields = ['content']

class InstitutionNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = InstitutionName
        fields = ['name']

class PrimaryColorSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrimaryColor
        fields = ['color']

class SecondaryColorSerializer(serializers.ModelSerializer):
    class Meta:
        model = SecondaryColor
        fields = ['color']

class DocumentUploadSerializer(serializers.Serializer):
    document = serializers.FileField()
    document_type = serializers.CharField()

    def validate_document_type(self, value):
        valid_types = [
            "Assumption of Risk Form",
            "Acknowledgement of the Code of Conduct",
            "Housing Questionnaire",
            "Medical/Health History and Immunization Records",
        ]
        if value not in valid_types:
            raise serializers.ValidationError("Invalid document type")
        return value


class ConfidentialNoteSerializer(serializers.ModelSerializer):
    author = serializers.PrimaryKeyRelatedField(read_only=True)  # Changed to read_only
    application = serializers.PrimaryKeyRelatedField(read_only=True)  # Changed to read_only

    class Meta:
        model = ConfidentialNote
        fields = ['id', 'application', 'author', 'content', 'timestamp']
        read_only_fields = ['id', 'timestamp']

    def to_representation(self, instance):
        """Customize the representation of the author field."""
        data = super().to_representation(instance)
        
        # Modify author to return {id: ..., display_name: ...}
        if instance.author:
            data['author'] = {
                'id': instance.author.id,
                'display_name': instance.author.display_name,
                'username':instance.author.user.username
            }
        
        return data
    
class DocumentTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentTemplate
        fields = ['document_type', 'template_file']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Add author name
        author = instance.author
        representation['author_name'] = author.display_name if author else None
        return representation

class RecommendationLetterSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecommendationLetter
        fields = ['id', 'application_id', 'writer_name', 'writer_email', 'status', 
                 'token', 'requested_date', 'fulfilled_date', 'letter_file']
        read_only_fields = ['id', 'token', 'requested_date', 'fulfilled_date', 'status']

    def create(self, validated_data):
        # Generate a unique token
        import uuid
        validated_data['token'] = uuid.uuid4()
        return super().create(validated_data)
    
