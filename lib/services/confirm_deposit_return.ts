// @/lib/service/MH_XacNhanHoanCocService.ts
import { supabase } from "@/lib/supabase";

export class MH_XacNhanHoanCocService {
  static async layThongTinPhieu(ma_hop_dong: string) {
    const { data, error } = await supabase
      .from("PhieuTraPhong")
      .select("*")
      .eq("ma_hop_dong", ma_hop_dong)
      .single();
    if (error) throw error;
    return data;
  }

  static async layThongTinKhachHang(ma_khach_hang: string) {
    const { data, error } = await supabase
      .from("KhachHang")
      .select("*")
      .eq("ma_khach_hang", ma_khach_hang)
      .single();
    if (error) throw error;
    return data;
  }

  static async capNhatPhieu(ma_hop_dong: string, trang_thai: string) {
    const { data, error } = await supabase
      .from("PhieuTraPhong")
      .update({ trang_thai })
      .eq("ma_hop_dong", ma_hop_dong);
    if (error) throw error;
    return data;
  }

  static async tinhToanHoanCoc(ma_hop_dong: string) {
    const phieu = await this.layThongTinPhieu(ma_hop_dong);
    if (!phieu) throw new Error("Không tìm thấy phiếu trả phòng");

    const tyLeHoan = phieu.ty_le_hoan_coc ?? 0;
    const tienHoan = (phieu.tien_hoan_coc_ban ?? 0) * tyLeHoan;
    const tongChiPhi =
      (phieu.no_tien ?? 0) +
      (phieu.no_dien_nuoc ?? 0) +
      (phieu.chi_phi_sua_chua ?? 0);
    const thanhTienCuoiCung = tienHoan - tongChiPhi;

    return {
      maHopDong: phieu.ma_hop_dong,
      tyLeHoanCoc: tyLeHoan,
      tienHoanCoc: tienHoan,
      tongChiPhi,
      thanhTienCuoiCung,
      phuongThucThanhToan: phieu.phuong_thuc_thanh_toan,
      ghiChu: phieu.ghi_chu,
    };
  }
}
