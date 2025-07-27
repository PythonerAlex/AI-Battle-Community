# modelstudio/serializers.py

from rest_framework import serializers
from .models import MLModel, ModelMetric,Dataset

class ModelMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModelMetric
        fields = ['name', 'value']


class MLModelSerializer(serializers.ModelSerializer):
    metrics = ModelMetricSerializer(many=True, read_only=True)
    owner = serializers.StringRelatedField(read_only=True)
    problem = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = MLModel
        fields = [
            'id',
            'name',
            'task_title',
            'is_public',
            'created_at',
            'model_file',
            'owner',
            'problem',
            'metrics',
        ]

class DatasetSerializer(serializers.ModelSerializer):
    owner = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Dataset
        fields = [
            'id',
            'name',
            'description',
            'file',
            'owner',
            'created_at',
            'is_public', 
        ]
        read_only_fields = ['owner', 'created_at']
