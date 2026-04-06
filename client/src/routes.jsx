import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Landing           from "./pages/Landing/Landing";
import Login             from "./pages/Auth/Login";
import Register          from "./pages/Auth/Register";
import Dashboard         from "./pages/Dashboard/Dashboard";
import Topics            from "./pages/Topics/Topics";

// ✅ Home pages — shown when clicking sidebar links directly
import DocumentationHome from "./pages/Documentation/DocumentationsHome";
import FlashcardsHome    from "./pages/Flashcards/FlashcardsHome";
import QuizHome          from "./pages/Quiz/QuizHome";

// ✅ View pages — shown after topic/file is selected
import Documentation     from "./pages/Documentation/Documentation";
import Flashcards        from "./pages/Flashcards/Flashcards";
import Quiz              from "./pages/Quiz/Quiz";

import AITutor           from "./pages/Tutor/AITutor";
import StudyPlanner      from "./pages/Planner/StudyPlanner";
import Profile           from "./pages/Profile/Profile";
import Settings          from "./pages/Settings/Settings";
import History           from "./pages/History/History";
import GoogleSuccess     from "./pages/Auth/GoogleSuccess";

// ✅ Auth guard
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

const P = ({ children }) => <ProtectedRoute>{children}</ProtectedRoute>;

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/"          element={<Landing />}  />
        <Route path="/login"     element={<Login />}    />
        <Route path="/register"               element={<Register />}       />
        <Route path="/auth/google/success"    element={<GoogleSuccess />}  />

        {/* Protected */}
        <Route path="/dashboard"       element={<P><Dashboard /></P>}         />
        <Route path="/topics"          element={<P><Topics /></P>}            />

        {/* Docs: sidebar → upload home, generate → view */}
        <Route path="/docs"            element={<P><DocumentationHome /></P>} />
        <Route path="/docs/view"       element={<P><Documentation /></P>}     />

        {/* Flashcards: sidebar → upload home, generate → view */}
        <Route path="/flashcards"      element={<P><FlashcardsHome /></P>}    />
        <Route path="/flashcards/view" element={<P><Flashcards /></P>}        />

        {/* Quiz: sidebar → upload home, generate → view */}
        <Route path="/quiz"            element={<P><QuizHome /></P>}          />
        <Route path="/quiz/view"       element={<P><Quiz /></P>}              />

        <Route path="/tutor"           element={<P><AITutor /></P>}           />
        <Route path="/planner"         element={<P><StudyPlanner /></P>}      />
        <Route path="/history"         element={<P><History /></P>}           />
        <Route path="/profile"         element={<P><Profile /></P>}           />
        <Route path="/settings"        element={<P><Settings /></P>}          />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;