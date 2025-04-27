from typing import Dict, List
from pydantic import BaseModel, HttpUrl, Field

class QAItem(BaseModel):
    url: HttpUrl
    title: str
    question: str
    answer: str
    summary: str | None = None

class EntryItem(BaseModel):
    title: str
    description: str = ""
    questions: List[QAItem] = Field(..., min_items=1)

# ingestion payload: mapping string → EntryItem
IngestPayload = Dict[str, EntryItem]

class QueryRequest(BaseModel):
    question: str = Field(..., min_length=1)

class QueryResponse(BaseModel):
    answer: str
    citations: List[HttpUrl]
