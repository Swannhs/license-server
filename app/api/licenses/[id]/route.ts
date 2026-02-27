import { NextRequest, NextResponse } from 'next/server';
import { deleteLicense, editLicense } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const p = await params;
        const id = p.id;
        if (!id) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const body = await req.json();
        const updates: any = {};

        if (body.expiresAt) {
            updates.expiresAt = new Date(body.expiresAt);
        } else if (body.expiresAt === null) {
            updates.expiresAt = null;
        }

        if (body.allowedDomain !== undefined) {
            updates.allowedDomain = body.allowedDomain;
        }

        const updated = await editLicense(id, updates);
        return NextResponse.json(updated);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const p = await params;
        const id = p.id;
        if (!id) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }
        await deleteLicense(id);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
