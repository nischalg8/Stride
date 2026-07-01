from django.contrib.auth import get_user_model

from .serializers import SignUpSerializer, LoginSerializer, ResetPasswordSerializer

from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import AllowAny

from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from .emails import send_reset_email, send_verify_email
from .models import EmailToken


User = get_user_model()

def _extract_error_message(errors):
    if isinstance(errors, str):
        return errors
    if isinstance(errors, list) and errors:
        return str(errors[0])
    if isinstance(errors, dict):
        for value in errors.values():
            if isinstance(value, list) and value:
                return str(value[0])
            if isinstance(value, str):
                return value
    return "Something went wrong."


class SignUpAPIView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
      
        serializer = SignUpSerializer(data=request.data)
      
        if not serializer.is_valid():
            return Response(
                {"message": _extract_error_message(serializer.errors)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = serializer.save()
        token = EmailToken.objects.create(
                user=user,
                token=EmailToken.generate_token(),
                purpose="verify_email",
            )
        
        send_verify_email(user, token.token)
        
        return Response(
            {
                "message":"Your account was created. Check your email to verify before logging in."
            },
            status=status.HTTP_201_CREATED,
        )

class VerifyEmailAPIView(APIView):
    
    authentication_classes = []
    permission_classes = [AllowAny]
    
    def get(self, request):
        
        token_str = request.query_params.get("token")
        
        if not token_str:
            return Response(
                {"message": "Token required"},
                status = status.HTTP_400_BAD_REQUEST,
            )
            
        try:
            token = EmailToken.objects.get(
                token = token_str,
                purpose="verify_email",
                is_used = False
                )
            
        except EmailToken.DoesNotExist:
            return Response(
                {"message": "Invalid Link."},
                status= status.HTTP_400_BAD_REQUEST
            )
            
        if token.is_expired():
            
            return Response(
                {"message":"Verification link has expired. Retry!"},
                status = status.HTTP_400_BAD_REQUEST
            )
        
        token.is_used=True
        token.save()
        
        token.user.is_active= True
        token.user.save()
        
        
        return Response(
            {"message": "Email verified successfully. You can now login to your account!"},
            status=status.HTTP_200_OK,
        )
        
class LoginAPIView(APIView):
    
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"message": _extract_error_message(serializer.errors)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = serializer.validated_data["user"]
        refresh = RefreshToken.for_user(user=user)
        access = refresh.access_token
        response = Response({"message": "Login Successful"}, status=status.HTTP_200_OK)
        response.set_cookie(
            key="refresh",
            value=str(refresh),
            httponly=True,
            secure=False,
            samesite="Lax",
        )
        response.set_cookie(
            key="access",
            value=str(access),
            httponly=True,
            secure=False,
            samesite="Lax",
        )
        return response
        
    


class RefreshTokenAPIView(APIView):

    # No auth required here this endpoint exists because the access token has 
    # expired. Requiring a valid access token to reach it would make refreshing impossible
    
    authentication_classes = []
    permission_classes = [AllowAny]
    def post(self, request):

        refresh_token = request.COOKIES.get("refresh")  

        if not refresh_token:
            raise AuthenticationFailed("No Refresh Token")

        # built-in serializer handles getting new refresh and access tokens  and blacklisting old one
        serializer = TokenRefreshSerializer(
            data={"refresh": refresh_token}
        )
        
        serializer.is_valid(raise_exception=True)
        
        access_token = serializer.validated_data["access"]
        # Present only when ROTATE_REFRESH_TOKENS=True 
        new_refresh_token = serializer.validated_data.get("refresh")  
       
        response = Response({
            "message": "Token refreshed",
        }, status=status.HTTP_200_OK)

        response.set_cookie(
            key="access",
            value=access_token,
            httponly=True,
            secure=False,
            samesite="Lax"
        )
        
        response.set_cookie(
            key="refresh",
            value=new_refresh_token,
            httponly=True,
            secure=False,
            samesite="Lax"
        )
        
        return response


class LogoutAPIView(APIView):
    
    # No auth required here. Logout must succeed even if the access token is 
    # expiredor invalid. Otherwise a user with a dead access token 
    # could never clear their cookies.
    authentication_classes = []
    permission_classes = [AllowAny]
    
    def post(self, request):
            
        refresh_token = request.COOKIES.get("refresh")
        
        if refresh_token:
            
            try:
                 # Security check performed here 
                 token = RefreshToken(refresh_token)
                 token.blacklist()
            except:
                pass
            
        response = Response({"message":"Logged out"},status= status.HTTP_200_OK)
        
        response.delete_cookie("access")
        response.delete_cookie("refresh")
        
        return response 
    
    
class ForgotPasswordAPIView(APIView):
    
    authentication_classes = []
    permission_classes = [AllowAny]
    def post(self, request):
        
        email = request.data.get("email")
        
        if not email:
            return Response(
                {"message": "Email is required"},
                status = status.HTTP_400_BAD_REQUEST,
            )
        
        try:
            user = User.objects.get(email=email, is_active=True)
            
            token = EmailToken.objects.create(
                user = user,
                token = EmailToken.generate_token(),
                purpose = "reset_password",
            )
            
            send_reset_email(user, token.token)
        
        except User.DoesNotExist:
            pass
        
        return Response(
            {"message":"We've sent a password reset link to your email address. Please check your inbox and follow the instructions to reset your password."},
            status = status.HTTP_200_OK
        )
            
        
class VerifyResetTokenAPIView(APIView):
    
    authentication_classes = []
    permission_classes = [AllowAny]
    
    def get(self, request):
        token_str = request.query_params.get("token")
        
        if not token_str:
            return Response(
                {"message": "Token is required"},
                status = status.HTTP_400_BAD_REQUEST
            )
        
        try:
            token = EmailToken.objects.get(
                token=token_str,
                purpose="reset_password",
                is_used=False,
            )
        except EmailToken.DoesNotExist:
            return Response(
                {"message":"Invalid or expired link"},
                status = status.HTTP_400_BAD_REQUEST
            )
        
        if token.is_expired():
            return Response(
                {"message": "Reset Link expired"},
                status = status.HTTP_400_BAD_REQUEST,
            )
        
    
        return Response(
            {"message": "Valid Token"},
            status = status.HTTP_200_OK,
        )
    


class ResetPasswordAPIView(APIView):
    
    authentication_classes = []
    permission_classes = [AllowAny]
    
    def post(self, request):
        
        serializer = ResetPasswordSerializer(data = request.data)
        
        if not serializer.is_valid():
               return Response(
                    {"message": _extract_error_message(serializer.errors)},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        
        token_str = serializer.validated_data.get("token")
        password = serializer.validated_data.get("password")
        
        try:
            token = EmailToken.objects.get(
                token = token_str,
                purpose = "reset_password",
                is_used = False,
            )
            
        except EmailToken.DoesNotExist:
            
            return Response(
                {"message":"Invalid reset token"},
                status = status.HTTP_400_BAD_REQUEST,
            )
        if token.is_expired():
            return Response(
                {"message": "Passsword Reset link has expired. Retry!"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        user = token.user
        user.set_password(password)
        
        user.save()
        
        token.is_used = True
        token.save()
                                  
        return Response(
            {"message": "Password reset successful."},
            status=status.HTTP_200_OK,
        )       