import uuid, json
from fastapi import UploadFile, HTTPException
from src.schemas.rag_schema import EntryItem, IngestPayload
from db import collection
from src.services.embeddings import embed_documents

async def run_ingest_file(file: UploadFile):
    """
    1) Read & parse JSON file
    2) Validate with Pydantic
    3) Flatten QA → [id,text,...]
    4) Embed & upsert into ChromaDB
    """
    content = await file.read()
    try:
        raw = json.loads(content)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=400, detail="Invalid JSON") from e

    # Validate structure
    try:
        payload: IngestPayload = {
            k: EntryItem(**v) for k, v in raw.items()
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    ids, texts, metas = [], [], []
    for entry in payload.values():
        for qa in entry.questions:
            uid = str(uuid.uuid4())
            text = f"{qa.question}\n\n{qa.answer}"
            texts.append(f"search_document: {text}")
            ids.append(uid)
            metas.append({"source_url": str(qa.url)})

    embeddings = embed_documents(texts)

    # Upsert in chunk if very large
    collection.upsert(
        ids=ids,
        embeddings=embeddings,
        metadatas=metas,
        documents=texts
    )
    client = collection._client  # get client instance for persistence
    client.persist()
