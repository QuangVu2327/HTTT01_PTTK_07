import { createClient } from '@/lib/supabase/server';
import { TTKH } from '@/lib/types/email.types';

export async function getKhachHang(maKhachHang: string) {
    const supabase = await createClient();
    const { data } = await supabase
        .from('KhachHang')
        .select('ten, email')
        .eq('ma_khach_hang', maKhachHang)
        .single();
    return data;   // .ten = TenKH, .email = Email
}