'use server';
import { getTTChoO } from '@/lib/repositories/choo.repository';
import { sendMail, importFile } from '@/lib/services/email.service';

export async function loadTTChoO(bookingId: string) {
    return getTTChoO(bookingId);
}

export async function guiEmail(formData: FormData) {
    const bookingId = formData.get('bookingId') as string;
    const mailContent = formData.get('mail') as string;
    const file = formData.get('file') as File | null;

    const data = await getTTChoO(bookingId);
    if (!data) {
        throw new Error(`Không tìm thấy hợp đồng với mã: ${bookingId}`);
    }

    // Bước 2: Kiểm tra xem email có hợp lệ không (không rỗng và có ký tự @)
    if (!data.Email || data.Email === '' || !data.Email.includes('@')) {
        console.error("Dữ liệu nhận được:", data);
        throw new Error(`Hợp đồng tồn tại nhưng khách hàng "${data.TenKH}" chưa có địa chỉ email hợp lệ.`);
    }

    await sendMail(
        { TenKH: data.TenKH, Email: data.Email },
        { Mail: mailContent, File: file ? importFile(file) : undefined }
    );

    return { success: true };
}