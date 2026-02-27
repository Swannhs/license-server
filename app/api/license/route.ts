import { NextRequest, NextResponse } from 'next/server';
import { addLicense, getLicense, initDb } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const { username, key, duration, allowedDomain } = await req.json();

        if (!username || !key) {
            return NextResponse.json({ error: 'Username and key are required' }, { status: 400 });
        }

        let expiresAt = null;
        if (duration && duration !== 'lifetime') {
            const months = parseInt(duration, 10);
            if (!isNaN(months)) {
                expiresAt = new Date();
                expiresAt.setMonth(expiresAt.getMonth() + months);
            }
        }

        const newLicense = await addLicense(username, key, expiresAt, allowedDomain || null);
        return NextResponse.json(newLicense, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');

    if (!username) {
        return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    try {
        const license = await getLicense(username);
        if (license) {
            return NextResponse.json(license, { status: 200 });
        } else {
            return NextResponse.json({ error: 'License not found' }, { status: 404 });
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
