
# Register your models here.
from django.contrib import admin
from .models import MLModel, ModelMetric,Dataset,MetricCategory, MetricDefinition   

#admin.site.register(MLModel)
#admin.site.register(ModelMetric)
admin.site.register(Dataset)

'''@admin.register(MetricCategory)
class MetricCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)


@admin.register(MetricDefinition)
class MetricDefinitionAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'higher_is_better')
    list_filter = ('category', 'higher_is_better')
    search_fields = ('name', 'display_name')


#@admin.register(ModelMetric)
#class ModelMetricAdmin(admin.ModelAdmin):
#    list_display = ('ml_model', 'metric', 'value')
#    list_filter = ('metric__category',)
#    search_fields = ('ml_model__name', 'metric__name')
@admin.register(ModelMetric)
class ModelMetricAdmin(admin.ModelAdmin):
    list_display = ('ml_model', 'metric', 'get_metric_category', 'value')
    list_filter = ('metric__category',)  # 允许侧边栏按分类筛选

    def get_metric_category(self, obj):
        return obj.metric.category.name
    get_metric_category.short_description = 'Metric Category'''

# 三级嵌套：ModelMetric 内联到 MetricDefinition
class ModelMetricInline(admin.TabularInline):
    model = ModelMetric
    extra = 0
    fields = ('ml_model', 'value')
    autocomplete_fields = ('ml_model',)  # 如果模型多可以加搜索
    show_change_link = True

# 二级嵌套：MetricDefinition 内联到 MetricCategory
class MetricDefinitionInline(admin.StackedInline):
    model = MetricDefinition
    extra = 0
    fields = ('name', 'display_name', 'description', 'formula', 'higher_is_better')
    show_change_link = True
    inlines = [ModelMetricInline]  # ❗ Django 默认不支持多层 inline，需要手动注册

    # 如果 Django 版本低于 4.0 不支持多层内联，可以在 MetricDefinition 的 Admin 单独显示 ModelMetric


@admin.register(MetricCategory)
class MetricCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)
    inlines = [MetricDefinitionInline]


# 单独注册 ModelMetric 方便直接查看
@admin.register(ModelMetric)
class ModelMetricAdmin(admin.ModelAdmin):
    list_display = ('ml_model', 'metric', 'get_metric_category', 'value')
    list_filter = ('metric__category',)
    search_fields = ('ml_model__name', 'metric__name')

    def get_metric_category(self, obj):
        return obj.metric.category.name
    get_metric_category.short_description = 'Metric Category'


@admin.register(MetricDefinition)
class MetricDefinitionAdmin(admin.ModelAdmin):
    list_display = ('name', 'display_name', 'category', 'higher_is_better')
    list_filter = ('category',)
    search_fields = ('name', 'display_name')


'''@admin.register(MLModel)
class MLModelAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'problem', 'dataset', 'created_at', 'is_public')
    search_fields = ('name',)
    list_filter = ('is_public', 'created_at')'''

'''@admin.register(MLModel)
class MLModelAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'problem', 'created_at', 'is_public', 'show_metrics')

    def show_metrics(self, obj):
        metrics = obj.metrics.select_related('metric').all()
        return ", ".join(f"{m.metric.name}: {m.value:.4f}" for m in metrics)
    show_metrics.short_description = 'Metrics'''


def generate_metric_column(metric):
    """动态生成显示某个指标的列函数"""
    def _metric_value(obj):
        value = obj.metrics.filter(metric=metric).first()
        return f"{value.value:.4f}" if value else "-"
    _metric_value.short_description = metric.display_name or metric.name
    return _metric_value


@admin.register(MLModel)
class MLModelAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'problem', 'created_at')  # 基本列
    list_filter = ('problem', 'owner')
    search_fields = ('name', 'owner__username')

    def get_list_display(self, request):
        """在 Admin 列表页动态添加所有 MetricDefinition 的列"""
        base_fields = ['name', 'owner', 'problem', 'created_at']

        # 动态生成每个 metric 的列
        metric_columns = []
        for metric in MetricDefinition.objects.all():
            method_name = f"metric_{metric.id}"
            if not hasattr(self, method_name):
                setattr(self, method_name, generate_metric_column(metric))
            metric_columns.append(method_name)

        return base_fields + metric_columns
