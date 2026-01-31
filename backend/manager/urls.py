from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TableViewSet, ClientViewSet, PartieViewSet, DashboardStatsView

router = DefaultRouter()
router.register(r'tables', TableViewSet, basename='table')
router.register(r'clients', ClientViewSet, basename='client')
router.register(r'parties', PartieViewSet, basename='partie')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
]
