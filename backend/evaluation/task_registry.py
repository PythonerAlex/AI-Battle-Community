# evaluation/task_registry.py

from .mnist_evaluator import evaluate_mnist_duel

# 注册所有支持的任务测评函数
task_registry = {
    "mnist": evaluate_mnist_duel,
    # 未来可以添加更多任务：
    # "connectx": evaluate_connectx_duel,
    # "sat": evaluate_sat_duel,
}
