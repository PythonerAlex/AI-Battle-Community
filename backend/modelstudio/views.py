# modelstudio/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from django.shortcuts import get_object_or_404


from .models import MLModel
from .serializers import MLModelSerializer
from problemhub.models import Problem  # ✅ 已有的 app

class UploadModelView(APIView):
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

        if not all([name, problem_id, file]):
            return Response({'detail': 'Missing required fields.'}, status=400)

        try:
            problem = Problem.objects.get(id=problem_id)
        except Problem.DoesNotExist:
            return Response({'detail': 'Problem not found.'}, status=404)

        model = MLModel.objects.create(
            owner=user,
            name=name,
            problem=problem,
            model_file=file,
            is_public=is_public,
            task_title=problem.title
        )

        serializer = MLModelSerializer(model)
        return Response(serializer.data, status=201)


class MyModelsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        models = MLModel.objects.filter(owner=user).order_by('-created_at')
        serializer = MLModelSerializer(models, many=True)
        return Response(serializer.data)
    

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
