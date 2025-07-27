# modelstudio/urls.py
from django.urls import path
from .views import UploadModelView, MyModelsView, DeleteModelView, TogglePublicView,DatasetUploadView, MyDatasetsView,DatasetDetailView,ToggleDatasetPublicView

urlpatterns = [
    path('upload/', UploadModelView.as_view(), name='upload-model'),   
    path('mine/', MyModelsView.as_view(), name='my-models'),
    path('<int:pk>/', DeleteModelView.as_view(), name='delete-model'),
    path('<int:pk>/toggle-public/', TogglePublicView.as_view(), name='toggle-public'),

    # ✅ Dataset endpoints
    path('datasets/upload/', DatasetUploadView.as_view(), name='upload-dataset'),
    path('datasets/', MyDatasetsView.as_view(), name='my-datasets'),
    path('datasets/<int:pk>/', DatasetDetailView.as_view(), name='dataset-detail'),
    path('datasets/<int:pk>/toggle-public/', ToggleDatasetPublicView.as_view(), name='toggle-dataset-public'),
]   