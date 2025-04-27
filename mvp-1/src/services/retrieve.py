from src.database.db import collection
from src.services.embeddings import embed_query
from src.core.settings import GEMINI_CFG

class Retriever:
    def __init__(self):
        self.top_k = GEMINI_CFG["top_k"]

    def get_contexts(self, question: str) -> list[tuple[str, str]]:
        q_emb = embed_query(question)
        result = collection.query(
            query_embeddings=[q_emb],
            n_results=self.top_k
        )
        docs = result["documents"][0]
        metas = result["metadatas"][0]
        # return list of (doc_text, source_url)
        return [(doc, m["source_url"]) for doc, m in zip(docs, metas)]