import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Save, User as UserIcon } from 'lucide-react';

interface ProfileModalProps {
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ onClose }) => {
  const { user, updateProfile, logout } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!user) return null;

  const handleSave = async () => {
    setIsSaving(true);
    await updateProfile(avatarFile || avatarUrl);
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden animate-fade-in shadow-2xl">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-app-text-muted" />
            {user.role === 'student' ? 'Student Dashboard' : user.role === 'professor' ? 'Professor Dashboard' : 'Profile'}
          </h2>
          <button onClick={onClose} className="text-app-text-muted hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative group cursor-pointer">
              <img 
                src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} 
                alt={user.name} 
                className="w-24 h-24 rounded-full border-4 border-white/10 object-cover"
              />
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs text-white font-medium">Upload</span>
              </div>
              <input 
                type="file" 
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setAvatarFile(e.target.files[0]);
                    setAvatarUrl(URL.createObjectURL(e.target.files[0]));
                  }
                }}
              />
            </div>
            <p className="text-xs text-app-text-muted">Click image to upload new avatar</p>
          </div>

          <div className="space-y-4 bg-white/[0.02] p-4 rounded-xl border border-white/5">
            <div>
              <p className="text-xs text-app-text-muted mb-1">Name</p>
              <p className="text-sm font-medium text-white">{user.name}</p>
            </div>
            <div>
              <p className="text-xs text-app-text-muted mb-1">Email</p>
              <p className="text-sm font-medium text-white">{user.email}</p>
            </div>
            <div>
              <p className="text-xs text-app-text-muted mb-1">Role & Department</p>
              <p className="text-sm font-medium text-white capitalize">{user.role} • {user.department}</p>
            </div>
            <div>
              <p className="text-xs text-app-text-muted mb-1">Course</p>
              <p className="text-sm font-medium text-white">{user.course}</p>
            </div>
          </div>

          {/* Role specific quick stats */}
          {user.role === 'student' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#111111] p-3 rounded-xl border border-white/5 text-center">
                <p className="text-xl font-bold text-white">4</p>
                <p className="text-[10px] uppercase tracking-wider text-app-text-muted mt-1">Quizzes Taken</p>
              </div>
              <div className="bg-[#111111] p-3 rounded-xl border border-white/5 text-center">
                <p className="text-xl font-bold text-white">12</p>
                <p className="text-[10px] uppercase tracking-wider text-app-text-muted mt-1">Chat Sessions</p>
              </div>
            </div>
          )}

          {user.role === 'professor' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#111111] p-3 rounded-xl border border-white/5 text-center">
                <p className="text-xl font-bold text-white">8</p>
                <p className="text-[10px] uppercase tracking-wider text-app-text-muted mt-1">Documents Indexed</p>
              </div>
              <div className="bg-[#111111] p-3 rounded-xl border border-white/5 text-center">
                <p className="text-xl font-bold text-white">24</p>
                <p className="text-[10px] uppercase tracking-wider text-app-text-muted mt-1">Students Enrolled</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-white/10 bg-[#050505] flex items-center justify-between">
          <button 
            onClick={() => { onClose(); logout(); }}
            className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
          >
            Sign Out
          </button>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-sm text-[#A3A3A3] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-white text-black hover:bg-[#E5E5E5] px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Profile</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
