from django.urls import path
from .views import CurrentProblemView, BattleView

urlpatterns = [
    path("current-problem/", CurrentProblemView.as_view()),
    path("battle/", BattleView.as_view()),
]
