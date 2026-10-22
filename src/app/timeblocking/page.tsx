'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TimeblockingRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/time-blocking');
  }, [router]);

  return null;
}
