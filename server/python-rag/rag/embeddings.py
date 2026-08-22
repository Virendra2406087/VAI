from sentence_transformers import SentenceTransformer

from config import EMBEDDING_MODEL

from utils.mongo import rag_chunks_collection


# ==========================================
# Load Embedding Model
# ==========================================

model = SentenceTransformer(
    EMBEDDING_MODEL
)


# ==========================================
# Create One Embedding
# ==========================================

def create_embedding(text):

    if not text or not text.strip():
        raise ValueError(
            "Text cannot be empty."
        )

    embedding = model.encode(
        text,
        normalize_embeddings=True
    )

    return embedding.tolist()


# ==========================================
# Create Multiple Embeddings
# ==========================================

def create_embeddings(texts):

    if not texts:
        return []

    embeddings = model.encode(
        texts,
        normalize_embeddings=True
    )

    return embeddings.tolist()


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

    # Generate embeddings in one batch
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