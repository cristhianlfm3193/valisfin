'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { LoadingCube } from './LoadingCube';

export function NavigationLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchString = searchParams.toString();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setIsNavigating(true);
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 700);

    return () => clearTimeout(timer);
  }, [pathname, searchString]);

  if (!isNavigating) return null;

  let theme: 'biz' | 'an' | 'fin' | 'hub' = 'hub';
  let text = 'ValisHub';

  if (pathname.startsWith('/valisbiz')) {
    theme = 'biz';
    text = 'ValisBiz';
  } else if (pathname.startsWith('/valisan')) {
    theme = 'an';
    text = 'ValisAN';
  } else if (pathname === '/' || pathname === '/login' || pathname.startsWith('/auth')) {
    theme = 'hub';
    text = 'ValisHub';
  } else {
    // If it's not biz, an, or root/login, it's likely a ValisFin section
    theme = 'fin';
    text = 'ValisFin';
  }

  return <LoadingCube text={text} theme={theme} />;
}
