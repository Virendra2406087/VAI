import time

from google import genai
from google.genai import errors as genai_errors
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

# "models/embedding-001" was deprecated by Google on 2025-08-14 and now
# returns a 404 "model not found" error for every call.
# gemini-embedding-001 is the current replacement and uses the same
# embed_content endpoint.
EMBEDDING_MODEL_NAME = "gemini-embedding-001"

# gemini-embedding-001 defaults to 3072-dim output. Pinning it explicitly
# avoids silently mixing dimensions if Google ever changes the default,
# and 768 keeps Mongo storage/comparison cheap if you don't need max quality.
EMBEDDING_OUTPUT_DIMENSIONALITY = 768

MAX_RETRIES = 3
RETRY_BASE_DELAY_SECONDS = 2


# ==========================================
# Internal: call embed_content with retry
# ==========================================

def _embed_with_retry(contents, task_type):
    """
    Calls embed_content with basic exponential backoff on
    rate limit / transient server errors.
    """

    last_error = None

    for attempt in range(MAX_RETRIES):
        try:
            return client.models.embed_content(
                model=EMBEDDING_MODEL_NAME,
                contents=contents,
                config=types.EmbedContentConfig(
                    task_type=task_type,
                    output_dimensionality=EMBEDDING_OUTPUT_DIMENSIONALITY
                )
            )

        except genai_errors.ClientError as error:
            # 429 = rate limited, worth retrying with backoff
            if getattr(error, "code", None) == 429 and attempt < MAX_RETRIES - 1:
                last_error = error
                time.sleep(RETRY_BASE_DELAY_SECONDS * (2 ** attempt))
                continue
            raise

        except genai_errors.ServerError as error:
            # 5xx = transient, worth retrying with backoff
            if attempt < MAX_RETRIES - 1:
                last_error = error
                time.sleep(RETRY_BASE_DELAY_SECONDS * (2 ** attempt))
                continue
            raise

    raise last_error


# ==========================================
# Create One Embedding
# ==========================================

def create_embedding(text, task_type="RETRIEVAL_DOCUMENT"):

    if not text or not text.strip():
        raise ValueError(
            "Text cannot be empty."
        )

    result = _embed_with_retry(
        contents=text,
        task_type=task_type
    )

    return result.embeddings[0].values


# ==========================================
# Create Multiple Embeddings
# ==========================================

def create_embeddings(texts, task_type="RETRIEVAL_DOCUMENT"):
    """
    Batches all texts into a single embed_content call instead of
    looping one request per chunk. This cuts API calls (and quota
    usage) roughly N-fold for an N-chunk document. gemini-embedding-001
    correctly returns one embedding per input when given a list -
    unlike some of the newer preview models, so this is safe to batch.
    """

    if not texts:
        return []

    clean_texts = [t for t in texts if t and t.strip()]

    if not clean_texts:
        return []

    result = _embed_with_retry(
        contents=clean_texts,
        task_type=task_type
    )

    embeddings = [e.values for e in result.embeddings]

    if len(embeddings) != len(clean_texts):
        raise RuntimeError(
            f"Embedding count mismatch: sent {len(clean_texts)} texts, "
            f"got {len(embeddings)} embeddings back."
        )

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