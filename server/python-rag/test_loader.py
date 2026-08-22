from rag.loader import load_pdf


pdf_path = "git_CheatSheet.pdf"

pages = load_pdf(pdf_path)


print(
    f"Total pages extracted: {len(pages)}"
)


for page in pages[:3]:

    print("\n--------------------")

    print(
        f"Page: {page['page']}"
    )

    print(
        page["text"][:500]
    )