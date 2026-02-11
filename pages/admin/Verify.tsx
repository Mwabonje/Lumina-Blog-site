import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyOtp } from '../../services/authService';
import SEOHead from '../../components/ui/SEOHead';

const Verify = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const [email, setEmail] = useState(queryParams.get('email') || '');
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await verifyOtp(email, code);
            setSuccess(true);
            setTimeout(() => navigate('/admin/login'), 2000);
        } catch (err: any) {
            setError(err.message || 'Invalid verification code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white relative overflow-hidden font-sans">
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-brand-blue/20 blur-[120px] rounded-full"></div>

            <SEOHead title="Verify Email" />

            <div className="relative z-10 w-full max-w-md p-8">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Verify Your Account</h1>
                    <p className="text-slate-400 text-sm">Enter the code sent to your email</p>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-8 rounded-2xl shadow-2xl">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-3 rounded-lg text-sm mb-6 text-center">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-500/10 border border-green-500/20 text-green-200 p-3 rounded-lg text-sm mb-6 text-center">
                            Verification successful! Redirecting to login...
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
                                className="w-full bg-slate-950/50 border border-slate-800 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none transition-all"
                                placeholder="email@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Verification Code</label>
                            <input
                                type="text"
                                required
                                value={code}
                                onChange={e => setCode(e.target.value)}
                                className="w-full bg-slate-950/50 border border-slate-800 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none transition-all text-center text-2xl tracking-[0.5em] font-mono"
                                placeholder="000000"
                                maxLength={6}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || success}
                            className="w-full bg-brand-blue text-white py-3.5 rounded-xl font-bold tracking-wide hover:bg-sky-400 transition-all disabled:opacity-50 mt-2"
                        >
                            {loading ? 'Verifying...' : 'Verify Email'}
                        </button>
                    </form>
                </div>

                <div className="mt-8 text-center text-xs text-slate-500">
                    <button onClick={() => navigate('/admin/login')} className="hover:text-white transition-colors">Back to Login</button>
                </div>
            </div>
        </div>
    );
};

export default Verify;
