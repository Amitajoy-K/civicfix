import React, { useState } from 'react';
import { Building2, X, Lock, Mail, User as UserIcon, ArrowRight, ShieldCheck, Wrench, CheckCircle2 } from 'lucide-react';
import { User, Department } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  departments: Department[];
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  departments
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'CITIZEN' | 'STAFF' | 'ADMIN'>('CITIZEN');
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || 'dept-road');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, role, departmentId })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed');
        onLoginSuccess(data.user);
        onClose();
      } else {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');
        onLoginSuccess(data.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail, password: 'password123' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Demo login failed');
      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        id="auth-modal-card"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          id="auth-close-btn"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Logo & Tagline */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900 text-white shadow-md mb-3">
              <Building2 className="w-7 h-7 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-display">CivicFix</h2>
            <p className="text-sm font-medium text-slate-500 mt-1">“See it. Report it. Fix it.”</p>
          </div>

          {/* Quick Demo Credentials Bar */}
          <div className="mb-6 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <p className="text-xs font-semibold text-slate-700 mb-2 text-center">Fast Demo 1-Click Login:</p>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('karthik.citizen@gmail.com')}
                className="px-2 py-1.5 bg-white border border-slate-200 hover:border-blue-500 rounded-lg text-slate-700 font-medium text-center hover:bg-blue-50/50 transition-colors"
                id="demo-login-citizen"
              >
                👤 Citizen
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('rajesh.staff@civicfix.gov.in')}
                className="px-2 py-1.5 bg-white border border-slate-200 hover:border-blue-500 rounded-lg text-slate-700 font-medium text-center hover:bg-blue-50/50 transition-colors"
                id="demo-login-staff"
              >
                🛠️ Staff
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin@civicfix.gov.in')}
                className="px-2 py-1.5 bg-white border border-slate-200 hover:border-blue-500 rounded-lg text-slate-700 font-medium text-center hover:bg-blue-50/50 transition-colors"
                id="demo-login-admin"
              >
                🛡️ Admin
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          {forgotSent && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Password reset instructions sent to your email.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                    id="auth-input-name"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@civicfix.gov.in"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                  id="auth-input-email"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                {!isRegister && (
                  <button
                    type="button"
                    onClick={() => setForgotSent(true)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    id="auth-forgot-password-link"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                  id="auth-input-password"
                />
              </div>
            </div>

            {isRegister && (
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Account Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                    id="auth-select-role"
                  >
                    <option value="CITIZEN">Citizen (Report & Track Issues)</option>
                    <option value="STAFF">Department Staff (Resolve Complaints)</option>
                    <option value="ADMIN">Municipal Administrator</option>
                  </select>
                </div>

                {role === 'STAFF' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Assign Department</label>
                    <select
                      value={departmentId}
                      onChange={(e) => setDepartmentId(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                      id="auth-select-department"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 mt-2"
              id="auth-submit-btn"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isRegister ? 'Create Civic Account' : 'Log In to CivicFix'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle between Login and Register */}
          <div className="mt-5 text-center text-xs text-slate-500">
            {isRegister ? (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setIsRegister(false); setError(null); }}
                  className="font-semibold text-blue-600 hover:text-blue-700"
                  id="auth-toggle-login"
                >
                  Log in
                </button>
              </p>
            ) : (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setIsRegister(true); setError(null); }}
                  className="font-semibold text-blue-600 hover:text-blue-700"
                  id="auth-toggle-register"
                >
                  Register here
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Subtle City Skyline Silhouette Graphic at Card Bottom */}
        <div className="w-full h-12 bg-gradient-to-t from-slate-100 to-transparent flex items-end justify-center px-4 overflow-hidden opacity-60">
          <svg className="w-full h-8 text-slate-300" viewBox="0 0 400 60" fill="currentColor" preserveAspectRatio="none">
            <path d="M0 60 L0 45 L15 45 L15 30 L35 30 L35 50 L45 50 L45 20 L60 20 L60 38 L80 38 L80 15 L95 15 L95 60 L120 60 L120 40 L135 40 L135 25 L155 25 L155 60 L170 60 L170 30 L190 30 L190 10 L205 10 L205 60 L230 60 L230 35 L245 35 L245 18 L265 18 L265 60 L285 60 L285 40 L300 40 L300 22 L320 22 L320 60 L345 60 L345 32 L360 32 L360 15 L380 15 L380 60 Z" />
          </svg>
        </div>
      </div>
    </div>
  );
};
