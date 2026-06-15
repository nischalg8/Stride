from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.views import TokenObtainPairView



app_name = "acocunts_apis"
urlpatterns = [
    path("signup/", views.SignUpAPIView.as_view(), name='signup'),
    path("login/", views.LoginAPIView.as_view(), name='login'),
    path("logoout/", views.LogoutAPIView.as_view(), name='logout'),
    path("token/refresh/", views.RefreshTokenAPIView.as_view(), name='token_refresh'),
]