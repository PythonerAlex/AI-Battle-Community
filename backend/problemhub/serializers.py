# problemhub/serializers.py

from rest_framework import serializers
from .models import Cycle, Problem, Vote
from django.contrib.auth.models import User
from .models import EvaluationCriterion  # 如果未导入


class CycleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cycle
        fields = ['id', 'title', 'start_time', 'end_time']


class EvaluationCriterionSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    likes_count = serializers.SerializerMethodField()
    liked_by_me = serializers.SerializerMethodField()

    class Meta:
        model = EvaluationCriterion
        fields = [
            'id', 'problem', 'author', 'author_username', 'content',
            'created_at', 'likes_count', 'liked_by_me'
        ]
        read_only_fields = ['author', 'created_at', 'likes_count', 'liked_by_me']
        extra_kwargs = {
            'problem': {'required': False}
        }

    def get_likes_count(self, obj):
        return obj.likes.count()


    def get_liked_by_me(self, obj):
        request = self.context.get('request')
        print("LIKED_BY_ME USER =", request.user if request else "NO REQUEST")
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False



class ProblemSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField()  # 返回用户名而不是ID
    votes = serializers.SerializerMethodField()
    cycle = CycleSerializer(read_only=True)  # ✅ 用嵌套方式返回轮次信息
    evaluationSuggestions = EvaluationCriterionSerializer(source='criteria', many=True, read_only=True)
    class Meta:
        model = Problem
        #fields = ['id', 'title', 'description', 'tags', 'cycle', 'author', 'created_at', 'votes']
        fields = '__all__'
        read_only_fields = ['id', 'author', 'cycle', 'created_at']
    def get_votes(self, obj):
        return obj.votes.count()


class VoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vote
        fields = ['id', 'user', 'problem', 'created_at']


# 可选：用于展示用户（如果前端需要）
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']


from .models import EvaluationCriterion, CriterionLike


