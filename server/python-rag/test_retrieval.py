from rag.retriever import retrieve_chunks


DOCUMENT_ID = "test-git-document"


question = "What is Git?"


results = retrieve_chunks(
    document_id=DOCUMENT_ID,
    question=question,
    top_k=5
)


print(
    "\n================================"
)

print(
    "Question:",
    question
)

print(
    "Retrieved chunks:",
    len(results)
)

print(
    "================================"
)


for index, result in enumerate(
    results,
    start=1
):

    print(
        f"\nResult {index}"
    )

    print(
        "Page:",
        result["page"]
    )

    print(
        "Chunk:",
        result["chunkIndex"]
    )

    print(
        "Similarity:",
        round(
            result["score"],
            4
        )
    )

    print(
        "Text:"
    )

    print(
        result["text"][:500]
    )

    print(
        "--------------------------------"
    )