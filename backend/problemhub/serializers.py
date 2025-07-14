# problemhub/serializers.py

from rest_framework import serializers
from .models import Cycle, Problem, Vote
from django.contrib.auth.models import User


class CycleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cycle
        fields = ['id', 'title', 'start_time', 'end_time']


class ProblemSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField()  # 返回用户名而不是ID
    votes = serializers.SerializerMethodField()
    cycle = CycleSerializer(read_only=True)  # ✅ 用嵌套方式返回轮次信息

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
