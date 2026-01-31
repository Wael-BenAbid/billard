from rest_framework import serializers
from .models import Table, Client, Partie


class TableSerializer(serializers.ModelSerializer):
    """Serializer for Table model."""
    class Meta:
        model = Table
        fields = [
            'id', 'numero', 'nom', 'est_disponible', 'prix_heure',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ClientSerializer(serializers.ModelSerializer):
    """Serializer for Client model."""
    class Meta:
        model = Client
        fields = [
            'id', 'nom', 'telephone', 'email',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PartieSerializer(serializers.ModelSerializer):
    """Serializer for Partie model."""
    table_info = TableSerializer(source='table', read_only=True)
    client_info = ClientSerializer(source='client', read_only=True)
    table_id = serializers.PrimaryKeyRelatedField(
        queryset=Table.objects.all(),
        source='table',
        write_only=True
    )
    client_id = serializers.PrimaryKeyRelatedField(
        queryset=Client.objects.all(),
        source='client',
        write_only=True
    )
    duree = serializers.SerializerMethodField()
    table_numero = serializers.SerializerMethodField()
    loser_name = serializers.SerializerMethodField()
    prix = serializers.SerializerMethodField()

    class Meta:
        model = Partie
        fields = [
            'id', 'table', 'table_info', 'table_id', 'table_numero',
            'client', 'client_info', 'client_id', 'loser_name',
            'date_debut', 'date_fin', 'est_en_cours', 'prix_total', 'prix',
            'next_player', 'est_paye', 'duree',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'date_debut', 'date_fin', 'prix_total', 'created_at', 'updated_at']

    def get_duree(self, obj):
        """Calculate the duration of the partie."""
        if obj.est_en_cours:
            from django.utils import timezone
            duration = timezone.now() - obj.date_debut
        elif obj.date_fin:
            duration = obj.date_fin - obj.date_debut
        else:
            return None
        
        total_seconds = duration.total_seconds()
        hours = int(total_seconds // 3600)
        minutes = int((total_seconds % 3600) // 60)
        return f"{hours}h {minutes}min"

    def get_table_numero(self, obj):
        """Get table numero."""
        return obj.table.numero

    def get_loser_name(self, obj):
        """Get client name (loser)."""
        return obj.client.nom

    def get_prix(self, obj):
        """Get price as number."""
        return float(obj.prix_total) if obj.prix_total else 0
