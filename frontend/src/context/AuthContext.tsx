import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (name: string, email: string, pass: string, role: UserRole) => Promise<boolean>;
  updateProfile: (avatar: string | File) => Promise<boolean>;
  logout: () => void;
  allUsers: any[];
  deleteUser: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('hercules_token'));
  const [usersDb, setUsersDb] = useState<any[]>([]);

  const fetchAllUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsersDb(data);
      }
    } catch (err) {
      console.error('Failed to fetch all users:', err);
    }
  };

  const fetchMe = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        if (data.user.role === 'admin') {
          fetchAllUsers();
        }
      } else {
        setToken(null);
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      setToken(null);
    }
  };

  useEffect(() => {
    if (token) {
      localStorage.setItem('hercules_token', token);
      fetchMe();
    } else {
      localStorage.removeItem('hercules_token');
      setUser(null);
    }
  }, [token]);

  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
        setUser(data.user);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  };

  const register = async (name: string, email: string, pass: string, role: UserRole): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password: pass, role })
      });
      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
        setUser(data.user);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Register error:', err);
      return false;
    }
  };

  const updateProfile = async (avatar: string | File): Promise<boolean> => {
    if (!token) return false;
    try {
      let body;
      let headers: HeadersInit = { Authorization: `Bearer ${token}` };
      
      if (avatar instanceof File) {
        const formData = new FormData();
        formData.append('avatarFile', avatar);
        body = formData;
      } else {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify({ avatar });
      }

      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'PUT',
        headers,
        body
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Update profile error:', err);
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const deleteUser = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setUsersDb(prev => prev.filter(u => u.id !== id));
        if (user?.id === id) {
          logout();
        }
      }
    } catch (err) {
      console.error('Delete user error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'student',
        isAuthenticated: !!user && !!token,
        token,
        login,
        register,
        updateProfile,
        logout,
        allUsers: usersDb,
        deleteUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
