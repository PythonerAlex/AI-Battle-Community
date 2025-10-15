
# utils.py
def generate_prompt_from_proposal(data):
    return f"""
Below is a user-submitted AI problem proposal. Please score it on a 0–10 scale across the following five dimensions and compute the average. If the average is below 6.0, reject the proposal and state the most critical improvement suggestion.

Scoring dimensions:
1. Clarity – Is the problem clearly stated and its objective unambiguous?
2. Impact – Does it have real-world significance and align with the SDGs?
3. Evaluability – Can model performance be quantitatively assessed?
4. Data Feasibility – Are data available or realistically obtainable?
5. Non-Functional Validity – Are performance/fairness requirements reasonable?

Proposal:
[Title] {data.get("title")}
[Background & Significance] {data.get("background")}
[Goal] {data.get("goal")}
[Non-Functional Requirements] {data.get("nonFunctional", "None")}
[Data Sources] {data.get("dataSources", "None")}
[Evaluation Expectation] {data.get("metricHint")}

Please return the following JSON:
{{
  "clarity": int,
  "impact": int,
  "evaluability": int,
  "data_feasibility": int,
  "nonfunctional_validity": int,
  "average_score": float,
  "decision": "accept/reject",
  "reasons": ["...brief reasons (max 2)..."]
}}
"""

'''def generate_prompt_from_proposal(data):
    return f"""
以下是用户提交的AI问题提案，请你从以下5个维度打分（0-10），并给出平均分。如果总分低于60，拒绝，并指出最主要的改进建议。评分维度为：

1. 明确性 clarity：问题是否表达清楚、目标明确
2. 社会价值 impact：是否有现实意义、是否贴合 SDG
3. 可评估性 evaluability：是否能量化评估模型效果
4. 数据可得性 data feasibility：是否有数据或可获得数据
5. 非功能性合理性 non-functional：性能/公平性要求是否合理

提案如下：
【标题】{data.get("title")}
【背景与意义】{data.get("background")}
【目标】{data.get("goal")}
【非功能要求】{data.get("nonFunctional", "无")}
【数据来源】{data.get("dataSources", "无")}
【评估期望】{data.get("metricHint")}

请输出以下 JSON 格式：
{{  
  "clarity": int,
  "impact": int,
  "evaluability": int,
  "data_feasibility": int,
  "nonfunctional_validity": int,
  "average_score": float,
  "decision": "accept/reject",
  "reasons": ["...简短理由（最多2条）..."]
}}
"""
'''