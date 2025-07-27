
# Register your models here.
from django.contrib import admin
from .models import MLModel, ModelMetric

admin.site.register(MLModel)
admin.site.register(ModelMetric)