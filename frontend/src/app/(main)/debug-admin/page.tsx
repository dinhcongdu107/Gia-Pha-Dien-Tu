'use client';

import { useAuth } from '@/components/auth-provider';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function DebugAdminPage() {
    const auth = useAuth();
    const [profileRaw, setProfileRaw] = useState<unknown>(null);
    const [profileError, setProfileError] = useState<string>('');
    const [sessionInfo, setSessionInfo] = useState<unknown>(null);

    useEffect(() => {
        // Get raw session
        supabase.auth.getSession().then(({ data }) => {
            setSessionInfo(data.session ? {
                user_id: data.session.user.id,
                email: data.session.user.email,
                expires_at: data.session.expires_at,
            } : null);
        });

        // Try to fetch profile directly
        if (auth.user) {
            supabase.from('profiles').select('*').eq('id', auth.user.id).maybeSingle()
                .then(({ data, error }) => {
                    setProfileRaw(data);
                    if (error) setProfileError(error.message);
                });
        }
    }, [auth.user]);

    const handleSetAdmin = async () => {
        const res = await fetch('/api/set-admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'dinhcongdu107@gmail.com', secret: 'dinh-admin-2024' })
        });
        const data = await res.json();
        alert(JSON.stringify(data, null, 2));
        // Refresh profile after setting admin
        await auth.refreshProfile();
        window.location.reload();
    };

    return (
        <div className="p-8 max-w-2xl mx-auto space-y-6 font-mono text-sm">
            <h1 className="text-2xl font-bold">🔧 Debug Admin Panel</h1>

            <section className="bg-slate-100 rounded-lg p-4 space-y-2">
                <h2 className="font-semibold text-base">Auth State (từ useAuth)</h2>
                <div><span className="text-slate-500">loading:</span> {String(auth.loading)}</div>
                <div><span className="text-slate-500">isLoggedIn:</span> <span className={auth.isLoggedIn ? 'text-green-600' : 'text-red-600'}>{String(auth.isLoggedIn)}</span></div>
                <div><span className="text-slate-500">isAdmin:</span> <span className={auth.isAdmin ? 'text-green-600' : 'text-red-600 font-bold'}>{String(auth.isAdmin)}</span></div>
                <div><span className="text-slate-500">role:</span> <span className={auth.role === 'admin' ? 'text-green-600' : 'text-orange-600'}>{auth.role ?? 'null'}</span></div>
                <div><span className="text-slate-500">email:</span> {auth.user?.email ?? 'NOT LOGGED IN'}</div>
                <div><span className="text-slate-500">user_id:</span> {auth.user?.id ?? '-'}</div>
            </section>

            <section className="bg-slate-100 rounded-lg p-4 space-y-2">
                <h2 className="font-semibold text-base">Profile (auth.profile)</h2>
                <pre className="text-xs overflow-auto">{JSON.stringify(auth.profile, null, 2)}</pre>
            </section>

            <section className="bg-slate-100 rounded-lg p-4 space-y-2">
                <h2 className="font-semibold text-base">Session từ Supabase trực tiếp</h2>
                <pre className="text-xs overflow-auto">{JSON.stringify(sessionInfo, null, 2)}</pre>
            </section>

            <section className="bg-slate-100 rounded-lg p-4 space-y-2">
                <h2 className="font-semibold text-base">Profile từ DB trực tiếp</h2>
                {profileError && <div className="text-red-600">❌ Error: {profileError}</div>}
                <pre className="text-xs overflow-auto">{JSON.stringify(profileRaw, null, 2)}</pre>
            </section>

            <div className="flex gap-3 flex-wrap">
                <button
                    onClick={handleSetAdmin}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-sans"
                >
                    🔑 Set Admin Role
                </button>
                <button
                    onClick={() => { auth.refreshProfile(); setTimeout(() => window.location.reload(), 500); }}
                    className="bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 font-sans"
                >
                    🔄 Refresh Profile
                </button>
                <a href="/tree" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-sans">
                    → Vào Tree
                </a>
            </div>
        </div>
    );
}
