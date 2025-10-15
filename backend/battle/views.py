import json
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings    
from openai import OpenAI
from .serializers import ProblemSerializer             
from .models import Problem

# 1. Get active problem
class CurrentProblemView(APIView):
    def get(self, request):
        problem = Problem.objects.filter(is_active=True).first()
        if not problem:
            return Response({"detail": "No active problem"}, status=404)
        return Response(ProblemSerializer(problem).data)


import json
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
from openai import OpenAI

client = OpenAI(api_key=settings.OPENAI_API_KEY)

GPTS_PROMPT = """
You are an expert SDG proposal evaluator.

For EACH solution you receive, score the 10 criteria (0-10) and output
TOTAL as the sum (0-100).

Return exactly ONE top-level JSON object with this shape:

{
  "results": [
    {
      "solution": "...",
      "relevance": 0-10,
      "clarity": 0-10,
      "innovation": 0-10,
      "impact": 0-10,
      "feasibility": 0-10,
      "economic_viability": 0-10,
      "implementability": 0-10,
      "technology_use": 0-10,
      "inclusivity": 0-10,
      "sustainability": 0-10,
      "total_score": 0-100
    },
    …
  ]
}

Do NOT add any keys outside "results" and do NOT add commentary.
"""

class BattleView(APIView):
    def post(self, request):
        solutions = request.data.get("solutions", [])
        if len(solutions) < 2:
            return Response({"detail": "Need at least 2 solutions"}, status=400)

        numbered = "\n".join(f"{i+1}. {s}" for i, s in enumerate(solutions))

        resp = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": GPTS_PROMPT.strip()},
                {"role": "user",
                 "content": f"Evaluate the following solutions:\n{numbered}"}
            ],
            temperature=0.2,
            response_format={"type": "json_object"}   # ✔ top-level object
        )

        raw = resp.choices[0].message.content.strip()

        try:
            data = json.loads(raw)["results"]   # ← extract the array
        except Exception as e:
            print("⚠ JSON error:", e, raw)
            data = [{"solution": s, "total_score": 50} for s in solutions]

        if all(isinstance(r, dict) and "total_score" in r for r in data):
            data.sort(key=lambda x: x["total_score"], reverse=True)

        return Response(data)

'''import json
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
from openai import OpenAI

client = OpenAI(api_key=settings.OPENAI_API_KEY)

# 🔹 System prompt: full 10-criteria evaluation
GPTS_PROMPT = """
You are an expert SDG proposal evaluator.
You will receive multiple proposed solutions for the same SDG problem.

For **each solution**, you must:
- Evaluate on the following 10 criteria (0-10 each, integers only):
  1. Relevance to SDG
  2. Clarity & Structure
  3. Innovativeness
  4. Impact Potential
  5. Feasibility & Practicality
  6. Economic Viability / Cost-Effectiveness
  7. Concrete Implementability
  8. Use of Technology & Innovation Solutions
  9. Inclusivity & Equity
  10. Sustainability & Long-Term Effects
- Compute total_score as the sum of all 10 criteria (0-100 scale).

**Output instructions**:
- Return a **JSON array** with **one object per solution**, in the **same order as received**.
- Each object must include the original solution text and its scores:

[
  {
    "solution": "...",
    "relevance": 0-10,
    "clarity": 0-10,
    "innovation": 0-10,
    "impact": 0-10,
    "feasibility": 0-10,
    "economic_viability": 0-10,
    "implementability": 0-10,
    "technology_use": 0-10,
    "inclusivity": 0-10,
    "sustainability": 0-10,
    "total_score": 0-100
  },
  ...
]

Do not include explanations, commentary, or text outside the JSON array.
"""


class BattleView(APIView):
    """
    Request:  { "solutions": ["solution1", "solution2", ...] }
    Response: list of dicts with evaluation scores
    """

    def post(self, request):
        solutions = request.data.get("solutions", [])

        if len(solutions) < 2:
            return Response({"detail": "Need at least 2 solutions"}, status=400)

        # Convert solutions to a numbered list for GPT to evaluate all
        solutions_text = "\n".join(
            [f"{idx+1}. {s}" for idx, s in enumerate(solutions)]
        )

        # ✅ Call GPT-4o with JSON response format
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": GPTS_PROMPT.strip()},
                {
                    "role": "user",
                    "content": f"Evaluate the following solutions:\n{solutions_text}"
                },
            ],
            temperature=0.2,
            response_format={"type": "json_object"},  # ✅ ensures JSON output
        )

        result_text = response.choices[0].message.content.strip()

        # Parse JSON output safely
        try:
            results = json.loads(result_text)
        except json.JSONDecodeError as e:
            print("⚠️ JSON parse error:", e, "Raw output:", result_text)
            results = [{"solution": s, "total_score": 50} for s in solutions]

        # Ensure response is always a list
        if isinstance(results, dict):
            results = [results]

        # Sort by total_score if available
        if all(isinstance(r, dict) and "total_score" in r for r in results):
            results.sort(key=lambda x: x["total_score"], reverse=True)

        return Response(results)

'''

