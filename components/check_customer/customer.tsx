'use client'

import { useState } from 'react'
import {
  validateThongTinCuTru,
  cungCapThongTinCuTru,
  traCuuKetQua,
  getPhongInfoByHopDong,
} from '@/lib/services/check_customer'
import type {
  CungCapThongTinForm,
  TraCuuResult,
} from '@/lib/types/CheckCustomerService'


const MOCK_MA_KHACH_HANG = 'KH001'
const MOCK_MA_HOP_DONG = 'HD_001'

// ─────────────────────────────────────────────────
// Component chính
// ─────────────────────────────────────────────────
export default function KhachHangCuTru() {
  const [tab, setTab] = useState<'cung-cap' | 'tra-cuu'>('cung-cap')

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Thông tin cư trú</h1>
          <p className="text-sm text-gray-500 mt-1">Cung cấp hoặc tra cứu kết quả xét duyệt thông tin cư trú của bạn.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
          {([
            { key: 'cung-cap', label: 'Cung cấp thông tin' },
            { key: 'tra-cuu',  label: 'Tra cứu kết quả' },
          ] as const).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                tab === t.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'cung-cap' ? <TabCungCap /> : <TabTraCuu />}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────
// Tab 1: Cung cấp thông tin cư trú (UC 2.5.10)
// ─────────────────────────────────────────────────
function TabCungCap() {
  const emptyForm: CungCapThongTinForm = {
    ma_khach_hang: MOCK_MA_KHACH_HANG,
    ma_hop_dong: MOCK_MA_HOP_DONG,
    ho_ten: '',
    ngay_sinh: '',
    gioi_tinh: 'Nam',
    cccd: '',
    ngay_cap_cccd: '',
    noi_cap_cccd: '',
    dia_chi_thuong_tru: '',
    que_quan: '',
    nghe_nghiep: '',
    noi_lam_viec_hoc_tap: '',
    nguoi_lien_he_khan_cap: '',
    sdt_khan_cap: '',
  }

  const [form, setForm] = useState<CungCapThongTinForm>(emptyForm)
  const [errors, setErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  function set(field: keyof CungCapThongTinForm, value: string) {
    setForm((prev: CungCapThongTinForm) => ({ ...prev, [field]: value }))
    setErrors([])
  }

  async function handleSubmit() {
    setLoading(true)
    setErrors([])
    try {
      // Lấy thông tin phòng để validate
      const phongInfo = await getPhongInfoByHopDong(form.ma_hop_dong)
      const phong = (phongInfo as any)?.Giuong?.Phong
      const phongGioiTinh = phong?.gioi_tinh_phong ?? 'Nam'
      const phongSucChua = phong?.suc_chua ?? 99

      const errs = validateThongTinCuTru(form, phongGioiTinh, phongSucChua, 0)
      if (errs.length > 0) {
        setErrors(errs)
        return
      }

      await cungCapThongTinCuTru(form)
      setSuccess(true)
    } catch (e: any) {
      setErrors([e.message ?? 'Có lỗi xảy ra, vui lòng thử lại.'])
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
        <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Cập nhật thông tin cư trú thành công</h2>
        <p className="text-sm text-gray-500 mb-6">Thông tin của bạn đã được ghi nhận và đang chờ quản lý xét duyệt.</p>
        <button
          onClick={() => { setSuccess(false); setForm(emptyForm) }}
          className="text-sm text-blue-600 hover:underline"
        >
          Cung cấp thêm phiếu khác
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">

      {/* Lỗi */}
      {errors.length > 0 && (
        <div className="px-6 py-4 bg-red-50 rounded-t-2xl">
          {errors.map(e => (
            <p key={e} className="text-sm text-red-600 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              {e}
            </p>
          ))}
        </div>
      )}

      {/* Thông tin cá nhân */}
      <Section title="Thông tin cá nhân">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Họ và tên *" colSpan={2}>
            <Input value={form.ho_ten} onChange={v => set('ho_ten', v)} placeholder="Nguyễn Văn A" />
          </Field>
          <Field label="Ngày sinh *">
            <Input type="date" value={form.ngay_sinh} onChange={v => set('ngay_sinh', v)} />
          </Field>
          <Field label="Giới tính *">
            <Select value={form.gioi_tinh} onChange={v => set('gioi_tinh', v as 'Nam' | 'Nu')}
              options={[{ value: 'Nam', label: 'Nam' }, { value: 'Nu', label: 'Nữ' }]} />
          </Field>
          <Field label="Số CCCD *">
            <Input value={form.cccd} onChange={v => set('cccd', v)} placeholder="012345678901" maxLength={12} />
          </Field>
          <Field label="Ngày cấp *">
            <Input type="date" value={form.ngay_cap_cccd} onChange={v => set('ngay_cap_cccd', v)} />
          </Field>
          <Field label="Nơi cấp *" colSpan={2}>
            <Input value={form.noi_cap_cccd} onChange={v => set('noi_cap_cccd', v)} placeholder="Cục Cảnh sát QLHC về TTXH" />
          </Field>
        </div>
      </Section>

      {/* Thông tin cư trú */}
      <Section title="Thông tin cư trú">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Địa chỉ thường trú *" colSpan={2}>
            <Input value={form.dia_chi_thuong_tru} onChange={v => set('dia_chi_thuong_tru', v)}
              placeholder="Số nhà, đường, phường, quận, tỉnh/thành phố" />
          </Field>
          <Field label="Quê quán *" colSpan={2}>
            <Input value={form.que_quan} onChange={v => set('que_quan', v)} placeholder="Tỉnh / Thành phố" />
          </Field>
          <Field label="Nghề nghiệp">
            <Input value={form.nghe_nghiep ?? ''} onChange={v => set('nghe_nghiep', v)} placeholder="Sinh viên, nhân viên văn phòng..." />
          </Field>
          <Field label="Nơi làm việc / học tập">
            <Input value={form.noi_lam_viec_hoc_tap ?? ''} onChange={v => set('noi_lam_viec_hoc_tap', v)} placeholder="Trường, công ty..." />
          </Field>
        </div>
      </Section>

      {/* Liên hệ khẩn cấp */}
      <Section title="Người liên hệ khẩn cấp">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Họ tên">
            <Input value={form.nguoi_lien_he_khan_cap ?? ''} onChange={v => set('nguoi_lien_he_khan_cap', v)} placeholder="Họ và tên" />
          </Field>
          <Field label="Số điện thoại">
            <Input value={form.sdt_khan_cap ?? ''} onChange={v => set('sdt_khan_cap', v)} placeholder="0901..." />
          </Field>
        </div>
      </Section>

      {/* Submit */}
      <div className="px-6 py-4 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-gray-900 text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Đang gửi...' : 'Gửi thông tin'}
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────
// Tab 2: Tra cứu kết quả (UC 2.5.12)
// ─────────────────────────────────────────────────
function TabTraCuu() {
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TraCuuResult | null>(null)
  const [searched, setSearched] = useState(false)

  async function handleSearch() {
    if (!keyword.trim()) return
    setLoading(true)
    setSearched(false)
    try {
      const res = await traCuuKetQua(keyword.trim())
      setResult(res)
    } catch {
      setResult({ found: false })
    } finally {
      setLoading(false)
      setSearched(true)
    }
  }

  return (
    <div className="space-y-4">
      {/* Search box */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nhập CCCD hoặc Số điện thoại
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={keyword}
            onChange={e => { setKeyword(e.target.value); setSearched(false) }}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="VD: 079123456789 hoặc 0901234567"
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
          <button
            onClick={handleSearch}
            disabled={loading || !keyword.trim()}
            className="bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-gray-700 disabled:opacity-40 transition-colors whitespace-nowrap"
          >
            {loading ? 'Đang tìm...' : 'Tra cứu'}
          </button>
        </div>
      </div>

      {/* Kết quả */}
      {searched && !result?.found && (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <p className="text-gray-400 text-sm">Không tìm thấy thông tin</p>
          <p className="text-gray-400 text-xs mt-1">Kiểm tra lại CCCD hoặc số điện thoại.</p>
        </div>
      )}

      {searched && result?.found && result.thong_tin && (
        <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">

          {/* Badge trạng thái */}
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">{result.thong_tin.ho_ten}</p>
              <p className="text-sm text-gray-500">CCCD: {result.thong_tin.cccd}</p>
            </div>
            <StatusBadge trangThai={result.thong_tin.trang_thai} ketQua={result.ket_qua?.ket_qua} />
          </div>

          {/* Chi tiết phiếu */}
          <div className="px-6 py-4 grid grid-cols-2 gap-3 text-sm">
            <InfoRow label="Ngày sinh" value={fmt(result.thong_tin.ngay_sinh)} />
            <InfoRow label="Giới tính" value={result.thong_tin.gioi_tinh} />
            <InfoRow label="Địa chỉ thường trú" value={result.thong_tin.dia_chi_thuong_tru} colSpan={2} />
            <InfoRow label="Quê quán" value={result.thong_tin.que_quan} />
            <InfoRow label="Ngày nộp" value={fmtDatetime(result.thong_tin.ngay_cung_cap)} />
          </div>

          {/* Kết quả xét duyệt */}
          {result.ket_qua && (
            <div className="px-6 py-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Kết quả xét duyệt</p>
              {result.ket_qua.ghi_chu_chung && (
                <p className="text-sm text-gray-700 mb-3">{result.ket_qua.ghi_chu_chung}</p>
              )}
              {result.ket_qua.chi_tiet_khong_hop_le?.length > 0 && (
                <div className="space-y-2">
                  {result.ket_qua.chi_tiet_khong_hop_le.map((c: { truong: string; ly_do: string }, i: number) => (
                    <div key={i} className="flex gap-3 bg-red-50 rounded-lg px-4 py-2.5">
                      <span className="text-xs font-medium text-red-700 w-28 shrink-0">{c.truong}</span>
                      <span className="text-xs text-red-600">{c.ly_do}</span>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-400 mt-3">Duyệt lúc: {fmtDatetime(result.ket_qua.ngay_duyet)}</p>
            </div>
          )}

          {!result.ket_qua && (
            <div className="px-6 py-4">
              <p className="text-sm text-gray-500 italic">Phiếu đang chờ quản lý xét duyệt.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-6 py-5">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">{title}</p>
      {children}
    </div>
  )
}

function Field({ label, children, colSpan }: { label: string; children: React.ReactNode; colSpan?: number }) {
  return (
    <div className={colSpan === 2 ? 'col-span-2' : ''}>
      <label className="block text-sm text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  )
}

function Input({ value, onChange, placeholder, type = 'text', maxLength }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; maxLength?: number
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
    />
  )
}

function Select({ value, onChange, options }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[]
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

function InfoRow({ label, value, colSpan }: { label: string; value: string; colSpan?: number }) {
  return (
    <div className={colSpan === 2 ? 'col-span-2' : ''}>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-gray-800 font-medium mt-0.5">{value || '—'}</p>
    </div>
  )
}

function StatusBadge({ trangThai, ketQua }: { trangThai: string; ketQua?: string }) {
  if (trangThai === 'Cho_duyet')
    return <span className="text-xs font-medium bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full border border-yellow-200">Đang chờ duyệt</span>
  if (ketQua === 'Dat' || trangThai === 'Da_duyet')
    return <span className="text-xs font-medium bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200">Đạt</span>
  return <span className="text-xs font-medium bg-red-50 text-red-700 px-3 py-1 rounded-full border border-red-200">Không đạt</span>
}

// ─────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────
function fmt(dateStr: string) {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

function fmtDatetime(iso: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString('vi-VN')
}