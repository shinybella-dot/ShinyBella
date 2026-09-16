'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

export default function EmailVerificationSuccess() {
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
        const color = (Math.random() * 30) + 200;
        pix[i] = color;
        pix[i + 1] = color;
        pix[i + 2] = color;
      }
      ctx.putImageData(imgData, 0, 0);
    };

    intervalRef.current = window.setInterval(flickering, 50);

    return () => {
      window.removeEventListener('resize', resize);
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-concrete flex items-center justify-center px-4 py-12">
      <div className="relative w-full max-w-md space-y-8">
        <div id="skybox" className="skybox">
          <div className="txt">
            <p>Succesfully</p>
            <br/>
            <span>Cuenta verificada correctamente</span>
          </div>
          <div id="player" className="idle"></div>
          <div className="ground"></div>
        </div>

        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        />

        <p className="text-center text-warm-steel/80 text-sm">
          Cuenta verificada correctamente
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Link
            href="/"
            className="px-8 py-4 bg-primary text-white font-semibold rounded-xl hover:bg-concrete transition-colors flex items-center gap-2"
            aria-label="Ir al inicio"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-2 6.3a1 1 0 010 1.7l.115 2.12m-1.65-1.66l2.12-.115m2.12 0l1.332 2.12a1 1 0 111.982 1.238l-.383 1.33m3.868-1.438a1 1 0 01.129-.383l1.321-.383l.383 1.321"
              />
            </svg>
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}