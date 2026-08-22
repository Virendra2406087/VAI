from rag.retriever import cosine_similarity


vector_a = [
    1,
    0,
    0
]

vector_b = [
    1,
    0,
    0
]

vector_c = [
    0,
    1,
    0
]


print(
    "Similarity A-B:",
    cosine_similarity(
        vector_a,
        vector_b
    )
)


print(
    "Similarity A-C:",
    cosine_similarity(
        vector_a,
        vector_c
    )
)