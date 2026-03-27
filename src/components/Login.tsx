import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      sessionStorage.setItem('admin_token', data.token);
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-dark bg-[radial-gradient(ellipse_at_50%_0%,_#0d2040_0%,_#0a1628_70%)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-bg-card p-10 rounded-2xl border border-border-hi w-full max-w-md shadow-[0_0_0_1px_rgba(0,212,255,0.12),0_30px_60px_rgba(0,0,0,0.5)]"
      >
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Logo" className="w-48 mx-auto mb-4 drop-shadow-[0_4px_14px_rgba(0,212,255,0.28)]" referrerPolicy="no-referrer" />
          <p className="text-text-2 text-[11px] tracking-[3px] uppercase">Admin Dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-text-3 uppercase tracking-widest mb-1.5">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-sm text-text-1 focus:outline-none focus:border-cyan transition-all"
              placeholder="Enter username"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-text-3 uppercase tracking-widest mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-sm text-text-1 focus:outline-none focus:border-cyan transition-all"
              placeholder="Enter password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-br from-[#07c8f0] to-[#0585b8] text-white py-3 px-6 rounded-lg font-semibold shadow-[0_4px_14px_rgba(0,180,220,0.3)] hover:shadow-[0_6px_18px_rgba(0,200,240,0.45)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/25 text-red-400 rounded-lg text-sm text-center">
            {error}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Login;
