import { FileText } from "lucide-react";
import { useRef, useState } from "react";

const DocumentUpload = ({ onUpload, uploading }) => {
  const inputRef = useRef(null);

  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);

  const selectFile = (selectedFile) => {
    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      alert("Please select a PDF file.");
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (event) => {
    event.preventDefault();

    setDragging(false);

    const droppedFile =
      event.dataTransfer.files?.[0];

    selectFile(droppedFile);
  };

  const upload = async () => {
    if (!file) return;

    await onUpload(file);

    setFile(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="upload-container">

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        hidden
        onChange={(e) =>
          selectFile(e.target.files?.[0])
        }
      />

      {!file ? (
        <div
          className={`upload-zone ${
            dragging ? "dragging" : ""
          }`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >

          <div className="upload-icon">
            <span><FileText size={20}/></span>
          </div>

          <div className="upload-title">
            Upload PDF
          </div>

          <div className="upload-description">
            Drag & drop your document here
          </div>

          <div className="upload-or">
            or
          </div>

          <button
            type="button"
            className="browse-button"
          >
            Browse files
          </button>

          <div className="upload-limit">
            PDF • Max 20 MB
          </div>
        </div>
      ) : (
        <div className="selected-file">

          <div className="pdf-icon">
            PDF
          </div>

          <div className="selected-file-info">
            <div className="selected-file-name">
              {file.name}
            </div>

            <div className="selected-file-size">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>

          <button
            className="remove-file"
            onClick={() => setFile(null)}
          >
            ×
          </button>

          <button
            className="process-button"
            disabled={uploading}
            onClick={upload}
          >
            {uploading
              ? "Processing..."
              : "Start Chat →"}
          </button>
        </div>
      )}

      <style>{`
        .upload-container {
          margin-bottom: 18px;
        }

        .upload-zone {
          position: relative;

          padding: 24px 15px;

          border-radius: 17px;

          text-align: center;

          cursor: pointer;

          border: 1px dashed rgba(129,140,248,.4);

          background:
            linear-gradient(
              145deg,
              rgba(99,102,241,.09),
              rgba(168,85,247,.035)
            );

          transition: all .25s ease;
        }

        .upload-zone:hover,
        .upload-zone.dragging {
          border-color: #818cf8;

          background:
            linear-gradient(
              145deg,
              rgba(99,102,241,.16),
              rgba(168,85,247,.08)
            );

          transform: translateY(-1px);
        }

        .upload-icon {
          width: 48px;
          height: 48px;

          margin: 0 auto 12px;

          border-radius: 14px;

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 27px;

          background:
            linear-gradient(
              135deg,
              #6366f1,
              #8b5cf6
            );

          box-shadow:
            0 10px 30px rgba(99,102,241,.3);
        }

        .upload-icon span {
          font-weight: 300;
          transform: translateY(-2px);
        }

        .upload-title {
          font-size: 14px;
          font-weight: 700;

          color: #f5f5f7;
        }

        .upload-description {
          margin-top: 5px;

          font-size: 11px;

          color: #77778b;
        }

        .upload-or {
          margin: 10px 0;

          font-size: 10px;

          color: #4f4f62;
        }

        .browse-button {
          padding: 7px 13px;

          border-radius: 8px;

          border: 1px solid rgba(255,255,255,.1);

          background: rgba(255,255,255,.06);

          color: #d4d4e0;

          font-size: 11px;

          cursor: pointer;
        }

        .upload-limit {
          margin-top: 12px;

          font-size: 9px;

          color: #525266;
        }

        /* SELECTED FILE */

        .selected-file {
          position: relative;

          padding: 15px;

          border-radius: 16px;

          background:
            linear-gradient(
              145deg,
              rgba(99,102,241,.13),
              rgba(255,255,255,.035)
            );

          border: 1px solid rgba(99,102,241,.25);
        }

        .pdf-icon {
          width: 42px;
          height: 48px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 8px;

          background: linear-gradient(
            145deg,
            #ef4444,
            #b91c1c
          );

          font-size: 10px;
          font-weight: 800;

          margin-bottom: 10px;
        }

        .selected-file-info {
          min-width: 0;
        }

        .selected-file-name {
          font-size: 12px;

          font-weight: 600;

          color: #e4e4ec;

          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .selected-file-size {
          margin-top: 3px;

          font-size: 10px;

          color: #6f6f82;
        }

        .remove-file {
          position: absolute;

          top: 12px;
          right: 12px;

          width: 24px;
          height: 24px;

          border-radius: 50%;

          border: none;

          background: rgba(255,255,255,.07);

          color: #aaaabd;

          cursor: pointer;
        }

        .process-button {
          width: 100%;

          margin-top: 13px;

          padding: 10px;

          border: none;

          border-radius: 10px;

          background:
            linear-gradient(
              135deg,
              #6366f1,
              #8b5cf6
            );

          color: white;

          font-size: 12px;

          font-weight: 700;

          cursor: pointer;

          box-shadow:
            0 8px 25px rgba(99,102,241,.2);
        }

        .process-button:disabled {
          opacity: .5;

          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default DocumentUpload;