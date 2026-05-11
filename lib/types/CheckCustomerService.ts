export type TrangThaiDon = 'Cho_duyet' | 'Da_duyet' | 'Khong_dat'
export type KetQuaDuyet = 'Dat' | 'Khong_dat'

export interface ThongTinCuTru {
  ma_thong_tin: string
  ma_khach_hang: string
  ma_hop_dong: string

  ho_ten: string
  ngay_sinh: string
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

  ngay_cung_cap: string
  trang_thai: TrangThaiDon
}

export interface ChiTietKhongHopLe {
  truong: string
  ly_do: string
}

export interface KetQuaXetDuyet {
  ma_ket_qua: string
  ma_thong_tin: string
  ma_quan_ly: string

  ket_qua: KetQuaDuyet
  ghi_chu_chung?: string
  ngay_duyet: string

  chi_tiet_khong_hop_le: ChiTietKhongHopLe[]
}

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

export interface ThongTinCuTruWithKetQua extends ThongTinCuTru {
  KetQuaXetDuyet?: KetQuaXetDuyet[]
}

export interface TraCuuResult {
  found: boolean
  thong_tin?: ThongTinCuTru
  ket_qua?: KetQuaXetDuyet
}