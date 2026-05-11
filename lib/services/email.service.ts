import { Resend } from 'resend';
import { TTKH, XuLiMailPayload } from '@/lib/types/email.types';

const resend = new Resend(process.env.RESEND_API_KEY);

// ImportFile() — validate & convert attachment
export function importFile(file: File) {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
        throw new Error('Unsupported file type');
    }
    return file;
}

// SendMail() — send to customer
export async function sendMail(ttkh: TTKH, payload: XuLiMailPayload) {
    const attachments = [];

    if (payload.File) {
        const buffer = Buffer.from(await payload.File.arrayBuffer());
        attachments.push({
            filename: payload.File.name,
            content: buffer,
        });
    }

    return resend.emails.send({
        from: 'manager@yourdomain.com',
        to: ttkh.Email,
        subject: `Thư gửi tới ${ttkh.TenKH}`,
        html: `<p>${payload.Mail}</p>`,
        attachments,
    });
}