import os

from dotenv import load_dotenv


# Load environment variables
load_dotenv()


# ==========================================
# MongoDB
# ==========================================

MONGO_URI = os.getenv(
    "MONGO_URI",
    "mongodb://127.0.0.1:27017"
)

MONGO_DB_NAME = os.getenv(
    "MONGO_DB_NAME",
    "ai-learning"
)


# ==========================================
# Gemini
# ==========================================

GEMINI_API_KEY = os.getenv(
    "GEMINI_API_KEY"
)


# ==========================================
# Embedding Model
# ==========================================

EMBEDDING_MODEL = os.getenv(
    "EMBEDDING_MODEL",
    "sentence-transformers/all-MiniLM-L6-v2"
)


# ==========================================
# RAG Settings
# ==========================================

CHUNK_SIZE = int(
    os.getenv(
        "CHUNK_SIZE",
        "1000"
    )
)

CHUNK_OVERLAP = int(
    os.getenv(
        "CHUNK_OVERLAP",
        "200"
    )
)

TOP_K = int(
    os.getenv(
        "TOP_K",
        "5"
    )
)