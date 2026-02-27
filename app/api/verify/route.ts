import { NextRequest, NextResponse } from 'next/server';
import { getLicense } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const { username, key, domain } = await req.json();

        if (!username || !key) {
            return NextResponse.json({ error: 'Username and key are required' }, { status: 400 });
        }

        const license = await getLicense(username);

        if (!license) {
            return NextResponse.json({ valid: false, error: 'License not found' }, { status: 404 });
        }

        if (license.key === key) {
            if (license.expiresAt && new Date(license.expiresAt) < new Date()) {
                return NextResponse.json({ valid: false, error: 'License has expired' }, { status: 401 });
            }

            if (license.allowedDomain) {
                // Check if the domain they provided in the payload, or the referer/origin matches
                const origin = req.headers.get('origin') || req.headers.get('referer') || '';
                const incomingDomain = domain || origin;

                if (!incomingDomain.includes(license.allowedDomain)) {
                    return NextResponse.json({ valid: false, error: 'License is not valid for this domain' }, { status: 403 });
                }
            }

            return NextResponse.json({ valid: true, message: 'License is valid' }, { status: 200 });
        } else {
            return NextResponse.json({ valid: false, error: 'Invalid license key' }, { status: 401 });
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
