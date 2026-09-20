import React, { useEffect } from 'react';

interface HeroAsciiOneProps {
  children?: React.ReactNode;
}

export default function HeroAsciiOne({ children }: HeroAsciiOneProps) {
  useEffect(() => {
    const embedScript = document.createElement('script');
    embedScript.innerHTML = `
      !function(){
        if(!window.UnicornStudio){
          window.UnicornStudio={isInitialized:!1,init:function(){console.warn("Unicorn Studio is not initialized yet")}};
          var i=document.createElement("script");
          i.src="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.33/dist/unicornStudio.umd.js";
          i.onload=function(){
            window.UnicornStudio.isInitialized||(UnicornStudio.init(),window.UnicornStudio.isInitialized=!0)
          };
          (document.head || document.body).appendChild(i)
        }
      }();
    `;
    document.head.appendChild(embedScript);

    const style = document.createElement('style');
    style.textContent = `
      [data-us-project] {
        position: relative !important;
        overflow: hidden !important;
      }
      /* If the watermark is drawn inside WebGL or un-removable shadow DOM, scale it off the viewport */
      [data-us-project] canvas {
        transform: scale(1.08) translateY(4%) !important;
        transform-origin: center center !important;
      }
      [data-us-project] > *:not(canvas) {
        display: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }
      /* Global ban hammer for the badge */
      a[href*="unicorn"],
      a[href*="Unicorn"],
      [class*="unicorn"],
      [id*="unicorn"] {
        display: none !important;
        opacity: 0 !important;
        pointer-events: none !important;
        z-index: -9999 !important;
      }
    `;
    document.head.appendChild(style);

    // Aggressive DOM wiping
    const killer = setInterval(() => {
      document.querySelectorAll('a').forEach(a => {
        if (a.href.toLowerCase().includes('unicorn')) a.remove();
      });
      // Try to pierce shadow DOM if they use one
      const usProject = document.querySelector('[data-us-project]');
      if (usProject && usProject.shadowRoot) {
        const shadowLinks = usProject.shadowRoot.querySelectorAll('a');
        shadowLinks.forEach(a => a.remove());
        const innerStyle = document.createElement('style');
        innerStyle.textContent = 'a { display: none !important; }';
        usProject.shadowRoot.appendChild(innerStyle);
      }
    }, 100);

    return () => {
      clearInterval(killer);
      document.head.removeChild(embedScript);
      document.head.removeChild(style);
    };
  }, []);

  return (
    <>
      <div className="fixed inset-0 w-full h-full hidden lg:block z-0 pointer-events-none">
        <div 
          data-us-project="OMzqyUv6M3kSnv0JeAtC" 
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      <div className="fixed inset-0 w-full h-full lg:hidden stars-bg z-0 pointer-events-none" />

      <div className="relative z-10 w-full font-mono text-white pointer-events-auto">
        {children}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .stars-bg {
          background-image: radial-gradient(1px 1px at 20% 30%, white, transparent),
            radial-gradient(1px 1px at 60% 70%, white, transparent),
            radial-gradient(1px 1px at 50% 50%, white, transparent);
          background-size: 200% 200%, 180% 180%, 250% 250%;
          opacity: 0.3;
        }
      `}} />
    </>
  );
}
