import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import NotesPage from './pages/NotesPage';
import NoteEditorPage from './pages/NoteEditorPage';
import DashboardPage from './pages/DashboardPage';
import SharedNotePage from './pages/SharedNotePage';
import Layout from './components/Layout';

const ProtectedRoute = ({ children }) => {
  const token = useAuthStore(s => s.token);
  return token ? children : <Navigate to="/login" replace />;
};

export default function App() {
  const init = useAuthStore(s => s.init);
  const isInitialized = useAuthStore(s => s.isInitialized);

  useEffect(() => { init(); }, []);

  if (!isInitialized) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-2)', fontFamily: 'var(--font-display)', fontSize: '1.1rem', letterSpacing: '0.05em' }}>
      Loading...
    </div>
  );

  return (
    <>
      <Toaster position="top-right" toastOptions={{
        style: { background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)', fontFamily: 'var(--font-body)' },
      }} />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/shared/:shareId" element={<SharedNotePage />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/notes" replace />} />
          <Route path="notes" element={<NotesPage />} />
          <Route path="notes/:id" element={<NoteEditorPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
        </Route>
      </Routes>
    </>
  );
}
