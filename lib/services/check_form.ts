// @/lib/service/MH_XemYeuCauThueService.ts
import { supabase } from "@/lib/supabase";

export class MH_XemYeuCauThueService {
  // Lấy danh sách yêu cầu thuê
  static async layDanhSachYeuCau() {
    const { data, error } = await supabase.from("yeucauthue").select("*");
    if (error) throw error;
    return data;
  }

  // Lấy chi tiết yêu cầu thuê theo mã
  static async layThongTinYeuCau(ma_yeu_cau: string) {
    const { data, error } = await supabase
      .from("yeucauthue")
      .select("*")
      .eq("ma_yeu_cau", ma_yeu_cau)
      .single();
    if (error) throw error;
    return data;
  }

  // Lấy thông tin khách hàng
  static async layThongTinKhachHang(ma_khach_hang: string) {
    const { data, error } = await supabase
      .from("khachhang")
      .select("*")
      .eq("ma_khach_hang", ma_khach_hang)
      .single();
    if (error) throw error;
    return data;
  }

  // Lấy thông tin nhân viên kinh doanh
  static async layThongTinNhanVien(ma_nv: string) {
    const { data, error } = await supabase
      .from("nhanvienkinhdoanh")
      .select("*")
      .eq("ma_nv", ma_nv)
      .single();
    if (error) throw error;
    return data;
  }

  // Cập nhật trạng thái yêu cầu thuê
  static async capNhatTrangThai(ma_yeu_cau: string, trang_thai: string) {
    const { data, error } = await supabase
      .from("yeucauthue")
      .update({ tinh_trang: trang_thai })
      .eq("ma_yeu_cau", ma_yeu_cau);
    if (error) throw error;
    return data;
  }
}
