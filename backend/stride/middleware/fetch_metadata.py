from django.http import JsonResponse
from rest_framework import status
import os 

class CSRFProtectionMiddleware:
   
   """
        A CSRF Protection Middleware to make sure the state changing requests (post, put, patch, delete) 
        is accepted only if comes through allowed origins to prevent CSRF attacks.
   """
    
   ALLOWED_ORIGINS = {
       origin.strip()
       for origin in os.environ.get("ALLOWED_ORIGINS", "")
       .split(',')
       if origin.strip()
   }
   
   
   PROTECTED_METHODS ={
       'POST',
       'PUT',
       'PATCH',
       'DELETE',
   }

   def __init__(self, get_response):
       self.get_response = get_response
       
   def __call__(self, request):
       
       if request.method in self.PROTECTED_METHODS:
            origin = request.headers.get("Origin")
            fetch_site = request.headers.get('Sec-Fetch-Site')

            if origin and origin not in self.ALLOWED_ORIGINS:
                return JsonResponse(
                    {"detail" : "Invalid origin"},
                    status=status.HTTP_403_FORBIDDEN
                )

            if (fetch_site == 'cross-site' and origin not in self.ALLOWED_ORIGINS):
                return JsonResponse(
                    {"detail": "Cross-site request blocked"},
                    status=status.HTTP_403_FORBIDDEN
                )
       
       return self.get_response(request) 
