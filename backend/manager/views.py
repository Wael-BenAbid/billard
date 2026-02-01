from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum
from django.db.models.functions import ExtractHour
from django.utils import timezone
from .models import Table, Client, Partie, Parametres
from .serializers import TableSerializer, ClientSerializer, PartieSerializer, ParametresSerializer


class ParametresViewSet(viewsets.ModelViewSet):
    """ViewSet for managing application parameters."""
    queryset = Parametres.objects.all()
    serializer_class = ParametresSerializer
    permission_classes = [permissions.AllowAny]

    def list(self, request):
        """Get or create the default configuration."""
        config, created = Parametres.objects.get_or_create(id=1)
        serializer = self.get_serializer(config)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        """Update configuration (upsert)."""
        config, created = Parametres.objects.get_or_create(id=1)
        serializer = self.get_serializer(config, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


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

    def create(self, request, *args, **kwargs):
        """Create a new game session and start it."""
        table_id = request.data.get('table')
        
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
        
        # Create the partie
        partie = Partie.objects.create(
            table=table,
            client=None,
            date_debut=timezone.now(),
            est_en_cours=True,
            prix=0
        )
        
        # Mark table as unavailable
        table.est_disponible = False
        table.save()
        
        return Response(PartieSerializer(partie).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def stop(self, request, pk=None):
        """Stop a game session and calculate total price."""
        partie = self.get_object()
        if not partie.est_en_cours:
            return Response(
                {'error': 'La partie nest pas en cours'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get loser_name from request, create client if needed
        loser_name = request.data.get('loser_name', '')
        partie.stop_partie(loser_name)
        return Response(PartieSerializer(partie).data)

    @action(detail=True, methods=['post'])
    def pay(self, request, pk=None):
        """Mark a game session as paid."""
        partie = self.get_object()
        partie.est_paye = True
        partie.save()
        return Response(PartieSerializer(partie).data)

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
        total_argent = Partie.objects.aggregate(Sum('prix'))['prix__sum'] or 0
        total_parties = Partie.objects.count()
        
        # Calculate peak hour (most profitable)
        pic = Partie.objects.annotate(heure=ExtractHour('date_debut'))\
            .values('heure').annotate(total=Sum('prix')).order_by('-total').first()
        
        # Today's stats
        today = timezone.now().date()
        today_parties = Partie.objects.filter(date_debut__date=today)
        today_revenue = sum(partie.prix for partie in today_parties)
        
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
