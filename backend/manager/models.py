from django.db import models
from django.utils import timezone


class Table(models.Model):
    """Model representing a billiard table."""
    numero = models.IntegerField(unique=True, verbose_name="Numéro de table")
    nom = models.CharField(max_length=100, verbose_name="Nom de la table")
    est_disponible = models.BooleanField(default=True, verbose_name="Disponible")
    prix_heure = models.DecimalField(max_digits=6, decimal_places=2, verbose_name="Prix par heure")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Table"
        verbose_name_plural = "Tables"
        ordering = ['numero']

    def __str__(self):
        return f"Table {self.numero} - {self.nom}"


class Client(models.Model):
    """Model representing a client."""
    nom = models.CharField(max_length=100, verbose_name="Nom")
    telephone = models.CharField(max_length=20, verbose_name="Téléphone")
    email = models.EmailField(blank=True, null=True, verbose_name="Email")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Client"
        verbose_name_plural = "Clients"

    def __str__(self):
        return self.nom


class Partie(models.Model):
    """Model representing a billiard game session."""
    table = models.ForeignKey(Table, on_delete=models.CASCADE, verbose_name="Table")
    client = models.ForeignKey(Client, on_delete=models.CASCADE, verbose_name="Client", null=True, blank=True)
    date_debut = models.DateTimeField(default=timezone.now, verbose_name="Date de début")
    date_fin = models.DateTimeField(blank=True, null=True, verbose_name="Date de fin")
    est_en_cours = models.BooleanField(default=True, verbose_name="En cours")
    prix_total = models.DecimalField(max_digits=8, decimal_places=2, default=0, verbose_name="Prix total")
    next_player = models.CharField(max_length=100, blank=True, null=True, verbose_name="Prochain joueur")
    est_paye = models.BooleanField(default=False, verbose_name="Est payé")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Partie"
        verbose_name_plural = "Parties"
        ordering = ['-date_debut']

    def __str__(self):
        return f"Partie {self.id} - {self.client.nom} - Table {self.table.numero}"

    @property
    def duree_minutes(self):
        if self.date_fin:
            return (self.date_fin - self.date_debut).total_seconds() / 60
        return 0

    def start_partie(self):
        """Start the game session."""
        self.est_en_cours = True
        self.date_debut = timezone.now()
        self.save()

    def stop_partie(self):
        """Stop the game session and calculate total price."""
        from decimal import Decimal
        if self.est_en_cours:
            self.date_fin = timezone.now()
            self.est_en_cours = False
            
            # Calculate duration in hours
            duration = self.date_fin - self.date_debut
            hours = Decimal(str(duration.total_seconds() / 3600))
            
            # Calculate total price (minimum 1 hour)
            hours = max(hours, Decimal('1'))
            self.prix_total = self.table.prix_heure * hours
            
            # Update table availability
            self.table.est_disponible = True
            self.table.save()
            
            self.save()
