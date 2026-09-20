import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogOut, Bell, CheckCircle2 } from 'lucide-react';
import { ProfileModal } from './ProfileModal';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const notifications: any[] = [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
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
        <div className="flex items-center gap-2 md:gap-4 relative">
          {/* Notifications */}
          <div className="relative hidden sm:block" ref={notifRef}>
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 rounded-full hover:bg-white/[0.06] transition-colors"
            >
              <Bell className="w-4 h-4 text-[#A3A3A3]" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#D4AF37] rounded-full border border-black"></span>
            </button>
            
            {/* Notification Dropdown */}
            {isNotificationsOpen && (
              <div className="absolute top-full mt-2 right-0 w-80 bg-[#0A0A0A] border border-white/10 rounded-xl shadow-2xl animate-fade-in z-50 overflow-hidden">
                <div className="p-3 border-b border-white/10 flex items-center justify-between bg-[#050505]">
                  <h3 className="text-sm font-semibold text-white">Notifications</h3>
                  <button onClick={() => setIsNotificationsOpen(false)} className="text-xs text-[#A3A3A3] hover:text-white transition-colors">Mark all as read</button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-[#737373]">
                      No new notifications.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div key={notif.id} className="p-3 border-b border-white/5 hover:bg-white/[0.02] transition-colors flex items-start gap-3 cursor-pointer group">
                        <div className="mt-0.5">
                          <CheckCircle2 className="w-4 h-4 text-[#D4AF37] opacity-60 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div>
                          <p className="text-xs text-[#E5E5E5] leading-relaxed">{notif.text}</p>
                          <p className="text-[10px] text-[#A3A3A3] mt-1">{notif.time}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-2 text-center bg-[#050505]">
                  <button className="text-[11px] text-[#A3A3A3] hover:text-white transition-colors">View all notifications</button>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3 text-[13px]">
            <button 
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center transition-opacity hover:opacity-80"
              title="Open Dashboard"
            >
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={user?.name}
                className="w-8 h-8 rounded-full border border-app-border object-cover"
              />
            </button>
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

      {isProfileOpen && (
        <ProfileModal onClose={() => setIsProfileOpen(false)} />
      )}
    </>
  );
};
