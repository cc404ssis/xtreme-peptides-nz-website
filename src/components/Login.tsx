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
    <div className="min-h-screen flex items-center justify-center bg-bg-deep relative overflow-hidden">
      {/* Soft red glow */}
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          top: '-200px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '700px',
          height: '500px',
          background: 'radial-gradient(ellipse, rgba(204,0,0,0.08) 0%, transparent 65%)',
        }}
      />

      {/* Corner brackets */}
      <div className="xp-corner xp-corner-tl" />
      <div className="xp-corner xp-corner-tr" />
      <div className="xp-corner xp-corner-bl" />
      <div className="xp-corner xp-corner-br" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="xp-card w-full max-w-md mx-6 relative z-10"
      >
        <div className="px-10 pt-12 pb-2 text-center">
          <div className="xp-wordmark mx-auto justify-center">
            <div>
              <div className="xp-wordmark-text">Xtreme Peptides</div>
              <div className="xp-wordmark-sub">New Zealand</div>
            </div>
          </div>
        </div>

        <div className="mx-10 my-6">
          <div className="xp-section-rule" />
        </div>

        <div className="px-10 pb-10">
          <div className="text-center mb-6">
            <div className="xp-section-label">— Restricted Access —</div>
            <h1 className="xp-display text-3xl mt-3">
              Admin <span style={{ color: 'var(--color-xp-red)' }}>Panel</span>
            </h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono font-bold text-text-3 uppercase tracking-[0.2em] mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                className="w-full bg-bg-input border border-border px-4 py-2.5 text-sm text-text-1 focus:outline-none focus:border-cyan transition-all font-sans"
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono font-bold text-text-3 uppercase tracking-[0.2em] mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full bg-bg-input border border-border px-4 py-2.5 text-sm text-text-1 focus:outline-none focus:border-cyan transition-all font-sans"
                placeholder="Enter password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-xp-primary w-full mt-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 border border-[var(--color-xp-red)] bg-[var(--color-xp-red-dim)] text-[var(--color-xp-red)] text-sm text-center font-mono uppercase tracking-widest">
              {error}
            </div>
          )}

          <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-center mt-8" style={{ color: 'var(--color-text-3)' }}>
            Authorised personnel only · Xtreme Peptides NZ
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
