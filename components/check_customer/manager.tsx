'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User, FileText, CheckCircle, XCircle, Phone, Mail, MapPin, Calendar, IdCard } from 'lucide-react'

// ── Test: bỏ qua auth ──
const TEST_MA_QUAN_LY = 'NV_QL_01'

function generateId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
}

interface ThanhVien {
  ma_thong_tin: string
  ho_ten: string
  cccd: string
  ngay_sinh: string
  gioi_tinh: string
  ngay_cung_cap: string
  ma_khach_hang: string
  khong_hop_le: boolean
  ghi_chu: string
  da_chon: boolean
}

interface HoSoHoKhau {
  ma_ho_gia_dinh: string
  ma_hop_dong: string
  chu_ho: {
    ma_thong_tin: string
    ho_ten: string
    cccd: string
    ngay_sinh: string
    gioi_tinh: string
    ngay_cap_cccd: string
    noi_cap_cccd: string
    dia_chi_thuong_tru: string
    que_quan: string
    nghe_nghiep: string
    so_dien_thoai: string
    email: string
  }
  thanh_vien: Array<{
    ma_thong_tin: string
    ho_ten: string
    cccd: string
    ngay_sinh: string
    gioi_tinh: string
    quan_he: string
  }>
  ket_qua_xet_duyet?: {
    ket_qua: string
    ghi_chu_chung: string
    ngay_duyet: string
  }
}

