from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional

from rag.loader import load_pdf
from rag.splitter import split_pages
from rag.embeddings import store_chunks
from rag.retriever import retrieve_chunks
from rag.generator import generate_answer

from utils.mongo import check_mongodb


# ==========================================
# FastAPI Application
# ==========================================

app = FastAPI(
    title="AI Learning RAG Service",
    description="RAG service for chatting with documents",
    version="1.0.0"
)


# ==========================================
# Request Models
# ==========================================

class ProcessDocumentRequest(BaseModel):

    documentId: str

    userId: str

    filePath: str


class ChatRequest(BaseModel):

    documentId: str

    question: str

    topK: Optional[int] = 5


# ==========================================
# Health Check
# ==========================================

@app.get("/health")
def health_check():

    mongodb_status = check_mongodb()

    return {
        "status": "ok",

        "service": "python-rag",

        "mongodb": mongodb_status
    }


# ==========================================
# Process PDF
# ==========================================

@app.post("/api/rag/process")
def process_document(
    request: ProcessDocumentRequest
):

    try:

        # ----------------------------------
        # Load PDF
        # ----------------------------------

        pages = load_pdf(
            request.filePath
        )

        if not pages:

            raise HTTPException(
                status_code=400,
                detail="No text found in PDF."
            )


        # ----------------------------------
        # Split into chunks
        # ----------------------------------

        chunks = split_pages(
            pages
        )

        if not chunks:

            raise HTTPException(
                status_code=400,
                detail="Could not create chunks."
            )


        # ----------------------------------
        # Store chunks + embeddings
        # ----------------------------------

        stored_count = store_chunks(
            document_id=request.documentId,

            user_id=request.userId,

            chunks=chunks
        )


        # ----------------------------------
        # Response
        # ----------------------------------

        return {

            "success": True,

            "message": (
                "Document processed successfully."
            ),

            "documentId":
                request.documentId,

            "pages":
                len(pages),

            "chunks":
                len(chunks),

            "storedChunks":
                stored_count
        }


    except HTTPException:

        raise


    except Exception as error:

        print(
            "Document processing error:",
            error
        )

        raise HTTPException(
            status_code=500,

            detail=str(error)
        )


# ==========================================
# Chat With Document
# ==========================================

@app.post("/api/rag/chat")
def chat_with_document(
    request: ChatRequest
):

    try:

        # ----------------------------------
        # Validate question
        # ----------------------------------

        if not request.question.strip():

            raise HTTPException(
                status_code=400,

                detail="Question cannot be empty."
            )


        # ----------------------------------
        # Retrieve chunks
        # ----------------------------------

        chunks = retrieve_chunks(

            document_id=
                request.documentId,

            question=
                request.question,

            top_k=
                request.topK
        )


        # ----------------------------------
        # Generate answer
        # ----------------------------------

        result = generate_answer(

            question=
                request.question,

            retrieved_chunks=
                chunks
        )


        # ----------------------------------
        # Response
        # ----------------------------------

        return {

            "success": True,

            "documentId":
                request.documentId,

            "question":
                request.question,

            "answer":
                result["answer"],

            "sources":
                result["sources"]
        }


    except HTTPException:

        raise


    except Exception as error:

        print(
            "Chat error:",
            error
        )

        raise HTTPException(
            status_code=500,

            detail=str(error)
        )


# ==========================================
# Root
# ==========================================

@app.get("/")
def root():

    return {

        "service":
            "AI Learning RAG Service",

        "status":
            "running"
    }