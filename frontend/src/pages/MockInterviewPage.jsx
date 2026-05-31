import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { interviewAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Mic, Loader2, Clock, BarChart2, Brain, Users, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const types = [
  { value: 'hr', label: 'HR', desc: 'Behavioral & background', icon: Users },
  { value: 'technical', label: 'Technical', desc: 'Coding & system design', icon: Brain },
  { value: 'mixed', label: 'Mixed', desc: 'HR + Technical blend', icon: Mic },
];

const difficulties = [
  { value: 'easy', label: 'Easy', desc: 'Fresher / Entry level', color: 'border-green-300 bg-green-50 text-green-700' },
  { value: 'medium', label: 'Medium', desc: '0–2 years experience', color: 'border-yellow-300 bg-yellow-50 text-yellow-700' },
  { value: 'hard', label: 'Hard', desc: '2+ years / Senior', color: 'border-red-300 bg-red-50 text-red-700' },
];

export default function MockInterviewPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    jobRole: user?.targetRole || '',
    type: 'hr',
    difficulty: 'medium',
    questionCount: 5,
  });
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    if (!form.jobRole.trim()) { toast.error('Please enter a job role.'); return; }
    setLoading(true);
    try {
      const res = await interviewAPI.start(form);
      toast.success('Interview session ready!');
      navigate(`/interview/session/${res.data.data.interviewId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start interview. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-slide-up max-w-2xl">
      <div>
        <h1 className="page-title">Mock Interview</h1>
        <p className="page-subtitle">Configure your session and get started with AI evaluation.</p>
      </div>

      <div className="card space-y-6">
        {/* Job role */}
        <div>
          <label className="label">Job role *</label>
          <input
            type="text"
            className="input"
            placeholder="e.g. Software Developer, Frontend Engineer, Data Analyst..."
            value={form.jobRole}
            onChange={e => setForm({ ...form, jobRole: e.target.value })}
          />
        </div>

        {/* Type */}
        <div>
          <label className="label">Interview type</label>
          <div className="grid grid-cols-3 gap-3">
            {types.map(({ value, label, desc, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setForm({ ...form, type: value })}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  form.type === value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <Icon size={18} className={form.type === value ? 'text-primary-600' : 'text-gray-400'} />
                <p className={`font-semibold text-sm mt-1 ${form.type === value ? 'text-primary-700' : 'text-gray-700'}`}>{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <label className="label">Difficulty</label>
          <div className="grid grid-cols-3 gap-3">
            {difficulties.map(({ value, label, desc, color }) => (
              <button
                key={value}
                onClick={() => setForm({ ...form, difficulty: value })}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  form.difficulty === value
                    ? `border-2 ${color}`
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <p className={`font-semibold text-sm ${form.difficulty === value ? '' : 'text-gray-700'}`}>{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Question count */}
        <div>
          <label className="label">Number of questions: <span className="text-primary-600 font-bold">{form.questionCount}</span></label>
          <input
            type="range"
            min="3"
            max="10"
            step="1"
            value={form.questionCount}
            onChange={e => setForm({ ...form, questionCount: parseInt(e.target.value) })}
            className="w-full accent-primary-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>3 (quick)</span>
            <span>10 (full)</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex items-center gap-3 text-sm text-gray-500 bg-gray-50 rounded-xl p-3">
          <Clock size={16} className="text-gray-400 flex-shrink-0" />
          <span>Estimated time: ~{form.questionCount * 3} minutes. AI evaluates each answer instantly.</span>
        </div>

        <button
          onClick={handleStart}
          disabled={loading}
          className="btn-primary w-full justify-center py-3 text-base"
        >
          {loading ? (
            <><Loader2 size={18} className="animate-spin" /> Generating questions...</>
          ) : (
            <><Mic size={18} /> Start interview</>
          )}
        </button>
      </div>

      {/* Tips */}
      <div className="card bg-primary-50 border-primary-100">
        <h3 className="font-semibold text-primary-800 mb-3 flex items-center gap-2">
          <BarChart2 size={16} /> Tips for a great session
        </h3>
        <ul className="space-y-1.5 text-sm text-primary-700">
          {[
            'Type your answers as you would speak them in a real interview.',
            'Aim for 2–4 sentences minimum per answer.',
            'Use STAR method (Situation, Task, Action, Result) for behavioral questions.',
            'Don\'t worry about perfect grammar — focus on content and clarity.',
          ].map((tip, i) => (
            <li key={i} className="flex items-start gap-2">
              <ChevronRight size={14} className="mt-0.5 flex-shrink-0" /> {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
