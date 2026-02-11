import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SEOHead from '../../components/ui/SEOHead';

const Login = () => {
  const { login: performLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await performLogin(email, password);
      navigate('/admin');
    } catch (err: any) {
      console.error("Login component error:", err);
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-brand-blue/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-accent/10 blur-[100px] rounded-full"></div>

      <SEOHead title="Admin Portal" />

      <div className="relative z-10 w-full max-w-md p-8">
        <div className="text-center mb-10">
          <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-[#020617] mx-auto mb-4">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome Back</h1>
          <p className="text-slate-400 text-sm">Sign in to Lumina Admin Console</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-8 rounded-2xl shadow-2xl">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-3 rounded-lg text-sm mb-6 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-800 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all placeholder-slate-600"
                placeholder="admin@lumina.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-800 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all placeholder-slate-600"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-blue text-white py-3.5 rounded-xl font-bold tracking-wide hover:bg-sky-400 transition-all disabled:opacity-50 shadow-lg shadow-brand-blue/20 hover:shadow-brand-blue/40 mt-2"
            >
              {loading ? 'Verifying...' : 'Sign In'}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center text-xs text-slate-500">
          <p>Secure Login</p>
        </div>
      </div>
    </div>
  );
};

export default Login;