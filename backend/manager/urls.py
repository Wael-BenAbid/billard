from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TableViewSet, ClientViewSet, PartieViewSet, ParametresViewSet

router = DefaultRouter()
router.register(r'tables', TableViewSet, basename='table')
router.register(r'clients', ClientViewSet, basename='client')
router.register(r'parties', PartieViewSet, basename='partie')
router.register(r'config', ParametresViewSet, basename='config')

urlpatterns = [
    path('', include(router.urls)),
]
