import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

/**
 * POST /api/set-admin
 * Body: { email: string, secret: string }
 * 
 * Dùng để set role = 'admin' cho một email cụ thể.
 * Yêu cầu secret key để bảo mật.
 */
export async function POST(req: Request) {
    try {
        const { email, secret } = await req.json();

        // Kiểm tra secret key (lưu trong env var ADMIN_SECRET)
        const adminSecret = process.env.ADMIN_SECRET || 'dinh-admin-2024';
        if (secret !== adminSecret) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Dùng service client để bypass RLS
        const serviceClient = createServiceClient();

        // Tìm user theo email trong profiles
        const { data: profile, error: fetchError } = await serviceClient
            .from('profiles')
            .select('id, email, role')
            .eq('email', email)
            .maybeSingle();

        if (fetchError) {
            return NextResponse.json({ error: fetchError.message }, { status: 500 });
        }

        if (!profile) {
            return NextResponse.json({ error: `Không tìm thấy profile với email: ${email}` }, { status: 404 });
        }

        // Update role thành admin
        const { error: updateError } = await serviceClient
            .from('profiles')
            .update({ role: 'admin' })
            .eq('email', email);

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: `Đã set role 'admin' cho ${email}`,
            previousRole: profile.role,
        });

    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
