# evaluation/urls.py

from django.urls import path
#from .views import run_evaluation
from .views import upload_model,upload_test_file                        

urlpatterns = [
    # 先写具体的上传接口 ↓↓↓ （一定放在最前面）
    path('upload_model/', upload_model, name='upload_model'),
    path('upload_test/', upload_test_file),  # ✅ 新增行
    #path("<str:task_type>/", run_evaluation),
    
    
]
    