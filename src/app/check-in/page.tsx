'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckInAliasPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/daily-check-in');
  }, [router]);

  return null;
}
