from rest_framework import serializers
from .models import Table, Client, Partie, Parametres


class ParametresSerializer(serializers.ModelSerializer):
    """Serializer for Parametres model."""
    class Meta:
        model = Parametres
        fields = ['id', 'nom_salle', 'tarif_base', 'tarif_reduit', 'seuil_prix', 'devise', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class TableSerializer(serializers.ModelSerializer):
    """Serializer for Table model."""
    class Meta:
        model = Table
        fields = ['id', 'numero', 'nom', 'est_disponible', 'prix_heure', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ClientSerializer(serializers.ModelSerializer):
    """Serializer for Client model."""
    class Meta:
        model = Client
        fields = ['id', 'nom', 'telephone', 'email', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class PartieSerializer(serializers.ModelSerializer):
    """Serializer for Partie model."""
    table_nom = serializers.ReadOnlyField(source='table.nom')
    client_nom = serializers.ReadOnlyField(source='client.nom', allow_null=True)
    duree = serializers.SerializerMethodField()

    class Meta:
        model = Partie
        fields = ['id', 'table', 'table_nom', 'date_debut', 'date_fin', 'prix', 
                  'client', 'client_nom', 'est_en_cours', 'est_paye', 'next_player', 'duree',
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'date_debut', 'created_at', 'updated_at']

    def get_duree(self, obj):
        """Calculate the duration of the partie."""
        if obj.est_en_cours:
            from django.utils import timezone
            duration = timezone.now() - obj.date_debut
        elif obj.date_fin:
            duration = obj.date_fin - obj.date_debut
        else:
            return "0min"
        
        total_seconds = duration.total_seconds()
        hours = int(total_seconds // 3600)
        minutes = int((total_seconds % 3600) // 60)
        return f"{hours}h {minutes}min"
