import { useEffect, useState } from "react";
import DocumentList from "./DocumentList";
import DocumentUpload from "./DocumentUpload";
import ChatWindow from "./ChatWindow";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import {getDocuments,uploadDocument,deleteDocument,} from "../../services/documentChatService";

const ChatWithDocument = () => {
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const data = await getDocuments();

      setDocuments(data);

      if (data.length > 0) {
        setSelectedDocument(data[0]);
      }
    } catch (error) {
      console.error(error);
      setError("Unable to load your documents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleUpload = async (file) => {
    try {
      setUploading(true);
      setError("");

      const document = await uploadDocument(file);

      setDocuments((prev) => [document, ...prev]);
      setSelectedDocument(document);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Unable to upload the document."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId) => {
    try {
      await deleteDocument(documentId);

      const remaining = documents.filter(
        (doc) => doc._id !== documentId
      );

      setDocuments(remaining);

      if (selectedDocument?._id === documentId) {
        setSelectedDocument(remaining[0] || null);
      }
    } catch (error) {
      console.error(error);
      setError("Unable to delete document.");
    }
  };

  return (
    <div className="page-layout">
      <Sidebar />
      <div className="page-main">
        <Navbar />
        <div className="document-chat-page">

      {/* Background decoration */}
      <div className="document-bg-glow glow-one" />
      <div className="document-bg-glow glow-two" />

      {/* Main workspace */}
      <div className="document-workspace">

        {/* LEFT DOCUMENT PANEL */}
        <aside className="document-sidebar">

          <div className="document-sidebar-header">
            <div>
              <div className="document-title">
                Documents
              </div>

              <div className="document-subtitle">
                Your personal knowledge base
              </div>
            </div>

            <div className="document-count">
              {documents.length}
            </div>
          </div>

          {/* Upload */}
          <DocumentUpload
            onUpload={handleUpload}
            uploading={uploading}
          />

          {/* Documents */}
          <DocumentList
            documents={documents}
            selectedDocument={selectedDocument}
            onSelect={setSelectedDocument}
            onDelete={handleDelete}
            loading={loading}
          />

        </aside>

        {/* CHAT */}
        <main className="document-chat-area">

          {error && (
            <div className="document-error">
              ⚠️ {error}
            </div>
          )}

          <ChatWindow
            document={selectedDocument}
          />

        </main>
      </div>

      <style>{`
        /*
          IMPORTANT: this component is rendered *inside* your existing
          layout (Sidebar + Navbar already occupy their own space above
          and to the left). It must fill only the space its parent gives
          it - NOT the full browser viewport - or it will visually sit
          on top of the Sidebar/Navbar.

          If this still overlaps after the fix below, check the parent
          layout wrapper (e.g. DashboardLayout.jsx) and make sure the
          element wrapping <Outlet /> / page content uses something like:

            display: flex; flex-direction: column; flex: 1; min-height: 0;

          so this component has a real, bounded height to fill with
          height: 100% rather than inventing its own via 100vh.
        */
        .document-chat-page {
          width: 100%;

          /* Navbar.jsx renders at height: 68 - subtract it so this
             fills exactly the remaining viewport instead of adding
             its own extra 100vh on top of Navbar's height. */
          height: calc(100vh - 68px);
          flex: 1;
          min-height: 0;

          position: relative;
          overflow: hidden;
          box-sizing: border-box;

          background:
            radial-gradient(
              circle at 15% 10%,
              rgba(99,102,241,0.12),
              transparent 30%
            ),
            radial-gradient(
              circle at 85% 90%,
              rgba(168,85,247,0.10),
              transparent 30%
            ),
            #07070d;

          color: #fff;
        }

        .document-bg-glow {
          position: absolute;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
          opacity: .25;
        }

        .glow-one {
          background: #6366f1;
          top: -200px;
          left: 20%;
        }

        .glow-two {
          background: #a855f7;
          right: -200px;
          bottom: -200px;
        }

        .document-workspace {
          position: relative;
          z-index: 2;

          display: flex;

          width: 100%;
          height: 100%;

          box-sizing: border-box;

          padding: 0 18px 18px;

          gap: 16px;
        }

        /* SIDEBAR */

        .document-sidebar {
          width: 310px;

          flex-shrink: 0;

          display: flex;
          flex-direction: column;

          padding: 20px;

          border-radius: 0 0 22px 22px;

          background:
            linear-gradient(
              145deg,
              rgba(255,255,255,.07),
              rgba(255,255,255,.025)
            );

          border: 1px solid rgba(255,255,255,.09);

          backdrop-filter: blur(25px);

          box-shadow:
            0 25px 80px rgba(0,0,0,.35);

          overflow: hidden;
        }

        .document-sidebar-header {
          display: flex;

          align-items: center;

          justify-content: space-between;

          margin-bottom: 20px;
        }

        .document-title {
          font-size: 19px;
          font-weight: 700;
          letter-spacing: -.02em;
        }

        .document-subtitle {
          margin-top: 4px;

          font-size: 11px;

          color: #7c7c91;
        }

        .document-count {
          width: 30px;
          height: 30px;

          border-radius: 9px;

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 12px;
          font-weight: 700;

          background: rgba(99,102,241,.15);

          color: #a5b4fc;

          border: 1px solid rgba(99,102,241,.25);
        }

        /* CHAT */

        .document-chat-area {
          position: relative;

          flex: 1;

          min-width: 0;
          min-height: 0;

          border-radius: 0 0 22px 22px;

          overflow: hidden;

          background:
            linear-gradient(
              135deg,
              rgba(15,15,27,.95),
              rgba(8,8,16,.92)
            );

          border: 1px solid rgba(255,255,255,.08);

          box-shadow:
            0 25px 80px rgba(0,0,0,.35);

          display: flex;
          flex-direction: column;
        }

        .document-error {
          position: absolute;

          top: 18px;
          left: 50%;

          transform: translateX(-50%);

          z-index: 50;

          padding: 10px 16px;

          border-radius: 12px;

          font-size: 12px;

          background: rgba(127,29,29,.85);

          border: 1px solid rgba(248,113,113,.25);

          color: #fecaca;

          backdrop-filter: blur(15px);
        }

        /* RESPONSIVE */

        @media(max-width: 900px) {
          .document-workspace {
            padding: 10px;
          }

          .document-sidebar {
            width: 260px;
          }
        }

        @media(max-width: 700px) {
          .document-workspace {
            flex-direction: column;
          }

          .document-sidebar {
            width: 100%;
            height: 260px;
          }

          .document-chat-area {
            min-height: 500px;
          }
        }
      `}</style>
        </div>
      </div>
    </div>
  );
};

export default ChatWithDocument;