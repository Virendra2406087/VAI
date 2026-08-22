const SourceCitation = ({ sources }) => {
  if (!sources?.length) {
    return null;
  }

  return (
    <div className="citation-wrap">
      <p className="citation-label">
        📚 Sources
      </p>

      <div className="citation-list">
        {sources.map((source, index) => (
          <div key={index} className="citation-card">
            <span className="citation-icon">📄</span>

            <span className="citation-name">
              {source.fileName || "Document"}
            </span>

            {(source.page || source.pageNumber) && (
              <span className="citation-page">
                Page {source.page || source.pageNumber}
              </span>
            )}
          </div>
        ))}
      </div>

      <style>{`
        .citation-wrap {
          margin-top: 8px;

          max-width: 75%;

          align-self: flex-start;
        }

        .citation-label {
          margin: 0 0 6px 4px;

          font-size: 10px;

          font-weight: 700;

          letter-spacing: .04em;

          color: #6f6f82;

          text-transform: uppercase;
        }

        .citation-list {
          display: flex;

          flex-direction: column;

          gap: 5px;
        }

        .citation-card {
          display: flex;

          align-items: center;

          gap: 8px;

          padding: 7px 11px;

          border-radius: 10px;

          background: rgba(255,255,255,.03);

          border: 1px solid rgba(255,255,255,.06);

          font-size: 11px;
        }

        .citation-icon {
          font-size: 12px;
        }

        .citation-name {
          color: #b9b9c8;

          overflow: hidden;

          text-overflow: ellipsis;

          white-space: nowrap;
        }

        .citation-page {
          margin-left: auto;

          color: #6f6f82;

          flex-shrink: 0;
        }

        @media(max-width: 600px) {
          .citation-wrap {
            max-width: 88%;
          }
        }
      `}</style>
    </div>
  );
};

export default SourceCitation;