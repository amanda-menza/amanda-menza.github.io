
from users.models import AppUser
if not AppUser.objects.filter(username='admin').exists():
    AppUser.objects.create_user(
        username='admin',
        roles=['Administrator', 'Faculty'],
        display_name='Administrator',
        password='Software458!'
    )
print("Admin user created successfully.")