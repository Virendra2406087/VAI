from pymongo import MongoClient

from config import (
    MONGO_URI,
    MONGO_DB_NAME
)


# ==========================================
# MongoDB Client
# ==========================================

client = MongoClient(
    MONGO_URI
)


# ==========================================
# Database
# ==========================================

db = client[
    MONGO_DB_NAME
]


# ==========================================
# Collections
# ==========================================

documents_collection = db[
    "documents"
]

rag_chunks_collection = db[
    "rag_chunks"
]

chat_messages_collection = db[
    "chatmessages"
]


# ==========================================
# Check MongoDB Connection
# ==========================================

def check_mongodb():

    try:

        client.admin.command(
            "ping"
        )

        return True

    except Exception as error:

        print(
            "MongoDB connection error:",
            error
        )

        return False