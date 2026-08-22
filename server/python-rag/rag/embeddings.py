from google import genai
from google.genai import types

from config import GEMINI_API_KEY
from utils.mongo import rag_chunks_collection

# ==========================================
# Configure Gemini
# ==========================================

if not GEMINI_API_KEY:
    raise ValueError(
        "GEMINI_API_KEY is not set in .env"
    )

client = genai.Client(
    api_key=GEMINI_API_KEY
)

EMBEDDING_MODEL_NAME = "models/embedding-001"


# ==========================================
# Create One Embedding
# ==========================================

def create_embedding(text, task_type="RETRIEVAL_DOCUMENT"):

    if not text or not text.strip():
        raise ValueError(
            "Text cannot be empty."
        )

    result = client.models.embed_content(
        model=EMBEDDING_MODEL_NAME,
        contents=text,
        config=types.EmbedContentConfig(
            task_type=task_type
        )
    )

    return result.embeddings[0].values


# ==========================================
# Create Multiple Embeddings
# ==========================================

def create_embeddings(texts, task_type="RETRIEVAL_DOCUMENT"):

    if not texts:
        return []

    embeddings = []

    for text in texts:
        result = client.models.embed_content(
            model=EMBEDDING_MODEL_NAME,
            contents=text,
            config=types.EmbedContentConfig(
                task_type=task_type
            )
        )
        embeddings.append(result.embeddings[0].values)

    return embeddings


# ==========================================
# Store Chunks In MongoDB
# ==========================================

def store_chunks(
    document_id,
    user_id,
    chunks
):
    """
    Generate embeddings for chunks
    and store them in MongoDB.
    """

    if not chunks:
        return 0

    texts = [
        chunk["text"]
        for chunk in chunks
    ]

    embeddings = create_embeddings(
        texts
    )

    documents = []

    for index, (chunk, embedding) in enumerate(
        zip(chunks, embeddings)
    ):

        documents.append(
            {
                "documentId": str(document_id),
                "userId": str(user_id),
                "page": chunk.get("page"),
                "chunkIndex": index,
                "text": chunk.get("text", ""),
                "embedding": embedding
            }
        )

    if documents:
        result = rag_chunks_collection.insert_many(documents)
        return len(result.inserted_ids)

    return 0