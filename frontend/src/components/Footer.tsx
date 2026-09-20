import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="fixed bottom-0 w-full border-t border-white/[0.08] px-4 lg:px-6 py-2.5 flex items-center justify-between z-50 bg-[#050505]/80 backdrop-blur-xl text-[10px] sm:text-xs text-[#A3A3A3] font-mono">
      <div className="flex gap-4">
        <span>HERCULES.SYS</span>
        <span className="hidden sm:inline">VER.2.0.0</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>STATUS: ONLINE</span>
      </div>
    </footer>
  );
};
