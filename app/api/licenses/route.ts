import { NextResponse } from 'next/server';
import { getAllLicenses } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const licenses = await getAllLicenses();
        return NextResponse.json(licenses, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
