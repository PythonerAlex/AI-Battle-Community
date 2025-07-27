# problemhub/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.utils import timezone
from .models import Cycle, Problem, Vote
from .serializers import CycleSerializer, ProblemSerializer, VoteSerializer
from .models import EvaluationCriterion, CriterionLike
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

class WinnerByCycleView(APIView):
    def get(self, request):
        index = request.query_params.get('index', None)
        all_cycles = list(Cycle.objects.order_by('start_time', 'id'))

        if index is None:
            return Response({'detail': 'index is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            index = int(index)
            if index < 0 or index >= len(all_cycles):
                return Response({'detail': 'Invalid index.'}, status=status.HTTP_400_BAD_REQUEST)
        except ValueError:
            return Response({'detail': 'Index must be an integer.'}, status=status.HTTP_400_BAD_REQUEST)

        cycle = all_cycles[index]
        top_problem = (
            Problem.objects
            .filter(cycle=cycle)
            .annotate(vote_count=Count('votes'))
            .order_by('-vote_count', '-created_at')  # tie-breaker: newer wins
            .first()
        )

        if not top_problem:
            return Response({'detail': 'No proposals found in this cycle.'}, status=status.HTTP_404_NOT_FOUND)

        return Response({
            'cycle': CycleSerializer(cycle).data,
            'problem': ProblemSerializer(top_problem).data,
            'votes': top_problem.vote_count,
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

        serializer = ProblemSerializer(problem, context={'request': request})
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
    


from .models import Problem, EvaluationCriterion, CriterionLike
from .serializers import EvaluationCriterionSerializer
from django.shortcuts import get_object_or_404

class EvaluationCriterionListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request, problem_id):
        problem = get_object_or_404(Problem, id=problem_id)
        criteria = EvaluationCriterion.objects.filter(problem=problem)
        serializer = EvaluationCriterionSerializer(criteria, many=True)
        return Response(serializer.data)

    def post(self, request, problem_id):
        problem = get_object_or_404(Problem, id=problem_id)
        serializer = EvaluationCriterionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(problem=problem, author=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CriterionLikeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, criterion_id):
        criterion = get_object_or_404(EvaluationCriterion, id=criterion_id)
        already_liked = CriterionLike.objects.filter(user=request.user, criterion=criterion).exists()
        if already_liked:
            return Response({'detail': 'Already liked'}, status=status.HTTP_400_BAD_REQUEST)

        CriterionLike.objects.create(user=request.user, criterion=criterion)
        return Response({'detail': 'Liked successfully'}, status=status.HTTP_201_CREATED)

class CriterionUnlikeView(APIView):
    def post(self, request, criterion_id):
        try:
            criterion = EvaluationCriterion.objects.get(id=criterion_id)
        except EvaluationCriterion.DoesNotExist:
            return Response({"detail": "Criterion not found."}, status=status.HTTP_404_NOT_FOUND)

        CriterionLike.objects.filter(user=request.user, criterion=criterion).delete()
        return Response({"detail": "Unliked successfully."}, status=status.HTTP_200_OK)



class CriterionDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            criterion = EvaluationCriterion.objects.get(pk=pk)
        except EvaluationCriterion.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        if criterion.author != request.user:
            return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

        criterion.delete()
        return Response({"detail": "Deleted."}, status=status.HTTP_204_NO_CONTENT)
    
class CriterionUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        try:
            criterion = EvaluationCriterion.objects.get(pk=pk)
        except EvaluationCriterion.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        if criterion.author != request.user:
            return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

        content = request.data.get('content', '').strip()
        if not content:
            return Response({"detail": "Content cannot be empty."}, status=status.HTTP_400_BAD_REQUEST)

        criterion.content = content
        criterion.save()
        return Response({
            "id": criterion.id,
            "content": criterion.content,
            "likes_count": criterion.likes.count(),
            "liked_by_me": True,  # or recalculate if needed
            "author_username": criterion.author.username,
            "problem": criterion.problem.id,
        }, status=status.HTTP_200_OK)
# vie
import json
from openai import OpenAI
from django.conf import settings
from .utils import generate_prompt_from_proposal

class EvaluateProposalView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        proposal = request.data
        prompt = generate_prompt_from_proposal(proposal)

        try:
            client = OpenAI(api_key=settings.OPENAI_API_KEY)
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "你是一个AI问题审核官，请根据评分标准评估用户提交的AI项目提案，并给出是否通过及理由。"},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3
            )
            result = response.choices[0].message.content
            return Response({"evaluation": result})

        except Exception as e:
            return Response({"error": f"OpenAI API call failed: {str(e)}"}, status=502)


from django.utils.timezone import now
from .models import Cycle

class ActiveCycleContextView(APIView):
    """
    提供当前系统时间下的全局 cycle index 和状态信息
    - cycle_index: 当前正在进行的 cycle 的 index（按 start_time 排序）
    - status: 'active', 'between_cycles', 'before_all', 'after_all'
    """
    permission_classes = [IsAuthenticated]
    def get(self, request):
        current_time = now()
        all_cycles = list(Cycle.objects.order_by('start_time', 'id'))

        if not all_cycles:
            return Response({'detail': 'No cycles defined.'}, status=status.HTTP_404_NOT_FOUND)

        for i, cycle in enumerate(all_cycles):
            if cycle.start_time <= current_time <= cycle.end_time:
                return Response({'cycle_index': i, 'status': 'active'})

        # now 在两个 cycle 之间
        for i in range(1, len(all_cycles)):
            prev_cycle = all_cycles[i - 1]
            next_cycle = all_cycles[i]
            if prev_cycle.end_time < current_time < next_cycle.start_time:
                return Response({'cycle_index': i - 1, 'status': 'between_cycles'})

        # now 在所有 cycle 开始之前
        if current_time < all_cycles[0].start_time:
            return Response({'cycle_index': -1, 'status': 'before_all'})

        # now 在所有 cycle 结束之后
        if current_time > all_cycles[-1].end_time:
            return Response({'cycle_index': len(all_cycles) - 1, 'status': 'after_all'})

        return Response({'detail': 'Unexpected cycle state.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)