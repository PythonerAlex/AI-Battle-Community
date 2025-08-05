# modelstudio/serializers.py

from rest_framework import serializers
from .models import MLModel, ModelMetric,Dataset,MetricCategory, MetricDefinition

#class ModelMetricSerializer(serializers.ModelSerializer):
 #   class Meta:
  #      model = ModelMetric
  #      fields = ['name', 'value']

class ModelMetricSerializer(serializers.ModelSerializer):
    metric_name = serializers.CharField(source='metric.name', read_only=True)

    class Meta:
        model = ModelMetric
        #fields = ['id', 'ml_model', 'metric', 'metric_name', 'value']
        fields = ["metric_name", "value"]
class MetricDefinitionSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = MetricDefinition
        fields = ['id', 'name', 'display_name', 'description', 'formula', 'higher_is_better', 'category_name']


class MetricCategorySerializer(serializers.ModelSerializer):
    metrics = MetricDefinitionSerializer(many=True, read_only=True)

    class Meta:
        model = MetricCategory
        fields = ['id', 'name', 'description', 'metrics']



class MLModelSerializer(serializers.ModelSerializer):
    metrics = ModelMetricSerializer(many=True, read_only=True)
    owner = serializers.StringRelatedField(read_only=True)
    problem = serializers.PrimaryKeyRelatedField(read_only=True)
    dataset = serializers.PrimaryKeyRelatedField(queryset=Dataset.objects.all(), allow_null=True, required=False)
    dataset_name = serializers.CharField(source="dataset.name", read_only=True)

        # ✅ 新增字段：从外键 Problem 获取标题
    problem_title = serializers.CharField(source="problem.title", read_only=True)
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
            'problem_title',    # 外键的 title
            'dataset', 
            'dataset_name',
            'metrics',
        ]
    def get_metrics(self, obj):
        """
        返回 {metric_name: value} 形式，方便前端直接使用
        """
        return {m.metric.name: m.value for m in obj.metrics.all()}
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
