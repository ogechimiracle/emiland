import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock, ArrowRight, Loader2, KeyRound, ShieldAlert } from 'lucide-react';

interface AdminLoginProps {
  onSuccess: () => void;
  onNavigateHome: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onNavigateHome }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('owner@maisonterre.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      onSuccess();
    } else {
      setError(res.error || 'Invalid owner credentials');
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md bg-white dark:bg-[#1E1A17] border border-[#E2D9CC] dark:border-[#2D2622] rounded-3xl p-8 sm:p-10 shadow-xl space-y-8">
        
        <div className="text-center space-y-3">
          <img
            src="/logo.jpeg"
            alt="Emiland’s Interior Logo"
            className="w-16 h-16 mx-auto rounded-full object-cover border border-[#E2D9CC] dark:border-[#38312B] shadow-md"
          />
          <div className="space-y-1">
            <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#302720] dark:text-[#F5EFE6]">
              Emiland’s Interior
            </h1>
            <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#6F4E37] dark:text-[#D4A373]">
              Owner Portal
            </p>
          </div>
          <p className="text-xs sm:text-sm text-[#786D63] dark:text-[#A3968A]">
            Restricted access — please sign in with your credentials
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs border border-rose-200 dark:border-rose-900/50 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#302720] dark:text-[#F5EFE6] mb-1.5">
              Owner Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@maisonterre.com"
              className="w-full px-4 py-3 rounded-xl bg-[#F8F5EF] dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B] text-sm text-[#302720] dark:text-[#F5EFE6] focus:outline-none focus:ring-1 focus:ring-[#6F4E37] dark:focus:ring-[#D4A373]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#302720] dark:text-[#F5EFE6] mb-1.5">
              Owner Secret Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-3 rounded-xl bg-[#F8F5EF] dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B] text-sm text-[#302720] dark:text-[#F5EFE6] focus:outline-none focus:ring-1 focus:ring-[#6F4E37] dark:focus:ring-[#D4A373]"
            />
          </div>

          {/* Initial credentials reminder banner for effortless first login */}
          <div className="p-3 rounded-xl bg-[#EDE5D8]/50 dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B] text-xs text-[#786D63] dark:text-[#A3968A] space-y-1">
            <p className="font-semibold text-[#302720] dark:text-[#F5EFE6] flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-[#6F4E37] dark:text-[#D4A373]" />
              Initial Access Credentials:
            </p>
            <p>Email: <code className="font-mono text-[#302720] dark:text-[#F5EFE6]">owner@maisonterre.com</code></p>
            <p>Password: <code className="font-mono text-[#302720] dark:text-[#F5EFE6]">Atelier2026!</code></p>
            <p className="text-[11px] opacity-75">You can update your password at any time in the dashboard.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl text-xs font-semibold uppercase tracking-wider text-white bg-[#6F4E37] hover:bg-[#3E2B23] dark:bg-[#A67C52] dark:hover:bg-[#6F4E37] transition-all disabled:opacity-50 cursor-pointer shadow-md flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              <>
                Sign In to Dashboard
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            onClick={onNavigateHome}
            className="text-xs text-[#786D63] dark:text-[#A3968A] hover:text-[#302720] dark:hover:text-[#F5EFE6] transition-colors cursor-pointer"
          >
            ← Return to Public Portfolio
          </button>
        </div>

      </div>
    </div>
  );
};
