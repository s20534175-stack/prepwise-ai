import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { User, Loader2, Save, Lock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const roles = ['Software Developer','Frontend Developer','Backend Developer',
  'Full Stack Developer','Data Analyst','Data Engineer','DevOps Engineer',
  'QA Engineer','Machine Learning Engineer','Other'];

const skillOptions = ['JavaScript','Python','Java','C++','React','Node.js','Express',
  'MongoDB','SQL','TypeScript','Git','Docker','AWS','DSA','System Design'];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    targetRole: user?.targetRole || '',
    skills: user?.skills || [],
  });
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  const toggleSkill = (skill) => {
    setForm(f => ({
      ...f,
      skills: f.skills.includes(skill)
        ? f.skills.filter(s => s !== skill)
        : [...f.skills, skill]
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authAPI.updateProfile(form);
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePass = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      toast.error('New passwords do not match.'); return;
    }
    if (passForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.'); return;
    }
    setChangingPass(true);
    try {
      await authAPI.changePassword({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword });
      toast.success('Password changed!');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed.');
    } finally {
      setChangingPass(false);
    }
  };

  return (
    <div className="space-y-6 animate-slide-up max-w-2xl">
      <div>
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Manage your account settings and preferences.</p>
      </div>

      {/* Avatar section */}
      <div className="card flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>
        <div>
          <p className="font-bold text-gray-900 text-lg">{user?.name}</p>
          <p className="text-gray-500 text-sm">{user?.email}</p>
          <div className="flex gap-2 mt-2">
            <span className="badge badge-blue">{user?.role}</span>
            {user?.targetRole && <span className="badge badge-purple">{user.targetRole}</span>}
          </div>
        </div>
      </div>

      {/* Profile form */}
      <form onSubmit={handleSave} className="card space-y-5">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <User size={18} className="text-primary-600" /> Personal info
        </h3>

        <div>
          <label className="label">Full name</label>
          <input type="text" className="input" value={form.name}
            onChange={e => setForm({...form, name: e.target.value})} required />
        </div>

        <div>
          <label className="label">Target role</label>
          <select className="input" value={form.targetRole}
            onChange={e => setForm({...form, targetRole: e.target.value})}>
            <option value="">Select target role...</option>
            {roles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div>
          <label className="label">Bio</label>
          <textarea className="input resize-none" rows={3}
            placeholder="Tell recruiters about yourself..."
            value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} />
        </div>

        <div>
          <label className="label">Skills (select all that apply)</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {skillOptions.map(skill => (
              <button key={skill} type="button" onClick={() => toggleSkill(skill)}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                  form.skills.includes(skill)
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-600'
                }`}>
                {form.skills.includes(skill) && <CheckCircle size={12} className="inline mr-1" />}
                {skill}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> Save changes</>}
        </button>
      </form>

      {/* Change password */}
      <form onSubmit={handleChangePass} className="card space-y-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Lock size={18} className="text-primary-600" /> Change password
        </h3>

        {['currentPassword', 'newPassword', 'confirmPassword'].map((field) => (
          <div key={field}>
            <label className="label capitalize">{field.replace(/([A-Z])/g, ' $1').toLowerCase()}</label>
            <input type="password" className="input"
              placeholder={field === 'currentPassword' ? 'Current password' : field === 'newPassword' ? 'New password (min 6 chars)' : 'Confirm new password'}
              value={passForm[field]}
              onChange={e => setPassForm({...passForm, [field]: e.target.value})}
              required />
          </div>
        ))}

        <button type="submit" disabled={changingPass} className="btn-secondary">
          {changingPass ? <><Loader2 size={16} className="animate-spin" /> Updating...</> : <><Lock size={16} /> Update password</>}
        </button>
      </form>

      {/* Stats summary */}
      <div className="card">
        <h3 className="section-title">Your stats</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-primary-600">{user?.totalInterviews || 0}</p>
            <p className="text-xs text-gray-500">Interviews</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-500">{user?.dsaStreak || 0}🔥</p>
            <p className="text-xs text-gray-500">Day streak</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{user?.averageScore || 0}%</p>
            <p className="text-xs text-gray-500">Avg score</p>
          </div>
        </div>
      </div>
    </div>
  );
}
