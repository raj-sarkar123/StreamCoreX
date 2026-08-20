import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Intercept leftover Vite/PWA/ServiceWorker requests from previous local projects on port 3000
  if (
    pathname.startsWith('/@vite') ||
    pathname.startsWith('/@react-refresh') ||
    pathname.startsWith('/src/') ||
    pathname === '/manifest.json' ||
    pathname === '/worker.js'
  ) {
    return new NextResponse('/* Silenced stale service worker request */', {
      status: 200,
      headers: { 'content-type': 'application/javascript' },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/@vite/:path*', '/@react-refresh', '/src/:path*', '/manifest.json', '/worker.js'],
};
