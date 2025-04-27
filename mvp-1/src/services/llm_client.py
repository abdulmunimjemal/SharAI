import google.generativeai as genai
from src.core.settings import GEMINI_CFG

genai.configure(api_key=GEMINI_CFG["gemini_api_key"])
GEMINI = genai.GenerativeModel(model_name=GEMINI_CFG["model_name"])

def generate_answer(question: str, contexts: list[tuple[str,str]]) -> str:
    prompt_lines = [
        "You are an expert assistant. Answer using ONLY the contexts below.",
        "Cite facts inline as [1], [2], … and list each URL at the end as “[1] URL”."
    ]
    for i, (doc, url) in enumerate(contexts, start=1):
        prompt_lines.append(f"\nContext {i} (URL: {url}):\n{doc}")
    prompt_lines.append(f"\nQuestion: {question}\nAnswer:")
    prompt = "\n".join(prompt_lines)

    resp = GEMINI.generate_content(prompt)
    return resp.text.strip()
