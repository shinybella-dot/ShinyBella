'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Home, RefreshCw } from 'lucide-react';

export default function NotFound() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    const flickering = () => {
      if (!ctx) return;
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pix = imgData.data;

      for (let i = 0; i < pix.length; i += 4) {
        const color = (Math.random() * 255) + 50;
        pix[i] = color;
        pix[i + 1] = color;
        pix[i + 2] = color;
      }
      ctx.putImageData(imgData, 0, 0);
    };

    intervalRef.current = window.setInterval(flickering, 30);

    return () => {
      window.removeEventListener('resize', resize);
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-concrete flex items-center justify-center overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-10"
        aria-hidden="true"
      />

      <div className="absolute inset-0 z-20 frame" aria-hidden="true">
        <div></div>
        <div></div>
        <div></div>
      </div>

      <div className="relative z-30 flex flex-col items-center justify-center min-h-screen px-4">
        <h1 className="font-bold text-center" style={{
          fontSize: 'clamp(80px, 20vw, 200px)',
          lineHeight: '1',
          color: 'transparent',
          textShadow: '0 0 30px rgba(0, 0, 0, 0.5)',
          animation: 'asdd 2s linear infinite',
          fontFamily: 'Arial, sans-serif',
          textAlign: 'center',
          width: '100%',
        }}>
          404
        </h1>

        <p className="mt-8 text-center text-warm-steel/80 text-lg max-w-md">
          Ups... esta página se ha perdido en el mapa 🗺️
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
          z-index: 20;
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

        @keyframes asdd {
          0% { text-shadow: 0 0 30px rgba(0, 0, 0, 0.5); }
          33% { text-shadow: 0 0 10px rgba(0, 0, 0, 0.4); }
          66% { text-shadow: 0 0 20px rgba(0, 0, 0, 0.2); }
          100% { text-shadow: 0 0 40px rgba(0, 0, 0, 0.8); }
        }
      `}</style>
    </div>
  );
}