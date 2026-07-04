

from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model


User = get_user_model()

@shared_task
def delete_inactive_users():
    cutoff = timezone.now() - timedelta(hours = 24)
    old_inactive = User.objects.filter(is_active=False, date_joined__lt = cutoff)
    count = old_inactive.count()
    
    old_inactive.delete()
    
    return f"Deleted {count} inactive users."