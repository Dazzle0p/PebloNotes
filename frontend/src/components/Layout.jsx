import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { FileText, LayoutDashboard, LogOut, Plus } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { notesApi } from '../services/api';
import toast from 'react-hot-toast';

const navLinkStyle = ({ isActive }) => ({
  display: 'flex', alignItems: 'center', gap: '10px',
  padding: '10px 12px', borderRadius: '10px',
  color: isActive ? 'var(--text)' : 'var(--text-2)',
  background: isActive ? 'var(--accent-subtle)' : 'transparent',
  textDecoration: 'none', fontSize: '0.875rem', fontWeight: isActive ? 500 : 400,
  transition: 'all 0.15s',
});

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleNewNote = async () => {
    try {
      const { data } = await notesApi.create({ title: 'Untitled Note', content: '' });
      navigate(`/notes/${data.note._id}`);
    } catch { toast.error('Failed to create note'); }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <aside style={{ width: '220px', flexShrink: 0, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', padding: '24px 16px', gap: '4px', background: 'var(--surface)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem', letterSpacing: '-0.03em', padding: '0 8px 16px', borderBottom: '1px solid var(--border)', marginBottom: '8px' }}>
          Peblo <span style={{ color: 'var(--accent)' }}>Notes</span>
        </div>
        <button onClick={handleNewNote} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '10px', background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '8px' }}>
          <Plus size={16} /> New Note
        </button>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          <NavLink to="/notes" style={navLinkStyle}><FileText size={16} />Notes</NavLink>
          <NavLink to="/dashboard" style={navLinkStyle}><LayoutDashboard size={16} />Dashboard</NavLink>
        </nav>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginBottom: '4px' }}>Signed in as</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-2)', fontWeight: 500, marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
          <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '10px', background: 'none', color: 'var(--text-2)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.875rem', width: '100%' }}>
            <LogOut size={14} />Sign out
          </button>
        </div>
      </aside>
      <main style={{ flex: 1, overflow: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