export default function ManagerPage() {
  const [danhSach, setDanhSach] = useState<ThanhVien[]>([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [filterTrangThai, setFilterTrangThai] = useState('Tat ca')
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  
  // State cho modal chi tiết
  const [selectedHoSo, setSelectedHoSo] = useState<HoSoHoKhau | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  async function loadDanhSach() {
    setLoading(true)
    try {
      // Lấy tất cả thông tin cư trú đang chờ duyệt
      const { data, error } = await supabase
        .from('thongtincutru')
        .select(`
          *,
          khachhang:ma_khach_hang(ten, so_dien_thoai, email)
        `)
        .eq('trang_thai', 'Cho_duyet')
        .order('ngay_cung_cap', { ascending: true })

      if (error) throw error

      setDanhSach(
        (data ?? []).map((r: any) => ({
          ma_thong_tin: r.ma_thong_tin,
          ho_ten: r.ho_ten,
          cccd: r.cccd,
          ngay_sinh: r.ngay_sinh,
          gioi_tinh: r.gioi_tinh,
          ngay_cung_cap: r.ngay_cung_cap,
          ma_khach_hang: r.ma_khach_hang,
          khong_hop_le: false,
          ghi_chu: '',
          da_chon: false,
        }))
      )
    } catch (error) {
      console.error('Lỗi load danh sách:', error)
    } finally {
      setLoading(false)
    }
  }

  // Hàm lấy chi tiết hộ khẩu theo mã khách hàng
  async function handleXemChiTiet(thanhVien: ThanhVien) {
    setLoading(true)
    try {
      // Lấy tất cả thành viên cùng mã khách hàng
      const { data: allMembers, error } = await supabase
        .from('thongtincutru')
        .select(`
          *,
          khachhang:ma_khach_hang(
            ten, 
            so_dien_thoai, 
            email,
            gioi_tinh
          )
        `)
        .eq('ma_khach_hang', thanhVien.ma_khach_hang)

      if (error) throw error

      if (!allMembers || allMembers.length === 0) {
        alert('Không tìm thấy thông tin')
        return
      }

      // Tìm chủ hộ (thường là người đầu tiên hoặc người đại diện)
      const chuHo = allMembers[0]
      
      // Các thành viên còn lại
      const cacThanhVien = allMembers.slice(1).map((m: any) => ({
        ma_thong_tin: m.ma_thong_tin,
        ho_ten: m.ho_ten,
        cccd: m.cccd,
        ngay_sinh: m.ngay_sinh,
        gioi_tinh: m.gioi_tinh,
        quan_he: m.quan_he_chu_ho || 'Thành viên'
      }))

      // Lấy kết quả xét duyệt nếu có
      const { data: ketQua } = await supabase
        .from('ketquaxetduyet')
        .select('*')
        .eq('ma_thong_tin', chuHo.ma_thong_tin)
        .single()

      setSelectedHoSo({
        ma_ho_gia_dinh: thanhVien.ma_khach_hang,
        ma_hop_dong: chuHo.ma_hop_dong || 'Chưa có',
        chu_ho: {
          ma_thong_tin: chuHo.ma_thong_tin,
          ho_ten: chuHo.ho_ten,
          cccd: chuHo.cccd,
          ngay_sinh: chuHo.ngay_sinh,
          gioi_tinh: chuHo.gioi_tinh,
          ngay_cap_cccd: chuHo.ngay_cap_cccd || '',
          noi_cap_cccd: chuHo.noi_cap_cccd || '',
          dia_chi_thuong_tru: chuHo.dia_chi_thuong_tru || '',
          que_quan: chuHo.que_quan || '',
          nghe_nghiep: chuHo.nghe_nghiep || '',
          so_dien_thoai: chuHo.khachhang?.so_dien_thoai || '',
          email: chuHo.khachhang?.email || '',
        },
        thanh_vien: cacThanhVien,
        ket_qua_xet_duyet: ketQua ? {
          ket_qua: ketQua.ket_qua,
          ghi_chu_chung: ketQua.ghi_chu_chung,
          ngay_duyet: ketQua.ngay_duyet,
        } : undefined
      })
      
      setIsDetailOpen(true)
    } catch (error) {
      console.error('Lỗi load chi tiết:', error)
      alert('Không thể tải thông tin chi tiết')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadDanhSach() }, [])

  function toggleChon(ma: string) {
    setDanhSach(prev => prev.map(p => p.ma_thong_tin === ma ? { ...p, da_chon: !p.da_chon } : p))
  }

  function toggleTatCa(checked: boolean) {
    setDanhSach(prev => prev.map(p => ({ ...p, da_chon: checked })))
  }

  function toggleKhongHopLe(ma: string) {
    setDanhSach(prev => prev.map(p => p.ma_thong_tin === ma ? { ...p, khong_hop_le: !p.khong_hop_le } : p))
  }

  function setGhiChu(ma: string, ghi_chu: string) {
    setDanhSach(prev => prev.map(p => p.ma_thong_tin === ma ? { ...p, ghi_chu } : p))
  }

  const daSoChon = danhSach.filter(p => p.da_chon).length

  const filtered = danhSach.filter(p => {
    const matchSearch = searchText
      ? p.ho_ten.toLowerCase().includes(searchText.toLowerCase()) || p.cccd.includes(searchText)
      : true
    return matchSearch
  })

  async function handleXacNhanDuyet() {
    const daChon = danhSach.filter(p => p.da_chon)
    if (daChon.length === 0) return

    setSubmitting(true)
    try {
      for (const phieu of daChon) {
        const ketQua = phieu.khong_hop_le ? 'Khong_dat' : 'Dat'
        const trangThaiMoi = phieu.khong_hop_le ? 'Khong_dat' : 'Da_duyet'

        await supabase.from('ketquaxetduyet').insert({
          ma_ket_qua: generateId('KQ'),
          ma_thong_tin: phieu.ma_thong_tin,
          ma_quan_ly: TEST_MA_QUAN_LY,
          ket_qua: ketQua,
          ghi_chu_chung: phieu.ghi_chu,
          ngay_duyet: new Date().toISOString(),
          chi_tiet_khong_hop_le: phieu.khong_hop_le && phieu.ghi_chu
            ? [{ truong: 'Thông tin cư trú', ly_do: phieu.ghi_chu }]
            : [],
        })

        await supabase
          .from('thongtincutru')
          .update({ trang_thai: trangThaiMoi })
          .eq('ma_thong_tin', phieu.ma_thong_tin)
      }

      setSuccessMsg(`Đã duyệt ${daChon.length} hồ sơ thành công.`)
      setTimeout(() => { setSuccessMsg(''); loadDanhSach() }, 2000)
    } catch (e: any) {
      alert('Lỗi: ' + e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="min-h-screen bg-white px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Kiểm tra thông tin cư trú</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kiểm tra và xác nhận các thông tin cư trú của khách hàng. 
            Bấm "Chi tiết" để xem đầy đủ thông tin hộ gia đình.
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-5">
          <input 
            value={searchText} 
            onChange={e => setSearchText(e.target.value)}
            placeholder="Tìm theo tên hoặc CMND"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64" 
          />
          <button onClick={loadDanhSach}
            className="bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
            Làm mới
          </button>
        </div>

        {/* Success toast */}
        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg mb-4">
            ✓ {successMsg}
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="border border-gray-100 rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p>Không có hồ sơ nào chờ duyệt</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <p className="text-sm text-gray-700 font-medium">
                  Chi tiết thông tin khách hàng{' '}
                  <span className="text-gray-400">(Tổng số người: {filtered.length} người)</span>
                </p>
              </div>
              <p className="text-xs text-gray-400">Chọn nhiều để thao tác hàng loạt</p>
            </div>

            {/* Bảng danh sách */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              {/* Header row */}
              <div className="grid grid-cols-[2rem_2.5rem_2fr_1.5fr_1.5fr_1fr_1fr_auto] gap-3 items-center px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <div>#</div>
                <div>Ảnh</div>
                <div>Họ tên</div>
                <div>CMND/CCCD</div>
                <div>Ngày đăng ký</div>
                <div>Giới tính</div>
                <div>Trạng thái</div>
                <div>Hành động</div>
              </div>

              {filtered.map((phieu, idx) => (
                <div key={phieu.ma_thong_tin}
                  className={`grid grid-cols-[2rem_2.5rem_2fr_1.5fr_1.5fr_1fr_1fr_auto] gap-3 items-center px-4 py-4 border-b border-gray-100 last:border-0 transition-colors ${phieu.da_chon ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>

                  {/* Checkbox */}
                  <input type="checkbox" checked={phieu.da_chon}
                    onChange={() => toggleChon(phieu.ma_thong_tin)}
                    className="accent-blue-600" />

                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                    {phieu.ho_ten.charAt(0)}
                  </div>

                  {/* Tên + ngày sinh */}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{phieu.ho_ten}</p>
                    <p className="text-xs text-gray-400">Ngày sinh: {phieu.ngay_sinh ? new Date(phieu.ngay_sinh).toLocaleDateString('vi-VN') : '—'}</p>
                  </div>

                  {/* CCCD */}
                  <div className="text-sm text-gray-700">{phieu.cccd}</div>

                  {/* Ngày đăng ký */}
                  <div className="text-sm text-gray-700">
                    {phieu.ngay_cung_cap ? new Date(phieu.ngay_cung_cap).toLocaleDateString('vi-VN') : '—'}
                  </div>

                  {/* Giới tính */}
                  <div className="text-sm text-gray-700">{phieu.gioi_tinh}</div>

                  {/* Không hợp lệ checkbox */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                      <input type="checkbox" checked={phieu.khong_hop_le}
                        onChange={() => toggleKhongHopLe(phieu.ma_thong_tin)}
                        className="accent-red-500" />
                      <span className={phieu.khong_hop_le ? 'text-red-600 font-medium' : 'text-gray-500'}>
                        Không hợp lệ
                      </span>
                    </label>
                    {phieu.khong_hop_le && (
                      <input 
                        value={phieu.ghi_chu}
                        onChange={e => setGhiChu(phieu.ma_thong_tin, e.target.value)}
                        placeholder="Ghi chú..."
                        className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400" 
                      />
                    )}
                  </div>

                  {/* Hành động */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleXemChiTiet(phieu)}
                      className="bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors">
                      Chi tiết
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-5">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox"
                checked={danhSach.length > 0 && danhSach.every(p => p.da_chon)}
                onChange={e => toggleTatCa(e.target.checked)}
                className="accent-blue-600" />
              Chọn tất cả
            </label>
            <span className="text-sm text-gray-400">Đã chọn: {daSoChon}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Tổng: {filtered.length} hồ sơ</span>
            <button onClick={handleXacNhanDuyet}
              disabled={submitting || daSoChon === 0}
              className="bg-blue-600 text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors">
              {submitting ? 'Đang xử lý...' : 'Xác nhận duyệt'}
            </button>
          </div>
        </div>
      </div>

      {/* Modal chi tiết hộ khẩu */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <FileText className="size-5" />
              Thông tin hộ khẩu - {selectedHoSo?.ma_ho_gia_dinh}
            </DialogTitle>
          </DialogHeader>

          {selectedHoSo && (
            <Tabs defaultValue="chuho" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="chuho" className="flex items-center gap-2">
                  <User className="size-4" />
                  Chủ hộ
                </TabsTrigger>
                <TabsTrigger value="thanhvien" className="flex items-center gap-2">
                  <User className="size-4" />
                  Thành viên ({selectedHoSo.thanh_vien.length})
                </TabsTrigger>
                <TabsTrigger value="ketqua" className="flex items-center gap-2">
                  <CheckCircle className="size-4" />
                  Kết quả duyệt
                </TabsTrigger>
              </TabsList>

              {/* Tab Chủ hộ */}
              <TabsContent value="chuho" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Họ và tên</label>
                    <p className="text-gray-900">{selectedHoSo.chu_ho.ho_ten}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Giới tính</label>
                    <p className="text-gray-900">{selectedHoSo.chu_ho.gioi_tinh}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Số điện thoại</label>
                    <p className="text-gray-900 flex items-center gap-2">
                      <Phone className="size-3" />
                      {selectedHoSo.chu_ho.so_dien_thoai || 'Chưa cập nhật'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-gray-900 flex items-center gap-2">
                      <Mail className="size-3" />
                      {selectedHoSo.chu_ho.email || 'Chưa cập nhật'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">CCCD/CMND</label>
                    <p className="text-gray-900 flex items-center gap-2">
                      <IdCard className="size-3" />
                      {selectedHoSo.chu_ho.cccd}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Ngày sinh</label>
                    <p className="text-gray-900 flex items-center gap-2">
                      <Calendar className="size-3" />
                      {new Date(selectedHoSo.chu_ho.ngay_sinh).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Ngày cấp CCCD</label>
                    <p className="text-gray-900">{selectedHoSo.chu_ho.ngay_cap_cccd || '—'}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Nơi cấp CCCD</label>
                    <p className="text-gray-900">{selectedHoSo.chu_ho.noi_cap_cccd || '—'}</p>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label className="text-sm font-medium text-gray-500">Địa chỉ thường trú</label>
                    <p className="text-gray-900 flex items-center gap-2">
                      <MapPin className="size-3" />
                      {selectedHoSo.chu_ho.dia_chi_thuong_tru || '—'}
                    </p>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label className="text-sm font-medium text-gray-500">Quê quán</label>
                    <p className="text-gray-900">{selectedHoSo.chu_ho.que_quan || '—'}</p>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label className="text-sm font-medium text-gray-500">Nghề nghiệp</label>
                    <p className="text-gray-900">{selectedHoSo.chu_ho.nghe_nghiep || '—'}</p>
                  </div>
                </div>
              </TabsContent>

              {/* Tab Thành viên */}
              <TabsContent value="thanhvien" className="mt-4">
                {selectedHoSo.thanh_vien.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">Không có thành viên nào</p>
                ) : (
                  <div className="space-y-3">
                    {selectedHoSo.thanh_vien.map((tv, idx) => (
                      <div key={tv.ma_thong_tin} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900">{tv.ho_ten}</h3>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                            {tv.quan_he}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">CCCD:</span> {tv.cccd}
                          </div>
                          <div>
                            <span className="text-gray-500">Ngày sinh:</span> {new Date(tv.ngay_sinh).toLocaleDateString('vi-VN')}
                          </div>
                          <div>
                            <span className="text-gray-500">Giới tính:</span> {tv.gioi_tinh}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Tab Kết quả duyệt */}
              <TabsContent value="ketqua" className="mt-4">
                {selectedHoSo.ket_qua_xet_duyet ? (
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg ${selectedHoSo.ket_qua_xet_duyet.ket_qua === 'Dat' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        {selectedHoSo.ket_qua_xet_duyet.ket_qua === 'Dat' ? (
                          <CheckCircle className="size-5 text-green-600" />
                        ) : (
                          <XCircle className="size-5 text-red-600" />
                        )}
                        <span className={`font-semibold ${selectedHoSo.ket_qua_xet_duyet.ket_qua === 'Dat' ? 'text-green-700' : 'text-red-700'}`}>
                          Kết quả: {selectedHoSo.ket_qua_xet_duyet.ket_qua === 'Dat' ? 'ĐẠT' : 'KHÔNG ĐẠT'}
                        </span>
                      </div>
                      {selectedHoSo.ket_qua_xet_duyet.ghi_chu_chung && (
                        <p className="text-gray-700">Ghi chú: {selectedHoSo.ket_qua_xet_duyet.ghi_chu_chung}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-2">
                        Ngày duyệt: {new Date(selectedHoSo.ket_qua_xet_duyet.ngay_duyet).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <p>Chưa có kết quả duyệt</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}