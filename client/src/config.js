// Centralized API base URL.
// In production (Vercel), set VITE_API_URL to your Render backend URL.
// Locally, it falls back to http://localhost:5000 automatically.
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";