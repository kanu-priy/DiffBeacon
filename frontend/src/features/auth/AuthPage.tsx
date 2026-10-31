import React, { useState } from 'react';
import { ArrowRight, LockKeyhole, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api, type AuthTokens } from '../../lib/api';

interface AuthPageProps {
  onAuthSuccess: (payload: AuthTokens) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const payload =
        mode === 'login'
          ? await api.loginUser({ username: form.username, password: form.password })
          : await api.registerUser({
              username: form.username,
              email: form.email,
              password: form.password,
              password_confirm: form.password_confirm,
            });

      onAuthSuccess(payload);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-[#1d2b22] bg-[#0b0f0d]/90 p-6 shadow-2xl shadow-black/30">
        <div className="mb-6 flex items-center gap-3 text-[#d9f7be]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d6fa64] text-[#18211c] font-mono font-bold">
            Δ
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.24em] text-[#7d897d] font-mono">Access</div>
            <h1 className="text-xl font-semibold text-white">DiffBeacon workspace</h1>
          </div>
        </div>

        <div className="mb-5 inline-flex rounded-full border border-[#243028] bg-[#101613] p-1">
          {['login', 'register'].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setMode(option as 'login' | 'register')}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                mode === option ? 'bg-[#d6fa64] text-[#15231a]' : 'text-[#a3aca3]'
              }`}
            >
              {option === 'login' ? 'Sign in' : 'Create account'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-[#717d74] font-mono">Username or email</label>
            <input
              value={form.username}
              onChange={(e) => handleChange('username', e.target.value)}
              className="w-full rounded-xl border border-[#253128] bg-[#0d120f] px-3 py-2.5 text-sm text-white outline-none transition focus:border-[#4b7b5d]"
              placeholder="your_username or name@company.com"
              required
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-[#717d74] font-mono">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full rounded-xl border border-[#253128] bg-[#0d120f] px-3 py-2.5 text-sm text-white outline-none transition focus:border-[#4b7b5d]"
                placeholder="name@company.com"
                required
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-[#717d74] font-mono">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className="w-full rounded-xl border border-[#253128] bg-[#0d120f] px-3 py-2.5 text-sm text-white outline-none transition focus:border-[#4b7b5d]"
              placeholder="••••••••"
              required
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-[#717d74] font-mono">Confirm password</label>
              <input
                type="password"
                value={form.password_confirm}
                onChange={(e) => handleChange('password_confirm', e.target.value)}
                className="w-full rounded-xl border border-[#253128] bg-[#0d120f] px-3 py-2.5 text-sm text-white outline-none transition focus:border-[#4b7b5d]"
                placeholder="Repeat password"
                required
              />
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-950/30 px-3 py-2 text-sm text-red-200">{error}</div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#d6fa64] px-4 py-2.5 text-sm font-semibold text-[#0f160f] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {mode === 'login' ? <LockKeyhole className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
            {isSubmitting ? 'Please wait…' : mode === 'login' ? 'Sign in to DiffBeacon' : 'Create your workspace'}
            {!isSubmitting && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>
      </div>
    </div>
  );
};
