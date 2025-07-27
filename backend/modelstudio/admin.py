
# Register your models here.
from django.contrib import admin
from .models import MLModel, ModelMetric,Dataset

admin.site.register(MLModel)
admin.site.register(ModelMetric)
admin.site.register(Dataset)