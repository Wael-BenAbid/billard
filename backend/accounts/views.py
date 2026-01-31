from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .serializers import (
    UserRegistrationSerializer,
    UserSerializer,
    CustomTokenObtainPairSerializer,
    ChangePasswordSerializer,
    UpdateUserSerializer
)

User = get_user_model()


class HealthCheckView(APIView):
    """Health check endpoint."""
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({
            'status': 'healthy',
            'message': 'API is running'
        })


class RegisterView(generics.CreateAPIView):
    """User registration endpoint."""
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        return Response({
            'success': True,
            'message': 'User registered successfully.',
            'data': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)


class LoginView(TokenObtainPairView):
    """User login endpoint."""
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        # Update last login
        user = self.serializer_class().user
        user.update_last_login()
        return response


class ProfileView(generics.RetrieveUpdateAPIView):
    """User profile endpoint."""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def get(self, request, *args, **kwargs):
        serializer = self.get_serializer(request.user)
        return Response({
            'success': True,
            'data': serializer.data
        })

    def put(self, request, *args, **kwargs):
        serializer = UpdateUserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({
            'success': True,
            'message': 'Profile updated successfully.',
            'data': UserSerializer(request.user).data
        })


class ChangePasswordView(APIView):
    """Change password endpoint."""
    permission_classes = [IsAuthenticated]

    def put(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        
        return Response({
            'success': True,
            'message': 'Password changed successfully.'
        })


class LogoutView(APIView):
    """User logout endpoint (blacklist refresh token)."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Get the refresh token from request data
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({
                'success': False,
                'error': {
                    'message': 'Refresh token is required.'
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Blacklist the refresh token
        from rest_framework_simplejwt.tokens import RefreshToken
        token = RefreshToken(refresh_token)
        token.blacklist()
        
        return Response({
            'success': True,
            'message': 'Logged out successfully.'
        })
