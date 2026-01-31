from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import GameSession, Client, Table

class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    
    # Recherche instantanée : /api/clients/search/?q=Mo
    @action(detail=False, methods=['get'])
    def search(self, request):
        query = request.query_params.get('q', '')
        clients = Client.objects.filter(nom__istartswith=query)[:10]
        return Response([{"id": c.id, "nom": c.nom} for c in clients])

class GameViewSet(viewsets.ModelViewSet):
    queryset = GameSession.objects.all().order_by('-debut')

    @action(detail=True, methods=['post'])
    def toggle_payment(self, request, pk=None):
        game = self.get_object()
        game.est_paye = not game.est_paye # Switch OUI/NON
        game.save()
        return Response({'status': 'success', 'paye': game.est_paye})