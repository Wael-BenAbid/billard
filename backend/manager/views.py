from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum, Count, Avg
from django.db.models.functions import ExtractHour
from django.utils import timezone
from .models import Table, Client, Partie
from .serializers import TableSerializer, ClientSerializer, PartieSerializer


class TableViewSet(viewsets.ModelViewSet):
    """ViewSet for managing billiard tables."""
    queryset = Table.objects.all()
    serializer_class = TableSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Table.objects.all()
        disponible = self.request.query_params.get('disponible')
        if disponible is not None:
            queryset = queryset.filter(est_disponible=disponible.lower() == 'true')
        return queryset

    @action(detail=True, methods=['post'])
    def toggle_disponibilite(self, request, pk=None):
        """Toggle table availability."""
        table = self.get_object()
        table.est_disponible = not table.est_disponible
        table.save()
        return Response(TableSerializer(table).data)


class ClientViewSet(viewsets.ModelViewSet):
    """ViewSet for managing clients."""
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Client.objects.all()
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(nom__icontains=search)
        return queryset


class PartieViewSet(viewsets.ModelViewSet):
    """ViewSet for managing game sessions."""
    queryset = Partie.objects.all().order_by('-date_debut')
    serializer_class = PartieSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = super().get_queryset()
        nom = self.request.query_params.get('nom')
        paye = self.request.query_params.get('paye')
        en_cours = self.request.query_params.get('en_cours')

        if nom:
            queryset = queryset.filter(client__nom__icontains=nom)
        if paye:
            queryset = queryset.filter(est_paye=(paye.lower() == 'true'))
        if en_cours is not None:
            queryset = queryset.filter(est_en_cours=en_cours.lower() == 'true')
        
        return queryset

    def perform_create(self, serializer):
        """Create a new game session and start it."""
        table_id = self.request.data.get('table')
        client_id = self.request.data.get('client')
        
        # Check if table is available
        try:
            table = Table.objects.get(id=table_id)
            if not table.est_disponible:
                return Response(
                    {'error': 'La table n\'est pas disponible'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Table.DoesNotExist:
            return Response(
                {'error': 'Table non trouvée'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create and start the partie
        partie = serializer.save(date_debut=timezone.now(), est_en_cours=True)
        
        # Mark table as unavailable
        table.est_disponible = False
        table.save()

    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        """Start a game session."""
        partie = self.get_object()
        if partie.est_en_cours:
            return Response(
                {'error': 'La partie est déjà en cours'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        partie.start_partie()
        return Response(PartieSerializer(partie).data)

    @action(detail=True, methods=['post'])
    def stop(self, request, pk=None):
        """Stop a game session and calculate total price."""
        partie = self.get_object()
        if not partie.est_en_cours:
            return Response(
                {'error': 'La partie nest pas en cours'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        partie.stop_partie()
        return Response(PartieSerializer(partie).data)

    @action(detail=True, methods=['post'])
    def pay(self, request, pk=None):
        """Mark a game session as paid."""
        partie = self.get_object()
        partie.est_paye = True
        partie.save()
        return Response(PartieSerializer(partie).data)

    @action(detail=True, methods=['post'])
    def set_next_player(self, request, pk=None):
        """Set the next player for a game session."""
        partie = self.get_object()
        next_player = request.data.get('next_player', '')
        partie.next_player = next_player
        partie.save()
        return Response(PartieSerializer(partie).data)

    @action(detail=True, methods=['post'])
    def mark_as_paid(self, request, pk=None):
        """Mark a game session as paid (alias for pay)."""
        return self.pay(request, pk)

    @action(detail=False, methods=['get'])
    def search_client(self, request):
        """Search clients by name for autocomplete."""
        q = request.query_params.get('q', '')
        clients = Client.objects.filter(nom__icontains=q)[:10]
        serializer = ClientSerializer(clients, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def get_stats(self, request):
        """Get dashboard statistics."""
        total_argent = Partie.objects.aggregate(Sum('prix_total'))['prix_total__sum'] or 0
        total_parties = Partie.objects.count()
        
        # Calculate peak hour (most profitable)
        pic = Partie.objects.annotate(heure=ExtractHour('date_debut'))\
            .values('heure').annotate(total=Sum('prix_total')).order_by('-total').first()
        
        # Today's stats
        today = timezone.now().date()
        today_parties = Partie.objects.filter(date_debut__date=today)
        today_revenue = sum(partie.prix_total for partie in today_parties)
        
        # Active parties
        active_parties = Partie.objects.filter(est_en_cours=True)
        
        # Available tables
        available_tables = Table.objects.filter(est_disponible=True).count()
        total_tables = Table.objects.count()
        
        return Response({
            "total_money": float(total_argent) if total_argent else 0,
            "total_games": total_parties,
            "peak_hour": pic['heure'] if pic else 0,
            "unpaid_count": Partie.objects.filter(est_paye=False).count(),
            "today_revenue": float(today_revenue),
            "today_games": today_parties.count(),
            "active_parties_count": active_parties.count(),
            "available_tables": f"{available_tables}/{total_tables}",
        })


class DashboardStatsView(APIView):
    """API endpoint for dashboard statistics."""
    def get(self, request):
        """Get dashboard statistics."""
        from django.db.models import Sum
        from django.db.models.functions import ExtractHour
        
        today = timezone.now().date()
        
        # Today's parties
        today_parties = Partie.objects.filter(date_debut__date=today)
        total_revenue_today = sum(partie.prix_total for partie in today_parties)
        
        # Total stats
        total_argent = Partie.objects.aggregate(Sum('prix_total'))['prix_total__sum'] or 0
        total_parties = Partie.objects.count()
        
        # Peak hour
        pic = Partie.objects.annotate(heure=ExtractHour('date_debut'))\
            .values('heure').annotate(total=Sum('prix_total')).order_by('-total').first()
        
        # Active parties
        active_parties = Partie.objects.filter(est_en_cours=True)
        
        # Available tables
        available_tables = Table.objects.filter(est_disponible=True).count()
        total_tables = Table.objects.count()
        
        # Total clients
        total_clients = Client.objects.count()
        
        return Response({
            'today_revenue': float(total_revenue_today),
            'today_parties_count': today_parties.count(),
            'total_revenue': float(total_argent),
            'total_games': total_parties,
            'peak_hour': pic['heure'] if pic else 0,
            'active_parties_count': active_parties.count(),
            'unpaid_count': Partie.objects.filter(est_paye=False).count(),
            'available_tables': f"{available_tables}/{total_tables}",
            'total_clients': total_clients,
            'tables_status': TableSerializer(Table.objects.all(), many=True).data,
            'active_parties': PartieSerializer(active_parties, many=True).data,
        })
