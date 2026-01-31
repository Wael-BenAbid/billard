from django.db.models import Sum, Avg, Max
from django.db.models.functions import ExtractHour

class GameViewSet(viewsets.ModelViewSet):
    queryset = GameSession.objects.all()
    
    # Endpoint pour les statistiques : /api/games/stats/
    @action(detail=False, methods=['get'])
    def stats(self, request):
        # Filtres de date (optionnels)
        start_date = request.query_params.get('start')
        end_date = request.query_params.get('end')
        
        qs = self.queryset
        if start_date and end_date:
            qs = qs.filter(debut__range=[start_date, end_date])

        stats_data = {
            "total_revenue": qs.aggregate(Sum('prix'))['prix__sum'] or 0,
            "total_games": qs.count(),
            "unpaid_count": qs.filter(est_paye=False).count(),
            "avg_duration": qs.aggregate(Avg('prix'))['prix__avg'] or 0, # Approximation par le prix
            "peak_hour": qs.annotate(hour=ExtractHour('debut')).values('hour').annotate(count=models.Count('id')).order_by('-count').first()
        }
        return Response(stats_data)

    # Action pour marquer comme payé rapidement
    @action(detail=True, methods=['post'])
    def mark_as_paid(self, request, pk=None):
        session = self.get_object()
        session.est_paye = True
        session.save()
        return Response({'status': 'payé'})