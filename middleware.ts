import { NextRequest, NextResponse } from 'next/server';
import { AUTH_TOKEN_COOKIE } from './lib/constants';

const PROTECTED_ROUTES = ['/processos'];
const PUBLIC_ROUTES = ['/login', '/auth/login'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;
    const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
    const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

    if (!token && isProtected) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('redirectTo', pathname);
        return NextResponse.redirect(url);
    }

    if (token && isPublic) {
        return NextResponse.redirect(new URL('/processos', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/login', '/auth/login', '/processos/:path*']
};
