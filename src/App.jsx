import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth } from './firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import AuthPage from './components/Auth/AuthPage.jsx';
import CanvasSizeSelection from './pages/CanvasSizeSelection.jsx';
import Editor from './pages/Editor.jsx';
import Lessons from './pages/Lessons.jsx';

// Protected Route Component
const ProtectedRoute = ({ children, user, loading }) => {
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return user ? children : <Navigate to="/" replace />;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        {/* Auth Page (Login/Register) */}
        <Route
          path="/"
          element={user ? <Navigate to="/lessons" replace /> : <AuthPage />}
        />

        {/* Lessons Page - Protected Route */}
        <Route
          path="/lessons"
          element={
            // <ProtectedRoute user={user} loading={loading}>
            <Lessons />
            // </ProtectedRoute>
          }
        />

        {/* Canvas Size Selection - Protected Route */}
        <Route
          path="/select-size"
          element={
            <ProtectedRoute user={user} loading={loading}>
              <CanvasSizeSelection />
            </ProtectedRoute>
          }
        />

        {/* Protected Editor Route */}
        <Route
          path="/editor"
          element={
            // <ProtectedRoute user={user} loading={loading}>
            <Editor />
            // </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;