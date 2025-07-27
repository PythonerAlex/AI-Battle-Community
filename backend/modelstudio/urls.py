# modelstudio/urls.py
from django.urls import path
from .views import UploadModelView

from .views import UploadModelView, MyModelsView, DeleteModelView, TogglePublicView

urlpatterns = [
    path('upload/', UploadModelView.as_view(), name='upload-model'),   
    path('mine/', MyModelsView.as_view(), name='my-models'),
    path('<int:pk>/', DeleteModelView.as_view(), name='delete-model'),
    path('<int:pk>/toggle-public/', TogglePublicView.as_view(), name='toggle-public'),

]