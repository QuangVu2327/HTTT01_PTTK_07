import { supabase } from '@/lib/supabase'
import type {
  ThongTinCuTru,
  ThongTinCuTruWithKetQua,
  CungCapThongTinForm,
  XetDuyetForm,
  KetQuaXetDuyet,
  TraCuuResult,
} from '@/lib/types/CheckCustomerService'

// ------------------------------------------------
// Helpers
// ------------------------------------------------

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

export function validateThongTinCuTru(
  form: CungCapThongTinForm,
  phongGioiTinh: 'Nam' | 'Nu',
  phongSucChua: number,
  soNguoiHienTai: number
): string[] {
  const errors: string[] = []

  const requiredFields: (keyof CungCapThongTinForm)[] = [
    'ho_ten', 'ngay_sinh', 'gioi_tinh', 'cccd',
    'ngay_cap_cccd', 'noi_cap_cccd',
    'dia_chi_thuong_tru', 'que_quan',
  ]

  const missing = requiredFields.filter(f => !form[f])
  if (missing.length > 0) {
    errors.push('Thông tin không đầy đủ')
  }

  // Kiểm tra giới tính theo phòng
  if (form.gioi_tinh && form.gioi_tinh !== phongGioiTinh) {
    errors.push('Thuộc tính giới tính không hợp lệ')
  }

  // Kiểm tra sức chứa
  if (soNguoiHienTai >= phongSucChua) {
    errors.push('Số người không phù hợp')
  }

  // Kiểm tra CCCD (12 số)
  if (form.cccd && !/^\d{12}$/.test(form.cccd)) {
    errors.push('Số CCCD không hợp lệ (phải đủ 12 chữ số)')
  }

  return errors
}

/**
 * Lấy thông tin phòng từ hợp đồng để validate.
 */
export async function getPhongInfoByHopDong(maHopDong: string) {
  const { data, error } = await supabase
    .from('chitiethopdong_giuong')
    .select(`
      Giuong (
        ma_giuong,
        Phong (
          ma_phong,
          suc_chua,
          gioi_tinh_phong
        )
      )
    `)
    .eq('ma_hop_dong', maHopDong)
    .limit(1)
    .single()

  if (error) throw new Error(`Không tìm thấy hợp đồng: ${error.message}`)
  return data
}

/**
 * Lấy số người hiện đang ở trong phòng (đã được duyệt).
 */
export async function getSoNguoiHienTai(maPhong: string): Promise<number> {
  const { count, error } = await supabase
    .from('thongtincutru')
    .select('*', { count: 'exact', head: true })
    .eq('ma_phong', maPhong)        
    .eq('trang_thai', 'Da_duyet')

  if (error) throw new Error(error.message)
  return count ?? 0
}

/**
 * Ghi nhận thông tin cư trú 
 */
export async function cungCapThongTinCuTru(
  form: CungCapThongTinForm
): Promise<ThongTinCuTru> {
  const record: ThongTinCuTru = {
    ...form,
    ma_thong_tin: generateId('TT'),
    ngay_cung_cap: new Date().toISOString(),
    trang_thai: 'Cho_duyet',
  }

  const { data, error } = await supabase
    .from('thongtincutru')
    .insert(record)
    .select()
    .single()

  if (error) throw new Error(`Lỗi lưu thông tin cư trú: ${error.message}`)
  return data
}

/**
 * Lấy danh sách phiếu đang chờ duyệt.
 */
export async function getDanhSachChoXetDuyet(): Promise<ThongTinCuTruWithKetQua[]> {
  const { data, error } = await supabase
    .from('thongtincutru')
    .select(`
      *,
      khachhang (ten, so_dien_thoai, email),
      hopdong (ngay_bat_dau, ngay_ket_thuc)
    `)
    .eq('trang_thai', 'Cho_duyet')
    .order('ngay_cung_cap', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

/**
 * Lấy chi tiết 1 phiếu (quản lý mở lên kiểm tra).
 */
export async function getChiTietThongTin(
  maThongTin: string
): Promise<ThongTinCuTruWithKetQua> {
  const { data, error } = await supabase
    .from('thongtincutru')
    .select(`
      *,
      khachhang (ten, so_dien_thoai, email, gioi_tinh),
      hopdong (ngay_bat_dau, ngay_ket_thuc, ghi_chu),
      ketquaxetduyet (*)
    `)
    .eq('ma_thong_tin', maThongTin)
    .single()

  if (error) throw new Error(`Không tìm thấy phiếu: ${error.message}`)
  return data
}

/**
 * Quản lý xác nhận kết quả xét duyệt — UC 2.5.11 bước 3-4.
 * Tự động cập nhật trang_thai trong ThongTinCuTru.
 */
export async function xetDuyetThongTin(
  form: XetDuyetForm
): Promise<KetQuaXetDuyet> {
  // 1. Ghi kết quả xét duyệt
  const ketQua: KetQuaXetDuyet = {
    ma_ket_qua: generateId('KQ'),
    ma_thong_tin: form.ma_thong_tin,
    ma_quan_ly: form.ma_quan_ly,
    ket_qua: form.ket_qua,
    ghi_chu_chung: form.ghi_chu_chung,
    ngay_duyet: new Date().toISOString(),
    chi_tiet_khong_hop_le: form.chi_tiet_khong_hop_le ?? [],
  }

  const { data, error } = await supabase
    .from('ketquaxetduyet')
    .insert(ketQua)
    .select()
    .single()

  if (error) throw new Error(`Lỗi lưu kết quả: ${error.message}`)

  // 2. Cập nhật trạng thái phiếu
  const trangThaiMoi = form.ket_qua === 'Dat' ? 'Da_duyet' : 'Khong_dat'
  const { error: updateError } = await supabase
    .from('thongtincutru')
    .update({ trang_thai: trangThaiMoi })
    .eq('ma_thong_tin', form.ma_thong_tin)

  if (updateError) throw new Error(`Lỗi cập nhật trạng thái: ${updateError.message}`)

  return data
}

// ================================================
// UC 2.5.12 — TraCuuKetQuaThongTinCuTru (Khách hàng)
// ================================================

/**
 * Tra cứu theo CCCD hoặc SĐT.
 * Trả về found: false nếu không có kết quả.
 */
export async function traCuuKetQua(
  keyword: string   // CCCD (12 số) hoặc SĐT
): Promise<TraCuuResult> {
  const isCCCD = /^\d{12}$/.test(keyword.trim())
  const isSoDienThoai = /^0\d{9}$/.test(keyword.trim())

  if (!isCCCD && !isSoDienThoai) {
    return { found: false }
  }

  // Tìm trong ThongTinCuTru
  let query = supabase
    .from('thongtincutru')
    .select(`
      *,
      ketquaxetduyet (
        ket_qua,
        ghi_chu_chung,
        chi_tiet_khong_hop_le,
        ngay_duyet
      )
    `)

  if (isCCCD) {
    query = query.eq('cccd', keyword.trim())
  } else {
    // Tìm qua KhachHang (join)
    const { data: khachHang } = await supabase
      .from('khachhang')
      .select('ma_khach_hang')
      .eq('so_dien_thoai', keyword.trim())
      .single()

    if (!khachHang) return { found: false }
    query = query.eq('ma_khach_hang', khachHang.ma_khach_hang)
  }

  const { data, error } = await query
    .order('ngay_cung_cap', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) return { found: false }

  const ketQua = data.KetQuaXetDuyet?.[0] ?? undefined

  return {
    found: true,
    thong_tin: data,
    ket_qua: ketQua,
  }
}
