from django.db import models
from django.utils import timezone

class Table(models.Model):
    nom = models.CharField(max_length=50) # "Table A", "Table B"
    est_occupee = models.BooleanField(default=False)
    def __str__(self): return self.nom

class GameSession(models.Model):
    table = models.ForeignKey(Table, on_delete=models.CASCADE)
    nom_client = models.CharField(max_length=100, blank=True)
    prenom_client = models.CharField(max_length=100, blank=True)
    next_player = models.CharField(max_length=100, blank=True) # Champ Next Player
    
    debut = models.DateTimeField(default=timezone.now)
    fin = models.DateTimeField(null=True, blank=True)
    prix = models.FloatField(default=0)
    
    est_paye = models.BooleanField(default=False) # Gestion des dettes

    def calculer_prix(self):
        if self.fin:
            duree = (self.fin - self.debut).total_seconds() / 60
            if (duree * 150) <= 1500:
                self.prix = round(duree * 150)
            else:
                self.prix = round(1500 + (duree - 10) * 135)
            self.save()