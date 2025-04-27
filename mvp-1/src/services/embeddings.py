from sentence_transformers import SentenceTransformer
# Load once
EMBED_MODEL = SentenceTransformer(
    "nomic-ai/nomic-embed-text-v1.5",
    trust_remote_code=True
)

def embed_documents(texts: list[str]) -> list[list[float]]:
    # texts should be prefixed with "search_document: "
    return EMBED_MODEL.encode(texts, show_progress_bar=True).tolist()

def embed_query(query: str) -> list[float]:
    # single string with prefix
    return EMBED_MODEL.encode([f"search_query: {query}"])[0].tolist()
