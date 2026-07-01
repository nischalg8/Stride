from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings

def send_verify_email(user, token):
  
    link = f"{settings.FRONTEND_URL}/verify-email?token={token}"

    send_mail(
        subject="Verify your Stride account",
        message=f"Hi {user.first_name},\n\nClick to verify:\n{link}\n\nExpires in 24 hours.\n\n— Stride",
        from_email=None,
        recipient_list=[user.email],
    )

def send_reset_email(user, token):
   
    link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    send_mail(
        subject="Reset your Stride password",
        message=f"Hi {user.first_name},\n\nClick to reset password:\n{link}\n\nExpires in 1 hour.\n\n— Stride",
        from_email=None,
        recipient_list=[user.email],
    )