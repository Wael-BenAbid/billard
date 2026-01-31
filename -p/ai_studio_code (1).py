from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count, Avg
from django.db.models.functions import ExtractHour
from .models import GameSession, Table

class GameViewSet(viewsets.ModelViewSet):
    queryset = GameSession.objects.all().order_by('-debut')
    
    # FILTRES : On surcharge la méthode pour filtrer par nom, date ou paiement
    def get_queryset(self):
        qs = super().get_queryset()
        nom = self.request.query_params.get('nom')
        paye = self.request.query_params.get('paye')
        
        if nom:
            qs = qs.filter(nom_client__icontains=nom) | qs.filter(prenom_client__icontains=nom)
        if paye:
            qs = qs.filter(est_paye=(paye.lower() == 'true'))
        return qs

    # STATISTIQUES : /api/games/get_stats/
    @action(detail=False, methods=['get'])
    def get_stats(self, request):
        total_argent = GameSession.objects.aggregate(Sum('prix'))['prix__sum'] or 0
        total_parties = GameSession.objects.count()
        
        # Calcul du pic d'argent (Heure la plus rentable)
        pic = GameSession.objects.annotate(heure=ExtractHour('debut'))\
            .values('heure').annotate(total=Sum('prix')).order_by('-total').first()

        return Response({
            "total_money": total_argent,
            "total_games": total_parties,
            "peak_hour": pic['heure'] if pic else 0,
            "unpaid_count": GameSession.objects.filter(est_paye=False).count()
        })

    @action(detail=True, methods=['post'])
    def mark_as_paid(self, request, pk=None):
        game = self.get_object()
        game.est_paye = True
        game.save()
        return Response({'status': 'payé'})