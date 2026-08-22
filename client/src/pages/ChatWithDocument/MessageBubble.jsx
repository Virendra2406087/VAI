const MessageBubble = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div
      className={`bubble-row ${
        isUser ? "user" : "assistant"
      }`}
    >
      <div className="bubble">
        {message.loading ? (
          <div className="typing">
            <span />
            <span />
            <span />
          </div>
        ) : (
          <p className="bubble-text">
            {message.content}
          </p>
        )}
      </div>

      <style>{`
        .bubble-row {
          display: flex;
          width: 100%;
        }

        .bubble-row.user {
          justify-content: flex-end;
        }

        .bubble-row.assistant {
          justify-content: flex-start;
        }

        .bubble {
          max-width: 75%;

          padding: 12px 16px;

          border-radius: 16px;

          box-sizing: border-box;
        }

        .bubble-row.user .bubble {
          background:
            linear-gradient(
              135deg,
              #6366f1,
              #8b5cf6
            );

          color: white;

          border-bottom-right-radius: 4px;

          box-shadow:
            0 10px 30px rgba(99,102,241,.25);
        }

        .bubble-row.assistant .bubble {
          background: rgba(255,255,255,.045);

          border: 1px solid rgba(255,255,255,.08);

          color: #e4e4ec;

          border-bottom-left-radius: 4px;
        }

        .bubble-text {
          margin: 0;

          font-size: 13px;

          line-height: 1.65;

          white-space: pre-wrap;

          word-break: break-word;
        }

        .typing {
          display: flex;

          align-items: center;

          gap: 4px;

          padding: 2px 0;
        }

        .typing span {
          width: 6px;
          height: 6px;

          border-radius: 50%;

          background: #9ca3ff;

          animation: bounce 1.1s infinite ease-in-out;
        }

        .typing span:nth-child(2) {
          animation-delay: .15s;
        }

        .typing span:nth-child(3) {
          animation-delay: .3s;
        }

        @keyframes bounce {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: .5;
          }
          30% {
            transform: translateY(-4px);
            opacity: 1;
          }
        }

        @media(max-width: 600px) {
          .bubble {
            max-width: 88%;
          }
        }
      `}</style>
    </div>
  );
};

export default MessageBubble;