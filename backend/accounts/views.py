from .serializers import SignUpSerializer, LoginSerializer
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.serializers import TokenRefreshSerializer


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
        return Response(
            {
                
                "username": user.username,
                "email": user.email,
            },
            status=status.HTTP_201_CREATED,
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
    
    def post(self, request):
            
        refresh_token = request.COOKIES.get("refresh")
        
        if refresh_token:
            
            try:
                 token = RefreshToken(refresh_token)
                 token.blacklist()
            except:
                pass
            
        response = Response({"message":"Logged out"},status= status.HTTP_200_OK)
        
        response.delete_cookie("access")
        response.delete_cookie("refresh")
        
        return response 