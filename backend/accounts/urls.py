from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    HealthCheckView,
    UserRegistrationView,
    CustomTokenObtainPairView,
    UserProfileView,
    UserListView,
)

app_name = 'accounts'

urlpatterns = [
    # Health check
    path('health/', HealthCheckView.as_view(), name='health-check'),
    
    # Authentication
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token-obtain-pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    
    # User endpoints
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('users/', UserListView.as_view(), name='user-list'),
]
