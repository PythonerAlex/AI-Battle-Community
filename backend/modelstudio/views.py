# modelstudio/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
import json

from .models import MLModel,ModelMetric, MetricCategory,MetricDefinition
from .serializers import MLModelSerializer,MetricCategorySerializer, ModelMetricSerializer
from problemhub.models import Problem  # ✅ 已有的 app

'''class UploadModelView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        user = request.user
        data = request.data

        name = data.get('name')
        #is_public = data.get('is_public', False)
        is_public = data.get('is_public', 'false').lower() == 'true'  # 强制转为 bool
        problem_id = data.get('problem_id')
        file = data.get('model_file')
        dataset_id = data.get('dataset_id') 

        metrics_raw = data.get('metrics')  # JSON string

        if not all([name, problem_id, file]):
            return Response({'detail': 'Missing required fields.'}, status=400)

        try:
            problem = Problem.objects.get(id=problem_id)
        except Problem.DoesNotExist:
            return Response({'detail': 'Problem not found.'}, status=404)

        dataset = None
        if dataset_id:
            try:
                dataset = Dataset.objects.get(id=dataset_id, owner=user)
            except Dataset.DoesNotExist:
                return Response({'detail': 'Dataset not found or not owned by user.'}, status=404)

        model = MLModel.objects.create(
            owner=user,
            name=name,
            problem=problem,
            model_file=file,
            is_public=is_public,
            task_title=problem.title,
            dataset=dataset,
            #metrics=metrics,
        )
        if metrics_raw:
            try:
                metrics_dict = json.loads(metrics_raw)
                for key, val in metrics_dict.items():
                    if val is not None:
                        ModelMetric.objects.create(model=model, name=key, value=val)
            except json.JSONDecodeError:
                return Response({'detail': 'Invalid metrics format.'}, status=400)
        serializer = MLModelSerializer(model)
        return Response(serializer.data, status=201)
'''
'''class UploadModelView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        data = request.data

        name = data.get('name')
        problem_id = data.get('problem_id')
        model_file = data.get('model_file')
        dataset_id = data.get('dataset_id')

        if not all([name, problem_id, model_file]):
            return Response({'detail': 'Missing required fields.'}, status=400)

        # 1️⃣ 创建 MLModel
        ml_model = MLModel.objects.create(
            owner=user,
            name=name,
            model_file=model_file,
            problem_id=problem_id,
            is_public=str(data.get('is_public')).lower() == 'true',
            dataset_id=dataset_id or None
        )

        # 2️⃣ 处理 metrics
        metrics_raw = data.get('metrics')
        if metrics_raw:
            try:
                metrics_dict = json.loads(metrics_raw)
            except json.JSONDecodeError:
                return Response({'detail': 'Invalid metrics JSON.'}, status=400)

            for metric_name, value in metrics_dict.items():
                try:
                    metric_def = MetricDefinition.objects.get(name=metric_name)
                except MetricDefinition.DoesNotExist:
                    continue  # 忽略未定义的指标

                ModelMetric.objects.create(
                    ml_model=ml_model,
                    metric=metric_def,
                    value=value
                )

        return Response({
            'id': ml_model.id,
            'name': ml_model.name,
            'metrics_count': ml_model.metrics.count()
        }, status=status.HTTP_201_CREATED)
'''
class UploadModelView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        user = request.user
        data = request.data

        name = data.get('name')
        problem_id = data.get('problem_id')
        model_file = data.get('model_file')
        dataset_id = data.get('dataset_id')

        if not all([name, problem_id, model_file]):
            return Response({'detail': 'Missing required fields.'}, status=400)

        # ✅ 获取 Problem
        try:
            problem = Problem.objects.get(id=problem_id)
        except Problem.DoesNotExist:
            return Response({'detail': 'Problem not found.'}, status=404)

        # ✅ 获取 Dataset（可选）
        dataset = None
        if dataset_id:
            try:
                dataset = Dataset.objects.get(id=dataset_id, owner=user)
            except Dataset.DoesNotExist:
                return Response({'detail': 'Dataset not found or not owned by user.'}, status=404)

        # ✅ 创建 MLModel
        ml_model = MLModel.objects.create(
            owner=user,
            name=name,
            model_file=model_file,
            problem=problem,
            is_public=str(data.get('is_public')).lower() == 'true',
            dataset=dataset,
            task_title=problem.title,  # 缓存任务标题
        )

        # ✅ 解析 metrics 并创建 ModelMetric
        metrics_raw = data.get('metrics')
        if metrics_raw:
            try:
                metrics_dict = json.loads(metrics_raw)
            except json.JSONDecodeError:
                return Response({'detail': 'Invalid metrics JSON.'}, status=400)

            for metric_name, value in metrics_dict.items():
                if value is None:
                    continue
                try:
                    metric_def = MetricDefinition.objects.get(name=metric_name)
                except MetricDefinition.DoesNotExist:
                    continue  # 忽略未定义的指标

                ModelMetric.objects.create(
                    ml_model=ml_model,
                    metric=metric_def,
                    value=value
                )

        # ✅ 返回完整序列化对象，包含 metrics
        serializer = MLModelSerializer(ml_model)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class MyModelsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        models = MLModel.objects.filter(owner=user).order_by('-created_at')
        serializer = MLModelSerializer(models, many=True)
        return Response(serializer.data)

