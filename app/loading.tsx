'use client';

import { usePathname } from 'next/navigation';
import { LoadingCube } from './components/LoadingCube';

export default function Loading() {
  const pathname = usePathname();

  let theme: 'biz' | 'an' | 'fin' | 'hub' = 'hub';
  let text = 'ValisHub';

  if (pathname) {
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
      // Any other root path (ingresos, pagos-fijos, vehiculos, etc) is ValisFin
      theme = 'fin';
      text = 'ValisFin';
    }
  }

  return <LoadingCube text={text} theme={theme} />;
}
