import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { interviewAPI } from '../services/api';
import { Loader2, CheckCircle, XCircle, Trophy, TrendingUp, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

function ScoreGauge({ percentage }) {
  const color = percentage >= 70 ? 'text-green-500 stroke-green-500' : percentage >= 50 ? 'text-yellow-500 stroke-yellow-500' : 'text-red-500 stroke-red-500';
  const pct = (percentage / 100) * 283;
  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="#f3f4f6" strokeWidth="8" />
        <circle cx="50" cy="50" r="45" fill="none" strokeWidth="8" strokeLinecap="round"
          className={color.split(' ')[1]}
          strokeDasharray={`${pct} 283`} style={{ transition: 'stroke-dasharray 1.2s ease' }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className={`text-3xl font-bold ${color.split(' ')[0]}`}>{percentage}%</span>
        <span className="text-xs text-gray-500 mt-1">Overall score</span>
      </div>
    </div>
  );
}

function QuestionReview({ q, index }) {
  const [open, setOpen] = useState(false);
  const scoreColor = q.score >= 7 ? 'text-green-600 bg-green-50' : q.score >= 5 ? 'text-yellow-600 bg-yellow-50' : 'text-red-600 bg-red-50';

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className={`w-8 h-8 rounded-lg text-sm font-bold flex items-center justify-center flex-shrink-0 ${scoreColor}`}>
            {q.score}
          </span>
          <p className="text-sm font-medium text-gray-800 line-clamp-1">{q.question}</p>
        </div>
        {open ? <ChevronUp size={16} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
          {q.userAnswer ? (
            <div className="bg-gray-50 rounded-xl p-3 mt-3">
              <p className="text-xs font-semibold text-gray-500 mb-1">Your answer</p>
              <p className="text-sm text-gray-700">{q.userAnswer}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic mt-3">No answer provided.</p>
          )}
          {q.aiFeedback && (
            <div className="bg-blue-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-blue-600 mb-1">AI feedback</p>
              <p className="text-sm text-blue-800">{q.aiFeedback}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function InterviewResultPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    interviewAPI.getById(id)
      .then(res => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-64">
      <Loader2 size={32} className="animate-spin text-primary-500" />
    </div>
  );

  if (!data) return <div className="text-center text-gray-500 mt-20">Interview not found.</div>;

  const passed = data.percentage >= 70;

  return (
    <div className="max-w-3xl animate-slide-up space-y-6">
      <div>
        <h1 className="page-title">Interview Results</h1>
        <p className="page-subtitle">{data.jobRole} · {data.type?.toUpperCase()} · {data.difficulty}</p>
      </div>

      {/* Score card */}
      <div className="card text-center">
        <ScoreGauge percentage={data.percentage} />
        <div className="mt-4">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold ${passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
            {passed ? <><Trophy size={16} /> Interview-ready!</> : <><TrendingUp size={16} /> Keep practicing</>}
          </div>
          {data.aiSummary && (
            <p className="text-gray-500 text-sm mt-3 max-w-lg mx-auto leading-relaxed">{data.aiSummary}</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-gray-100">
          <div>
            <p className="text-2xl font-bold text-gray-900">{data.totalScore}</p>
            <p className="text-xs text-gray-500">Total score</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{data.questions?.length}</p>
            <p className="text-xs text-gray-500">Questions</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {data.duration ? `${Math.floor(data.duration / 60)}m ${data.duration % 60}s` : '—'}
            </p>
            <p className="text-xs text-gray-500">Duration</p>
          </div>
        </div>
      </div>

      {/* Strengths & improvements */}
      {(data.strengths?.length > 0 || data.improvements?.length > 0) && (
        <div className="grid sm:grid-cols-2 gap-5">
          {data.strengths?.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
                <CheckCircle size={16} className="text-green-500" /> Strengths
              </h3>
              <ul className="space-y-2">
                {data.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {data.improvements?.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
                <TrendingUp size={16} className="text-yellow-500" /> Areas to improve
              </h3>
              <ul className="space-y-2">
                {data.improvements.map((s, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-yellow-500 mt-0.5">→</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Q&A review */}
      <div>
        <h2 className="section-title">Question-by-question review</h2>
        <div className="space-y-3">
          {data.questions?.map((q, i) => (
            <QuestionReview key={i} q={q} index={i} />
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Link to="/interview" className="btn-primary flex-1 justify-center">
          Try again <ArrowRight size={16} />
        </Link>
        <Link to="/dashboard" className="btn-secondary flex-1 justify-center">
          Dashboard
        </Link>
      </div>
    </div>
  );
}
