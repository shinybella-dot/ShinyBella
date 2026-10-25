'use client';

import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const WizardNegocio = dynamic(() => import('@/components/auth/WizardSteps'), { ssr: false });

export default function AfiliarsePage() {
  return (
    <div className="flex flex-col min-h-screen bg-surface-light">
      <Header />
      <main className="flex-1">
        <WizardNegocio />
      </main>
      <Footer />
    </div>
  );
}