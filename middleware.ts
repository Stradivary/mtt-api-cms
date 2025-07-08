import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './lib/jwt';
import { parse } from 'cookie';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const cookieHeader = req.headers.get('cookie') || '';
  const { token } = parse(cookieHeader);

  if (pathname === '/login' && token) {
    try {
      verifyToken(token);
      return NextResponse.redirect(new URL('/news', req.url));
    } catch {
    }
  }

  if (pathname.startsWith('/news') || pathname === '/' || pathname === '/dashboard') {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    try {
      verifyToken(token);
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/news/:path*', '/login'],
};
