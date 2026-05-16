import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Tag, Archive, RefreshCw, Trash2, Share2 } from 'lucide-react';
import { notesApi } from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const navigate = useNavigate();

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filterTag) params.tag = filterTag;
      if (showArchived) params.archived = 'true';
      const { data } = await notesApi.getAll(params);
      setNotes(data.notes);
    } catch { toast.error('Failed to load notes'); }
    finally { setLoading(false); }
  }, [search, filterTag, showArchived]);

  useEffect(() => {
    const t = setTimeout(fetchNotes, 300);
    return () => clearTimeout(t);
  }, [fetchNotes]);

  const deleteNote = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Delete this note?')) return;
    try { await notesApi.delete(id); setNotes(n => n.filter(x => x._id !== id)); toast.success('Deleted'); }
    catch { toast.error('Failed to delete'); }
  };

  const archiveNote = async (e, note) => {
    e.stopPropagation();
    try {
      await notesApi.update(note._id, { isArchived: !note.isArchived });
      setNotes(n => n.filter(x => x._id !== note._id));
      toast.success(note.isArchived ? 'Restored' : 'Archived');
    } catch { toast.error('Failed'); }
  };

  return (
    <div style={{ padding: '32px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.03em' }}>
          {showArchived ? 'Archived Notes' : 'My Notes'}
        </h1>
        <button onClick={() => setShowArchived(a => !a)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', background: showArchived ? 'var(--accent-subtle)' : 'var(--surface-2)', border: '1px solid var(--border)', color: showArchived ? 'var(--accent)' : 'var(--text-2)', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'var(--font-body)' }}>
          <Archive size={14} />{showArchived ? 'Show active' : 'Archived'}
        </button>
      </div>

      {/* Search & filter */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes..."
            style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', outline: 'none' }} />
        </div>
        <div style={{ position: 'relative' }}>
          <Tag size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <input value={filterTag} onChange={e => setFilterTag(e.target.value)} placeholder="Filter by tag"
            style={{ padding: '10px 14px 10px 36px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', outline: 'none', width: '160px' }} />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-3)' }}>Loading...</div>
      ) : notes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-3)' }}>
          {search || filterTag ? 'No notes match your search.' : 'No notes yet. Create one!'}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {notes.map(note => (
            <div key={note._id} onClick={() => navigate(`/notes/${note._id}`)} className="fade-in"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', cursor: 'pointer', transition: 'border-color 0.15s, transform 0.15s', position: 'relative' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.95rem', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{note.title}</h3>
              {note.tags?.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {note.tags.slice(0, 3).map(t => (
                    <span key={t} style={{ padding: '2px 8px', borderRadius: '99px', background: 'var(--accent-subtle)', color: 'var(--accent)', fontSize: '0.72rem', fontWeight: 500 }}>{t}</span>
                  ))}
                </div>
              )}
              {note.aiSummary && <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>✨ {note.aiSummary}</div>}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}</span>
                <div style={{ display: 'flex', gap: '4px' }} onClick={e => e.stopPropagation()}>
                  {note.isPublic && <Share2 size={13} style={{ color: 'var(--green)' }} />}
                  <button onClick={e => archiveNote(e, note)} title={note.isArchived ? 'Restore' : 'Archive'} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: '2px' }}><RefreshCw size={13} /></button>
                  <button onClick={e => deleteNote(e, note._id)} title="Delete" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: '2px' }}><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
