import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_MAX_AGE, AUTH_TOKEN_COOKIE } from '@/lib/constants';

export async function POST(request: NextRequest) {
    const body = await request.json();
    const token = body?.token;

    if (!token) {
        return NextResponse.json({ message: 'Token não informado.' }, { status: 400 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set({
        name: AUTH_TOKEN_COOKIE,
        value: token,
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: AUTH_COOKIE_MAX_AGE,
        secure: process.env.NODE_ENV === 'production'
    });

    return response;
}

export async function DELETE() {
    const response = NextResponse.json({ success: true });
    response.cookies.set({
        name: AUTH_TOKEN_COOKIE,
        value: '',
        path: '/',
        maxAge: 0
    });
    return response;
}