'''client = OpenAI(api_key=settings.OPENAI_API_KEY)

# 🔹 Replace this with your actual GPTs system prompt
GPTS_PROMPT = """
You are an expert SDG proposal evaluator. 
Evaluate each solution on the following 10 criteria (0-10 each, integers only):
1. Relevance to SDG
2. Clarity & Structure
3. Innovativeness
4. Impact Potential
5. Feasibility & Practicality
6. Economic Viability / Cost-Effectiveness
7. Concrete Implementability
8. Use of Technology & Innovation Solutions
9. Inclusivity & Equity
10. Sustainability & Long-Term Effects

Compute total_score as the sum of all 10 criteria (0-100 scale). 

Return ONLY a JSON array in the format:
[
  {
    "solution": "...",
    "relevance": 9,
    "clarity": 7,
    "innovation": 6,
    "impact": 8,
    "feasibility": 6,
    "economic_viability": 5,
    "implementability": 6,
    "technology_use": 4,
    "inclusivity": 7,
    "sustainability": 7,
    "total_score": 65
  },
  ...
]

Do not include any explanations or extra text.
"""


class BattleView(APIView):
    """
    Request:  { "solutions": ["solution1", "solution2", ...] }
    Response: list of dicts with evaluation scores
    """

    def post(self, request):
        solutions = request.data.get("solutions", [])

        if len(solutions) < 2:
            return Response({"detail": "Need at least 2 solutions"}, status=400)

        # Use gpt-4o and embed your GPTs logic via system prompt
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": GPTS_PROMPT.strip()},
                {"role": "user", "content": json.dumps(solutions, ensure_ascii=False)}
            ],
            temperature=0.2
        )

        # GPT output text
        result_text = response.choices[0].message.content.strip()

        # Try parse JSON
        try:
            results = json.loads(result_text)
        except json.JSONDecodeError:
            # fallback: wrap with default scores
            results = [
                {
                    "solution": s,
                    "feasibility": 50,
                    "impact": 50,
                    "innovation": 50,
                    "total_score": 50
                }
                for s in solutions
            ]

        # Optionally sort by total_score descending
        if all(isinstance(r, dict) and "total_score" in r for r in results):
            results.sort(key=lambda x: x["total_score"], reverse=True)

        return Response(results)'''

'''GPTS_ID = "g-6892e35f18d08191beb674dac31ca398"
client = OpenAI(api_key=settings.OPENAI_API_KEY)

class BattleView(APIView):
    """
    Request:  { "solutions": ["solution1", "solution2", ...] }
    Response: Parsed GPTs JSON (list of dicts)
    """

    def post(self, request):
        solutions = request.data.get("solutions", [])

        if len(solutions) < 2:
            return Response({"detail": "Need at least 2 solutions"}, status=400)

        # ✅ Send only solutions as user content
        # Let GPTs handle evaluation & JSON formatting
        response = client.chat.completions.create(
            model=GPTS_ID,
            messages=[
                {"role": "user", "content": json.dumps(solutions, ensure_ascii=False)}
            ],
            temperature=0.2
        )

        # GPTs output
        result_text = response.choices[0].message.content.strip()

        # Try parse JSON
        try:
            results = json.loads(result_text)
        except json.JSONDecodeError:
            # fallback: wrap with default scores
            results = [
                {"solution": s, "total_score": 50} for s in solutions
            ]

        # Optionally sort by total_score descending if GPTs returns structured scores
        if all(isinstance(r, dict) and "total_score" in r for r in results):
            results.sort(key=lambda x: x["total_score"], reverse=True)

        return Response(results)
'''