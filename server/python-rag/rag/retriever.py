import numpy as np

from rag.embeddings import create_embedding

from utils.mongo import rag_chunks_collection

from config import TOP_K


# ==========================================
# COSINE SIMILARITY
# ==========================================

def cosine_similarity(vector_a, vector_b):
    """
    Calculate cosine similarity between
    two embedding vectors.
    """

    a = np.array(
        vector_a,
        dtype=np.float32
    )

    b = np.array(
        vector_b,
        dtype=np.float32
    )

    denominator = (
        np.linalg.norm(a)
        *
        np.linalg.norm(b)
    )

    if denominator == 0:
        return 0.0

    similarity = (
        np.dot(a, b)
        / denominator
    )

    return float(similarity)


# ==========================================
# RETRIEVE RELEVANT CHUNKS
# ==========================================

def retrieve_chunks(
    document_id,
    question,
    top_k=TOP_K
):
    """
    Find the most relevant chunks from
    a particular document.
    """

    if not question or not question.strip():
        return []

    # --------------------------------------
    # Create embedding for question
    # --------------------------------------

    question_embedding = create_embedding(
        question
    )

    # --------------------------------------
    # Get document chunks
    # --------------------------------------

    chunks = rag_chunks_collection.find(
        {
            "documentId": str(document_id)
        }
    )

    results = []

    # --------------------------------------
    # Compare with every chunk
    # --------------------------------------

    for chunk in chunks:

        chunk_embedding = chunk.get(
            "embedding"
        )

        if not chunk_embedding:
            continue

        score = cosine_similarity(
            question_embedding,
            chunk_embedding
        )

        results.append(
            {
                "chunkId": str(
                    chunk["_id"]
                ),

                "documentId":
                    chunk.get(
                        "documentId"
                    ),

                "userId":
                    chunk.get(
                        "userId"
                    ),

                "page":
                    chunk.get(
                        "page"
                    ),

                "chunkIndex":
                    chunk.get(
                        "chunkIndex"
                    ),

                "text":
                    chunk.get(
                        "text",
                        ""
                    ),

                "score":
                    score
            }
        )

    # --------------------------------------
    # Sort highest similarity first
    # --------------------------------------

    results.sort(
        key=lambda item:
            item["score"],
        reverse=True
    )

    # --------------------------------------
    # Return top K
    # --------------------------------------

    return results[:top_k]