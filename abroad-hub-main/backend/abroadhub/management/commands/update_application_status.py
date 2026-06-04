# management/commands/update_application_status.py
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db.models import Count
from abroadhub.models import Program
class Command(BaseCommand):
    help = 'Updates application statuses for completed programs'

    def handle(self, *args, **kwargs):
        # Get all programs that have ended
        ended_programs = Program.objects.filter(
            end_date__lt=timezone.now()
        )
        
        total_updated = 0
        for program in ended_programs:
            updated = program.update_completed_applications()
            total_updated += updated
            
            if updated > 0:
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Updated {updated} applications for program "{program.title}"'
                    )
                )
        
        self.stdout.write(
            self.style.SUCCESS(f'Total applications updated: {total_updated}')
        )