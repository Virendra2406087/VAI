import { useState } from "react";
import {BookOpen} from "lucide-react"
const DocumentList = ({
  documents,
  selectedDocument,
  onSelect,
  onDelete,
  loading,
}) => {
  const [pendingDelete, setPendingDelete] = useState(null);

  const requestDelete = (e, document) => {
    e.stopPropagation();
    setPendingDelete(document);
  };

  const confirmDelete = () => {
    if (pendingDelete) {
      onDelete(pendingDelete._id);
    }
    setPendingDelete(null);
  };

  const cancelDelete = () => {
    setPendingDelete(null);
  };

  return (
    <div className="document-list">

      <div className="document-list-header">
        <span>RECENT DOCUMENTS</span>
      </div>

      {loading ? (
        <div className="document-loading">
          <div className="loading-dot" />
          Loading documents...
        </div>
      ) : documents.length === 0 ? (
        <div className="empty-documents">
          <div><BookOpen size={20}/></div>
          <span>No documents yet</span>
        </div>
      ) : (
        <div className="documents-scroll">
          {documents.map((document) => {
            const active =
              selectedDocument?._id === document._id;

            return (
              <div
                key={document._id}
                className={`document-card ${
                  active ? "active" : ""
                }`}
                onClick={() => onSelect(document)}
              >
                <div className="mini-pdf">
                  PDF
                </div>

                <div className="document-info">
                  <div className="document-name">
                    {document.fileName}
                  </div>

                  <div className="document-meta">
                    <span
                      className={`status ${
                        document.status
                      }`}
                    >
                      <span className="status-dot" />
                      {document.status || "ready"}
                    </span>

                    {document.totalChunks && (
                      <span>
                        {document.totalChunks} chunks
                      </span>
                    )}
                  </div>
                </div>

                <button
                  className="delete-document"
                  title="Delete document"
                  onClick={(e) => requestDelete(e, document)}
                >
                  🗑️
                </button>
              </div>
            );
          })}
        </div>
      )}

      {pendingDelete && (
        <div className="confirm-overlay" onClick={cancelDelete}>
          <div
            className="confirm-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="confirm-icon">🗑️</div>

            <div className="confirm-title">
              Delete document?
            </div>

            <div className="confirm-message">
              "{pendingDelete.fileName}" and its chat history
              will be permanently deleted. This can't be undone.
            </div>

            <div className="confirm-actions">
              <button
                className="confirm-cancel"
                onClick={cancelDelete}
              >
                Cancel
              </button>

              <button
                className="confirm-delete"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .document-list {
          flex: 1;

          min-height: 0;

          display: flex;
          flex-direction: column;
        }

        .document-list-header {
          padding: 4px 3px 10px;

          font-size: 9px;

          letter-spacing: .12em;

          font-weight: 700;

          color: #555568;
        }

        .documents-scroll {
          flex: 1;

          overflow-y: auto;

          padding-right: 3px;
        }

        .document-card {
          display: flex;

          align-items: center;

          gap: 10px;

          padding: 10px;

          margin-bottom: 5px;

          border-radius: 12px;

          cursor: pointer;

          border: 1px solid transparent;

          transition: all .2s;
        }

        .document-card:hover {
          background: rgba(255,255,255,.045);
        }

        .document-card.active {
          background:
            linear-gradient(
              135deg,
              rgba(99,102,241,.14),
              rgba(139,92,246,.06)
            );

          border-color:
            rgba(99,102,241,.2);
        }

        .mini-pdf {
          width: 34px;
          height: 40px;

          flex-shrink: 0;

          border-radius: 7px;

          display: flex;
          align-items: center;
          justify-content: center;

          background:
            linear-gradient(
              145deg,
              #ef4444,
              #991b1b
            );

          font-size: 8px;

          font-weight: 800;

          color: white;
        }

        .document-info {
          flex: 1;

          min-width: 0;
        }

        .document-name {
          font-size: 11px;

          font-weight: 600;

          color: #d5d5df;

          white-space: nowrap;

          overflow: hidden;

          text-overflow: ellipsis;
        }

        .document-meta {
          display: flex;

          gap: 8px;

          margin-top: 5px;

          font-size: 9px;

          color: #555568;
        }

        .status {
          display: flex;

          align-items: center;

          gap: 4px;
        }

        .status-dot {
          width: 5px;
          height: 5px;

          border-radius: 50%;

          background: #22c55e;
        }

        .status.processing .status-dot {
          background: #eab308;
        }

        .status.error .status-dot {
          background: #ef4444;
        }

        .delete-document {
          border: none;

          background: transparent;

          color: #555568;

          cursor: pointer;

          font-size: 13px;

          opacity: .6;

          transition: opacity .2s;

          flex-shrink: 0;

          padding: 4px;

          border-radius: 6px;
        }

        .delete-document:hover {
          opacity: 1;

          background: rgba(248,113,113,.1);
        }

        .empty-documents {
          padding: 35px 10px;

          text-align: center;

          color: #555568;

          font-size: 11px;
        }

        .empty-documents div {
          font-size: 28px;

          margin-bottom: 8px;
        }

        .document-loading {
          display: flex;

          align-items: center;

          gap: 8px;

          padding: 15px;

          color: #66667a;

          font-size: 11px;
        }

        .loading-dot {
          width: 7px;
          height: 7px;

          border-radius: 50%;

          background: #818cf8;

          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          50% {
            opacity: .3;
          }
        }

        /* CONFIRM DIALOG */

        .confirm-overlay {
          position: fixed;

          inset: 0;

          z-index: 200;

          display: flex;

          align-items: center;

          justify-content: center;

          background: rgba(5,5,10,.6);

          backdrop-filter: blur(6px);

          animation: fadeIn .15s ease;
        }

        .confirm-dialog {
          width: 320px;

          max-width: calc(100vw - 40px);

          padding: 22px;

          border-radius: 18px;

          text-align: center;

          background:
            linear-gradient(
              160deg,
              rgba(30,30,42,.98),
              rgba(15,15,22,.98)
            );

          border: 1px solid rgba(255,255,255,.09);

          box-shadow: 0 30px 80px rgba(0,0,0,.5);
        }

        .confirm-icon {
          width: 46px;
          height: 46px;

          margin: 0 auto 12px;

          border-radius: 14px;

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 20px;

          background: rgba(248,113,113,.12);

          border: 1px solid rgba(248,113,113,.25);
        }

        .confirm-title {
          font-size: 15px;

          font-weight: 700;

          color: #f1f1f5;
        }

        .confirm-message {
          margin-top: 8px;

          font-size: 12px;

          line-height: 1.6;

          color: #8f8fa3;
        }

        .confirm-actions {
          display: flex;

          gap: 8px;

          margin-top: 18px;
        }

        .confirm-cancel,
        .confirm-delete {
          flex: 1;

          padding: 10px;

          border-radius: 10px;

          font-size: 12px;

          font-weight: 600;

          cursor: pointer;

          border: 1px solid transparent;
        }

        .confirm-cancel {
          background: rgba(255,255,255,.05);

          border-color: rgba(255,255,255,.09);

          color: #d5d5df;
        }

        .confirm-cancel:hover {
          background: rgba(255,255,255,.09);
        }

        .confirm-delete {
          background: linear-gradient(135deg, #ef4444, #b91c1c);

          color: white;

          box-shadow: 0 8px 25px rgba(239,68,68,.25);
        }

        .confirm-delete:hover {
          filter: brightness(1.08);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default DocumentList;