import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DocumentProvider } from './context/DocumentContext';
import { ChatProvider } from './context/ChatContext';
import { Navbar } from './components/Navbar';
import { ChatPage } from './pages/student/ChatPage';
import { DashboardPage } from './pages/professor/DashboardPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { CustomCursor } from './components/CustomCursor';
import { AboutPage } from './pages/AboutPage';
import { Footer } from './components/Footer';

const AppContent: React.FC = () => {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return (
      <>
        <CustomCursor />
        <AboutPage />
        <Footer />
      </>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col text-app-text-primary overflow-hidden font-sans bg-black relative">
      <CustomCursor />
      
      {/* Passive Background Animations (Classy Deep Dark) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#000000]">
        
        {/* Deep Classy Background Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#111111_0%,#000000_100%)]" />
        
        {/* Very subtle elegant lighting */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-white/[0.015] blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-[#D4AF37]/[0.01] blur-[120px] animate-float" />
        
        {/* Top-level subtle sheen (keep the very soft noise for texture) */}
        <div className="absolute inset-0 bg-noise opacity-[0.01] mix-blend-screen" />
      </div>

      <div className="relative z-10 flex flex-col h-full w-full">
        {/* Product Header */}
      <Navbar />

      {/* Main Workspace */}
      <main className="flex-1 flex overflow-hidden pt-[60px]">
        {role === 'admin' ? (
          <AdminDashboard />
        ) : role === 'student' ? (
          <ChatPage />
        ) : (
          <DashboardPage />
        )}
      </main>
      <Footer />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DocumentProvider>
        <ChatProvider>
          <AppContent />
        </ChatProvider>
      </DocumentProvider>
    </AuthProvider>
  );
}
