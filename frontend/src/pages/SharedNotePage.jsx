import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { sharedApi } from '../services/api';
import { Sparkles, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

export default function SharedNotePage() {
  const { shareId } = useParams();
  const [note, setNote] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    sharedApi.getNote(shareId)
      .then(r => setNote(r.data.note))
      .catch(() => setError('Note not found or no longer public.'));
  }, [shareId]);

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', flexDirection: 'column', gap: '16px', color: 'var(--text-2)' }}>
      <p>{error}</p>
      <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '0.9rem' }}>Go to Peblo Notes →</Link>
    </div>
  );

  if (!note) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', color: 'var(--text-3)' }}>Loading...</div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '60px 24px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '48px' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.03em' }}>
            Peblo <span style={{ color: 'var(--accent)' }}>Notes</span>
          </span>
          <Link to="/signup" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent)', textDecoration: 'none', fontSize: '0.85rem' }}>
            <ExternalLink size={13} /> Create your workspace
          </Link>
        </div>

        {/* Note */}
        <div className="fade-in">
          {note.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              {note.tags.map(t => <span key={t} style={{ padding: '3px 10px', borderRadius: '99px', background: 'var(--accent-subtle)', color: 'var(--accent)', fontSize: '0.78rem' }}>{t}</span>)}
            </div>
          )}
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.2, marginBottom: '12px' }}>{note.title}</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-3)', marginBottom: '40px' }}>
            By {note.user?.name} · {format(new Date(note.updatedAt), 'MMMM d, yyyy')}
          </p>

          {note.aiSummary && (
            <div style={{ padding: '20px 24px', borderRadius: '12px', background: 'var(--surface)', border: '1px solid var(--border)', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <Sparkles size={13} />AI Summary
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-2)', lineHeight: 1.7 }}>{note.aiSummary}</p>
            </div>
          )}

          <div style={{ fontSize: '1rem', color: 'var(--text-2)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{note.content}</div>
        </div>
      </div>
    </div>
  );
}
