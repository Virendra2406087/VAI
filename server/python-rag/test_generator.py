from rag.retriever import retrieve_chunks
from rag.generator import generate_answer


DOCUMENT_ID = "test-git-document"


question = "What is Git?"


# ==========================================
# Retrieve
# ==========================================

chunks = retrieve_chunks(
    document_id=DOCUMENT_ID,
    question=question,
    top_k=5
)


print(
    "\nRetrieved:",
    len(chunks),
    "chunks"
)


# ==========================================
# Generate
# ==========================================

result = generate_answer(
    question=question,
    retrieved_chunks=chunks
)


# ==========================================
# Print
# ==========================================

print(
    "\n================================"
)

print("QUESTION:")

print(question)


print("\nANSWER:")

print(result["answer"])


print("\nSOURCES:")

for source in result["sources"]:

    print(
        f"Page {source['page']} "
        f"(score: {source['score']})"
    )


print(
    "================================"
)