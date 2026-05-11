'use server';
import { getKhachHang } from '@/lib/repositories/khachhang.repository';
import { getTTChoO } from '@/lib/repositories/choo.repository';
import { sendMail, importFile } from '@/lib/services/email.service';

// Step 2-5: Load TTChoO on screen open
export async function loadTTChoO(bookingId: string) {
    return getTTChoO(bookingId);
}

// Step 9-14: Send email (main action)
export async function guiEmail(formData: FormData) {
    const tenKH = formData.get('tenKH') as string;
    const mailContent = formData.get('mail') as string;
    const file = formData.get('file') as File | null;

    // Step 10-12: Lấy TT KH
    const ttkh = await getKhachHang(tenKH);
    if (!ttkh) throw new Error('Không tìm thấy khách hàng');

    const payload = {
        Mail: mailContent,
        File: file ? importFile(file) : undefined,
    };

    // Step 13: Send
    await sendMail(ttkh, payload);
    // Step 14: returns success to UI
    return { success: true };
}