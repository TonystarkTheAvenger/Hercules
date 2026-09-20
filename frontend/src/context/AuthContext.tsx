import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => boolean;
  register: (name: string, email: string, pass: string, role: UserRole) => boolean;
  logout: () => void;
  allUsers: any[];
  deleteUser: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('hercules_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [usersDb, setUsersDb] = useState<any[]>(() => {
    const adminUser = {
      id: 'usr_admin_01',
      email: 'admin@demo.com',
      password: 'password123',
      name: 'System Admin',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      course: 'System Operations',
    };

    const savedDb = localStorage.getItem('hercules_users_db');
    if (savedDb) {
      const parsed = JSON.parse(savedDb);
      // Force inject admin if it's missing from an older session
      if (!parsed.some((u: any) => u.email === 'admin@demo.com')) {
        parsed.push(adminUser);
        localStorage.setItem('hercules_users_db', JSON.stringify(parsed));
      }
      return parsed;
    }
    
    // Seed with initial dummy data if brand new
    const initialDb = [
      adminUser,
      {
        id: 'usr_student_01',
        email: 'student@demo.com',
        password: 'password123',
        name: 'Alex Rivera',
        role: 'student',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        course: 'CS201',
      },
      {
        id: 'usr_prof_01',
        email: 'prof@demo.com',
        password: 'password123',
        name: 'Dr. Evelyn Vance',
        role: 'professor',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        course: 'CS201',
      }
    ];
    localStorage.setItem('hercules_users_db', JSON.stringify(initialDb));
    return initialDb;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('hercules_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('hercules_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('hercules_users_db', JSON.stringify(usersDb));
  }, [usersDb]);

  const login = (email: string, pass: string): boolean => {
    const foundUser = usersDb.find(u => u.email === email && u.password === pass);
    if (foundUser) {
      // Omit password from session
      const { password, ...sessionUser } = foundUser;
      setUser(sessionUser as User);
      return true;
    }
    return false;
  };

  const register = (name: string, email: string, pass: string, role: UserRole): boolean => {
    // Check if exists
    if (usersDb.some(u => u.email === email)) {
      return false;
    }
    
    const newUser = {
      id: `usr_${Date.now()}`,
      email,
      password: pass,
      name,
      role,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      course: 'Custom Course',
    };
    
    setUsersDb(prev => [...prev, newUser]);
    
    const { password, ...sessionUser } = newUser;
    setUser(sessionUser as User);
    
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const deleteUser = (id: string) => {
    setUsersDb(prev => prev.filter(u => u.id !== id));
    if (user?.id === id) {
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'student',
        isAuthenticated: !!user,
        login,
        register,
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
