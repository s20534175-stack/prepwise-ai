import { useState, useEffect } from 'react';
import { dsaAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Flame, Plus, Trash2, Loader2, BarChart2, Code2, Filter, X } from 'lucide-react';
import toast from 'react-hot-toast';

const TOPICS = ['Array','String','LinkedList','Tree','Graph','DP','Greedy',
  'Binary Search','Stack','Queue','Heap','Hashing','Math','Other'];
const PLATFORMS = ['LeetCode','HackerRank','Codeforces','GeeksForGeeks','CodeChef','Other'];
const DIFFICULTIES = ['easy','medium','hard'];

function LogForm({ onSuccess }) {
  const [form, setForm] = useState({
    problemTitle: '', platform: 'LeetCode', difficulty: 'medium',
    topic: 'Array', timeSpent: '', notes: '', url: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dsaAPI.log({ ...form, timeSpent: parseInt(form.timeSpent) || 0 });
      toast.success(`"${form.problemTitle}" logged! 🔥`);
      setForm({ problemTitle: '', platform: 'LeetCode', difficulty: 'medium',
        topic: 'Array', timeSpent: '', notes: '', url: '' });
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log problem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
        <Plus size={18} className="text-primary-600" /> Log a problem
      </h3>

      <div>
        <label className="label">Problem title *</label>
        <input type="text" className="input" placeholder="e.g. Two Sum, LRU Cache..."
          value={form.problemTitle} onChange={e => setForm({...form, problemTitle: e.target.value})} required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Platform</label>
          <select className="input" value={form.platform} onChange={e => setForm({...form, platform: e.target.value})}>
            {PLATFORMS.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Topic</label>
          <select className="input" value={form.topic} onChange={e => setForm({...form, topic: e.target.value})}>
            {TOPICS.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Difficulty</label>
          <div className="flex gap-2">
            {DIFFICULTIES.map(d => (
              <button key={d} type="button"
                onClick={() => setForm({...form, difficulty: d})}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold border-2 transition-all capitalize
                  ${form.difficulty === d
                    ? d === 'easy' ? 'border-green-400 bg-green-50 text-green-700'
                    : d === 'medium' ? 'border-yellow-400 bg-yellow-50 text-yellow-700'
                    : 'border-red-400 bg-red-50 text-red-700'
                    : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}
              >{d}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">Time spent (min)</label>
          <input type="number" className="input" placeholder="30" min="0"
            value={form.timeSpent} onChange={e => setForm({...form, timeSpent: e.target.value})} />
        </div>
      </div>

      <div>
        <label className="label">Problem URL (optional)</label>
        <input type="url" className="input" placeholder="https://leetcode.com/problems/..."
          value={form.url} onChange={e => setForm({...form, url: e.target.value})} />
      </div>

      <div>
        <label className="label">Notes (optional)</label>
        <textarea className="input resize-none" rows={2} placeholder="Approach used, key insight..."
          value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
        {loading ? <><Loader2 size={16} className="animate-spin" /> Logging...</> : <><Flame size={16} /> Log problem</>}
      </button>
    </form>
  );
}

function ProblemRow({ p, onDelete }) {
  const diffClass = { easy: 'diff-easy', medium: 'diff-medium', hard: 'diff-hard' }[p.difficulty];

  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0 group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {p.url
            ? <a href={p.url} target="_blank" rel="noopener noreferrer"
                className="font-medium text-gray-900 text-sm hover:text-primary-600 truncate">
                {p.problemTitle}
              </a>
            : <span className="font-medium text-gray-900 text-sm truncate">{p.problemTitle}</span>
          }
          <span className={`badge ${diffClass}`}>{p.difficulty}</span>
          <span className="badge badge-blue">{p.topic}</span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          {p.platform} · {p.timeSpent > 0 ? `${p.timeSpent}min` : ''} · {new Date(p.solvedAt).toLocaleDateString()}
        </p>
      </div>
      <button onClick={() => onDelete(p._id)}
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all">
        <Trash2 size={14} />
      </button>
    </div>
  );
}

export default function DSATrackerPage() {
  const { user, updateUser } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [problems, setProblems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ topic: '', difficulty: '', platform: '' });
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [showForm, setShowForm] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [anaRes, probRes] = await Promise.all([
        dsaAPI.getAnalytics(),
        dsaAPI.getProblems({ ...filters, page, limit: 15 })
      ]);
      setAnalytics(anaRes.data.data);
      setProblems(probRes.data.data);
      setTotal(probRes.data.total);
      setPages(probRes.data.pages);
      updateUser({ dsaStreak: anaRes.data.data.streak });
    } catch (err) {
      toast.error('Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [filters, page]);

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this problem?')) return;
    try {
      await dsaAPI.delete(id);
      toast.success('Problem removed.');
      fetchData();
    } catch { toast.error('Failed to delete.'); }
  };

  const topicCounts = analytics?.byTopic || [];
  const maxTopic = Math.max(...topicCounts.map(t => t.count), 1);

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">DSA Tracker</h1>
          <p className="page-subtitle">Log problems, maintain streaks, spot weak areas.</p>
        </div>
        <button onClick={() => setShowForm(s => !s)} className="btn-primary">
          {showForm ? <><X size={16}/> Cancel</> : <><Plus size={16}/> Log problem</>}
        </button>
      </div>

      {showForm && <LogForm onSuccess={() => { setShowForm(false); fetchData(); }} />}

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total solved', value: analytics?.totalSolved || 0, color: 'text-primary-600' },
          { label: 'Current streak', value: `${analytics?.streak || 0} 🔥`, color: 'text-orange-500' },
          { label: 'Easy', value: analytics?.byDifficulty?.find(d=>d._id==='easy')?.count || 0, color: 'text-green-600' },
          { label: 'Hard', value: analytics?.byDifficulty?.find(d=>d._id==='hard')?.count || 0, color: 'text-red-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Topic breakdown */}
        <div className="card">
          <h3 className="section-title flex items-center gap-2">
            <BarChart2 size={16} className="text-primary-500" /> Topics
          </h3>
          {topicCounts.length === 0
            ? <p className="text-sm text-gray-400">Log problems to see topic breakdown.</p>
            : <div className="space-y-3">
                {topicCounts.map(({ _id, count }) => (
                  <div key={_id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 font-medium">{_id}</span>
                      <span className="text-gray-500">{count}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500 rounded-full"
                        style={{ width: `${(count/maxTopic)*100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
          }
        </div>

        {/* Problem list */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="section-title mb-0 flex items-center gap-2">
              <Code2 size={16} className="text-primary-500" /> Problems ({total})
            </h3>
            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
              <select className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 bg-white"
                value={filters.difficulty} onChange={e => { setFilters({...filters, difficulty: e.target.value}); setPage(1); }}>
                <option value="">All levels</option>
                {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 bg-white"
                value={filters.topic} onChange={e => { setFilters({...filters, topic: e.target.value}); setPage(1); }}>
                <option value="">All topics</option>
                {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {(filters.topic || filters.difficulty) && (
                <button onClick={() => { setFilters({ topic:'', difficulty:'', platform:'' }); setPage(1); }}
                  className="text-xs text-red-500 hover:underline flex items-center gap-1">
                  <X size={12}/> Clear
                </button>
              )}
            </div>
          </div>

          {loading
            ? <div className="flex items-center justify-center py-10"><Loader2 className="animate-spin text-primary-500" size={24}/></div>
            : problems.length === 0
            ? <div className="text-center py-10 text-gray-400">
                <Code2 size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">No problems logged yet. Start your journey!</p>
              </div>
            : <>
                <div>
                  {problems.map(p => (
                    <ProblemRow key={p._id} p={p} onDelete={handleDelete} />
                  ))}
                </div>
                {pages > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-gray-100">
                    <button disabled={page === 1} onClick={() => setPage(p=>p-1)}
                      className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40">← Prev</button>
                    <span className="text-xs text-gray-500">Page {page} of {pages}</span>
                    <button disabled={page === pages} onClick={() => setPage(p=>p+1)}
                      className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40">Next →</button>
                  </div>
                )}
              </>
          }
        </div>
      </div>
    </div>
  );
}
