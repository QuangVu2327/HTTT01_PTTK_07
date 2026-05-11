// @/lib/service/MH_KiemTraThongTinHoanCocService.ts
import { supabase } from "@/lib/supabase";

export class MH_KiemTraThongTinHoanCocService {
  // Lấy thông tin hợp đồng
  static async layThongTinHopDong(ma_hop_dong: string) {
    const { data, error } = await supabase
      .from("HopDong")
      .select("*")
      .eq("ma_hop_dong", ma_hop_dong)
      .single();
    if (error) throw error;
    return data;
  }

  // Lấy thông tin phiếu đặt cọc
  static async layThongTinDatCoc(ma_phieu_coc: string, ma_khach_hang: string) {
    const { data, error } = await supabase
      .from("PhieuDatCoc")
      .select("*")
      .eq("ma_phieu_coc", ma_phieu_coc)
      .eq("ma_khach_hang", ma_khach_hang)
      .single();
    if (error) throw error;
    return data;
  }

  // Lấy thông tin phiếu trả phòng
  static async layThongTinPhieuTra(ma_hop_dong: string) {
    const { data, error } = await supabase
      .from("PhieuTraPhong")
      .select("*")
      .eq("ma_hop_dong", ma_hop_dong)
      .single();
    if (error) throw error;
    return data;
  }

  // Lấy thông tin khách hàng
  static async layThongTinKhachHang(ma_khach_hang: string) {
    const { data, error } = await supabase
      .from("KhachHang")
      .select("*")
      .eq("ma_khach_hang", ma_khach_hang)
      .single();
    if (error) throw error;
    return data;
  }

  // Lấy thông tin giường
  static async layThongTinGiuong(ma_giuong: string) {
    const { data, error } = await supabase
      .from("Giuong")
      .select("*")
      .eq("ma_giuong", ma_giuong)
      .single();
    if (error) throw error;
    return data;
  }

  // Tính toán tiền hoàn cọc
  static async tinhTienHoanCoc(ma_hop_dong: string) {
    const phieuTra = await this.layThongTinPhieuTra(ma_hop_dong);
    if (!phieuTra) throw new Error("Không tìm thấy phiếu trả phòng");

    const tienHoan = phieuTra.tien_hoan_coc ?? 0;
    const chiPhi =
      (phieuTra.no_dien_nuoc ?? 0) + (phieuTra.chi_phi_sua_chua ?? 0);
    const thanhTienCuoiCung = tienHoan - chiPhi;

    return {
      maHopDong: phieuTra.ma_hop_dong,
      tienHoanCoc: tienHoan,
      tongChiPhi: chiPhi,
      thanhTienCuoiCung,
      phuongThucThanhToan: phieuTra.phuong_thuc_thanh_toan,
      ghiChu: phieuTra.ghi_chu,
    };
  }
}
