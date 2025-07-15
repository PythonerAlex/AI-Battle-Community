from django.contrib import admin
from .models import Cycle, Problem, Vote,EvaluationCriterion,CriterionLike

admin.site.register(Cycle)
admin.site.register(Problem)
admin.site.register(Vote)


admin.site.register(EvaluationCriterion)
admin.site.register(CriterionLike)
