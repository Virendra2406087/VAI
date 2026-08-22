const DocumentList = ({
  documents,
  selectedDocument,
  onSelect,
  onDelete,
  loading,
}) => {
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
          <div>📚</div>
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
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(document._id);
                  }}
                >
                  ⋮
                </button>
              </div>
            );
          })}
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

          font-size: 16px;
        }

        .delete-document:hover {
          color: #f87171;
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
      `}</style>
    </div>
  );
};

export default DocumentList;