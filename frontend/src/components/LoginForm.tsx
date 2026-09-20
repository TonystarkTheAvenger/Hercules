import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, AlertCircle, UserPlus } from 'lucide-react';
import type { UserRole } from '../types';

export const LoginForm: React.FC = () => {
  const { login, register } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (isRegistering) {
      if (!name) { setError('Name is required for registration.'); return; }
      if (!register(name, email, password, role)) {
        setError('Email already exists. Please use a different one.');
      }
    } else {
      if (!login(email, password)) {
        setError('Invalid credentials. Please try again.');
      }
    }
  };

  return (
    <div className="w-full font-sans text-[#F5F5F5] relative transition-all duration-500 max-w-md mx-auto z-20">
      <div className="space-y-6 animate-fade-in-right relative z-20">
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div className="space-y-1.5 animate-fade-in">
              <label className="block text-xs font-medium text-[#A3A3A3]">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 transition-colors"
                placeholder="John Doe" />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#A3A3A3]">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 transition-colors"
              placeholder="name@university.edu" />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#A3A3A3]">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 transition-colors"
              placeholder="••••••••" />
          </div>

          {isRegistering && (
            <div className="space-y-1.5 animate-fade-in">
              <label className="block text-xs font-medium text-[#A3A3A3]">Role</label>
              <div className="flex bg-[#0A0A0A] border border-white/10 rounded-lg p-1">
                {(['student', 'professor', 'admin'] as const).map((r) => (
                  <button key={r} type="button" onClick={() => setRole(r)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md capitalize transition-all ${role === r ? 'bg-white text-black shadow-sm' : 'text-[#A3A3A3] hover:text-white'}`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs bg-red-400/10 p-2.5 rounded-lg animate-fade-in border border-red-400/20">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <button type="submit"
            className="w-full bg-white text-black hover:bg-[#E5E5E5] flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all group">
            {isRegistering ? (
              <><UserPlus className="w-4 h-4" /> Create Account</>
            ) : (
              <>Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <button type="button" onClick={() => { setIsRegistering(!isRegistering); setError(null); }}
            className="text-xs text-[#A3A3A3] hover:text-white transition-colors">
            {isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
};
