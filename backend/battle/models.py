from django.db import models

class Problem(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)  # Only one active problem at a time

    def __str__(self):
        return self.title
