'use client';

import { Suspense } from 'react';
import RegistroForm from './RegistroForm';

export default function RegistroPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" aria-hidden="true" /></div>}>
      <RegistroForm />
    </Suspense>
  );
}