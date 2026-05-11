import { supabase } from '@/lib/supabase'

export async function getDanhSachPhong() {
  const { data, error } = await supabase.from('phong').select('*');
  if (error) throw error;
  return data;
}

export async function getChiTietPhong(maPhong: string) {
  // Lấy thông tin phòng, danh sách giường và vật dụng cùng lúc
  const { data, error } = await supabase
    .from('phong')
    .select(`
      *,
      giuong (*),
      vatdung (*)
    `)
    .eq('ma_phong', maPhong)
    .single();
  
  if (error) throw error;
  return data;
}

export async function luuThongTinPhong(phongData: any) {
  const { error } = await supabase
    .from('phong')
    .upsert(phongData);
  if (error) throw error;
}

export async function thaoTacGiuong(type: 'INSERT' | 'UPDATE' | 'DELETE', giuongData: any) {
  if (type === 'DELETE') {
    return await supabase.from('giuong').delete().eq('ma_giuong', giuongData.ma_giuong);
  }
  return await supabase.from('giuong').upsert(giuongData);
}