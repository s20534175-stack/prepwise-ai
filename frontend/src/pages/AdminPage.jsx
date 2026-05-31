import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { Users, Mic, Code2, TrendingUp, Search, Loader2, ToggleLeft, ToggleRight, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}><Icon size={22} className="text-white" /></div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);

  const fetchUsers = async (q = '') => {
    try {
      const res = await adminAPI.getUsers({ search: q, limit: 20 });
      setUsers(res.data.data);
      setTotal(res.data.total);
    } catch { toast.error('Failed to load users.'); }
  };

  useEffect(() => {
    Promise.all([adminAPI.getStats(), adminAPI.getUsers({})])
      .then(([sRes, uRes]) => {
        setStats(sRes.data.data);
        setUsers(uRes.data.data);
        setTotal(uRes.data.total);
      })
      .catch(() => toast.error('Failed to load admin data.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleToggle = async (userId, name) => {
    setToggling(userId);
    try {
      const res = await adminAPI.toggleUser(userId);
      setUsers(us => us.map(u => u._id === userId ? { ...u, isActive: res.data.isActive } : u));
      toast.success(`${name} ${res.data.isActive ? 'activated' : 'deactivated'}.`);
    } catch { toast.error('Failed to toggle user.'); }
    finally { setToggling(null); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-64">
      <Loader2 size={32} className="animate-spin text-primary-500" />
    </div>
  );

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-rose-500 rounded-xl flex items-center justify-center">
          <Shield size={20} className="text-white" />
        </div>
        <div>
          <h1 className="page-title">Admin Panel</h1>
          <p className="page-subtitle">Manage users and monitor platform activity.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total users" value={stats?.totalUsers || 0} color="bg-gradient-to-br from-blue-400 to-primary-500" />
        <StatCard icon={Mic} label="Interviews done" value={stats?.totalInterviews || 0} color="bg-gradient-to-br from-purple-400 to-violet-500" />
        <StatCard icon={Code2} label="DSA problems" value={stats?.totalDSA || 0} color="bg-gradient-to-br from-green-400 to-emerald-500" />
        <StatCard icon={TrendingUp} label="Avg interview score" value={`${stats?.avgInterviewScore || 0}%`} color="bg-gradient-to-br from-amber-400 to-orange-500" />
      </div>

      {/* Users table */}
      <div className="card">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
          <h2 className="section-title mb-0">Users ({total})</h2>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" className="input pl-9 py-2 text-sm w-56"
              placeholder="Search name or email..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['User','Role','Target role','Interviews','Streak','Joined','Status','Action'].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {u.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`badge ${u.role === 'admin' ? 'badge-red' : 'badge-blue'}`}>{u.role}</span>
                  </td>
                  <td className="py-3 px-3 text-gray-600 text-xs">{u.targetRole || '—'}</td>
                  <td className="py-3 px-3 text-center text-gray-700">{u.totalInterviews}</td>
                  <td className="py-3 px-3 text-center">{u.dsaStreak > 0 ? `${u.dsaStreak}🔥` : '0'}</td>
                  <td className="py-3 px-3 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-3">
                    <span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>
                      {u.isActive ? 'Active' : 'Banned'}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => handleToggle(u._id, u.name)}
                        disabled={toggling === u._id}
                        className={`p-1.5 rounded-lg transition-colors ${u.isActive ? 'text-red-400 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}
                        title={u.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {toggling === u._id
                          ? <Loader2 size={16} className="animate-spin" />
                          : u.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />
                        }
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <p className="text-center text-gray-400 py-8 text-sm">No users found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
