export interface KhachHang {
  ma_khach_hang: string
  ten: string
  so_dien_thoai: string | null
  email: string | null
  gioi_tinh: string | null
  loai_doi_tuong: string | null
}

export interface Phong {
  ma_phong: string
  suc_chua: number
  khu_vuc: string
  trang_thai: string        // 'Con trong' | 'Day' | 'Dang sua'
  gioi_tinh_phong: string   // 'Nam' | 'Nu' | 'Khong phan biet'
  loai_doi_tuong_phong: string
}

export interface Giuong {
  ma_giuong: string
  ma_phong: string
  vi_tri_giuong: string
  trang_thai: string        // 'San sang' | 'Dang giu' | 'Da dat coc' | 'Dang o' | 'Bao tri'
  gia_giuong: number
}

export interface VatDung {
  ma_vat_dung: string
  ten_vat_dung: string
  don_gia: number
}

export interface ChiTietVatDung {
  ma_phong: string
  ma_vat_dung: string
  so_luong: number
  tinh_trang: string
  vatdung?: VatDung
}

export interface YeuCauThue {
  ma_yeu_cau: string
  ma_khach_hang: string
  ma_nv_sale: string
  khu_vuc_mong_muon: string | null
  muc_gia: number | null
  so_nguoi_du_kien: number | null
  gioi_tinh_yeu_cau: string | null
  loai_thue: string | null
  thoi_han_thue: string | null
  yeu_cau_khac: string | null
  tinh_trang_don: string
}

export interface LichXemPhong {
  ma_lich: string
  ma_yeu_cau: string
  ma_phong: string
  thoi_gian: string
  ket_qua: string   // 'Cho xem' | 'Da xem' | 'Huy'
}

export interface RoomDisplay extends Phong {
  beds: Giuong[]
  availableBeds: Giuong[]
  minPrice: number | null
  vatDung?: ChiTietVatDung[]
}
