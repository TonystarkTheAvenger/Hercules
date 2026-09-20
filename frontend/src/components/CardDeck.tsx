import React, { useState } from 'react';
import { ChevronRight, Globe, Target, Cpu, Users, ChevronLeft } from 'lucide-react';
import { LoginForm } from './LoginForm';

export const CardDeck: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextCard = () => setActiveIndex((prev) => Math.min(prev + 1, 4));
  const prevCard = () => setActiveIndex((prev) => Math.max(prev - 1, 0));

  const cards = [
    {
      id: 'intro',
      icon: <Cpu className="w-8 h-8 text-white/50 mb-6" />,
      title: "Project Hercules",
      subtitle: "SYS.VER.2.0.0",
      content: "Hercules is an advanced intelligent protocol designed to bridge the gap between academic intent and student comprehension. Engineered with dual-state interfaces, it provides sysadmin-level control for educators to inject core knowledge, while offering an interactive, zero-lag query terminal for students."
    },
    {
      id: 'who-we-are',
      icon: <Users className="w-8 h-8 text-white/50 mb-6" />,
      title: "Who We Are",
      subtitle: "THE INITIATIVE",
      content: "We are a collective of engineers and educators building the next generation of academic interfaces. By merging raw computational power with fluid, zero-latency design, we aim to eliminate the friction between thought and knowledge."
    },
    {
      id: 'vision',
      icon: <Globe className="w-8 h-8 text-white/50 mb-6" />,
      title: "The Vision",
      subtitle: "FUTURE STATE",
      content: "A future where educational software isn't just a database, but an extension of the mind. We foresee a fully autonomous, adaptive layer that morphs to fit the learning velocity of every single student in real time."
    },
    {
      id: 'goal',
      icon: <Target className="w-8 h-8 text-white/50 mb-6" />,
      title: "Our Primary Goal",
      subtitle: "STUDENT FIRST",
      content: "To give every student a personalized, 24/7 academic co-pilot. Whether you're stuck on a complex formula at 2 AM or need a concept broken down into first principles, Hercules instantly adapts to your learning style using only professor-verified knowledge. No hallucinations, just instant clarity."
    }
  ];

  const getCardStyle = (idx: number) => {
    const diff = idx - activeIndex;
    const isActive = diff === 0;
    const sign = diff > 0 ? 1 : -1;
    
    // Explicit sequence requested by user:
    // 0: Up to Down
    // 1: Right to Left
    // 2: Down to Up
    // 3: Left to Right
    const axisType = idx % 4;
    let transformInactive = '';
    
    if (axisType === 0) {
      // Up to Down entry (Waits at Top -Y, Exits to Bottom +Y)
      transformInactive = `rotateX(${sign * 90}deg) translate3d(0, ${sign * -100}px, -100px)`;
    } else if (axisType === 1) {
      // Right to Left entry (Waits at Right +X, Exits to Left -X)
      transformInactive = `rotateY(${sign * 90}deg) translate3d(${sign * 100}px, 0, -100px)`;
    } else if (axisType === 2) {
      // Down to Up entry (Waits at Bottom +Y, Exits to Top -Y)
      transformInactive = `rotateX(${sign * -90}deg) translate3d(0, ${sign * 100}px, -100px)`;
    } else {
      // Left to Right entry (Waits at Left -X, Exits to Right +X)
      transformInactive = `rotateY(${sign * -90}deg) translate3d(${sign * -100}px, 0, -100px)`;
    }

    return {
      transform: isActive 
        ? 'rotateX(0deg) rotateY(0deg) translate3d(0px, 0px, 0px) scale(1)' 
        : `${transformInactive} scale(0.9)`,
      opacity: isActive ? 1 : 0,
      pointerEvents: isActive ? 'auto' as const : 'none' as const,
      zIndex: isActive ? 10 : 0,
      willChange: 'transform, opacity',
      // Added a fluid spring bezier curve (overshoots slightly to 1.15) for maximum smoothness
      transition: 'transform 0.9s cubic-bezier(0.34, 1.15, 0.64, 1), opacity 0.7s ease'
    };
  };

  return (
    <div className="relative w-full max-w-xl h-[550px] mx-auto" style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}>
      {cards.map((card, idx) => (
        <div 
          key={card.id}
          className="absolute inset-0 flex flex-col justify-between p-8 sm:p-10 rounded-2xl bg-[#0A0A0A]/80 backdrop-blur-2xl border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_20px_40px_rgba(0,0,0,0.5)] transform-style-3d backface-hidden"
          style={getCardStyle(idx)}
        >
          <div>
            {card.icon}
            <div className="space-y-2 border-b border-white/[0.08] pb-6 mb-6">
              <h2 className="text-3xl font-bold tracking-tight text-white">{card.title}</h2>
              <p className="text-xs text-[#A3A3A3] font-mono tracking-widest">{card.subtitle}</p>
            </div>
            <p className="text-[#E5E5E5] leading-relaxed text-sm sm:text-base">
              {card.content}
            </p>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-white/[0.05]">
            <div className="flex gap-2">
              {cards.map((_, dotIdx) => (
                <div key={dotIdx} className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${dotIdx === idx ? 'bg-white' : 'bg-white/20'}`} />
              ))}
              <div className="w-1.5 h-1.5 rounded-full transition-colors duration-500 bg-white/20" />
            </div>
            <div className="flex gap-3">
              {idx > 0 && (
                <button onClick={prevCard} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-transparent hover:bg-white/[0.05] text-[#A3A3A3] hover:text-white transition-colors text-sm font-medium">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              )}
              <button onClick={nextCard} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black hover:bg-[#E5E5E5] transition-colors text-sm font-medium group">
                Continue <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Login Card (Final Card) */}
      <div 
        className="absolute inset-0 flex flex-col rounded-2xl bg-[#0A0A0A]/80 backdrop-blur-2xl border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_20px_40px_rgba(0,0,0,0.5)] transform-style-3d backface-hidden"
        style={getCardStyle(4)}
      >
        <div className="p-8 sm:p-10 pb-0">
          <div className="space-y-2 border-b border-white/[0.08] pb-6 mb-6">
            <h2 className="text-3xl font-bold tracking-tight text-white">Welcome to Hercules</h2>
            <p className="text-xs text-[#A3A3A3] font-mono tracking-widest">Sign in to access your portal</p>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar px-8 sm:px-10">
           <LoginForm />
        </div>

        <div className="flex items-center justify-between p-8 sm:p-10 pt-4 border-t border-white/[0.05]">
          <div className="flex gap-2">
            {cards.map((_, dotIdx) => (
              <div key={dotIdx} className="w-1.5 h-1.5 rounded-full bg-white/20" />
            ))}
            <div className="w-1.5 h-1.5 rounded-full transition-colors duration-500 bg-white" />
          </div>
          <button onClick={prevCard} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-transparent hover:bg-white/[0.05] text-[#A3A3A3] hover:text-white transition-colors text-sm font-medium">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        </div>
      </div>
    </div>
  );
};
