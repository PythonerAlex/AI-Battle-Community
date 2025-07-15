# problemhub/urls.py

from django.urls import path
from .views import (
    CycleListView,
    CurrentCycleProblemView,
    SubmitProblemView,
    VoteProblemView,
    VotedProblemIdsView,
    CancelVoteView,
    AllProblemsView,
    ProposalDetailView,
    EvaluationCriterionListCreateView, 
    CriterionLikeView,
)

urlpatterns = [
    path('cycles/', CycleListView.as_view(), name='cycle-list'),
    path('current/', CurrentCycleProblemView.as_view(), name='current-cycle-problems'),
    path('submit/', SubmitProblemView.as_view(), name='submit-problem'),
    path('vote/<int:problem_id>/', VoteProblemView.as_view(), name='vote-problem'),
    path('unvote/<int:problem_id>/', CancelVoteView.as_view(), name='cancel-vote'),
    path('all-problems/', AllProblemsView.as_view(), name='all-problems'),
    path('voted-ids/', VotedProblemIdsView.as_view(), name='voted-ids'),
    path('proposal/<int:problem_id>/', ProposalDetailView.as_view()),
    path('proposal/<int:problem_id>/criteria/', EvaluationCriterionListCreateView.as_view(), name='proposal-criteria'),
    path('criteria/<int:criterion_id>/like/', CriterionLikeView.as_view(), name='criterion-like'),
    

]
