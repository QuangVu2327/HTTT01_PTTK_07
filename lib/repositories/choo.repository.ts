import { createClient } from '@/lib/supabase/server';

export async function getTTChoO(bookingId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('hopdong')
        .select(`
            ma_hop_dong,
            khachhang ( ten, email ),
            chitiethopdong_giuong (
                giuong ( vi_tri_giuong, phong ( ma_phong, khu_vuc ) )
            )
        `)
        .eq('ma_hop_dong', bookingId)
        .single();

    if (error || !data) {
        console.error("Supabase error or no data:", error);
        return null;
    }

    // Safely handle if khachhang is an array or object
    const kh = Array.isArray(data.khachhang) ? data.khachhang[0] : data.khachhang;
    const giuongDetails = data.chitiethopdong_giuong?.[0]?.giuong;
    const phong = giuongDetails?.phong;
    return {
        TenKH: kh?.ten ?? 'Khách hàng',
        DiaChi: phong ? `Phòng ${phong.ma_phong} — ${phong.khu_vuc} - ${giuongDetails?.vi_tri_giuong}` : '',
        Email: kh?.email.trim(), // This ensures it returns a string, even if empty
    };

}