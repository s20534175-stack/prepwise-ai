import { useState } from 'react';
import { questionsAPI } from '../services/api';
import { Lightbulb, Loader2, Copy, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

const roles = ['Software Developer','Frontend Developer','Backend Developer',
  'Full Stack Developer','Data Analyst','Data Engineer','DevOps Engineer',
  'QA Engineer','Product Manager','UI/UX Designer','Machine Learning Engineer'];

const types = [
  { value: 'hr', label: 'HR / Behavioral' },
  { value: 'technical', label: 'Technical' },
  { value: 'mixed', label: 'Mixed' },
];

const difficulties = ['easy','medium','hard'];

function QuestionCard({ q, index }) {
  const [open, setOpen] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(q.question);
    toast.success('Copied!');
  };

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden hover:border-primary-100 transition-colors">
      <div className="flex items-start gap-3 p-4">
        <span className="w-7 h-7 rounded-lg bg-primary-100 text-primary-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
          {index + 1}
        </span>
        <div className="flex-1">
          <p className="text-gray-800 font-medium text-sm leading-relaxed">{q.question}</p>
          {q.category && (
            <span className="badge badge-blue mt-2">{q.category}</span>
          )}
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button onClick={copy}
            className="p-1.5 rounded-lg text-gray-300 hover:text-primary-500 hover:bg-primary-50 transition-all"
            title="Copy question">
            <Copy size={14} />
          </button>
          {q.tips && (
            <button onClick={() => setOpen(o => !o)}
              className="p-1.5 rounded-lg text-gray-300 hover:text-primary-500 hover:bg-primary-50 transition-all"
              title="Show tips">
              {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>
      </div>
      {open && q.tips && (
        <div className="px-4 pb-4 border-t border-gray-50">
          <div className="bg-amber-50 rounded-lg p-3 mt-2">
            <p className="text-xs font-semibold text-amber-700 mb-1">💡 How to answer this</p>
            <p className="text-xs text-amber-800 leading-relaxed">{q.tips}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function QuestionGeneratorPage() {
  const [form, setForm] = useState({ jobRole: '', type: 'hr', difficulty: 'medium', count: 5 });
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!form.jobRole.trim()) { toast.error('Please enter or select a job role.'); return; }
    setLoading(true);
    try {
      const res = await questionsAPI.generate(form);
      setQuestions(res.data.data);
      toast.success(`${res.data.data.length} questions generated!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Generation failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyAll = () => {
    const text = questions.map((q, i) => `${i+1}. ${q.question}`).join('\n\n');
    navigator.clipboard.writeText(text);
    toast.success('All questions copied!');
  };

  return (
    <div className="space-y-6 animate-slide-up max-w-3xl">
      <div>
        <h1 className="page-title">Question Generator</h1>
        <p className="page-subtitle">Generate AI-crafted interview questions for any role, instantly.</p>
      </div>

      <div className="card space-y-5">
        <div>
          <label className="label">Job role *</label>
          <div className="flex gap-2 flex-wrap mb-2">
            {roles.slice(0,6).map(r => (
              <button key={r}
                onClick={() => setForm({...form, jobRole: r})}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  form.jobRole === r
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-600'
                }`}>
                {r}
              </button>
            ))}
          </div>
          <input type="text" className="input" placeholder="Or type a custom role..."
            value={form.jobRole} onChange={e => setForm({...form, jobRole: e.target.value})} />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="label">Type</label>
            <select className="input" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
              {types.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Difficulty</label>
            <select className="input capitalize" value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})}>
              {difficulties.map(d => <option key={d} value={d} className="capitalize">{d}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Count: <span className="text-primary-600 font-bold">{form.count}</span></label>
            <input type="range" min="3" max="10" step="1" value={form.count}
              onChange={e => setForm({...form, count: parseInt(e.target.value)})}
              className="w-full mt-2 accent-primary-600" />
          </div>
        </div>

        <button onClick={handleGenerate} disabled={loading} className="btn-primary w-full justify-center py-3">
          {loading
            ? <><Loader2 size={18} className="animate-spin" /> Generating with AI...</>
            : <><Lightbulb size={18} /> Generate questions</>
          }
        </button>
      </div>

      {questions.length > 0 && (
        <div className="animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title mb-0">{questions.length} questions for {form.jobRole}</h2>
            <div className="flex gap-2">
              <button onClick={copyAll} className="btn-secondary text-sm px-3 py-2">
                <Copy size={14} /> Copy all
              </button>
              <button onClick={handleGenerate} disabled={loading} className="btn-ghost text-sm">
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Regenerate
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {questions.map((q, i) => <QuestionCard key={i} q={q} index={i} />)}
          </div>
        </div>
      )}
    </div>
  );
}