class MyModelDetailView(APIView):
    """
    支持 GET / PATCH / DELETE
    """
    permission_classes = [IsAuthenticated]

    def get_object(self, user, pk):
        return get_object_or_404(MLModel, pk=pk, owner=user)

    def get(self, request, pk):
        model = self.get_object(request.user, pk)
        serializer = MLModelSerializer(model)
        return Response(serializer.data)

    def patch(self, request, pk):
        model = self.get_object(request.user, pk)
        serializer = MLModelSerializer(model, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        model = self.get_object(request.user, pk)
        model.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)    

class DeleteModelView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        model = get_object_or_404(MLModel, pk=pk, owner=request.user)
        model.delete()
        return Response({'detail': '模型已删除'}, status=status.HTTP_204_NO_CONTENT)


class TogglePublicView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        model = get_object_or_404(MLModel, pk=pk, owner=request.user)
        model.is_public = not model.is_public
        model.save()
        return Response({'is_public': model.is_public})

class AvailableMetricsView(APIView):
    permission_classes = [IsAuthenticated]  # 或根据需要限制权限

    def get(self, request):
        names = ModelMetric.objects.values_list('name', flat=True).distinct()
        return Response(sorted(names))


class MetricCategoryListView(APIView):
    """
    Returns all metric categories with their metrics (read-only).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = MetricCategory.objects.prefetch_related('metrics').all()
        serializer = MetricCategorySerializer(queryset, many=True)
        return Response(serializer.data)

class ModelMetricListCreateView(APIView):
    """
    GET: List all model metrics.
    POST: Create one or multiple model metrics.
    Supports metric_name to resolve MetricDefinition automatically.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        queryset = ModelMetric.objects.select_related('ml_model', 'metric')
        serializer = ModelMetricSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data
        # 支持单条和多条两种情况
        if isinstance(data, dict):
            data = [data]

        # 解析 metric_name -> metric_id
        processed_data = []
        for item in data:
            # metric_name 或 metric
            metric_name = item.get('metric_name') or item.get('metric')
            if not metric_name:
                return Response(
                    {"error": "Each item must have metric_name or metric"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            try:
                metric = MetricDefinition.objects.get(name=metric_name)
            except MetricDefinition.DoesNotExist:
                return Response(
                    {"error": f"Metric '{metric_name}' not found"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            processed_data.append({
                "ml_model": item.get("ml_model"),
                "metric": metric.id,
                "value": item.get("value"),
            })

        serializer = ModelMetricSerializer(data=processed_data, many=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
from rest_framework.parsers import MultiPartParser, FormParser

from .models import Dataset
from .serializers import DatasetSerializer

class DatasetUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        user = request.user
        data = request.data.copy()
        data['owner'] = user.id

        serializer = DatasetSerializer(data=data)
        if serializer.is_valid():
            serializer.save(owner=user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MyDatasetsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        datasets = Dataset.objects.filter(owner=request.user).order_by('-created_at')
        serializer = DatasetSerializer(datasets, many=True)
        return Response(serializer.data)
class DatasetDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        dataset = get_object_or_404(Dataset, pk=pk, owner=request.user)
        dataset.delete()
        return Response({'detail': 'Dataset deleted'}, status=status.HTTP_204_NO_CONTENT)
    
class ToggleDatasetPublicView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            dataset = Dataset.objects.get(pk=pk, owner=request.user)
        except Dataset.DoesNotExist:
            return Response({'detail': 'Dataset not found.'}, status=status.HTTP_404_NOT_FOUND)

        dataset.is_public = not dataset.is_public
        dataset.save()
        return Response({'is_public': dataset.is_public}, status=status.HTTP_200_OK)
