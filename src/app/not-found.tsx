'use client';

import Link from 'next/link';
import { Home, RefreshCw } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-concrete flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-10 frame" aria-hidden="true">
        <div></div>
        <div></div>
        <div></div>
      </div>

      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="glitch-container">
          <h1 className="font-bold text-center glitch-text" data-text="404" style={{
            fontSize: 'clamp(80px, 20vw, 200px)',
            lineHeight: '1',
            color: '#F2C1A3',
            fontFamily: 'Arial, sans-serif',
            textAlign: 'center',
            width: '100%',
          }}>
            404
          </h1>
        </div>

        <p className="mt-8 text-center text-warm-steel/80 text-lg max-w-md">
          Ups... esta página se ha perdido en el mapa
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Link
            href="/"
            className="px-8 py-4 bg-primary text-white font-semibold rounded-xl hover:bg-concrete transition-colors flex items-center gap-2"
          >
            <Home className="w-5 h-5" aria-hidden="true" />
            Volver al inicio
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-5 h-5" aria-hidden="true" />
            Reintentar
          </button>
        </div>
      </div>

      <style jsx>{`
        .frame {
          position: absolute;
          inset: 0;
          z-index: 10;
          background: radial-gradient(ellipse at center, 
            rgba(0, 0, 0, 0) 0%, 
            rgba(0, 0, 0, 0) 19%, 
            rgba(0, 0, 0, 0.9) 100%
          );
        }

        .frame div {
          position: absolute;
          left: 0;
          top: -20%;
          width: 100%;
          height: 20%;
          background-color: rgba(0, 0, 0, 0.12);
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
          animation: scanline 12s linear infinite;
        }

        .frame div:nth-child(1) { animation-delay: 0s; }
        .frame div:nth-child(2) { animation-delay: 4s; }
        .frame div:nth-child(3) { animation-delay: 8s; }

        @keyframes scanline {
          0% { top: -20%; }
          100% { top: 100%; }
        }

        .glitch-container {
          position: relative;
          display: inline-block;
        }

        .glitch-text {
          position: relative;
          animation: glitch-flicker 3s infinite ease-in-out;
        }

        .glitch-text::before,
        .glitch-text::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .glitch-text::before {
          animation: glitch-anim-1 2.5s infinite linear alternate-reverse;
          clip-path: polygon(0 0, 100% 0, 100% 35%, 0 35%);
          -webkit-clip-path: polygon(0 0, 100% 0, 100% 35%, 0 35%);
          color: #CD9FA0;
          z-index: -1;
        }

        .glitch-text::after {
          animation: glitch-anim-2 3s infinite linear alternate-reverse;
          clip-path: polygon(0 65%, 100% 65%, 100% 100%, 0 100%);
          -webkit-clip-path: polygon(0 65%, 100% 65%, 100% 100%, 0 100%);
          color: #857C91;
          z-index: -2;
        }

        @keyframes glitch-flicker {
          0%, 100% { opacity: 1; }
          20% { opacity: 0.8; }
          40% { opacity: 1; }
          60% { opacity: 0.9; }
          80% { opacity: 1; }
        }

        @keyframes glitch-anim-1 {
          0% { transform: translateX(-2px); clip-path: polygon(0 0, 100% 0, 100% 10%, 0 10%); }
          20% { transform: translateX(2px); clip-path: polygon(0 20%, 100% 20%, 100% 40%, 0 40%); }
          40% { transform: translateX(-1px); clip-path: polygon(0 50%, 100% 50%, 100% 70%, 0 70%); }
          60% { transform: translateX(1px); clip-path: polygon(0 30%, 100% 30%, 100% 55%, 0 55%); }
          80% { transform: translateX(-2px); clip-path: polygon(0 80%, 100% 80%, 100% 95%, 0 95%); }
          100% { transform: translateX(0); clip-path: polygon(0 10%, 100% 10%, 100% 25%, 0 25%); }
        }

        @keyframes glitch-anim-2 {
          0% { transform: translateX(2px); clip-path: polygon(0 0, 100% 0, 100% 5%, 0 5%); }
          20% { transform: translateX(-1px); clip-path: polygon(0 15%, 100% 15%, 100% 30%, 0 30%); }
          40% { transform: translateX(1px); clip-path: polygon(0 45%, 100% 45%, 100% 60%, 0 60%); }
          60% { transform: translateX(-2px); clip-path: polygon(0 70%, 100% 70%, 100% 85%, 0 85%); }
          80% { transform: translateX(2px); clip-path: polygon(0 55%, 100% 55%, 100% 90%, 0 90%); }
          100% { transform: translateX(0); clip-path: polygon(0 90%, 100% 90%, 100% 100%, 0 100%); }
        }
      `}</style>
    </div>
  );
}