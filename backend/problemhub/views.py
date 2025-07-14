# problemhub/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.utils import timezone
from .models import Cycle, Problem, Vote
from .serializers import CycleSerializer, ProblemSerializer, VoteSerializer
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count


class CycleListView(APIView):
    def get(self, request):
        cycles = Cycle.objects.all().order_by('-start_time')
        serializer = CycleSerializer(cycles, many=True)
        return Response(serializer.data)


class CurrentCycleProblemView(APIView):
    def get(self, request):
        now = timezone.now()
        try:
            cycle = Cycle.objects.get(start_time__lte=now, end_time__gte=now)
        except Cycle.DoesNotExist:
            return Response({"detail": "No active cycle."}, status=status.HTTP_404_NOT_FOUND)

        problems = Problem.objects.filter(cycle=cycle).annotate(vote_count=Count('votes'))
        serializer = ProblemSerializer(problems, many=True)
        return Response({
            "cycle": CycleSerializer(cycle).data,
            "problems": serializer.data,
        })


class SubmitProblemView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        now = timezone.now()
        try:
            cycle = Cycle.objects.get(start_time__lte=now, end_time__gte=now)
        except Cycle.DoesNotExist:
            return Response({"detail": "No active cycle to submit problem."}, status=status.HTTP_400_BAD_REQUEST)

        data = request.data.copy()
        serializer = ProblemSerializer(data=data)

        if serializer.is_valid():
            serializer.save(author=request.user, cycle=cycle)  # ✅ 显式指定
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VoteProblemView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, problem_id):
        try:
            problem = Problem.objects.get(pk=problem_id)
        except Problem.DoesNotExist:
            return Response({"detail": "Problem not found."}, status=status.HTTP_404_NOT_FOUND)

        # 防止重复投票
        if Vote.objects.filter(user=request.user, problem=problem).exists():
            return Response({"detail": "You already voted for this problem."}, status=status.HTTP_400_BAD_REQUEST)

        vote = Vote(user=request.user, problem=problem)
        vote.save()
        return Response({"detail": "Vote recorded."}, status=status.HTTP_201_CREATED)


class CancelVoteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, problem_id):
        try:
            problem = Problem.objects.get(pk=problem_id)
        except Problem.DoesNotExist:
            return Response({"detail": "Problem not found."}, status=status.HTTP_404_NOT_FOUND)

        try:
            vote = Vote.objects.get(user=request.user, problem=problem)
            vote.delete()
            return Response({"detail": "Vote cancelled."}, status=status.HTTP_200_OK)
        except Vote.DoesNotExist:
            return Response({"detail": "No vote found to cancel."}, status=status.HTTP_400_BAD_REQUEST)


class AllProblemsView(APIView):
    """
    返回所有轮次的所有问题，用于展示历史记录和 winner 提取。
    """
    def get(self, request):
        problems = Problem.objects.all().annotate(vote_count=Count('votes')).order_by('-cycle__start_time', '-id')
        serializer = ProblemSerializer(problems, many=True)
        return Response(serializer.data)

class VotedProblemIdsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        voted_problem_ids = Vote.objects.filter(user=user).values_list('problem_id', flat=True)
        return Response(list(voted_problem_ids))
    

class ProposalDetailView(APIView):
    def get(self, request, problem_id):
        try:
            problem = Problem.objects.get(pk=problem_id)
        except Problem.DoesNotExist:
            return Response({"detail": "Problem not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = ProblemSerializer(problem)
        return Response(serializer.data)
    
    def delete(self, request, problem_id):
        try:
            problem = Problem.objects.get(pk=problem_id)
        except Problem.DoesNotExist:
            return Response({"detail": "Problem not found."}, status=status.HTTP_404_NOT_FOUND)

        if problem.author != request.user:
            return Response({"detail": "You do not have permission to delete this proposal."},
                            status=status.HTTP_403_FORBIDDEN)

        problem.delete()
        return Response({"detail": "Proposal deleted successfully."}, status=status.HTTP_204_NO_CONTENT)