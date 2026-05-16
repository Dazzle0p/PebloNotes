import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { notesApi } from '../services/api';
import { ArrowLeft, Sparkles, Share2, Tag, X, Loader, CheckCircle, Copy, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export default function NoteEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareId, setShareId] = useState(null);
  const [isPublic, setIsPublic] = useState(false);
  const autoSaveRef = useRef(null);

  useEffect(() => {
    notesApi.getOne(id).then(({ data }) => {
      setNote(data.note);
      setTitle(data.note.title);
      setContent(data.note.content || '');
      setTags(data.note.tags || []);
      setShareId(data.note.shareId || null);
      setIsPublic(data.note.isPublic || false);
    }).catch(() => { toast.error('Note not found'); navigate('/notes'); });
  }, [id]);

  const save = useCallback(async (t, c, tgs) => {
    setSaving(true); setSaved(false);
    try {
      await notesApi.update(id, { title: t, content: c, tags: tgs });
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  }, [id]);

  const scheduleAutoSave = (t, c, tgs) => {
    clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => save(t, c, tgs), 1500);
  };

  const handleTitleChange = (e) => { setTitle(e.target.value); scheduleAutoSave(e.target.value, content, tags); };
  const handleContentChange = (e) => { setContent(e.target.value); scheduleAutoSave(title, e.target.value, tags); };

  const addTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      const newTags = [...new Set([...tags, tagInput.trim().toLowerCase()])];
      setTags(newTags); setTagInput(''); scheduleAutoSave(title, content, newTags);
    }
  };
  const removeTag = (t) => { const newTags = tags.filter(x => x !== t); setTags(newTags); scheduleAutoSave(title, content, newTags); };

  const generateAI = async () => {
    if (!content.trim()) { toast.error('Add some content first'); return; }
    setAiLoading(true);
    try {
      const { data } = await notesApi.generateSummary(id);
      setNote(data.note);
      if (data.note.title !== title) setTitle(data.note.title);
      toast.success('AI summary generated!');
    } catch { toast.error('AI generation failed'); }
    finally { setAiLoading(false); }
  };

  const handleShare = async () => {
    setShareLoading(true);
    try {
      if (isPublic) {
        await notesApi.unshare(id);
        setIsPublic(false); setShareId(null); toast.success('Note is now private');
      } else {
        const { data } = await notesApi.share(id);
        setShareId(data.shareId); setIsPublic(true);
        const url = `${window.location.origin}/shared/${data.shareId}`;
        await navigator.clipboard.writeText(url);
        toast.success('Share link copied!');
      }
    } catch { toast.error('Failed'); }
    finally { setShareLoading(false); }
  };

  const copyLink = async () => {
    const url = `${window.location.origin}/shared/${shareId}`;
    await navigator.clipboard.writeText(url);
    toast.success('Copied!');
  };

  if (!note) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-3)' }}>Loading...</div>;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0 }}>
        <button onClick={() => navigate('/notes')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontFamily: 'var(--font-body)' }}>
          <ArrowLeft size={16} /> Notes
        </button>
        <div style={{ flex: 1 }} />
        {/* Save status */}
        <span style={{ fontSize: '0.78rem', color: saving ? 'var(--text-3)' : saved ? 'var(--green)' : 'var(--text-3)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          {saving ? <><Loader size={12} className="spin" />Saving...</> : saved ? <><CheckCircle size={12} />Saved</> : note.updatedAt ? `Last saved ${formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}` : ''}
        </span>
        <button onClick={generateAI} disabled={aiLoading} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', background: 'var(--accent-subtle)', border: '1px solid var(--accent)', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'var(--font-body)', fontWeight: 500 }}>
          {aiLoading ? <Loader size={14} className="spin" /> : <Sparkles size={14} />} AI Summary
        </button>
        <button onClick={handleShare} disabled={shareLoading} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', background: isPublic ? 'rgba(74,222,128,0.1)' : 'var(--surface-2)', border: `1px solid ${isPublic ? 'var(--green)' : 'var(--border)'}`, color: isPublic ? 'var(--green)' : 'var(--text-2)', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'var(--font-body)' }}>
          {isPublic ? <EyeOff size={14} /> : <Share2 size={14} />} {isPublic ? 'Unshare' : 'Share'}
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '40px 48px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        {/* Public link */}
        {isPublic && shareId && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '10px', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', marginBottom: '24px', fontSize: '0.85rem' }}>
            <Share2 size={14} style={{ color: 'var(--green)' }} />
            <span style={{ color: 'var(--text-2)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {window.location.origin}/shared/{shareId}
            </span>
            <button onClick={copyLink} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--green)', display: 'flex' }}><Copy size={14} /></button>
          </div>
        )}

        {/* Title */}
        <input value={title} onChange={handleTitleChange}
          style={{ width: '100%', background: 'none', border: 'none', outline: 'none', fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.03em', marginBottom: '16px' }}
          placeholder="Untitled Note" />

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '24px', alignItems: 'center' }}>
          {tags.map(t => (
            <span key={t} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '99px', background: 'var(--accent-subtle)', color: 'var(--accent)', fontSize: '0.78rem' }}>
              {t} <button onClick={() => removeTag(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', display: 'flex', padding: 0 }}><X size={11} /></button>
            </span>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Tag size={13} style={{ color: 'var(--text-3)' }} />
            <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={addTag}
              placeholder="Add tag, Enter" style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-2)', fontSize: '0.82rem', fontFamily: 'var(--font-body)', width: '120px' }} />
          </div>
        </div>

        {/* Content */}
        <textarea value={content} onChange={handleContentChange}
          placeholder="Start writing..."
          style={{ width: '100%', minHeight: '320px', background: 'none', border: 'none', outline: 'none', fontFamily: 'var(--font-body)', fontSize: '1rem', color: 'var(--text)', lineHeight: 1.75, resize: 'none', color: 'var(--text-2)' }} />

        {/* AI output */}
        {note.aiSummary && (
          <div style={{ marginTop: '40px', padding: '24px', borderRadius: '12px', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px', color: 'var(--accent)' }}>
              <Sparkles size={15} /> AI Summary
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-2)', lineHeight: 1.7, marginBottom: '16px' }}>{note.aiSummary}</p>
            {note.aiActionItems?.length > 0 && (
              <>
                <h4 style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Action Items</h4>
                <ul style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {note.aiActionItems.map((item, i) => (
                    <li key={i} style={{ fontSize: '0.88rem', color: 'var(--text-2)', lineHeight: 1.6 }}>{item}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
