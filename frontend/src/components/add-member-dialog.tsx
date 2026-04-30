'use client';

import { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface AddMemberData {
    displayName: string;
    gender: number; // 1 for male, 0 for female
    birthYear: number | null;
    deathYear: number | null;
    isLiving: boolean;
}

interface AddMemberDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: AddMemberData) => Promise<void>;
    title: string;
    subtitle?: string;
    defaultGender?: number; // Optional default gender
}

export function AddMemberDialog({ isOpen, onClose, onSubmit, title, subtitle, defaultGender = 1 }: AddMemberDialogProps) {
    const [displayName, setDisplayName] = useState('');
    const [gender, setGender] = useState<number>(defaultGender);
    const [birthYear, setBirthYear] = useState('');
    const [deathYear, setDeathYear] = useState('');
    const [isLiving, setIsLiving] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!displayName.trim()) {
            setError('Vui lòng nhập họ và tên');
            return;
        }

        setError('');
        setIsSubmitting(true);

        try {
            await onSubmit({
                displayName: displayName.trim(),
                gender,
                birthYear: birthYear ? parseInt(birthYear, 10) : null,
                deathYear: deathYear ? parseInt(deathYear, 10) : null,
                isLiving
            });
            // Reset form
            setDisplayName('');
            setGender(defaultGender);
            setBirthYear('');
            setDeathYear('');
            setIsLiving(true);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Đã xảy ra lỗi khi thêm thành viên');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-[420px] max-w-[95vw] animate-in zoom-in-95 fade-in duration-200"
                onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b">
                    <div className="flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-blue-500" />
                        <div>
                            <h3 className="font-semibold text-sm">{title}</h3>
                            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
                </div>

                <div className="p-5 space-y-4">
                    {error && (
                        <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">{error}</div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Họ và tên <span className="text-red-500">*</span></label>
                        <Input
                            type="text"
                            value={displayName}
                            onChange={e => setDisplayName(e.target.value)}
                            placeholder="VD: Đinh Văn A"
                            autoFocus
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Giới tính</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                <input type="radio" name="gender" checked={gender === 1} onChange={() => setGender(1)} />
                                Nam
                            </label>
                            <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                <input type="radio" name="gender" checked={gender === 0} onChange={() => setGender(0)} />
                                Nữ
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="space-y-1.5 flex-1">
                            <label className="text-xs font-medium text-muted-foreground">Năm sinh</label>
                            <Input
                                type="number"
                                value={birthYear}
                                onChange={e => setBirthYear(e.target.value)}
                                placeholder="VD: 1950"
                            />
                        </div>
                        <div className="space-y-1.5 flex-1">
                            <label className="text-xs font-medium text-muted-foreground">Năm mất</label>
                            <Input
                                type="number"
                                value={deathYear}
                                onChange={e => setDeathYear(e.target.value)}
                                placeholder="Đã mất..."
                                disabled={isLiving}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Trạng thái</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                <input type="radio" name="living" checked={isLiving === true} onChange={() => { setIsLiving(true); setDeathYear(''); }} />
                                Còn sống
                            </label>
                            <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                <input type="radio" name="living" checked={isLiving === false} onChange={() => setIsLiving(false)} />
                                Đã mất
                            </label>
                        </div>
                    </div>

                    <Button className="w-full" disabled={isSubmitting} onClick={handleSubmit}>
                        {isSubmitting ? 'Đang lưu...' : 'Thêm thành viên'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
