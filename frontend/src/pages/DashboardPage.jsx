import { useEffect, useState } from 'react';
import { insightsApi } from '../services/api';
import { FileText, Archive, Sparkles, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatDistanceToNow, format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ icon: Icon, label, value, accent }) => (
  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: accent || 'var(--text-3)', fontSize: '0.8rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
      <Icon size={14} />{label}
    </div>
    <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.03em' }}>{value}</div>
  </div>
);

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    insightsApi.get().then(r => setData(r.data)).catch(console.error);
  }, []);

  if (!data) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-3)' }}>Loading...</div>;

  // Fill weekly gaps
  const last7 = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = format(d, 'yyyy-MM-dd');
    const found = data.weeklyActivity.find(w => w._id === key);
    last7.push({ day: format(d, 'EEE'), count: found?.count || 0 });
  }

  return (
    <div style={{ padding: '32px', maxWidth: '960px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '28px' }}>Dashboard</h1>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <StatCard icon={FileText} label="Total Notes" value={data.totalNotes} />
        <StatCard icon={Archive} label="Archived" value={data.archivedNotes} />
        <StatCard icon={Sparkles} label="AI Summaries" value={data.aiUsed} accent="var(--accent)" />
        <StatCard icon={TrendingUp} label="This Week" value={data.weeklyNotes} accent="var(--green)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        {/* Weekly chart */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, marginBottom: '20px' }}>Weekly Activity</h2>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={last7} barSize={20}>
              <XAxis dataKey="day" tick={{ fill: 'var(--text-3)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '0.85rem' }} cursor={{ fill: 'rgba(124,106,247,0.1)' }} />
              <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top tags */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>Top Tags</h2>
          {data.topTags.length === 0 ? <p style={{ color: 'var(--text-3)', fontSize: '0.875rem' }}>No tags yet</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {data.topTags.map(({ tag, count }) => {
                const max = data.topTags[0].count;
                return (
                  <div key={tag}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.82rem' }}>
                      <span style={{ color: 'var(--text-2)' }}>{tag}</span>
                      <span style={{ color: 'var(--text-3)' }}>{count}</span>
                    </div>
                    <div style={{ height: '4px', borderRadius: '99px', background: 'var(--surface-3)' }}>
                      <div style={{ height: '100%', borderRadius: '99px', background: 'var(--accent)', width: `${(count / max) * 100}%`, transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent notes */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>Recently Edited</h2>
        {data.recentNotes.length === 0 ? <p style={{ color: 'var(--text-3)', fontSize: '0.875rem' }}>No notes yet</p> : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {data.recentNotes.map((note, i) => (
              <div key={note._id} onClick={() => navigate(`/notes/${note._id}`)}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: i < data.recentNotes.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: '0.9rem', marginBottom: '2px' }}>{note.title}</div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {note.tags?.slice(0, 3).map(t => <span key={t} style={{ fontSize: '0.72rem', color: 'var(--accent)' }}>#{t}</span>)}
                  </div>
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-3)', flexShrink: 0 }}>{formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
