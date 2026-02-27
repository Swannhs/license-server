import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    const user = process.env.ADMIN_USERNAME || 'Swann';
    const pwd = process.env.ADMIN_PASSWORD || '$Swann007';

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
        const basicAuth = req.headers.get('authorization');

        if (basicAuth) {
            const authValue = basicAuth.split(' ')[1];
            const [providedUser, providedPwd] = atob(authValue).split(':');

            if (providedUser === user && providedPwd === pwd) {
                return NextResponse.next();
            }
        }

        return new NextResponse('Auth Required', {
            status: 401,
            headers: {
                'WWW-Authenticate': 'Basic realm="Secure Area"',
            },
        });
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
