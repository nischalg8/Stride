from django.db import models
from django.conf import settings
from django.utils import timezone
import secrets


class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete = models.CASCADE)


class EmailToken(models.Model):
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    token = models.CharField(max_length=64, unique=True)
    purpose = models.CharField(max_length=20) # verify_email/ reset_password
    created_at = models.DateTimeField(auto_now_add =True)
    is_used = models.BooleanField(default = False)
    
    def is_expired(self):
        expiry = 24 if self.purpose == "verify_email" else 1 
        return timezone.now() >= self.created_at + timezone.timedelta(hours = expiry)
    
    @staticmethod
    def generate_token():
        return secrets.token_urlsafe(32)
    