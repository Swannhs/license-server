import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'super_secret_fallback_key_for_development_purposes_only'
);

export async function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname;
    let isProtected = false;

    // Protect the admin panel
    if (path.startsWith('/admin')) {
        isProtected = true;
    }

    // Protect fetching all licenses and deleting licenses
    if (path.startsWith('/api/licenses')) {
        isProtected = true;
    }

    // Protect generating new licenses
    if (path === '/api/license' && req.method === 'POST') {
        isProtected = true;
    }

    if (isProtected) {
        const token = req.cookies.get('admin_token')?.value;

        if (!token) {
            // If it's an API route, return 401 JSON
            if (path.startsWith('/api/')) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
            // If it's a UI route, redirect to login
            return NextResponse.redirect(new URL('/login', req.url));
        }

        try {
            // Verify token authenticity
            await jwtVerify(token, JWT_SECRET);
            return NextResponse.next();
        } catch (error) {
            if (path.startsWith('/api/')) {
                return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
            }

            const response = NextResponse.redirect(new URL('/login', req.url));
            response.cookies.delete('admin_token');
            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/api/licenses/:path*',
        '/api/license'
    ],
};
