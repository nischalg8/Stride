from django.contrib import admin
from .models import EmailToken, Profile
# Register your models here.


admin.site.register(EmailToken)
admin.site.register(Profile)