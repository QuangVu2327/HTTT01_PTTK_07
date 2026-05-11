'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { loadTTChoO, guiEmail } from '@/lib/actions/email.actions';

export default function EmailPage({ searchParams }: { searchParams: { bookingId?: string } }) {
    const router = useRouter();
    const { bookingId } = use(searchParams);
    const [ttchoo, setTtchoo] = useState<any>(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fileName, setFileName] = useState('');

    useEffect(() => {
        if (bookingId) loadTTChoO(bookingId).then(setTtchoo);
    }, [bookingId]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        try {
            await guiEmail(formData);
            setSuccess(true);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    }

    // ── Success screen ──────────────────────────────────────────────
    if (success) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="border border-gray-200 rounded-2xl p-10 max-w-md w-full text-center shadow-sm">
                <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Gửi thành công!</h2>
                <p className="text-gray-500 mb-8">Email đã được gửi đến khách hàng.</p>
                <button
                    onClick={() => router.back()}
                    className="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors"
                >
                    Đóng thông báo
                </button>
            </div>
        </div>
    );

    // ── Main screen ─────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Quay về
                </button>
                <div className="h-4 w-px bg-gray-300" />
                <h1 className="text-sm font-semibold text-gray-900">Gửi Email Khách Hàng</h1>
            </div>

            <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
                {/* Thông tin chỗ ở card */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                        Thông tin chỗ ở
                    </p>
                </div>
                {ttchoo && (

                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Tên KH đại diện</span>
                                <span className="text-sm font-medium text-gray-900">{ttchoo.TenKH}</span>
                            </div>
                            <div className="h-px bg-gray-100" />
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Địa chỉ</span>
                                <span className="text-sm font-medium text-gray-900">{ttchoo.DiaChi}</span>
                            </div>
                            <div className="h-px bg-gray-100" />
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Thông tin khác</span>
                                <span className="text-sm font-medium text-gray-900">{ttchoo.TTKhac}</span>
                            </div>
                        </div>
                )}

                {/* Email compose card */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                        Soạn email
                    </p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input type="hidden" name="tenKH" value={ttchoo?.TenKH ?? ''} />

                        {/* Email body */}
                        <textarea
                            name="mail"
                            rows={8}
                            required
                            placeholder="Nhập nội dung email..."
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                        />

                        {/* File attachment */}
                        <label className="flex items-center gap-3 border border-dashed border-gray-300 rounded-xl px-4 py-3 cursor-pointer hover:border-gray-500 transition-colors">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            <span className="text-sm text-gray-500">
                                {fileName || 'Đính kèm file (PDF, JPG, PNG)'}
                            </span>
                            <input
                                type="file"
                                name="file"
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => setFileName(e.target.files?.[0]?.name || '')}
                            />
                        </label>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    Đang gửi...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Lưu / Gửi
                                </>
                            )}
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
}