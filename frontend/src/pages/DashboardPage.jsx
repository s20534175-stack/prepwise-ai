import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dsaAPI, interviewAPI } from '../services/api';
import {
  FileText, Mic, Code2, Lightbulb, TrendingUp,
  Flame, Target, Award, ArrowRight, ChevronRight,
  CheckCircle, Clock
} from 'lucide-react';

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
        {sub && <p className="text-xs text-green-600 font-medium mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function QuickAction({ to, icon: Icon, title, desc, color }) {
  return (
    <Link to={to} className="card-hover group flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
        <Icon size={18} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm">{title}</p>
        <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{desc}</p>
      </div>
      <ChevronRight size={16} className="text-gray-300 group-hover:text-primary-500 transition-colors mt-1 flex-shrink-0" />
    </Link>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([dsaAPI.getAnalytics(), interviewAPI.getHistory()])
      .then(([dsaRes, intRes]) => {
        setAnalytics(dsaRes.data.data);
        setInterviews(intRes.data.data?.slice(0, 3) || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const diffCount = (diff) => analytics?.byDifficulty?.find(d => d._id === diff)?.count || 0;

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="page-title">
          {getGreeting()}, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="page-subtitle">
          {user?.targetRole ? `Preparing for: ${user.targetRole}` : 'Let\'s get you interview-ready today.'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Flame}
          label="DSA Streak"
          value={`${user?.dsaStreak || 0} days`}
          color="bg-gradient-to-br from-orange-400 to-red-500"
          sub={user?.dsaStreak > 0 ? '🔥 Keep it up!' : 'Start your streak!'}
        />
        <StatCard
          icon={Code2}
          label="Problems solved"
          value={analytics?.totalSolved || 0}
          color="bg-gradient-to-br from-green-400 to-emerald-500"
        />
        <StatCard
          icon={Mic}
          label="Interviews done"
          value={user?.totalInterviews || 0}
          color="bg-gradient-to-br from-purple-400 to-violet-500"
        />
        <StatCard
          icon={Target}
          label="Avg interview score"
          value={`${user?.averageScore || 0}%`}
          color="bg-gradient-to-br from-blue-400 to-primary-500"
          sub={user?.averageScore >= 70 ? '✅ Interview-ready!' : ''}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick actions */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="section-title">Quick actions</h2>
          <div className="space-y-3">
            <QuickAction
              to="/resume"
              icon={FileText}
              title="Analyze your resume"
              desc="Upload your PDF and get an ATS score + keyword feedback in seconds."
              color="bg-gradient-to-br from-blue-500 to-blue-600"
            />
            <QuickAction
              to="/interview"
              icon={Mic}
              title="Start a mock interview"
              desc="Practice HR and technical questions with real-time AI evaluation."
              color="bg-gradient-to-br from-purple-500 to-violet-600"
            />
            <QuickAction
              to="/dsa"
              icon={Code2}
              title="Log a DSA problem"
              desc="Track today's practice and maintain your streak."
              color="bg-gradient-to-br from-green-500 to-emerald-600"
            />
            <QuickAction
              to="/questions"
              icon={Lightbulb}
              title="Generate practice questions"
              desc="Get AI-generated interview questions for any role and topic."
              color="bg-gradient-to-br from-amber-500 to-orange-500"
            />
          </div>
        </div>

        {/* DSA breakdown */}
        <div className="space-y-4">
          <h2 className="section-title">DSA breakdown</h2>
          <div className="card space-y-4">
            {[
              { label: 'Easy', count: diffCount('easy'), color: 'bg-green-500', total: analytics?.totalSolved || 1 },
              { label: 'Medium', count: diffCount('medium'), color: 'bg-yellow-400', total: analytics?.totalSolved || 1 },
              { label: 'Hard', count: diffCount('hard'), color: 'bg-red-500', total: analytics?.totalSolved || 1 },
            ].map(({ label, count, color, total }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-gray-700">{label}</span>
                  <span className="text-gray-500">{count}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${color} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.round((count / Math.max(total, 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
            <Link to="/dsa" className="btn-ghost w-full justify-center text-sm mt-2">
              View full tracker <ArrowRight size={14} />
            </Link>
          </div>

          {/* Recent interviews */}
          {interviews.length > 0 && (
            <>
              <h2 className="section-title">Recent interviews</h2>
              <div className="card space-y-3">
                {interviews.map(iv => (
                  <Link key={iv._id} to={`/interview/result/${iv._id}`} className="flex items-center justify-between group">
                    <div>
                      <p className="text-sm font-medium text-gray-800 group-hover:text-primary-600">{iv.jobRole}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <Clock size={10} /> {new Date(iv.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className={`text-sm font-bold ${iv.percentage >= 70 ? 'text-green-600' : iv.percentage >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>
                      {iv.percentage}%
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
