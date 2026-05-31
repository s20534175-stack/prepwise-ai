import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewAPI } from '../services/api';
import { Loader2, Send, ChevronLeft, ChevronRight, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InterviewSessionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [allFeedback, setAllFeedback] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [answered, setAnswered] = useState([]);
  const [startTime] = useState(Date.now());
  const textRef = useRef();

  useEffect(() => {
    interviewAPI.getById(id)
      .then(res => setSession(res.data.data))
      .catch(() => {
        toast.error('Interview not found.');
        navigate('/interview');
      });
  }, [id]);

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) { toast.error('Please write an answer before submitting.'); return; }
    if (answer.trim().length < 20) { toast.error('Please write a more detailed answer (at least 20 characters).'); return; }
    setSubmitting(true);
    try {
      const res = await interviewAPI.submitAnswer(id, { questionIndex: currentQ, answer });
      const fb = res.data.data;
      setFeedback(fb);
      setAllFeedback(prev => {
        const updated = [...prev];
        updated[currentQ] = fb;
        return updated;
      });
      setAnswered(prev => [...new Set([...prev, currentQ])]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to evaluate. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    setFeedback(null);
    setAnswer('');
    if (currentQ < (session?.questions?.length || 1) - 1) {
      setCurrentQ(q => q + 1);
    }
  };

  const handleComplete = async () => {
    const unanswered = session.questions.filter((_, i) => !answered.includes(i));
    if (unanswered.length > 0 && !window.confirm(`${unanswered.length} questions are unanswered. Complete anyway?`)) return;

    setCompleting(true);
    try {
      const duration = Math.round((Date.now() - startTime) / 1000);
      await interviewAPI.complete(id, { duration });
      toast.success('Interview completed! 🎉');
      navigate(`/interview/result/${id}`);
    } catch (err) {
      toast.error('Failed to complete interview. Try again.');
    } finally {
      setCompleting(false);
    }
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 size={32} className="animate-spin text-primary-500" />
      </div>
    );
  }

  const questions = session.questions || [];
  const q = questions[currentQ];
  const progress = Math.round((answered.length / questions.length) * 100);
  const isLastQ = currentQ === questions.length - 1;
  const currentAnswered = answered.includes(currentQ);

  return (
    <div className="max-w-3xl animate-slide-up space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h1 className="page-title">Mock Interview</h1>
          <span className="text-sm text-gray-500">{session.jobRole} · {session.type?.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm text-gray-500 whitespace-nowrap">
            {answered.length}/{questions.length} answered
          </span>
        </div>
      </div>

      {/* Question navigation pills */}
      <div className="flex gap-2 flex-wrap">
        {questions.map((_, i) => (
          <button
            key={i}
            onClick={() => { setCurrentQ(i); setFeedback(allFeedback[i] || null); setAnswer(''); }}
            className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${
              i === currentQ
                ? 'bg-primary-600 text-white'
                : answered.includes(i)
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {answered.includes(i) ? <CheckCircle size={14} className="mx-auto" /> : i + 1}
          </button>
        ))}
      </div>

      {/* Question card */}
      <div className="card">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-8 h-8 rounded-xl bg-primary-100 text-primary-600 font-bold text-sm flex items-center justify-center flex-shrink-0">
            {currentQ + 1}
          </div>
          <p className="text-gray-900 font-medium text-lg leading-relaxed">{q?.question}</p>
        </div>

        {!currentAnswered && (
          <>
            <textarea
              ref={textRef}
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              rows={5}
              className="input resize-none"
              placeholder="Type your answer here. Be as detailed as possible — the AI evaluates content, not perfection..."
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-gray-400">{answer.length} characters</span>
              <button
                onClick={handleSubmitAnswer}
                disabled={submitting || !answer.trim()}
                className="btn-primary"
              >
                {submitting
                  ? <><Loader2 size={16} className="animate-spin" /> Evaluating...</>
                  : <><Send size={16} /> Submit answer</>
                }
              </button>
            </div>
          </>
        )}
      </div>

      {/* AI Feedback */}
      {(feedback || allFeedback[currentQ]) && (
        <div className="card border-l-4 border-l-primary-500 animate-slide-up space-y-4">
          {(() => {
            const fb = feedback || allFeedback[currentQ];
            const scoreColor = fb.score >= 7 ? 'text-green-600' : fb.score >= 5 ? 'text-yellow-600' : 'text-red-500';
            return (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">AI Feedback</h3>
                  <div className={`text-2xl font-bold ${scoreColor}`}>
                    {fb.score}/10
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{fb.feedback}</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {fb.whatWasGood && (
                    <div className="bg-green-50 rounded-xl p-3">
                      <p className="text-xs font-semibold text-green-700 mb-1">✅ What was good</p>
                      <p className="text-sm text-green-800">{fb.whatWasGood}</p>
                    </div>
                  )}
                  {fb.whatToImprove && (
                    <div className="bg-yellow-50 rounded-xl p-3">
                      <p className="text-xs font-semibold text-yellow-700 mb-1">💡 What to improve</p>
                      <p className="text-sm text-yellow-800">{fb.whatToImprove}</p>
                    </div>
                  )}
                </div>
                {fb.sampleBetterAnswer && (
                  <div className="bg-blue-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-blue-700 mb-1">📝 Sample stronger answer</p>
                    <p className="text-sm text-blue-800">{fb.sampleBetterAnswer}</p>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => { setCurrentQ(q => Math.max(0, q - 1)); setFeedback(null); setAnswer(''); }}
          disabled={currentQ === 0}
          className="btn-secondary disabled:opacity-40"
        >
          <ChevronLeft size={16} /> Previous
        </button>

        {isLastQ && answered.length > 0 ? (
          <button
            onClick={handleComplete}
            disabled={completing}
            className="btn-primary bg-green-600 hover:bg-green-700"
          >
            {completing
              ? <><Loader2 size={16} className="animate-spin" /> Finishing...</>
              : '🎉 Complete interview'
            }
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!currentAnswered || isLastQ}
            className="btn-primary disabled:opacity-40"
          >
            Next <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
