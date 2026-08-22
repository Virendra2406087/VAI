import os
import tempfile

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
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
# CORS Middleware
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten later to your specific frontend/backend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# Request Models
# ==========================================

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
# Process PDF (now accepts an uploaded file)
# ==========================================

@app.post("/api/rag/process")
async def process_document(
    documentId: str = Form(...),
    userId: str = Form(...),
    file: UploadFile = File(...)
):

    temp_path = None

    try:

        # ----------------------------------
        # Save uploaded file to a temp path
        # ----------------------------------

        suffix = os.path.splitext(file.filename)[1] or ".pdf"

        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            content = await file.read()
            tmp.write(content)
            temp_path = tmp.name


        # ----------------------------------
        # Load PDF
        # ----------------------------------

        pages = load_pdf(
            temp_path
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
            document_id=documentId,

            user_id=userId,

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
                documentId,

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

    finally:

        # ----------------------------------
        # Clean up temp file
        # ----------------------------------

        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)


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