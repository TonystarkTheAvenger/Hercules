import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { checkBackendHealth } from '../api/client';
import { RotateCcw } from 'lucide-react';

export const DemoBar: React.FC = () => {
  const { role, user } = useAuth();
  const { resetChat } = useChat();
  const [isLiveBackend, setIsLiveBackend] = useState<boolean | null>(null);

  const testBackend = async () => {
    const online = await checkBackendHealth();
    setIsLiveBackend(online);
  };

  useEffect(() => {
    testBackend();
    const interval = setInterval(testBackend, 20000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-black border-b border-white/20 px-4 py-1.5 flex items-center justify-between text-xs text-white select-none">
      {/* Left: Role Switcher */}
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-mono uppercase tracking-wider text-white">
          Hercules App
        </span>
      </div>

      {/* Center: Active user info */}
      <div className="hidden md:flex items-center gap-2 text-xs text-white">
        <span>Active user:</span>
        <span className="text-white font-medium">{user?.name}</span>
        <span className="text-white">({user?.email})</span>
      </div>

      {/* Right: Reset & status */}
      <div className="flex items-center gap-3">
        {role === 'student' && (
          <button
            onClick={resetChat}
            className="flex items-center gap-1 text-[11px] text-white hover:text-white transition-colors px-1.5 py-0.5 rounded hover:bg-black"
            title="Reset conversation to initial state"
          >
            <RotateCcw className="w-3 h-3 text-white" />
            <span>Reset Chat</span>
          </button>
        )}

        <div
          onClick={testBackend}
          className="cursor-pointer flex items-center gap-1.5 text-[11px] text-white hover:text-white transition-colors"
          title="Click to check FastAPI backend connection status"
        >
          <span
            className={`w-1.5 h-1.5 rounded-none ${
              isLiveBackend ? 'bg-white' : 'bg-white/10'
            }`}
          />
          <span>{isLiveBackend ? 'FastAPI Connected' : 'Local Engine'}</span>
        </div>
      </div>
    </div>
  );
};
