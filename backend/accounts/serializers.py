from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.password_validation import validate_password
from .models import Profile

User = get_user_model()

class SignUpSerializer(serializers.ModelSerializer):

        password = serializers.CharField(write_only=True, required=True)
        confirm_password = serializers.CharField(write_only=True, required=True)
        class Meta:
                model = User
                fields = ['first_name','last_name','username','email','password', 'confirm_password', ]

        def validate(self, data):
                
            if data.get('password') != data.get('confirm_password'):
                        raise serializers.ValidationError("Passwords do not match!")
            validate_password(data.get('password'))
            return data

        def create(self, validated_data):
            
           password = validated_data.pop("password")
           validated_data.pop("confirm_password")

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
                    user = authenticate(username=username, password=password)

                    if user:
                        if not user.is_active:
                            raise serializers.ValidationError({"detail": "User account is disabled."})
                        data["user"] = user
                    else:
                        if User.objects.filter(username=username).exists():
                            raise serializers.ValidationError({"detail": "Incorrect password."})
                        raise serializers.ValidationError({"detail": "Account does not exist."})
                else:
                    raise serializers.ValidationError({"detail": "Enter both username and password."})

                return data
            
        