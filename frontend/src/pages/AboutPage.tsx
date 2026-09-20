import React from 'react';
import { CardDeck } from '../components/CardDeck';
import HeroAsciiOne from '../components/hero-ascii-one';

export const AboutPage: React.FC = () => {
  return (
    <HeroAsciiOne>
      <div className="bg-transparent min-h-screen text-white flex items-center p-6 lg:p-12 relative overflow-hidden">
        {/* Container forced to the right half of the screen on desktop */}
        <div className="w-full lg:w-1/2 lg:ml-auto relative z-10 pt-16">
          <CardDeck />
        </div>
      </div>
    </HeroAsciiOne>
  );
};
