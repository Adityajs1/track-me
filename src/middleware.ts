import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PREFIXES = [
  '/time-blocking',
  '/timeblocking',
  '/goals-habits',
  '/goals',
  '/daily-check-in',
  '/check-in',
  '/journal',
  '/notes',
  '/overview',
  '/dashboard',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get('auth_token')?.value;

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isProtected && !authToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/time-blocking/:path*',
    '/time-blocking',
    '/timeblocking/:path*',
    '/timeblocking',
    '/goals-habits/:path*',
    '/goals-habits',
    '/goals/:path*',
    '/goals',
    '/daily-check-in/:path*',
    '/daily-check-in',
    '/check-in/:path*',
    '/check-in',
    '/journal/:path*',
    '/journal',
    '/notes/:path*',
    '/notes',
    '/overview/:path*',
    '/overview',
    '/dashboard/:path*',
    '/dashboard',
  ],
};
