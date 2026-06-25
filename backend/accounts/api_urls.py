from django.urls import path
from . import views

app_name = "acocunts_apis"
urlpatterns = [
    path("signup/", views.SignUpAPIView.as_view(), name='signup'),
    path("login/", views.LoginAPIView.as_view(), name='login'),
    path("logout/", views.LogoutAPIView.as_view(), name='logout'),
    path("token/refresh/", views.RefreshTokenAPIView.as_view(), name='token_refresh'),
]