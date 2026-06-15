from .serializers import SignUpSerializer, LoginSerializer
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import AllowAny

class SignUpAPIView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    
    def post(self, request):
                
        serializer = SignUpSerializer(data= request.data)
       
        serializer.is_valid(raise_exception=True)
        
        user = serializer.save()
        
        return Response({
            'id': user.id,
            'username': user.username,
            'email':user.email,
        },status = status.HTTP_201_CREATED)
        
        
class LoginAPIView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    
    def post(self, request):
    
        serializer = LoginSerializer(data =request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        
        refresh= RefreshToken.for_user(user =user)
        access = refresh.access_token
        
        response = Response({
            "message": "Login Successful"
        }, status = status.HTTP_200_OK)
        
        response.set_cookie(
            key='refresh',
            value=str(refresh),
            httponly=True,
            secure=False,    # True in production then requires HTTPS
            samesite='Lax'
        )
        response.set_cookie(
             key='access',
             value=str(access),
             httponly=True,
             secure =False, # True in production then requires HTTPS
             samesite='Lax'
        )
        return response


class RefreshTokenAPIView(APIView):

    def post(self, request):

        refresh_token = request.COOKIES.get("refresh")  

        if not refresh_token:
            raise AuthenticationFailed("No Refresh Token")

        try:
            refresh = RefreshToken(refresh_token)
            access_token = str(refresh.access_token)
            
        except Exception:
            raise AuthenticationFailed('Session expired. Please login again.')
        
        response = Response({
            "message": "Access token refreshed",
        }, status=status.HTTP_200_OK)

        response.set_cookie(
            key="access",
            value=access_token,
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