import google.generativeai as genai

from config import GEMINI_API_KEY
from utils.mongo import rag_chunks_collection

# ==========================================
# Configure Gemini
# ==========================================

genai.configure(api_key=GEMINI_API_KEY)

EMBEDDING_MODEL_NAME = "models/embedding-001"


# ==========================================
# Create One Embedding
# ==========================================

def create_embedding(text, task_type="retrieval_document"):

    if not text or not text.strip():
        raise ValueError(
            "Text cannot be empty."
        )

    result = genai.embed_content(
        model=EMBEDDING_MODEL_NAME,
        content=text,
        task_type=task_type
    )

    return result["embedding"]


# ==========================================
# Create Multiple Embeddings
# ==========================================

def create_embeddings(texts, task_type="retrieval_document"):

    if not texts:
        return []

    embeddings = []

    for text in texts:
        result = genai.embed_content(
            model=EMBEDDING_MODEL_NAME,
            content=text,
            task_type=task_type
        )
        embeddings.append(result["embedding"])

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

    # Generate embeddings (Gemini API doesn't batch, so we loop)
    embeddings = create_embeddings(
        texts
    )

    documents = []

    for index, (chunk, embedding) in enumerate(
        zip(chunks, embeddings)
    ):

        documents.append(
            {
                "documentId": str(
                    document_id
                ),

                "userId": str(
                    user_id
                ),

                "page": chunk.get(
                    "page"
                ),

                "chunkIndex": index,

                "text": chunk.get(
                    "text",
                    ""
                ),

                "embedding": embedding
            }
        )

    # Insert all chunks
    if documents:

        result = rag_chunks_collection.insert_many(
            documents
        )

        return len(
            result.inserted_ids
        )

    return 0