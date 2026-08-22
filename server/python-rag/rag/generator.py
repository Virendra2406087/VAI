from google import genai

from config import GEMINI_API_KEY


# ==========================================
# Configure Gemini
# ==========================================

if not GEMINI_API_KEY:
    raise ValueError(
        "GEMINI_API_KEY is not set in .env"
    )


client = genai.Client(
    api_key=GEMINI_API_KEY
)


# ==========================================
# Model
# ==========================================

MODEL_NAME = "gemini-2.5-flash"


# ==========================================
# Generate Answer
# ==========================================

def generate_answer(
    question,
    retrieved_chunks
):
    """
    Generate an answer using only the
    retrieved document chunks.
    """

    if not question or not question.strip():

        return {
            "answer": "Please ask a question.",
            "sources": []
        }


    if not retrieved_chunks:

        return {
            "answer": (
                "I couldn't find relevant "
                "information in the document."
            ),
            "sources": []
        }


    # ======================================
    # Build Context
    # ======================================

    context_parts = []


    for chunk in retrieved_chunks:

        page = chunk.get(
            "page",
            "Unknown"
        )

        text = chunk.get(
            "text",
            ""
        )

        context_parts.append(
            f"[Page {page}]\n{text}"
        )


    context = "\n\n".join(
        context_parts
    )


    # ======================================
    # Prompt
    # ======================================

    prompt = f"""
You are an AI document assistant.

Your job is to answer the user's question
using ONLY the information contained in the
DOCUMENT CONTEXT below.

IMPORTANT RULES:

1. Do not use outside knowledge.
2. Do not invent information.
3. If the answer is not available in the
   document context, say:
   "I couldn't find this information in
   the document."
4. Give a clear and concise answer.
5. When useful, mention the relevant page
   number.

DOCUMENT CONTEXT:
=================

{context}

=================

USER QUESTION:
{question}

ANSWER:
"""


    # ======================================
    # Generate Response
    # ======================================

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt
    )


    answer = response.text.strip()


    # ======================================
    # Build Sources
    # ======================================

    sources = []

    seen_pages = set()


    for chunk in retrieved_chunks:

        page = chunk.get(
            "page"
        )

        if page is None:
            continue


        if page in seen_pages:
            continue


        seen_pages.add(
            page
        )


        sources.append(
            {
                "page": page,

                "score": round(
                    chunk.get(
                        "score",
                        0
                    ),
                    4
                )
            }
        )


    # ======================================
    # Return
    # ======================================

    return {
        "answer": answer,
        "sources": sources
    }