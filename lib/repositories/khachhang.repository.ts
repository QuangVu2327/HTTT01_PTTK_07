import { createClient } from '@/lib/supabase/server';

export async function getKhachHang(bookingId: string) {
    const supabase = await createClient();
    const { data } = await supabase
        .from('hopdong')
        .select(`khachhang ( ten, email )`)
        .eq('ma_hop_dong', bookingId)
        .single();

    return data?.khachhang ?? null;
}