'use client'

import { useState, useEffect } from 'react'
import {
  getDanhSachChoXetDuyet,
  getChiTietThongTin,
  xetDuyetThongTin,
} from '@/lib/services/check_customer'
import type {
  ThongTinCuTruWithKetQua,
  ChiTietKhongHopLe,
  KetQuaDuyet,
} from '@/lib/types/CheckCustomerService'

// ── Thay bằng ID quản lý đang đăng nhập ──
const MA_QUAN_LY = 'NV_QL_01'

// ─────────────────────────────────────────────────
// Component chính
// ─────────────────────────────────────────────────
export default function QuanLyXetDuyet() {
  const [danhSach, setDanhSach] = useState<ThongTinCuTruWithKetQua[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<ThongTinCuTruWithKetQua | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  async function loadDanhSach() {
    setLoading(true)
    try {
      const data = await getDanhSachChoXetDuyet()
      setDanhSach(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadDanhSach() }, [])

  async function handleChonPhieu(maThongTin: string) {
    setLoadingDetail(true)
    try {
      const data = await getChiTietThongTin(maThongTin)
      setSelected(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingDetail(false)
    }
  }

  function handleDuyetXong() {
    setSelected(null)
    loadDanhSach()
  }

  // ── Layout: danh sách bên trái, chi tiết bên phải ──
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Xét duyệt thông tin cư trú</h1>
          <p className="text-sm text-gray-500 mt-1">
            {danhSach.length} phiếu đang chờ xét duyệt
          </p>
        </div>

        <div className="flex gap-5 items-start">

          {/* Danh sách bên trái */}
          <div className="w-80 shrink-0 space-y-2">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                  <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              ))
            ) : danhSach.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                <p className="text-sm text-gray-400">Không có phiếu nào chờ duyệt</p>
              </div>
            ) : (
              danhSach.map(item => (
                <button
                  key={item.ma_thong_tin}
                  onClick={() => handleChonPhieu(item.ma_thong_tin)}
                  className={`w-full text-left bg-white rounded-xl border px-4 py-3.5 transition-all hover:border-gray-400 ${
                    selected?.ma_thong_tin === item.ma_thong_tin
                      ? 'border-gray-900 ring-1 ring-gray-900'
                      : 'border-gray-200'
                  }`}
                >
                  <p className="font-medium text-sm text-gray-900">{item.ho_ten}</p>
                  <p className="text-xs text-gray-400 mt-0.5">CCCD: {item.cccd}</p>
                  <p className="text-xs text-gray-400">{fmtDatetime(item.ngay_cung_cap)}</p>
                </button>
              ))
            )}
          </div>

          {/* Chi tiết + form xét duyệt bên phải */}
          <div className="flex-1 min-w-0">
            {loadingDetail && (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
                <p className="text-sm text-gray-400">Đang tải...</p>
              </div>
            )}

            {!loadingDetail && !selected && (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <p className="text-gray-300 text-4xl mb-3">📋</p>
                <p className="text-sm text-gray-400">Chọn một phiếu bên trái để xem chi tiết</p>
              </div>
            )}

            {!loadingDetail && selected && (
              <FormXetDuyet
                thongTin={selected}
                onDone={handleDuyetXong}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────
// Form xét duyệt (UC 2.5.11)
// ─────────────────────────────────────────────────
const CACS_TRUONG = [
  { key: 'ho_ten',             label: 'Họ và tên' },
  { key: 'ngay_sinh',          label: 'Ngày sinh' },
  { key: 'gioi_tinh',          label: 'Giới tính' },
  { key: 'cccd',               label: 'Số CCCD' },
  { key: 'ngay_cap_cccd',      label: 'Ngày cấp CCCD' },
  { key: 'noi_cap_cccd',       label: 'Nơi cấp CCCD' },
  { key: 'dia_chi_thuong_tru', label: 'Địa chỉ thường trú' },
  { key: 'que_quan',           label: 'Quê quán' },
]

function FormXetDuyet({
  thongTin,
  onDone,
}: {
  thongTin: ThongTinCuTruWithKetQua
  onDone: () => void
}) {
  // Mỗi trường: { khongHopLe: boolean, lyDo: string }
  const [flags, setFlags] = useState<Record<string, { khongHopLe: boolean; lyDo: string }>>(
    Object.fromEntries(CACS_TRUONG.map(t => [t.key, { khongHopLe: false, lyDo: '' }]))
  )
  const [ghiChu, setGhiChu] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  function toggleFlag(key: string) {
    setFlags(prev => ({
      ...prev,
      [key]: { ...prev[key], khongHopLe: !prev[key].khongHopLe, lyDo: prev[key].khongHopLe ? '' : prev[key].lyDo },
    }))
  }

  function setLyDo(key: string, lyDo: string) {
    setFlags(prev => ({ ...prev, [key]: { ...prev[key], lyDo } }))
  }

  async function handleXacNhan(ketQua: KetQuaDuyet) {
    setLoading(true)
    try {
      const chiTiet: ChiTietKhongHopLe[] = CACS_TRUONG
        .filter(t => flags[t.key].khongHopLe)
        .map(t => ({ truong: t.label, ly_do: flags[t.key].lyDo || 'Không hợp lệ' }))

      await xetDuyetThongTin({
        ma_thong_tin: thongTin.ma_thong_tin,
        ma_quan_ly: MA_QUAN_LY,
        ket_qua: ketQua,
        ghi_chu_chung: ghiChu,
        chi_tiet_khong_hop_le: chiTiet,
      })
      setDone(true)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
        <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Đã duyệt thông tin khách hàng</h2>
        <p className="text-sm text-gray-500 mb-6">Kết quả đã được ghi nhận và thông báo cho khách hàng.</p>
        <button onClick={onDone} className="text-sm text-blue-600 hover:underline">
          Quay lại danh sách
        </button>
      </div>
    )
  }

  const kh = (thongTin as any).KhachHang

  return (
    <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">

      {/* Tiêu đề phiếu */}
      <div className="px-6 py-4 flex items-center justify-between">
        <div>
          <p className="font-semibold text-gray-900">{thongTin.ho_ten}</p>
          <p className="text-xs text-gray-400">Nộp lúc {fmtDatetime(thongTin.ngay_cung_cap)}</p>
        </div>
        <span className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-3 py-1 rounded-full font-medium">
          Chờ duyệt
        </span>
      </div>

      {/* Thông tin khách hàng từ hệ thống */}
      {kh && (
        <div className="px-6 py-4 bg-gray-50">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Hồ sơ trong hệ thống</p>
          <div className="flex gap-6 text-sm">
            <span className="text-gray-600">Tên: <strong>{kh.ten}</strong></span>
            <span className="text-gray-600">SĐT: <strong>{kh.so_dien_thoai}</strong></span>
            <span className="text-gray-600">Email: <strong>{kh.email}</strong></span>
          </div>
        </div>
      )}

      {/* Bảng kiểm tra từng trường */}
      <div className="px-6 py-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Đánh dấu thông tin không hợp lệ
        </p>
        <div className="space-y-3">
          {CACS_TRUONG.map(({ key, label }) => {
            const val = (thongTin as any)[key] ?? '—'
            const flag = flags[key]
            return (
              <div
                key={key}
                className={`rounded-xl border px-4 py-3 transition-colors ${
                  flag.khongHopLe ? 'border-red-200 bg-red-50' : 'border-gray-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleFlag(key)}
                    className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                      flag.khongHopLe
                        ? 'bg-red-500 border-red-500'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    title="Đánh dấu không hợp lệ"
                  >
                    {flag.khongHopLe && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </button>

                  {/* Nội dung */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-xs text-gray-400">{label}</span>
                      <span className="text-sm font-medium text-gray-900 text-right">
                        {key === 'ngay_sinh' || key === 'ngay_cap_cccd' ? fmt(val) : val}
                      </span>
                    </div>

                    {/* Ghi chú lý do nếu đánh dấu không hợp lệ */}
                    {flag.khongHopLe && (
                      <input
                        type="text"
                        value={flag.lyDo}
                        onChange={e => setLyDo(key, e.target.value)}
                        placeholder="Ghi rõ lý do không hợp lệ..."
                        className="mt-2 w-full text-sm border border-red-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-red-300"
                      />
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Ghi chú chung */}
      <div className="px-6 py-4">
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Ghi chú chung
        </label>
        <textarea
          value={ghiChu}
          onChange={e => setGhiChu(e.target.value)}
          placeholder="Ghi chú thêm (không bắt buộc)..."
          rows={3}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      </div>

      {/* Nút xác nhận */}
      <div className="px-6 py-4 flex justify-end gap-3">
        {/* Đạt chỉ enable khi không có trường nào bị đánh không hợp lệ */}
        {Object.values(flags).every(f => !f.khongHopLe) ? (
          <button
            onClick={() => handleXacNhan('Dat')}
            disabled={loading}
            className="bg-green-600 text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Đang xử lý...' : '✓ Xác nhận đạt'}
          </button>
        ) : (
          <button
            onClick={() => handleXacNhan('Khong_dat')}
            disabled={loading}
            className="bg-red-600 text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Đang xử lý...' : '✗ Xác nhận không đạt'}
          </button>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────
function fmt(dateStr: string) {
  if (!dateStr || dateStr === '—') return '—'
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

function fmtDatetime(iso: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('vi-VN')
}