from django.db import models
from django.contrib.auth.models import User

class Cycle(models.Model):
    title = models.CharField(max_length=200)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()

    def __str__(self):
        return self.title


class Problem(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    tags = models.JSONField(default=list)
    cycle = models.ForeignKey(Cycle, on_delete=models.CASCADE, related_name='problems')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Vote(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE, related_name='votes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'problem')
