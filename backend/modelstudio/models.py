# modelstudio/models.py

from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()
class Dataset(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to='datasets/')
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    is_public = models.BooleanField(default=False)
    
    def __str__(self):
        return self.name
class MLModel(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='models')
    problem = models.ForeignKey('problemhub.Problem', on_delete=models.CASCADE, related_name='models')

    name = models.CharField(max_length=255) 
    model_file = models.FileField(upload_to='models/')  # 可迁移至 MinIO
    is_public = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    # 可选缓存字段
    task_title = models.CharField(max_length=255, blank=True)

    train_dataset = models.ForeignKey(
        Dataset, null=True, blank=True, on_delete=models.SET_NULL, related_name='used_for_training'
    )
    test_dataset = models.ForeignKey(
        Dataset, null=True, blank=True, on_delete=models.SET_NULL, related_name='used_for_testing'
    )

    def __str__(self):
        return f'{self.name} (by {self.owner.username})'


# modelstudio/models.py（继续追加）

class ModelMetric(models.Model):
    model = models.ForeignKey(MLModel, on_delete=models.CASCADE, related_name='metrics')
    name = models.CharField(max_length=100)  # 指标名，如 'accuracy', 'f1'
    value = models.FloatField()

    def __str__(self):
        return f'{self.name}: {self.value:.4f}'



