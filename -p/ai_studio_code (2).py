class GameSession(models.Model):
    # ... champs précédents ...
    next_player = models.CharField(max_length=100, blank=True, null=True)
    est_paye = models.BooleanField(default=False)

    @property
    def duree_minutes(self):
        if self.fin:
            return (self.fin - self.debut).total_seconds() / 60
        return 0