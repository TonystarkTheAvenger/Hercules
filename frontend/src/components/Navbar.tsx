import React from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogOut, Bell } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="fixed top-0 w-full border-b border-white/[0.08] px-4 lg:px-6 py-3 flex items-center justify-between z-50 bg-[#050505]/80 backdrop-blur-xl">
      {/* Left: Brand & Course Context */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 flex items-center justify-center text-app-text-primary">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="font-semibold text-[15px] tracking-tight text-app-text-primary">
            Hercules
          </span>
        </div>

        <div className="h-4 w-px bg-app-border" />

        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08]">
          <BookOpen className="w-3.5 h-3.5 text-[#A3A3A3]" />
          <span className="text-xs font-medium text-[#E5E5E5]">CS401: Adv. Data Structures</span>
        </div>
      </div>

      {/* Right: User Profile & Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Notifications */}
        <button className="relative p-2 rounded-full hover:bg-white/[0.06] transition-colors hidden sm:block">
          <Bell className="w-4 h-4 text-[#A3A3A3]" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#D4AF37] rounded-full border border-black"></span>
        </button>
        <div className="flex items-center gap-3 text-[13px]">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={user?.name}
            className="w-8 h-8 rounded-full border border-app-border object-cover"
          />
          <button
            onClick={logout}
            title="Sign Out"
            className="text-app-text-muted hover:text-app-text-primary transition-colors ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
