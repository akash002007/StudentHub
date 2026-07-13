"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export function EditorialHero() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!videoRef.current) return;
      
      if (document.hidden) {
        videoRef.current.pause();
      } else {
        // Only attempt to play if the video is paused
        if (videoRef.current.paused) {
          videoRef.current.play().catch(() => {
            // Silently handle autoplay restrictions
          });
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-[140px] pb-24 overflow-hidden">
      
      {/* Background Video Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-[#050505]">
        <video 
          ref={videoRef}
          autoPlay 
          loop 
          muted 
          playsInline
          preload="metadata"
          className="w-full h-full object-cover"
        >
          <source src="/assets/landing_page_video.mp4" type="video/mp4" />
        </video>
        
        {/* Layer 2: Scrim Overlay for text readability (matches previous AmbientBackground lighting) */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/40 to-black/90" />
        
        {/* Layer 3: Noise Texture to blend smoothly */}
        <div className="absolute inset-0 opacity-[0.03] bg-noise-texture mix-blend-overlay" />
      </div>

      {/* Layer 4: Hero Text */}
      <div className="relative z-40 container mx-auto px-6 md:px-12 flex flex-col items-center text-center mt-12 md:mt-24 pointer-events-auto">
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 glass-panel-light"
        >
          <span className="w-2 h-2 rounded-full bg-electric-cyan animate-pulse" style={{ backgroundColor: 'var(--color-electric-cyan)' }} />
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">
            The Future of Networking
          </span>
        </motion.div>

        <motion.h1 
          className="text-hero max-w-6xl mx-auto drop-shadow-2xl"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="block text-white">Verified Students.</span>
          <span className="block text-gradient-cyan mt-2">Endless Opportunities.</span>
        </motion.h1>

        <motion.p
          className="mt-8 text-xl md:text-2xl text-zinc-300 max-w-3xl font-medium tracking-wide leading-relaxed drop-shadow-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          An exclusive ecosystem where verified students connect with top recruiters, 
          alumni, and communities. No noise. Just growth.
        </motion.p>

      </div>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 right-8 md:bottom-12 md:right-12 flex flex-col items-center gap-2 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">Scroll</span>
        <motion.div 
          className="w-[1px] h-12 bg-gradient-to-b from-zinc-500 to-transparent origin-top"
          animate={{ scaleY: [0, 1, 0], translateY: [0, 10, 20] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  );
}
