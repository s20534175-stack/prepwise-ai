import { Link } from 'react-router-dom';
import { Zap, FileText, Mic, Code2, CheckCircle, ArrowRight, Star, TrendingUp, Users } from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'AI Resume Analyzer',
    desc: 'Get ATS score, keyword gaps, and specific improvement tips powered by Gemini AI.',
    color: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: Mic,
    title: 'Mock HR Interview',
    desc: 'Practice with AI-generated questions. Get instant feedback and scoring on every answer.',
    color: 'from-purple-500 to-purple-600',
    bg: 'bg-purple-50',
  },
  {
    icon: Code2,
    title: 'DSA Progress Tracker',
    desc: 'Log solved problems, maintain streaks, and see your weak areas with analytics.',
    color: 'from-green-500 to-green-600',
    bg: 'bg-green-50',
  },
];

const stats = [
  { label: 'Mock interviews conducted', value: '10K+', icon: Mic },
  { label: 'Resumes analyzed', value: '5K+', icon: FileText },
  { label: 'DSA problems tracked', value: '50K+', icon: Code2 },
  { label: 'Users placed', value: '500+', icon: Users },
];

const testimonials = [
  { name: 'Priya S.', role: 'Placed at Infosys', text: 'PrepWise AI helped me identify gaps in my resume and practice HR questions. Got placed in 3 weeks!', stars: 5 },
  { name: 'Arjun K.', role: 'Placed at TCS Digital', text: 'The DSA streak tracker kept me consistent. I solved 200+ problems in 60 days. Game changer!', stars: 5 },
  { name: 'Sneha M.', role: 'Placed at Wipro', text: 'The mock interview feedback was so specific. It told me exactly what to improve in each answer.', stars: 5 },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-gray-100 sticky top-0 z-50 bg-white/90 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-bold text-gray-900 text-lg">PrepWise AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-secondary text-sm px-4 py-2">Sign in</Link>
          <Link to="/register" className="btn-primary text-sm px-4 py-2">Get started free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 md:px-12 pt-20 pb-16 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-50 border border-primary-100 text-primary-600 rounded-full text-sm font-medium mb-8">
          <Zap size={14} />
          Powered by Google Gemini AI
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
          Land your dream job with{' '}
          <span className="text-gradient">AI-powered prep</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Practice mock interviews, analyze your resume for ATS, track DSA progress,
          and get personalized AI feedback — all in one platform built for freshers.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/register" className="btn-primary text-base px-8 py-3.5 w-full sm:w-auto justify-center">
            Start for free
            <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn-secondary text-base px-8 py-3.5 w-full sm:w-auto justify-center">
            Sign in
          </Link>
        </div>
        <p className="text-gray-400 text-sm mt-4">No credit card required. Free forever for core features.</p>
      </section>

      {/* Stats */}
      <section className="px-6 md:px-12 py-10 bg-gray-50 border-y border-gray-100">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-1">{value}</div>
              <div className="text-gray-500 text-sm">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 md:px-12 py-20 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything you need to get placed</h2>
          <p className="text-gray-500 text-lg">Built specifically for freshers targeting their first tech job.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc, color, bg }) => (
            <div key={title} className="card-hover group">
              <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
                  <Icon size={14} className="text-white" />
                </div>
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
              <p className="text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 md:px-12 py-20 bg-gray-50 border-y border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How PrepWise AI works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create your account', desc: 'Sign up free and set your target job role.' },
              { step: '02', title: 'Prepare with AI', desc: 'Use resume analyzer, mock interviews, and DSA tracker daily.' },
              { step: '03', title: 'Get placed', desc: 'Track progress, fix weak areas, and land offers with confidence.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0 mt-1">
                  {step}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 md:px-12 py-20 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Loved by freshers who got placed</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map(({ name, role, text, stars }) => (
            <div key={name} className="card">
              <div className="flex gap-0.5 mb-3">
                {Array(stars).fill(0).map((_, i) => (
                  <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">"{text}"</p>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{name}</p>
                <p className="text-green-600 text-xs font-medium">{role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-12 py-20 bg-gradient-to-br from-primary-600 to-accent-600 text-white text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to get placed?</h2>
        <p className="text-primary-100 mb-8 text-lg">Join thousands of freshers preparing smarter with AI.</p>
        <Link to="/register" className="inline-flex items-center gap-2 bg-white text-primary-600 font-bold px-8 py-3.5 rounded-xl hover:bg-primary-50 transition-colors">
          Start for free
          <ArrowRight size={18} />
        </Link>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-8 border-t border-gray-100 text-center text-gray-400 text-sm">
        <p>© 2024 PrepWise AI. Built with React, Node.js, MongoDB & Gemini API.</p>
      </footer>
    </div>
  );
}
