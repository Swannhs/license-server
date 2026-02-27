import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'super_secret_fallback_key_for_development_purposes_only'
);

export async function POST(req: NextRequest) {
    try {
        const { username, password } = await req.json();

        const adminUser = process.env.ADMIN_USERNAME || 'Swann';
        const adminPwd = process.env.ADMIN_PASSWORD || '$Swann007';

        if (username === adminUser && password === adminPwd) {
            // Create a JWT token
            const token = await new SignJWT({ user: username })
                .setProtectedHeader({ alg: 'HS256' })
                .setExpirationTime('24h')
                .sign(JWT_SECRET);

            const response = NextResponse.json({ success: true }, { status: 200 });

            // Set token as an HTTP-only cookie
            response.cookies.set({
                name: 'admin_token',
                value: token,
                httpOnly: true,
                path: '/',
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 // 1 day
            });

            return response;
        } else {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }
    } catch (error: any) {
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
}
