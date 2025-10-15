# modelstudio/urls.py
from django.urls import path
from .views import UploadModelView, MyModelsView, DeleteModelView,TogglePublicView,DatasetUploadView, MyDatasetsView,DatasetDetailView,ToggleDatasetPublicView,AvailableMetricsView,MetricCategoryListView,ModelMetricListCreateView, MyModelDetailView
from .views import (
    ModelGalleryView,
    ModelCommentListCreateView,
    ModelCommentDeleteView,
    PublishModelView
)

urlpatterns = [
    path('upload/', UploadModelView.as_view(), name='upload-model'),   
    path('mine/', MyModelsView.as_view(), name='my-models'),
    path('mine/<int:pk>/', MyModelDetailView.as_view(), name='my-model-detail'),
    path('<int:pk>/', DeleteModelView.as_view(), name='delete-model'),
    path('<int:pk>/toggle-public/', TogglePublicView.as_view(), name='toggle-public'),

    path('available-metrics/', AvailableMetricsView.as_view(), name='available-metrics'),
    path('metric-categories/', MetricCategoryListView.as_view(), name='metric-category'),
    path('model-metrics/', ModelMetricListCreateView.as_view(), name='model-metric'),
    # ✅ Dataset endpoints
    path('datasets/upload/', DatasetUploadView.as_view(), name='upload-dataset'),
    path('datasets/', MyDatasetsView.as_view(), name='my-datasets'),
    path('datasets/<int:pk>/', DatasetDetailView.as_view(), name='dataset-detail'),
    path('datasets/<int:pk>/toggle-public/', ToggleDatasetPublicView.as_view(), name='toggle-dataset-public'),

    path('gallery/<int:problem_id>/', ModelGalleryView.as_view(), name='model-gallery'),

    path('<int:model_id>/comments/', ModelCommentListCreateView.as_view(), name='model-comments'),
    path('comments/<int:pk>/', ModelCommentDeleteView.as_view(), name='model-comment-delete'),

    path('<int:pk>/publish/', PublishModelView.as_view(), name='publish-model'),
]   

