import { createClient } from '@/lib/supabase/server';
import { TTChoO } from '@/lib/types/email.types';

export async function getTTChoO(bookingId: string) {
    const supabase = await createClient();
    const { data } = await supabase
        .from('HopDong')           // ← actual table
        .select(`
      ma_hop_dong,
      KhachHang (ten, email),
      ChiTietHopDong_Giuong (
        Giuong ( vi_tri_giuong, Phong ( ma_phong, khu_vuc ) )
      )
    `)
        .eq('ma_hop_dong', bookingId)
        .single();
    return data;
}

