from django.urls import path
from . import views

app_name = "acocunts_apis"
urlpatterns = [
    path("signup/", views.SignUpAPIView.as_view(), name='signup'),
    path("login/", views.LoginAPIView.as_view(), name='login'),
    path("logout/", views.LogoutAPIView.as_view(), name='logout'),
    path("token/refresh/", views.RefreshTokenAPIView.as_view(), name='token_refresh'),
    path("reset-password/", views.ResetPasswordAPIView.as_view(), name='reset_password'),
    path("verify-email/", views.VerifyEmailAPIView.as_view(), name='verify_email'),
    path("verify-reset-token/", views.VerifyResetTokenAPIView.as_view(), name='verify_reset_token'),
    path("forgot-password/", views.ForgotPasswordAPIView.as_view(), name='forgot_password'),
]