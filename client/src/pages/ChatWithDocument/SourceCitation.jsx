
import {BookOpen,FileText} from "lucide-react";
const SourceCitation = ({ sources }) => {
  if (!sources?.length) {
    return null;
  }

  return (
    <div className="citation-wrap">
      <p className="citation-label">
        <BookOpen size={20}/> Sources
      </p>

      <div className="citation-list">
        {sources.map((source, index) => (
          <div key={index} className="citation-card">
            <span className="citation-icon"><FileText size={20}/></span>

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

          max-width: 100%;

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

          flex-direction: row;

          flex-wrap: wrap;

          gap: 6px;
        }

        .citation-card {
          display: inline-flex;

          align-items: center;

          gap: 6px;

          padding: 6px 11px;

          border-radius: 999px;

          background: rgba(255,255,255,.03);

          border: 1px solid rgba(255,255,255,.06);

          font-size: 11px;

          white-space: nowrap;

          flex-shrink: 0;
        }

        .citation-icon {
          font-size: 11px;
        }

        .citation-name {
          color: #b9b9c8;

          max-width: 140px;

          overflow: hidden;

          text-overflow: ellipsis;

          white-space: nowrap;
        }

        .citation-page {
          color: #8b8b9e;

          padding-left: 6px;

          border-left: 1px solid rgba(255,255,255,.08);

          flex-shrink: 0;
        }

        @media(max-width: 600px) {
          .citation-wrap {
            max-width: 100%;
          }

          .citation-name {
            max-width: 90px;
          }
        }
      `}</style>
    </div>
  );
};

export default SourceCitation;