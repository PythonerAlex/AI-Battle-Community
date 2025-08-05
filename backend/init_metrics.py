# init_metrics.py
import django
import os

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'battle_platform.settings')
django.setup()

from modelstudio.models import MetricCategory, MetricDefinition

# Dictionary of categories -> metrics -> description & formula
metrics_dict = {
    "Classification": {
        "accuracy": {
            "desc": "Accuracy",
            "formula": r"\frac{TP + TN}{TP + TN + FP + FN}"
        },
        "precision": {
            "desc": "Precision (Positive predictive value)",
            "formula": r"\frac{TP}{TP + FP}"
        },
        "recall": {
            "desc": "Recall (Sensitivity / True positive rate)",
            "formula": r"\frac{TP}{TP + FN}"
        },
        "f1": {
            "desc": "F1-score (Harmonic mean of precision and recall)",
            "formula": r"2 \cdot \frac{precision \cdot recall}{precision + recall}"
        },
        "f1_macro": {
            "desc": "Macro F1 (Unweighted mean of F1 across classes)",
            "formula": r"\frac{1}{C}\sum_{c=1}^{C} F1_c"
        },
        "f1_micro": {
            "desc": "Micro F1 (Aggregate TP/FP/FN before computing F1)",
            "formula": r"2 \cdot \frac{\sum_c TP_c}{2\sum_c TP_c + \sum_c FP_c + \sum_c FN_c}"
        },
        "roc_auc": {
            "desc": "Area under the ROC curve",
            "formula": r"\int_0^1 TPR(FPR^{-1}(x)) dx"
        },
        "pr_auc": {
            "desc": "Area under the Precision-Recall curve",
            "formula": r"\int_0^1 precision(recall^{-1}(x)) dx"
        },
        "log_loss": {
            "desc": "Log loss / Cross-entropy loss (lower is better)",
            "formula": r"-\frac{1}{N}\sum_{i=1}^{N} [y_i\log \hat{y}_i + (1-y_i)\log(1-\hat{y}_i)]"
        },
        "hamming_loss": {
            "desc": "Hamming loss for multilabel classification",
            "formula": r"\frac{1}{N \cdot L}\sum_{i=1}^{N}\sum_{j=1}^{L} 1_{y_{ij} \neq \hat{y}_{ij}}"
        },
        "jaccard_score": {
            "desc": "Jaccard Index (Intersection over Union)",
            "formula": r"\frac{|Y \cap \hat{Y}|}{|Y \cup \hat{Y}|}"
        },
        "top_k_accuracy": {
            "desc": "Top-K Accuracy (multiclass)",
            "formula": r"\frac{\text{\# samples where true class in top-K}}{N}"
        },
    },

    "Regression": {
        "mae": {
            "desc": "Mean Absolute Error (MAE, lower is better)",
            "formula": r"\frac{1}{N}\sum_{i=1}^{N} |y_i - \hat{y}_i|"
        },
        "mse": {
            "desc": "Mean Squared Error (MSE, lower is better)",
            "formula": r"\frac{1}{N}\sum_{i=1}^{N} (y_i - \hat{y}_i)^2"
        },
        "rmse": {
            "desc": "Root Mean Squared Error (RMSE, lower is better)",
            "formula": r"\sqrt{\frac{1}{N}\sum_{i=1}^{N} (y_i - \hat{y}_i)^2}"
        },
        "r2": {
            "desc": "R² (Coefficient of determination)",
            "formula": r"1 - \frac{\sum_i (y_i - \hat{y}_i)^2}{\sum_i (y_i - \bar{y})^2}"
        },
        "mape": {
            "desc": "Mean Absolute Percentage Error",
            "formula": r"\frac{100}{N}\sum_i \left|\frac{y_i - \hat{y}_i}{y_i}\right|"
        },
        "msle": {
            "desc": "Mean Squared Logarithmic Error",
            "formula": r"\frac{1}{N}\sum_{i=1}^{N} (\log(1+y_i) - \log(1+\hat{y}_i))^2"
        },
        "median_ae": {
            "desc": "Median Absolute Error",
            "formula": r"\text{median}(|y_i - \hat{y}_i|)"
        },
    },

    "Ranking": {
        "ndcg": {
            "desc": "Normalized Discounted Cumulative Gain (NDCG)",
            "formula": r"\frac{DCG_k}{IDCG_k},\quad DCG_k = \sum_{i=1}^{k} \frac{2^{rel_i}-1}{\log_2(i+1)}"
        },
        "map": {
            "desc": "Mean Average Precision (MAP)",
            "formula": r"\frac{1}{Q}\sum_{q=1}^{Q} AP(q)"
        },
        "hit_rate": {
            "desc": "Hit Rate (fraction of successful hits)",
            "formula": r"\frac{\text{\# hits}}{N}"
        },
        "precision_at_k": {
            "desc": "Precision@K (Top-K precision)",
            "formula": r"\frac{\text{\# relevant items in top K}}{K}"
        },
        "recall_at_k": {
            "desc": "Recall@K (Top-K recall)",
            "formula": r"\frac{\text{\# relevant items in top K}}{\text{\# total relevant items}}"
        },
        "mrr": {
            "desc": "Mean Reciprocal Rank (MRR)",
            "formula": r"\frac{1}{N}\sum_{i=1}^{N}\frac{1}{rank_i}"
        },
        "coverage": {
            "desc": "Coverage (fraction of items recommended)",
            "formula": r"\frac{\text{\# items recommended at least once}}{\text{\# total items}}"
        },
    },

    "Clustering": {
        "silhouette_score": {
            "desc": "Silhouette Score (cluster cohesion and separation)",
            "formula": r"\frac{b_i - a_i}{\max(a_i, b_i)}"
        },
        "calinski_harabasz_score": {
            "desc": "Calinski-Harabasz Index (higher is better)",
            "formula": r"\frac{Tr(B_k)/(k-1)}{Tr(W_k)/(n-k)}"
        },
        "davies_bouldin_score": {
            "desc": "Davies-Bouldin Index (lower is better)",
            "formula": r"\frac{1}{k}\sum_{i=1}^{k}\max_{j\neq i}\frac{s_i+s_j}{d_{ij}}"
        },
        "homogeneity_score": {
            "desc": "Homogeneity Score",
            "formula": r"1 - \frac{H(C|K)}{H(C)}"
        },
        "completeness_score": {
            "desc": "Completeness Score",
            "formula": r"1 - \frac{H(K|C)}{H(K)}"
        },
        "v_measure_score": {
            "desc": "V-Measure Score (harmonic mean of homogeneity and completeness)",
            "formula": r"2 \cdot \frac{homogeneity \cdot completeness}{homogeneity+completeness}"
        },
        "adjusted_rand_index": {
            "desc": "Adjusted Rand Index (ARI)",
            "formula": r"\frac{RI - Expected\_RI}{Max\_RI - Expected\_RI}"
        },
        "adjusted_mutual_info": {
            "desc": "Adjusted Mutual Information (AMI)",
            "formula": r"\frac{MI - Expected\_MI}{\max(H(C), H(K)) - Expected\_MI}"
        },
    },

    "Reinforcement Learning": {
        "avg_reward": {
            "desc": "Average reward per episode",
            "formula": r"\frac{1}{E}\sum_{e=1}^{E} \sum_{t=1}^{T} r_t^{(e)}"
        },
        "total_reward": {
            "desc": "Total accumulated reward",
            "formula": r"\sum_{e=1}^{E} \sum_{t=1}^{T} r_t^{(e)}"
        },
        "success_rate": {
            "desc": "Success rate of episodes",
            "formula": r"\frac{\text{\# of successful episodes}}{E}"
        },
        "episode_length": {
            "desc": "Average episode length",
            "formula": r"\frac{1}{E}\sum_{e=1}^{E} T_e"
        },
        "policy_entropy": {
            "desc": "Policy entropy (measures exploration)",
            "formula": r"-\sum_a \pi(a|s)\log \pi(a|s)"
        },
        "value_loss": {
            "desc": "Value function loss (lower is better)",
            "formula": r"(V(s) - G_t)^2"
        },
        "policy_loss": {
            "desc": "Policy loss (lower is better)",
            "formula": r"-\log \pi(a_t|s_t) \cdot A_t"
        },
    },

    "Forecasting": {
        "mape": {
            "desc": "Mean Absolute Percentage Error (MAPE)",
            "formula": r"\frac{100}{N}\sum_i \left|\frac{y_i - \hat{y}_i}{y_i}\right|"
        },
        "smape": {
            "desc": "Symmetric Mean Absolute Percentage Error (SMAPE)",
            "formula": r"\frac{100}{N}\sum_i \frac{|y_i - \hat{y}_i|}{(|y_i| + |\hat{y}_i|)/2}"
        },
        "mae": {
            "desc": "Mean Absolute Error (MAE)",
            "formula": r"\frac{1}{N}\sum_i |y_i - \hat{y}_i|"
        },
        "rmse": {
            "desc": "Root Mean Squared Error (RMSE)",
            "formula": r"\sqrt{\frac{1}{N}\sum_i (y_i - \hat{y}_i)^2}"
        },
        "crps": {
            "desc": "Continuous Ranked Probability Score (lower is better)",
            "formula": r"\int_{-\infty}^{+\infty} (F(z) - 1_{y\le z})^2 dz"
        },
        "pinball_loss": {
            "desc": "Pinball Loss (quantile regression loss)",
            "formula": r"\max\{q(y-\hat{y}), (q-1)(y-\hat{y})\}"
        },
    },

    "Probabilistic": {
        "brier_score": {
            "desc": "Brier Score (lower is better)",
            "formula": r"\frac{1}{N}\sum_{i=1}^{N} (\hat{y}_i - y_i)^2"
        },
        "log_loss": {
            "desc": "Log Loss / Cross-entropy loss (lower is better)",
            "formula": r"-\frac{1}{N}\sum_i [y_i \log \hat{y}_i + (1-y_i)\log(1-\hat{y}_i)]"
        },
        "ece": {
            "desc": "Expected Calibration Error",
            "formula": r"\sum_{m=1}^{M} \frac{|B_m|}{N} |acc(B_m) - conf(B_m)|"
        },
        "mce": {
            "desc": "Maximum Calibration Error",
            "formula": r"\max_m |acc(B_m) - conf(B_m)|"
        },
    }
}

# Insert into DB
for category_name, metrics in metrics_dict.items():
    category, _ = MetricCategory.objects.get_or_create(name=category_name)
    for metric_name, metric_data in metrics.items():
        MetricDefinition.objects.update_or_create(
            name=metric_name,
            defaults={
                "display_name": metric_name.replace("_", " ").title(),
                "description": metric_data["desc"],
                "formula": metric_data.get("formula", ""),
                "category": category,
                "higher_is_better": not metric_name.endswith((
                    "loss", "error", "mse", "mae", "rmse", "brier_score"
                )),
            },
        )


print("✅ Metric categories and definitions with LaTeX formulas initialized successfully!")
