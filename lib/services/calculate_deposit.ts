// src/services/MH_TinhTiLeHoanCocService.ts
import { supabase } from "@/lib/supabase";

export class MH_TinhTiLeHoanCocService {
  /**
   * Lấy thông tin phiếu trả phòng theo mã hợp đồng
   */
  static async layThongTinPhieu(ma_hop_dong: string) {
    const { data, error } = await supabase
      .from("phieutraphong")
      .select("*")
      .eq("ma_hop_dong", ma_hop_dong)
      .maybeSingle();

    if (error) throw error;
    
    if (!data) {
      throw new Error(`Không tìm thấy phiếu trả phòng cho hợp đồng: ${ma_hop_dong}`);
    }
    
    return data;
  }

  /**
   * Tính toán hoàn cọc dựa trên dữ liệu phiếu trả phòng
   */
  static async tinhHoanCoc(ma_hop_dong: string) {
    const phieu = await this.layThongTinPhieu(ma_hop_dong);

    if (!phieu) {
      throw new Error("Không tìm thấy phiếu trả phòng cho hợp đồng này");
    }

    const tyLeHoan = phieu.ty_le_hoan_coc ?? 0;
    const tienHoan = (phieu.tien_hoan_co_ban ?? 0) * tyLeHoan;

    const tongChiPhi = (phieu.no_tien_thue ?? 0)
      + (phieu.no_dien_nuoc ?? 0)
      + (phieu.chi_phi_sua_chua ?? 0);

    const thanhTienCuoiCung = tienHoan - tongChiPhi;

    return {
      maHopDong: phieu.ma_hop_dong,
      maKhachHang: phieu.ma_khach_hang,
      tyLeHoanCoc: tyLeHoan,
      tienHoanCoc: tienHoan,
      tongChiPhi,
      thanhTienCuoiCung,
    };
  }
}
