from rag.loader import load_pdf

from rag.splitter import split_pages

from rag.embeddings import store_chunks

from utils.mongo import rag_chunks_collection


# ==========================================
# Test Data
# ==========================================

PDF_PATH = "git_CheatSheet.pdf"

DOCUMENT_ID = "test-git-document"

USER_ID = "test-user"


# ==========================================
# Load PDF
# ==========================================

pages = load_pdf(
    PDF_PATH
)

print(
    "Pages loaded:",
    len(pages)
)


# ==========================================
# Split PDF
# ==========================================

chunks = split_pages(
    pages
)

print(
    "Chunks created:",
    len(chunks)
)


# ==========================================
# Remove Previous Test Data
# ==========================================

rag_chunks_collection.delete_many(
    {
        "documentId": DOCUMENT_ID
    }
)


# ==========================================
# Generate Embeddings + Store
# ==========================================

count = store_chunks(
    document_id=DOCUMENT_ID,
    user_id=USER_ID,
    chunks=chunks
)


print(
    "Chunks stored:",
    count
)


# ==========================================
# Verify MongoDB
# ==========================================

stored_chunks = list(
    rag_chunks_collection.find(
        {
            "documentId": DOCUMENT_ID
        }
    )
)


print(
    "MongoDB chunks:",
    len(stored_chunks)
)


# ==========================================
# Display First Chunk
# ==========================================

if stored_chunks:

    first = stored_chunks[0]

    print("\nFirst stored chunk:")

    print(
        "Page:",
        first["page"]
    )

    print(
        "Chunk index:",
        first["chunkIndex"]
    )

    print(
        "Text:",
        first["text"][:200]
    )

    print(
        "Embedding length:",
        len(first["embedding"])
    )