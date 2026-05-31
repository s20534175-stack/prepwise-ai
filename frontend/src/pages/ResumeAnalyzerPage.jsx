import { useState, useRef } from 'react';
import { resumeAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Upload, FileText, Loader2, CheckCircle, XCircle, AlertCircle, TrendingUp, Star, X } from 'lucide-react';
import toast from 'react-hot-toast';

function ScoreCircle({ score }) {
  const color = score >= 75 ? 'text-green-500' : score >= 50 ? 'text-yellow-500' : 'text-red-500';
  const bgColor = score >= 75 ? 'stroke-green-500' : score >= 50 ? 'stroke-yellow-500' : 'stroke-red-500';
  const pct = (score / 100) * 283; // circumference

  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="#f3f4f6" strokeWidth="8" />
        <circle
          cx="50" cy="50" r="45" fill="none" strokeWidth="8"
          strokeLinecap="round"
          className={bgColor}
          strokeDasharray={`${pct} 283`}
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className={`text-2xl font-bold ${color}`}>{score}</span>
        <span className="text-xs text-gray-500">ATS Score</span>
      </div>
    </div>
  );
}

function ScoreBar({ label, score, color }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600 font-medium">{label}</span>
        <span className="font-bold text-gray-900">{score}/100</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full`}
          style={{ width: `${score}%`, transition: 'width 1s ease' }}
        />
      </div>
    </div>
  );
}

export default function ResumeAnalyzerPage() {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [targetRole, setTargetRole] = useState(user?.targetRole || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileRef = useRef();

  const handleFile = (f) => {
    if (!f) return;
    if (f.type !== 'application/pdf') { toast.error('Only PDF files are supported.'); return; }
    if (f.size > 5 * 1024 * 1024) { toast.error('File must be under 5MB.'); return; }
    setFile(f);
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const handleAnalyze = async () => {
    if (!file) { toast.error('Please select a PDF resume first.'); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      if (targetRole) formData.append('targetRole', targetRole);
      const res = await resumeAPI.analyze(formData);
      setResult(res.data.data);
      toast.success('Resume analyzed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-slide-up max-w-4xl">
      <div>
        <h1 className="page-title">Resume Analyzer</h1>
        <p className="page-subtitle">Upload your PDF and get AI-powered ATS feedback instantly.</p>
      </div>

      {/* Upload area */}
      {!result && (
        <div className="card space-y-5">
          <div
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all
              ${file ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'}`}
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => fileRef.current.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={e => handleFile(e.target.files[0])}
            />
            {file ? (
              <div>
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FileText className="text-primary-600" size={24} />
                </div>
                <p className="font-semibold text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <button
                  onClick={e => { e.stopPropagation(); setFile(null); }}
                  className="mt-2 text-xs text-red-500 hover:underline flex items-center gap-1 mx-auto"
                >
                  <X size={12} /> Remove
                </button>
              </div>
            ) : (
              <div>
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Upload className="text-gray-400" size={24} />
                </div>
                <p className="font-semibold text-gray-700">Drop your resume here, or click to browse</p>
                <p className="text-sm text-gray-400 mt-1">PDF only · Max 5MB</p>
              </div>
            )}
          </div>

          <div>
            <label className="label">Target role (optional)</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Software Developer, Frontend Engineer..."
              value={targetRole}
              onChange={e => setTargetRole(e.target.value)}
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!file || loading}
            className="btn-primary w-full justify-center py-3"
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Analyzing with AI...</>
            ) : (
              <><TrendingUp size={18} /> Analyze Resume</>
            )}
          </button>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-5 animate-slide-up">
          <div className="flex items-center justify-between">
            <h2 className="section-title mb-0">Analysis Results</h2>
            <button onClick={() => setResult(null)} className="btn-secondary text-sm px-4 py-2">
              Analyze another
            </button>
          </div>

          {/* Score overview */}
          <div className="card">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="text-center">
                <ScoreCircle score={result.analysis.atsScore} />
                <p className="mt-3 text-sm text-gray-600 leading-relaxed max-w-xs mx-auto">
                  {result.analysis.overallFeedback}
                </p>
              </div>
              <div className="space-y-4">
                <ScoreBar label="Formatting" score={result.analysis.formattingScore} color="bg-blue-500" />
                <ScoreBar label="Content" score={result.analysis.contentScore} color="bg-purple-500" />
                <ScoreBar label="Keywords" score={result.analysis.keywordsScore} color="bg-green-500" />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Strengths */}
            <div className="card">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
                <CheckCircle size={18} className="text-green-500" /> Strengths
              </h3>
              <ul className="space-y-2">
                {result.analysis.strengths?.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span> {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Improvements */}
            <div className="card">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
                <AlertCircle size={18} className="text-yellow-500" /> Areas to improve
              </h3>
              <ul className="space-y-2">
                {result.analysis.improvements?.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-yellow-500 mt-0.5 flex-shrink-0">→</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Missing keywords */}
          {result.analysis.missingKeywords?.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-3">Missing keywords</h3>
              <div className="flex flex-wrap gap-2">
                {result.analysis.missingKeywords.map((k, i) => (
                  <span key={i} className="badge badge-red px-3 py-1 text-sm">{k}</span>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          <div className="card">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <Star size={18} className="text-primary-500" /> Actionable suggestions
            </h3>
            <ol className="space-y-3">
              {result.analysis.suggestions?.map((s, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                  <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
