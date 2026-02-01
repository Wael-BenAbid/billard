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


class Parametres(models.Model):
    """Configuration globale de l'application."""
    nom_salle = models.CharField(max_length=100, default="Ma Salle de Billard")
    tarif_base = models.FloatField(default=150.0)    # 150 millimes/min
    tarif_reduit = models.FloatField(default=135.0)  # 135 millimes/min après seuil
    seuil_prix = models.FloatField(default=1500.0)   # Seuil de changement
    devise = models.CharField(max_length=10, default="DT")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Paramètres"
        verbose_name_plural = "Paramètres"

    def __str__(self):
        return "Configuration Générale"


class Client(models.Model):
    """Model representing a client."""
    nom = models.CharField(max_length=100, verbose_name="Nom")
    telephone = models.CharField(max_length=20, verbose_name="Téléphone", blank=True, default="")
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
    table = models.ForeignKey(Table, on_delete=models.CASCADE, related_name='parties', verbose_name="Table")
    client = models.ForeignKey(Client, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Client")
    date_debut = models.DateTimeField(default=timezone.now, verbose_name="Date de début")
    date_fin = models.DateTimeField(null=True, blank=True, verbose_name="Date de fin")
    est_en_cours = models.BooleanField(default=True, verbose_name="En cours")
    prix = models.FloatField(default=0.0, verbose_name="Prix")
    est_paye = models.BooleanField(default=False, verbose_name="Est payé")
    next_player = models.CharField(max_length=100, blank=True, null=True, verbose_name="Prochain joueur")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Partie"
        verbose_name_plural = "Parties"
        ordering = ['-date_debut']

    def __str__(self):
        client_name = self.client.nom if self.client else "Pas de client"
        return f"Partie {self.id} - {client_name} - Table {self.table.numero}"

    @property
    def duree_minutes(self):
        if self.date_fin:
            return (self.date_fin - self.date_debut).total_seconds() / 60
        return 0

    def calculer_prix(self):
        """Calcule le prix selon la nouvelle formule.
        0-15 min: 150 mil/min
        Après 15 min: 135 mil/min
        Min 1000 si prix < 1000
        Fixe 1500 si prix entre 1000 et 1500
        """
        if self.date_fin and self.date_debut:
            diff = self.date_fin - self.date_debut
            minutes = diff.total_seconds() / 60
            
            # Calcul de base
            if minutes <= 15:
                prix_brut = minutes * 150
            else:
                prix_brut = (15 * 150) + ((minutes - 15) * 135)
            
            # Application des paliers
            if prix_brut < 1000:
                self.prix = 1000
            elif 1000 <= prix_brut <= 1500:
                self.prix = 1500
            else:
                self.prix = round(prix_brut)
            
            self.save()

    def stop_partie(self, loser_name=None):
        """Stop the game session and calculate total price."""
        if self.est_en_cours:
            self.date_fin = timezone.now()
            self.est_en_cours = False
            
            # Calcul du prix selon la formule
            self.calculer_prix()
            
            # Update table availability
            self.table.est_disponible = True
            self.table.save()
            
            # Create client if loser_name provided
            if loser_name:
                client, created = Client.objects.get_or_create(nom=loser_name)
                self.client = client
            
            self.save()
