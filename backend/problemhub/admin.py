from django.contrib import admin
from .models import Cycle, Problem, Vote,EvaluationCriterion,CriterionLike
from django.core.exceptions import ValidationError
from django.utils import timezone
from django import forms
#admin.site.register(Cycle)
class CycleForm(forms.ModelForm):
    class Meta:
        model = Cycle
        fields = ['title', 'start_time', 'end_time']

    def clean(self):
        cleaned = super().clean()
        start = cleaned.get('start_time')
        end   = cleaned.get('end_time')
        if start and end and end <= start:
            raise ValidationError('结束时间必须晚于开始时间')
        return cleaned
@admin.register(Cycle)
class CycleAdmin(admin.ModelAdmin):
    # 想要在列表页显示的字段
    form = CycleForm
    list_display = ('id', 'title', 'start_time', 'end_time')

    # 可选：让列表可按时间排序、可搜索
    list_filter = ('start_time', 'end_time')
    search_fields = ('title',)
    ordering = ('start_time',)

    def get_readonly_fields(self, request, obj=None):
        """
        3. 已经结束的周期，start_time / end_time 不能再编辑
        """
        if obj and obj.end_time <= timezone.now():
            return ['start_time', 'end_time']
        return []
#admin.site.register(Problem)@admin.register(Problem)

@admin.register(Problem)
class ProblemAdmin(admin.ModelAdmin):
    # 列表页要显示的列
    list_display = ('id', 'cycle', 'title','author', 'created_at')

    # 可选：按 cycle 或 author 过滤
    list_filter = ('cycle', 'author')

    # 可选：搜索框
    search_fields = ('title',)



#admin.site.register(Vote)
@admin.register(Vote)
class ProblemAdmin(admin.ModelAdmin):
    # 列表页要显示的列
    list_display = ('id', 'user', 'problem','created_at')

#admin.site.register(EvaluationCriterion)
@admin.register(EvaluationCriterion)
class EvaluationCriterionAdmin(admin.ModelAdmin):
    list_display = ('id', 'problem', 'author', 'created_at')

#admin.site.register(CriterionLike)
@admin.register(CriterionLike)
class CriterionLikeAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'criterion', 'created_at')
