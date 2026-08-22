from pathlib import Path

from pypdf import PdfReader


def load_pdf(file_path):
    """
    Extract text from a PDF file.

    Returns:
        list:
        [
            {
                "page": 1,
                "text": "Page 1 content..."
            },
            {
                "page": 2,
                "text": "Page 2 content..."
            }
        ]
    """

    # Check whether file exists
    pdf_path = Path(file_path)

    if not pdf_path.exists():
        raise FileNotFoundError(
            f"PDF file not found: {file_path}"
        )

    # Make sure it is a PDF
    if pdf_path.suffix.lower() != ".pdf":
        raise ValueError(
            "Only PDF files are supported."
        )

    # Read PDF
    reader = PdfReader(
        str(pdf_path)
    )

    pages = []

    # Extract every page
    for page_number, page in enumerate(
        reader.pages,
        start=1
    ):

        text = page.extract_text()

        # Some PDF pages may not contain
        # extractable text
        if not text:
            continue

        text = text.strip()

        if not text:
            continue

        pages.append(
            {
                "page": page_number,
                "text": text
            }
        )

    return pages