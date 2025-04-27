from chromadb.config import Settings
import chromadb
from src.core.settings import CHROMA_CFG

# Initialize a persistent Chroma client
client = chromadb.Client(
    Settings(
        persist_directory=CHROMA_CFG["persist_directory"],
        chroma_db_impl="duckdb+parquet"
    )
)
# Create/get collection
collection = client.get_or_create_collection(name=CHROMA_CFG["collection_name"])
