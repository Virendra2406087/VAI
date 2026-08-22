from rag.embeddings import create_embedding


text = """
Git is a version control system that
is used for tracking changes in files.
"""


embedding = create_embedding(
    text
)


print(
    "Embedding created successfully!"
)

print(
    "Vector length:",
    len(embedding)
)

print(
    "First 10 values:"
)

print(
    embedding[:10]
)