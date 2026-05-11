import { supabase } from '@/lib/supabase'

// Hàm tạo ID tự động
function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

// Định nghĩa kiểu dữ liệu
export interface RegisterFormData {
  hoTen: string;
  soDienThoai: string;
  email: string;
  cccd: string;
  ngayDuKienVao: string;
  loaiPhongMuonThue: string;
}

/**
 * Hàm tìm thông tin khách hàng qua CCCD để Auto-fill
 */
export async function findKhachHangByCCCD(cccd: string) {
  const { data, error } = await supabase
    .from('khachhang')
    .select('*')
    .eq('cccd', cccd)
    .maybeSingle(); // Trả về data hoặc null nếu không thấy

  if (error) throw error;
  return data;
}

/**
 * Hàm thực hiện đăng ký thuê phòng
 */
export async function dangKyThuePhong(formData: RegisterFormData) {
  // 1. Lưu/Cập nhật thông tin Khách Hàng (Upsert dựa trên CCCD)
  const { data: kh, error: khError } = await supabase
    .from('khachhang')
    .upsert({
      ma_khach_hang: generateId('KH'),
      ten: formData.hoTen,
      so_dien_thoai: formData.soDienThoai,
      email: formData.email,
      cccd: formData.cccd,
    }, { onConflict: 'cccd' }) 
    .select()
    .single();

  if (khError) throw khError;

  // 2. Tạo Đơn Đăng Ký Thuê
  const { error: dkError } = await supabase
    .from('dondangkythue')
    .insert({
      ma_don: generateId('DK'),
      ma_khach_hang: kh.ma_khach_hang,
      ngay_dang_ky: new Date().toISOString(),
      ngay_du_kien_vao: formData.ngayDuKienVao,
      loai_phong_muon_thue: formData.loaiPhongMuonThue,
      trang_thai: 'Cho_duyet'
    });

  if (dkError) throw dkError;

  return { success: true };
}