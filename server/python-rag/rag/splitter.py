from config import (
    CHUNK_SIZE,
    CHUNK_OVERLAP
)


def split_text(
    text,
    chunk_size=CHUNK_SIZE,
    overlap=CHUNK_OVERLAP
):
    """
    Split text into overlapping chunks.

    Returns a list of text chunks.
    """

    if not text:
        return []

    if chunk_size <= 0:
        raise ValueError(
            "chunk_size must be greater than 0"
        )

    if overlap < 0:
        raise ValueError(
            "overlap cannot be negative"
        )

    if overlap >= chunk_size:
        raise ValueError(
            "overlap must be smaller than chunk_size"
        )

    text = text.strip()

    chunks = []

    start = 0

    step = chunk_size - overlap

    while start < len(text):

        end = start + chunk_size

        chunk = text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        start += step

    return chunks


def split_pages(
    pages,
    chunk_size=CHUNK_SIZE,
    overlap=CHUNK_OVERLAP
):
    """
    Split PDF pages into chunks while
    preserving page numbers.

    Input:

        [
            {
                "page": 1,
                "text": "..."
            }
        ]

    Output:

        [
            {
                "page": 1,
                "chunkIndex": 0,
                "text": "..."
            }
        ]
    """

    all_chunks = []

    global_chunk_index = 0

    for page in pages:

        page_number = page["page"]

        page_text = page["text"]

        chunks = split_text(
            page_text,
            chunk_size,
            overlap
        )

        for chunk in chunks:

            all_chunks.append(
                {
                    "page": page_number,

                    "chunkIndex":
                        global_chunk_index,

                    "text": chunk
                }
            )

            global_chunk_index += 1

    return all_chunks