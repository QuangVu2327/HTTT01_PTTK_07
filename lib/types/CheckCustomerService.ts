export type TrangThaiDon = 'Cho_duyet' | 'Da_duyet' | 'Khong_dat'
export type KetQuaDuyet = 'Dat' | 'Khong_dat'

export interface ThongTinCuTru {
  ma_thong_tin: string
  ma_khach_hang: string
  ma_hop_dong: string

  ho_ten: string
  ngay_sinh: string        // ISO date string 'YYYY-MM-DD'
  gioi_tinh: 'Nam' | 'Nu'
  cccd: string
  ngay_cap_cccd: string
  noi_cap_cccd: string

  dia_chi_thuong_tru: string
  que_quan: string
  nghe_nghiep?: string
  noi_lam_viec_hoc_tap?: string

  nguoi_lien_he_khan_cap?: string
  sdt_khan_cap?: string

  ngay_cung_cap: string    // ISO timestamp
  trang_thai: TrangThaiDon
}

export interface ChiTietKhongHopLe {
  truong: string           // tên trường không hợp lệ
  ly_do: string            // lý do cụ thể
}

export interface KetQuaXetDuyet {
  ma_ket_qua: string
  ma_thong_tin: string
  ma_quan_ly: string

  ket_qua: KetQuaDuyet
  ghi_chu_chung?: string
  ngay_duyet: string       // ISO timestamp

  chi_tiet_khong_hop_le: ChiTietKhongHopLe[]
}

// ---- Form input types (dùng cho React forms) ----

export type CungCapThongTinForm = Omit<
  ThongTinCuTru,
  'ma_thong_tin' | 'ngay_cung_cap' | 'trang_thai'
>

export type XetDuyetForm = {
  ma_thong_tin: string
  ma_quan_ly: string
  ket_qua: KetQuaDuyet
  ghi_chu_chung?: string
  chi_tiet_khong_hop_le: ChiTietKhongHopLe[]
}

// ---- Response types từ Supabase queries ----

export interface ThongTinCuTruWithKetQua extends ThongTinCuTru {
  KetQuaXetDuyet?: KetQuaXetDuyet[]
}

export interface TraCuuResult {
  found: boolean
  thong_tin?: ThongTinCuTru
  ket_qua?: KetQuaXetDuyet
}
