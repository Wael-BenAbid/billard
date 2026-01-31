from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import RetrieveUpdateAPIView, CreateAPIView, ListAPIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.auth import get_user_model
from django.utils import timezone

from .serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    CustomTokenObtainPairSerializer,
)

User = get_user_model()


class HealthCheckView(APIView):
    """Health check endpoint."""
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        return Response({
            'status': 'healthy',
            'service': 'Django REST API',
            'timestamp': timezone.now().isoformat()
        })


class UserRegistrationView(CreateAPIView):
    """API view for user registration."""
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        return Response({
            'message': 'User registered successfully.',
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom login view with JWT tokens and user info."""
    serializer_class = CustomTokenObtainPairSerializer


class UserProfileView(RetrieveUpdateAPIView):
    """API view for retrieving and updating user profile."""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class UserListView(ListAPIView):
    """API view for listing users (admin only)."""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return super().get_queryset().exclude(id=self.request.user.id)
