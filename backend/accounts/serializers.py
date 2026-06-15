from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.password_validation import validate_password
from .models import Profile

User = get_user_model()

class SignUpSerializer(serializers.ModelSerializer):

        password1 = serializers.CharField(write_only=True, required=True)
        password2 = serializers.CharField(write_only=True, required=True)
        class Meta:
                model = User
                fields = ['username','email','password1', 'password2', 'first_name','last_name']

        def validate(self, data):
                
            if data.get('password1') != data.get('password2'):
                        raise serializers.ValidationError("Passwords do not match!")
            validate_password(data.get('password1'))
            return data

        def create(self, validated_data):
            
           password = validated_data.pop("password1")
           validated_data.pop("password2")

           user = User.objects.create_user(
                username=validated_data.get('username'),
                email=validated_data.get('email'),
                password=password,
                first_name=validated_data.get('first_name', ''),
                last_name=validated_data.get('last_name', '')
            )   

            # create related profile
           Profile.objects.create(user=user)

           return user

class LoginSerializer(serializers.Serializer):
        
        username = serializers.CharField()
        password = serializers.CharField()


        def validate(self, data):
                
                username = data.get('username')
                password = data.get('password')

                if username and password:
                    user = authenticate(username=username, password =password)

                    if user:
                            if not user.is_active:
                                    raise serializers.ValidationError("User account is disabled.")
                            data['user'] = user
                    

                    else:
                            raise serializers.ValidationError('Invalid Credentials')
                    
                else: 
                    raise serializers.ValidationError("Enter both username and password")
                
                return data
            
        