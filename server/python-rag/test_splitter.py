from rag.loader import load_pdf

from rag.splitter import split_pages


pdf_path = "git_CheatSheet.pdf"


# Load PDF
pages = load_pdf(
    pdf_path
)


# Split pages
chunks = split_pages(
    pages
)


print(
    "Total pages:",
    len(pages)
)

print(
    "Total chunks:",
    len(chunks)
)


for chunk in chunks:

    print("\n------------------------")

    print(
        "Page:",
        chunk["page"]
    )

    print(
        "Chunk index:",
        chunk["chunkIndex"]
    )

    print(
        "Length:",
        len(chunk["text"])
    )

    print(
        chunk["text"][:300]
    )