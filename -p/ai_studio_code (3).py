from django.db import models
from django.utils import timezone

class Client(models.Model):
    nom = models.CharField(max_length=100, unique=True)
    telephone = models.CharField(max_length=20, blank=True)
    date_creation = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nom

class Table(models.Model):
    nom = models.CharField(max_length=50) # "Billard A"
    est_occupee = models.BooleanField(default=False)
    def __str__(self): return self.nom

class GameSession(models.Model):
    table = models.ForeignKey(Table, on_delete=models.CASCADE)
    # On lie la session à un client spécifique
    loser = models.ForeignKey(Client, on_delete=models.SET_NULL, null=True, blank=True)
    
    debut = models.DateTimeField(default=timezone.now)
    fin = models.DateTimeField(null=True, blank=True)
    temps_de_jeu = models.CharField(max_length=50, blank=True) # Ex: "45 min"
    prix = models.FloatField(default=0)
    
    # Statut de paiement (OUI/NON)
    est_paye = models.BooleanField(default=False) 

    def calculer_fin(self, client_obj):
        self.fin = timezone.now()
        self.loser = client_obj
        diff = self.fin - self.debut
        minutes = diff.total_seconds() / 60
        self.temps_de_jeu = f"{int(minutes)} min"
        
        # Ta formule
        if (minutes * 150) <= 1500:
            self.prix = round(minutes * 150)
        else:
            self.prix = round(1500 + (minutes - 10) * 135)
        self.save()