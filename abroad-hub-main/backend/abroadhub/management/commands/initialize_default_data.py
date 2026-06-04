from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.db import transaction
from django.utils import timezone
from datetime import datetime
import pytz
from abroadhub.models import AppUser, UserProfile, Program, Application, ConfidentialNote, Answer, Question

class Command(BaseCommand):
    help = 'Initializes the database with default data for Abroad Hub'

    def parse_date(self, date_str):
        """Parse date string in format YYYY/MM/DD or YYYY-MM-DD"""
        if '/' in date_str:
            return datetime.strptime(date_str, '%Y/%m/%d').date()
        else:
            return datetime.strptime(date_str, '%Y-%m-%d').date()

    def parse_roles(self, roles_str):
        """Parse roles string into a list"""
        if not roles_str:
            return ['Student']
        return [role.strip() for role in roles_str.split(',')]

    @transaction.atomic
    def handle(self, *args, **kwargs):
        self.stdout.write('Creating default data...')
        
        # Create students
        students_data = [
  {
    "username": "tylerharris352",
    "display_name": "Tyler Harris",
    "password": "bVByhlT1",
    "email": "tylerharris352@service.net",
    "gpa": 3.52,
    "major": "Biology",
    "dob": "2004-09-01",
    "roles": "Student",
    "ulink_username": "th352"
  },
  {
    "username": "davidclark074",
    "display_name": "David Clark",
    "password": "9mtPZ6M2",
    "email": "davidclark074@service.net",
    "gpa": 2.54,
    "major": "Psychology",
    "dob": "2004-06-15",
    "roles": "Student",
    "ulink_username": "dc74"
  },
  {
    "username": "elizabethjohnson303",
    "display_name": "Elizabeth Johnson",
    "password": "kTr1guGj",
    "email": "elizabethjohnson303@domain.org",
    "gpa": 3.95,
    "major": "Psychology",
    "dob": "2008-03-20",
    "roles": "Student",
    "ulink_username": ""
  },
  {
    "username": "jamestaylor121",
    "display_name": "James Taylor",
    "password": "LBUL23vh",
    "email": "jamestaylor121@service.net",
    "gpa": 2.6,
    "major": "Psychology",
    "dob": "2000-02-29",
    "roles": "Student",
    "ulink_username": ""
  },
  {
    "username": "emilyharris658",
    "display_name": "Emily Harris",
    "password": "Z1HAX9yj",
    "email": "emilyharris658@service.net",
    "gpa": 3.64,
    "major": "Biology",
    "dob": "2001-04-12",
    "roles": "Student",
    "ulink_username": ""
  },
  {
    "username": "elizabethlewis588",
    "display_name": "Elizabeth Lewis",
    "password": "TTSRKJtH",
    "email": "elizabethlewis588@example.com",
    "gpa": 3.1,
    "major": "Psychology",
    "dob": "2000-03-16",
    "roles": "Student",
    "ulink_username": "el58"
  },
  {
    "username": "jessicasmith684",
    "display_name": "Jessica Smith",
    "password": "JOVMVjjA",
    "email": "jessicasmith684@example.com",
    "gpa": 3.0,
    "major": "Engineering",
    "dob": "2008-08-08",
    "roles": "Student",
    "ulink_username": ""
  },
  {
    "username": "jessicasmith610",
    "display_name": "Jessica Smith",
    "password": "b3zCmWYA",
    "email": "jessicasmith610@mail.com",
    "gpa": 3.6,
    "major": "Computer Science",
    "dob": "2001-07-07",
    "roles": "Student",
    "ulink_username": ""
  }
]

        
        # Create faculty and admin
        faculty_data = [
    {
    "username": "ashleybrown862",
    "display_name": "Ashley Brown",
    "password": "bq1qw1Kj",
    "email": "ashleybrown862@mail.com",
    "roles": "Administrator",
  },
  {
    "username": "jessicaanderson409",
    "display_name": "Jessica Anderson",
    "password": "XKqzZq6l",
    "email": "jessicaanderson409@domain.org",
    "roles": "Administrator, Faculty",
  },
  {
    "username": "sarahsmith682",
    "display_name": "Sarah Smith",
    "password": "ye6GGoNf",
    "email": "sarahsmith682@domain.org",
    "roles": "Administrator, Faculty",
  },
  {
    "username": "emilybletsch943",
    "display_name": "Emily Bletsch",
    "password": "cWdcUokz",
    "email": "emilybletsch943@service.net",
    "roles": "Faculty",
  },
  {
    "username": "emilywalker026",
    "display_name": "Emily Walker",
    "password": "B366kKuA",
    "email": "emilywalker026@domain.org",
    "roles": "Faculty",
  },
  {
    "username": "jamestaylor844",
    "display_name": "James Taylor",
    "password": "DdukcK85",
    "email": "jamestaylor844@service.net",
    "roles": "Reviewer",
  },
            {'username': 'admin', 'display_name': 'Administrator', 'password': 'Software458!', 'email': 'admin@gmail.com', 'roles': ['Administrator','Faculty']},
            {
    "username": "jamescarter92",
    "display_name": "James Carter",
    "password": "H1j94D-x",
    "email": "james.carter92@example.com",
    "roles": "Partner",
  },
  {
    "username": "emilywatson88",
    "display_name": "Emily Watson",
    "password": "Kjs13ski!",
    "email": "emily.watson88@example.com",
    "roles": "Partner",
  },
  {
    "username": "danielbrooks77",
    "display_name": "Daniel Brooks",
    "password": "Jsk8k9q+",
    "email": "daniel.brooks77@example.com",
    "roles": "Partner",
  },
  {
    "username": "oliviagreen21",
    "display_name": "Olivia Green",
    "password": "A3jsa0-",
    "email": "olivia.green21@example.com",
    "roles": "Partner",
  }
        ]
        
        # Combine all user data
        all_users_data = students_data + faculty_data
        
        # Create users
        created_users = {}
        for user_data in all_users_data:
            # Check if user already exists
            if User.objects.filter(username=user_data['username']).exists():
                self.stdout.write(f"User {user_data['username']} already exists. Skipping.")
                continue
            
            # Create Django User
            user = User.objects.create_user(
                username=user_data['username'],
                email=user_data['email'],
                password=user_data['password']
            )
            
            # Create UserProfile if needed
            profile = None
            if 'Student' in self.parse_roles(user_data.get('roles', '')):
                profile = UserProfile.objects.create(
                    major=user_data.get('major'),
                    gpa=user_data.get('gpa')
                )
            
            # Create AppUser
            app_user = AppUser.objects.create(
                user=user,
                display_name=user_data['display_name'],
                roles=self.parse_roles(user_data.get('roles', '')),
                dob=self.parse_date(user_data['birthday']) if 'birthday' in user_data else None,
                profile=profile
            )
            
            created_users[user_data['username']] = app_user
            self.stdout.write(f"Created user: {user_data['username']}")
        
        # Create programs
        programs_data =[
    {
        "title": "Science in Spain",
        "year": 2025,
        "semester": "Fall",
        "faculty_leads": ["jessicaanderson409"],
        "description": "Science in Spain: A unique and enriching study abroad experience focusing on local culture, history, and academic insights.",
        "application_open_date": "2024-12-01",
        "application_deadline": "2025-04-30",
        "start_date": "2025-08-18",
        "end_date": "2025-12-28",
        "questions": [
            {"text": "Why do you want to participate in this study abroad program?"},
            {"text": "How does this program align with your academic or career goals?"},
            {"text": "What challenges do you anticipate during this experience, and how will you address them?"},
            {"text": "Describe a time you adapted to a new or unfamiliar environment."},
            {"text": "What unique perspective or contribution will you bring to the group?"}
        ]
    },
    {
        "title": "History in Canada",
        "year": 2025,
        "semester": "Fall",
        "faculty_leads": ["emilybletsch943"],
        "description": "History in Canada: A unique and enriching study abroad experience focusing on local culture, history, and academic insights.",
        "application_open_date": "2024-12-01",
        "application_deadline": "2025-02-28",
        "start_date": "2025-08-18",
        "end_date": "2025-12-28",
        "questions": [
            {"text": "Why do you want to participate in this study abroad program?"},
            {"text": "How does this program align with your academic or career goals?"},
            {"text": "What challenges do you anticipate during this experience, and how will you address them?"},
            {"text": "Describe a time you adapted to a new or unfamiliar environment."},
            {"text": "What unique perspective or contribution will you bring to the group?"}
        ]
    },
    {
        "title": "Art in Italy",
        "year": 2024,
        "semester": "Fall",
        "faculty_leads": ["emilywalker026"],
        "description": "Art in Italy: A unique and enriching study abroad experience focusing on local culture, history, and academic insights.",
        "application_open_date": "2023-12-01",
        "application_deadline": "2024-02-28",
        "start_date": "2024-08-19",
        "end_date": "2024-12-29",
        "questions": [
            {"text": "Why do you want to participate in this study abroad program?"},
            {"text": "How does this program align with your academic or career goals?"},
            {"text": "What challenges do you anticipate during this experience, and how will you address them?"},
            {"text": "Describe a time you adapted to a new or unfamiliar environment."},
            {"text": "What unique perspective or contribution will you bring to the group?"}
        ]
    },
    {
        "title": "Medicine in India",
        "year": 2028,
        "semester": "Fall",
        "faculty_leads": ["emilybletsch943"],
        "description": "Medicine in India: A unique and enriching study abroad experience focusing on local culture, history, and academic insights.",
        "application_open_date": "2027-12-01",
        "application_deadline": "2028-02-29",
        "start_date": "2028-08-14",
        "end_date": "2028-12-31",
        "questions": [
            {"text": "Why do you want to participate in this study abroad program?"},
            {"text": "How does this program align with your academic or career goals?"},
            {"text": "What challenges do you anticipate during this experience, and how will you address them?"},
            {"text": "Describe a time you adapted to a new or unfamiliar environment."},
            {"text": "What unique perspective or contribution will you bring to the group?"}
        ]
    },
    {
        "title": "Language in Japan",
        "year": 2029,
        "semester": "Fall",
        "faculty_leads": ["jessicaanderson409"],
        "description": "Language in Japan: A unique and enriching study abroad experience focusing on local culture, history, and academic insights.",
        "application_open_date": "2028-12-01",
        "application_deadline": "2029-02-28",
        "start_date": "2029-08-20",
        "end_date": "2029-12-30",
        "questions": [
            {"text": "Why do you want to participate in this study abroad program?"},
            {"text": "How does this program align with your academic or career goals?"},
            {"text": "What challenges do you anticipate during this experience, and how will you address them?"},
            {"text": "Describe a time you adapted to a new or unfamiliar environment."},
            {"text": "What unique perspective or contribution will you bring to the group?"}
        ]
    },
     {
        "title": "Technology in Japan",
        "year": 2030,
        "semester": "Fall",
        "faculty_leads": ["sarahsmith682"],
        "description": "Technology in Japan: A unique and enriching study abroad experience focusing on local culture, history, and academic insights.",
        "application_open_date": "2029-12-01",
        "application_deadline": "2030-02-28",
        "start_date": "2030-08-19",
        "end_date": "2030-12-29",
        "questions": [
            {"text": "Why do you want to participate in this study abroad program?"},
            {"text": "How does this program align with your academic or career goals?"},
            {"text": "What challenges do you anticipate during this experience, and how will you address them?"},
            {"text": "Describe a time you adapted to a new or unfamiliar environment."},
            {"text": "What unique perspective or contribution will you bring to the group?"}
        ]
    },
    {
        "title": "Medicine in Canada",
        "year": 2025,
        "semester": "Spring",
        "faculty_leads": ["emilybletsch943"],
        "description": "Medicine in Canada: A unique and enriching study abroad experience focusing on local culture, history, and academic insights.",
        "application_open_date": "2024-09-01",
        "application_deadline": "2024-11-30",
        "start_date": "2025-01-06",
        "end_date": "2025-05-04",
        "questions": [
            {"text": "What's your opinion of this program?"},
            {"text": "Have you ever did familiar project related to this program?"}
        ]
    },
    {
        "title": "Technology in Australia",
        "year": 2027,
        "semester": "Spring",
        "faculty_leads": ["emilybletsch943"],
        "description": "Technology in Australia: A unique and enriching study abroad experience focusing on local culture, history, and academic insights.",
        "application_open_date": "2026-09-01",
        "application_deadline": "2026-11-30",
        "start_date": "2027-01-04",
        "end_date": "2027-05-02",
        "questions": [
            {"text": "Why do you want to participate in this study abroad program?"},
            {"text": "How does this program align with your academic or career goals?"},
            {"text": "What challenges do you anticipate during this experience, and how will you address them?"},
            {"text": "Describe a time you adapted to a new or unfamiliar environment."},
            {"text": "What unique perspective or contribution will you bring to the group?"}
        ]
    },
    {
        "title": "Art in Australia",
        "year": 2028,
        "semester": "Spring",
        "faculty_leads": ["sarahsmith682"],
        "description": "Art in Australia: A unique and enriching study abroad experience focusing on local culture, history, and academic insights.",
        "application_open_date": "2027-09-01",
        "application_deadline": "2027-11-30",
        "start_date": "2028-01-03",
        "end_date": "2028-05-07",
        "questions": [
            {"text": "Why do you want to participate in this study abroad program?"},
            {"text": "How does this program align with your academic or career goals?"},
            {"text": "What challenges do you anticipate during this experience, and how will you address them?"},
            {"text": "Describe a time you adapted to a new or unfamiliar environment."},
            {"text": "What unique perspective or contribution will you bring to the group?"}
        ]
    },
    {
        "title": "Art in Japan",
        "year": 2029,
        "semester": "Spring",
        "faculty_leads": ["emilybletsch943"],
        "description": "Art in Japan: A unique and enriching study abroad experience focusing on local culture, history, and academic insights.",
        "application_open_date": "2028-09-01",
        "application_deadline": "2028-11-30",
        "start_date": "2029-01-08",
        "end_date": "2029-05-06",
        "questions": [
            {"text": "Why do you want to participate in this study abroad program?"},
            {"text": "How does this program align with your academic or career goals?"},
            {"text": "What challenges do you anticipate during this experience, and how will you address them?"},
            {"text": "Describe a time you adapted to a new or unfamiliar environment."},
            {"text": "What unique perspective or contribution will you bring to the group?"}
        ]
    },
    {
        "title": "Art in France",
        "year": 2025,
        "semester": "Summer",
        "faculty_leads": ["jessicaanderson409"],
        "description": "Art in France: A unique and enriching study abroad experience focusing on local culture, history, and academic insights.",
        "application_open_date": "2024-09-01",
        "application_deadline": "2024-11-30",
        "start_date": "2025-05-19",
        "end_date": "2025-08-17",
        "questions": [
            {"text": "Why do you want to participate in this study abroad program?"},
            {"text": "How does this program align with your academic or career goals?"},
            {"text": "What challenges do you anticipate during this experience, and how will you address them?"},
            {"text": "Describe a time you adapted to a new or unfamiliar environment."},
            {"text": "What unique perspective or contribution will you bring to the group?"}
        ]
    }
]
        
        created_programs = {}
        for program_data in programs_data:
            # Extract the location from the title
            location = program_data['title'].split(' in ')[1] if ' in ' in program_data['title'] else ''
            
            # Check if program already exists
            if Program.objects.filter(title=program_data['title'], year=program_data['year']).exists():
                self.stdout.write(f"Program {program_data['title']} {program_data['year']} already exists. Skipping.")
                continue
            
            # Find the faculty lead
            faculty_lead_username = program_data['faculty_leads']

            faculty_lead = [user for username, user in created_users.items() if username in faculty_lead_username]

            if not faculty_lead:
                self.stdout.write(f"Faculty lead {program_data['faculty_leads']} not found. Skipping program.")
                continue
            
                # Create the program instance
            program = Program.objects.create(
                title=program_data['title'],
                year=program_data['year'],
                semester=program_data['semester'],
                location=location,
                description=program_data['description'],
                start_date=self.parse_date(program_data['start_date']),
                end_date=self.parse_date(program_data['end_date']),
                open_date=self.parse_date(program_data['application_open_date']),
                deadline=self.parse_date(program_data['application_deadline']),
                essential_doc_deadline=self.parse_date(program_data.get('essential_doc_deadline', program_data['application_deadline']))  # Default to deadline if missing
            )

            # Add faculty lead to the program
            program.faculty_leads.add(*faculty_lead)

            # Add questions to the program
            questions_list = program_data.get('questions', [])  # Ensure there's a list of questions
                    
            
            for question_data in questions_list:
                # Remove the manual ID specification
                question, created = Question.objects.get_or_create(
                    text=question_data["text"],  # Use text as the unique identifier
                    program=program
                )
                
                if created:
                    self.stdout.write(f"Created new question: {question.text}")
                else:
                    self.stdout.write(f"Question already exists: {question.text}")
            created_programs[program_data['title']] = program
            self.stdout.write(f"Created program: {program_data['title']} {program_data['year']}")
        
        applications_data = [
              {
        "student": "tylerharris352",
        "program": "Science in Spain",
        "answers": [
            {"question": "Why do you want to participate in this study abroad program?", "response": "The opportunity to learn in a different environment is invaluable."},
            {"question": "How does this program align with your academic or career goals?", "response": "I bring a collaborative spirit and a unique cultural perspective."},
            {"question": "What challenges do you anticipate during this experience, and how will you address them?", "response": "This program supports my career aspirations in global business."},
            {"question": "Describe a time you adapted to a new or unfamiliar environment.", "response": "I want to explore new cultures and enhance my academic knowledge."},
            {"question": "What unique perspective or contribution will you bring to the group?", "response": "I adapted to a new job environment by quickly learning the workflows and collaborating effectively."}
        ],
        "status": "Applied",
        "notes": ""
    },
    {
        "student": "tylerharris352",
        "program": "Medicine in Canada",
        "answers": [
            {"question": "What's your opinion of this program?", "response": "I think it's a quite great program."},
            {"question": "Have you ever did familiar project related to this program?", "response": "I did one project related to this program before."}
        ],
        "status": "Enrolled",
        "notes": ""
    },
    {
        "student": "davidclark074",
        "program": "Science in Spain",
        "answers": [
            {"question": "Why do you want to participate in this study abroad program?", "response": "This program provides hands-on experience crucial for my future career."},
            {"question": "How does this program align with your academic or career goals?", "response": "This program provides hands-on experience crucial for my future career."},
            {"question": "What challenges do you anticipate during this experience, and how will you address them?", "response": "This program aligns with my passion for international relations and global studies."},
            {"question": "Describe a time you adapted to a new or unfamiliar environment.", "response": "I anticipate communication barriers but will overcome them through active learning and collaboration."},
            {"question": "What unique perspective or contribution will you bring to the group?", "response": "I am excited to network with peers and professionals in this field."}
        ],
        "status": "Canceled",
        "notes": ""
    },
    {
        "student": "elizabethjohnson303",
        "program": "History in Canada",
        "answers": [
            {"question": "Why do you want to participate in this study abroad program?", "response": "I am excited to network with peers and professionals in this field."},
            {"question": "How does this program align with your academic or career goals?", "response": "This program provides hands-on experience crucial for my future career."},
            {"question": "What challenges do you anticipate during this experience, and how will you address them?", "response": "I want to explore new cultures and enhance my academic knowledge."},
            {"question": "Describe a time you adapted to a new or unfamiliar environment.", "response": "This program provides hands-on experience crucial for my future career."},
            {"question": "What unique perspective or contribution will you bring to the group?", "response": "This program aligns with my passion for international relations and global studies."}
        ],
        "status": "Enrolled",
        "notes": ""

    },
    {
        "student": "jamestaylor121",
        "program": "Science in Spain",
        "answers": [
            {"question": "Why do you want to participate in this study abroad program?", "response": "I seek to improve my language skills and immerse myself in the local culture."},
            {"question": "How does this program align with your academic or career goals?", "response": "I seek to improve my language skills and immerse myself in the local culture."},
            {"question": "What challenges do you anticipate during this experience, and how will you address them?", "response": "I adapted to a new job environment by quickly learning the workflows and collaborating effectively."},
            {"question": "Describe a time you adapted to a new or unfamiliar environment.", "response": "I anticipate communication barriers but will overcome them through active learning and collaboration."},
            {"question": "What unique perspective or contribution will you bring to the group?", "response": "I bring a collaborative spirit and a unique cultural perspective."}
        ],
        "status": "Applied",
        "notes": ""

    },
    {
        "student": "emilyharris658",
        "program": "Science in Spain",
        "answers": [
            {"question": "Why do you want to participate in this study abroad program?", "response": "I bring a collaborative spirit and a unique cultural perspective."},
            {"question": "How does this program align with your academic or career goals?", "response": "I seek to improve my language skills and immerse myself in the local culture."},
            {"question": "What challenges do you anticipate during this experience, and how will you address them?", "response": "This program supports my career aspirations in global business."},
            {"question": "Describe a time you adapted to a new or unfamiliar environment.", "response": "I anticipate communication barriers but will overcome them through active learning and collaboration."},
            {"question": "What unique perspective or contribution will you bring to the group?", "response": "This program aligns with my passion for international relations and global studies."}
        ],
        "status": "Withdrawn",
        "notes": ""

    },
    {
        "student": "elizabethlewis588",
        "program": "Art in Italy",
        "answers": [
            {"question": "Why do you want to participate in this study abroad program?", "response": "The opportunity to learn in a different environment is invaluable."},
            {"question": "How does this program align with your academic or career goals?", "response": "I bring a collaborative spirit and a unique cultural perspective."},
            {"question": "What challenges do you anticipate during this experience, and how will you address them?", "response": "This program aligns with my passion for international relations and global studies."},
            {"question": "Describe a time you adapted to a new or unfamiliar environment.", "response": "The opportunity to learn in a different environment is invaluable."},
            {"question": "What unique perspective or contribution will you bring to the group?", "response": "This program provides hands-on experience crucial for my future career."}
        ],
        "status": "Enrolled",
        "notes": ""

    },
    {
        "student": "jessicasmith684",
        "program": "Art in Italy",
        "answers": [
            {"question": "Why do you want to participate in this study abroad program?", "response": "I adapted to a new job environment by quickly learning the workflows and collaborating effectively."},
            {"question": "How does this program align with your academic or career goals?", "response": "I adapted to a new job environment by quickly learning the workflows and collaborating effectively."},
            {"question": "What challenges do you anticipate during this experience, and how will you address them?", "response": "This program provides hands-on experience crucial for my future career."},
            {"question": "Describe a time you adapted to a new or unfamiliar environment.", "response": "I adapted to a new job environment by quickly learning the workflows and collaborating effectively."},
            {"question": "What unique perspective or contribution will you bring to the group?", "response": "This program provides hands-on experience crucial for my future career."}
        ],
        "status": "Withdrawn",
        "notes": ""

    },
    {
        "student": "jessicasmith684",
        "program": "History in Canada",
        "answers": [
            {"question": "Why do you want to participate in this study abroad program?", "response": "I want to explore new cultures and enhance my academic knowledge."},
            {"question": "How does this program align with your academic or career goals?", "response": "The opportunity to learn in a different environment is invaluable."},
            {"question": "What challenges do you anticipate during this experience, and how will you address them?", "response": "This program supports my career aspirations in global business."},
            {"question": "Describe a time you adapted to a new or unfamiliar environment.", "response": "I bring a collaborative spirit and a unique cultural perspective."},
            {"question": "What unique perspective or contribution will you bring to the group?", "response": "The opportunity to learn in a different environment is invaluable."}
        ],
        "status": "Enrolled",
        "notes": ""

    },
    {
        "student": "jessicasmith610",
        "program": "History in Canada",
        "answers": [
            {"question": "Why do you want to participate in this study abroad program?", "response": "The opportunity to learn in a different environment is invaluable."},
            {"question": "How does this program align with your academic or career goals?", "response": "The opportunity to learn in a different environment is invaluable."},
            {"question": "What challenges do you anticipate during this experience, and how will you address them?", "response": "This program supports my career aspirations in global business."},
            {"question": "Describe a time you adapted to a new or unfamiliar environment.", "response": "I want to explore new cultures and enhance my academic knowledge."},
            {"question": "What unique perspective or contribution will you bring to the group?", "response": "I am excited to network with peers and professionals in this field."}
        ],
        "status": "Applied",
        "notes":[ {
        "author": "ashleybrown862",
        "content": "Looks good!",
    }]

    }
    ]

        
        for app_data in applications_data:
            # Find the student
            student = AppUser.objects.filter(user__username=app_data['student']).first()
            if not student:
                self.stdout.write(f"Student {app_data['student']} not found. Skipping application.")
                continue
            
            # Find the program
            program = next((prog for title, prog in created_programs.items() 
                          if title == app_data['program']), None)
            
            if not program:
                self.stdout.write(f"Program {app_data['program']} not found. Skipping application.")
                continue
            
            # Check if application already exists
            if Application.objects.filter(student=student, program=program).exists():
                self.stdout.write(f"Application for {student.display_name} to {program.title} already exists. Skipping.")
                continue
          
            # Create Application
            application = Application.objects.create(
                student=student,
                program=program,
                status=app_data['status'],
                submission_date=timezone.now()
            )
            self.stdout.write(f"Created Application for {student.display_name} to {program.title}.")


            for answer_obj in app_data['answers']:
                question_text = answer_obj['question']
                response_text = answer_obj['response']

                # Find the question by text and program
                question = Question.objects.get(
                    text=question_text, 
                    program=program
                )

                # Create Answer object with the correct references
                answer, created = Answer.objects.get_or_create(
                    application=application, 
                    question=question, 
                    response=response_text
                )
                self.stdout.write(f"Created answer for question: {question.text}")

            if app_data['notes']:
                # Iterate over the list of notes
                for note in app_data['notes']:
                    # Extract author and content from each note
                    note_author_username = note.get('author')
                    note_content = note.get('content')
                    
                    # Check if both author and content are provided
                    if note_author_username and note_content:
                        # Retrieve the note author from created_users
                        note_author = created_users.get(note_author_username)
                        
                        if note_author:
                            # Create a new confidential note
                            ConfidentialNote.objects.create(
                                application=application,
                                author=note_author,
                                content=note_content,
                                timestamp=timezone.now()
                            )
                            self.stdout.write(f"Added confidential note to application for {student.display_name}")
            
            self.stdout.write(f"Created application for {student.display_name} to {program.title}")
        
        self.stdout.write(self.style.SUCCESS('Default data initialization complete!'))