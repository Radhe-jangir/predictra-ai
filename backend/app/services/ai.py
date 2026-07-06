from typing import Any

import httpx

from app.core.config import settings
from app.services.analytics import answer_question, local_insights

FREE_MODELS = [
    "poolside/laguna-xs-2.1:free ",
    "meta-llama/llama-3.3-70b-instruct:free ",
    "meta-llama/llama-3.2-3b-instruct:free ",
    "nvidia/llama-nemotron-rerank-vl-1b-v2:free",
]


async def openrouter_completion(prompt: str, api_key: str | None = None) -> str | None:
    key = api_key or settings.openrouter_api_key
    if not key:
        return None
    headers = {
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://predictra.ai",
        "X-Title": "Predictra AI",
    }
    async with httpx.AsyncClient(timeout=40) as client:
        for model in FREE_MODELS:
            try:
                response = await client.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers=headers,
                    json={
                        "model": model,
                        "messages": [
                            
    {
    "role": "system",
    "content": """
You are Predictra AI.

You are an expert Senior Data Scientist and Business Intelligence Analyst.

Rules:

- Always answer in GitHub Flavored Markdown.
- Use headings only when appropriate.
- Never invent data.
- Use ONLY the dataset information provided.
- If information is unavailable, clearly say so.
- Keep answers professional and concise.
- When tables help, use markdown tables.
- When the user requests a complete analysis, generate a full report.
- Otherwise answer only the user's question.

Return ONLY markdown.
"""
},
                            {"role": "user", "content": prompt},
                        ],
                        "temperature": 0.15,
                    },
                )
                
                response.raise_for_status()
                return response.json()["choices"][0]["message"]["content"]
            except Exception as e:
                print(f"{model}: {e}")
                if "response" in locals():
                    print(response.text)
                continue
    return None


async def generate_ai_insights(df, profile: dict[str, Any], api_key: str | None = None) -> dict[str, Any]:
    local = local_insights(df)
    sample = df.head(5).to_dict("records")
    prompt = f"""
Analyze the following dataset.

Dataset Profile

{profile}

Sample Rows

{sample}

Create a professional business intelligence report.

Return ONLY markdown.

Do NOT use HTML.

Do NOT return JSON.

Use the exact structure requested.
"""
    completion = await openrouter_completion(prompt, api_key)
    if not completion:
        return {**local, "source": "local-statistical-engine"}
    return {**local, "ai_narrative": completion, "source": "openrouter"}


async def chat_with_dataset(
    df,
    question: str,
    profile: dict[str, Any],
    api_key: str | None = None,
) -> dict[str, str]:

    local_answer = answer_question(df, question)

    prompt = f"""
You are an expert Data Analyst.

Dataset Profile

{profile}

Sample Data

{df.head(5).to_csv(index=False)}

User Question

{question}

Instructions

- Answer ONLY the user's question.
- Use only supplied data.
- Never invent facts.
- Keep answers concise.
- Use markdown if needed.
"""

    completion = await openrouter_completion(prompt, api_key)

    return {
        "answer": completion or local_answer,
        "source": "openrouter" if completion else "local-statistical-engine",
    }
