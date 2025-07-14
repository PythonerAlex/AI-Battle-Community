from django.urls import path
#from .views import RegisterView, LoginView
from .views import RegisterView, LoginView, MeView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('login/', LoginView.as_view()),

    path('user_info/', MeView.as_view()),  # ✅ 更安全的命名   

    
    # ✅ 标准 JWT token 接口
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),     
]
