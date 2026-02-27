import { NextRequest, NextResponse } from 'next/server';
import { getLicense } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const { username, key } = await req.json();

        if (!username || !key) {
            return NextResponse.json({ error: 'Username and key are required' }, { status: 400 });
        }

        const license = await getLicense(username);

        if (!license) {
            return NextResponse.json({ valid: false, error: 'License not found' }, { status: 404 });
        }

        if (license.key === key) {
            return NextResponse.json({ valid: true, message: 'License is valid' }, { status: 200 });
        } else {
            return NextResponse.json({ valid: false, error: 'Invalid license key' }, { status: 401 });
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
