from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
#from django.utils import timezone
class Cycle(models.Model):
    title = models.CharField(max_length=200)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()

    def clean(self):
        # 1. 结束 > 开始
        if self.end_time <= self.start_time:
            raise ValidationError('结束时间必须晚于开始时间')

        #now = timezone.now()

        # 2. 新建逻辑
        #if self._state.adding:
        #    latest = (
        #        Cycle.objects
        #        .order_by('-end_time')
        #       .first()
        #   )
        #    if latest and self.start_time <= latest.end_time:
        #        raise ValidationError(
        #            f'新建周期的开始时间必须晚于当前最晚周期结束时间：{latest.end_time.isoformat()}'
        #        )
            return   # 新建就到此为止

        # 3. 编辑逻辑：仅当周期仍未结束
        # 3. 编辑：检查与 **除自己外所有 Cycle** 是否重叠
        overlap = (
            Cycle.objects
            .exclude(pk=self.pk)
            .filter(
                # 区间重叠的四种情况可简化为：
                start_time__lt=self.end_time,
                end_time__gt=self.start_time
            )
            .exists()
        )
        if overlap:
            raise ValidationError(
                '编辑后时间段与已有周期重叠，请调整开始或结束时间。'
            )
        
    def save(self, *args, **kwargs):
        # 4. 统一 UTC：无论前端给什么，都强制转 UTC
        self.start_time = self.start_time
        self.end_time   = self.end_time
        # 先触发 clean，再真正保存
        self.full_clean()
        super().save(*args, **kwargs)



    def __str__(self):
        return self.title


class Problem(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    tags = models.JSONField(default=list)
    cycle = models.ForeignKey(Cycle, on_delete=models.CASCADE, related_name='problems')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Vote(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE, related_name='votes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'problem')

class EvaluationCriterion(models.Model):
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE, related_name='criteria')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        #return f"{self.author.username}'s suggestion on {self.problem.title}"
        return f"{self.problem.title}"

class CriterionLike(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    criterion = models.ForeignKey(EvaluationCriterion, on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'criterion')
