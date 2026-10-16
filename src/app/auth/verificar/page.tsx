'use client';

import Link from 'next/link';

export default function EmailVerificationSuccess() {
  return (
    <div className="min-h-screen bg-concrete flex items-center justify-center px-4 py-12">
      <div className="relative w-full max-w-md space-y-8">
        <div id="skybox" className="skybox">
          <div className="txt">
            <p>Succesfully</p>
            <br />
            <span>Cuenta verificada correctamente</span>
          </div>
          <div id="player" className="idle"></div>
          <div className="ground"></div>
        </div>

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

      <style jsx>{`
        .skybox {
          position: relative;
          width: 100%;
          height: 200px;
          background: linear-gradient(180deg, #F8CCAA 0%, #F2C1A3 50%, #CD9FA0 100%);
          border-radius: 16px;
          overflow: hidden;
        }

        .txt {
          position: absolute;
          top: 20px;
          left: 20px;
          color: #525871;
          font-family: 'Arial', sans-serif;
        }

        .txt p {
          font-size: 2rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          animation: bounce-in 0.8s ease-out;
        }

        .txt span {
          display: block;
          margin-top: 8px;
          font-size: 1rem;
          font-weight: 500;
          animation: fade-in-up 0.6s ease-out 0.3s both;
        }

        #player {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 60px;
          background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='28' fill='%23F2C1A3'/%3E%3Ccircle cx='24' cy='26' r='3' fill='%23525871'/%3E%3Ccircle cx='40' cy='26' r='3' fill='%23525871'/%3E%3Cellipse cx='32' cy='38' rx='8' ry='4' fill='%23857C91'/%3E%3C/svg%3E") no-repeat center/contain;
          animation: mario-bounce 1.5s ease-in-out infinite;
        }

        .ground {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 40px;
          background: linear-gradient(180deg, #CD9FA0 0%, #857C91 100%);
        }

        @keyframes bounce-in {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.1); }
          70% { transform: scale(0.95); }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes fade-in-up {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }

        @keyframes mario-bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-15px); }
        }
      `}</style>
    </div>
  );
}