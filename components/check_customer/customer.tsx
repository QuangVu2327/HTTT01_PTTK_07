'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'


// ── Test: bỏ qua auth ──
const TEST_MA_KHACH_HANG = 'KH001'
const TEST_MA_HOP_DONG = 'HD_001'

function generateId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

interface NguoiLuuTru {
  ho_ten: string
  cccd: string
  ngay_sinh: string
  quan_he: string
  gioi_tinh: 'Nam' | 'Nu' | ''
}

interface ThongTinChuHo {
  ho_ten: string
  cccd: string
  so_dien_thoai: string
  email: string
  gioi_tinh: 'Nam' | 'Nu' | ''
  ngay_sinh: string
  dia_chi_thuong_tru: string
  que_quan: string
  nghe_nghiep: string
  noi_lam_viec: string
  nguoi_lien_he_khan_cap: string
  sdt_khan_cap: string
}

// ─────────────────────────────────────────────────
// Page wrapper
// ─────────────────────────────────────────────────
export default function CustomerPage() {
  const [tab, setTab] = useState<'cung-cap' | 'tra-cuu'>('cung-cap')
  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-200 px-6">
        <div className="flex gap-6">
          {([
            { key: 'cung-cap', label: 'Cung cấp thông tin' },
            { key: 'tra-cuu', label: 'Tra cứu kết quả' },
          ] as const).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
      {tab === 'cung-cap' ? <TabCungCap /> : <TabTraCuu />}
    </div>
  )
}

// ─────────────────────────────────────────────────
// Tab 1: Cung cấp thông tin (Sửa hoàn chỉnh)
// ─────────────────────────────────────────────────
function TabCungCap() {
  // Thông tin chủ hộ
  const [chuHo, setChuHo] = useState<ThongTinChuHo>({
    ho_ten: '',
    cccd: '',
    so_dien_thoai: '',
    email: '',
    gioi_tinh: '',
    ngay_sinh: '',
    dia_chi_thuong_tru: '',
    que_quan: '',
    nghe_nghiep: '',
    noi_lam_viec: '',
    nguoi_lien_he_khan_cap: '',
    sdt_khan_cap: '',
  })
  
  const [soLuong, setSoLuong] = useState(1)
  const [nguoiList, setNguoiList] = useState<NguoiLuuTru[]>([
    { ho_ten: '', cccd: '', ngay_sinh: '', quan_he: '', gioi_tinh: '' },
  ])
  const [errors, setErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  function themNguoi() {
    if (nguoiList.length >= 10) {
      setErrors(['Tối đa 10 người trong một hồ sơ'])
      return
    }
    setNguoiList(prev => [...prev, { ho_ten: '', cccd: '', ngay_sinh: '', quan_he: '', gioi_tinh: '' }])
    setSoLuong(prev => prev + 1)
  }

  function xoaNguoi() {
    if (nguoiList.length <= 1) return
    setNguoiList(prev => prev.slice(0, -1))
    setSoLuong(prev => prev - 1)
  }

  function updateChuHo(field: keyof ThongTinChuHo, value: string) {
    setChuHo(prev => ({ ...prev, [field]: value }))
  }

  function updateNguoi(i: number, field: keyof NguoiLuuTru, value: string) {
    setNguoiList(prev => prev.map((n, idx) => idx === i ? { ...n, [field]: value } : n))
  }

  async function handleSubmit() {
    setErrors([])
    const errs: string[] = []

    // Validate chủ hộ
    if (!chuHo.ho_ten.trim()) errs.push('Họ tên chủ hộ không được để trống')
    if (!chuHo.cccd.trim()) errs.push('CCCD không được để trống')
    if (chuHo.cccd && !/^\d{12}$/.test(chuHo.cccd)) errs.push('CCCD phải có 12 chữ số')
    if (!chuHo.so_dien_thoai.trim()) errs.push('Số điện thoại không được để trống')
    if (!chuHo.email.trim()) errs.push('Email không được để trống')
    if (!chuHo.gioi_tinh) errs.push('Giới tính không được để trống')
    if (!chuHo.ngay_sinh) errs.push('Ngày sinh không được để trống')
    if (!chuHo.dia_chi_thuong_tru.trim()) errs.push('Địa chỉ thường trú không được để trống')

    // Validate số lượng
    if (soLuong !== nguoiList.length) {
      errs.push('Số lượng người không khớp với danh sách')
    }

    if (errs.length > 0) { setErrors(errs); return }

    setLoading(true)
    try {
      const maHoGiaDinh = generateId('HD')
      
      // 1. Tạo/Lấy thông tin khách hàng
      let maKhachHang = TEST_MA_KHACH_HANG
      
      // Kiểm tra khách hàng đã tồn tại chưa
      const { data: existingKH } = await supabase
        .from('khachhang')
        .select('ma_khach_hang')
        .eq('so_dien_thoai', chuHo.so_dien_thoai)
        .single()
      
      if (!existingKH) {
        // Tạo khách hàng mới
        const newMaKH = generateId('KH')
        const { error: khError } = await supabase.from('khachhang').insert({
          ma_khach_hang: newMaKH,
          so_dien_thoai: chuHo.so_dien_thoai,
          ten: chuHo.ho_ten,
          email: chuHo.email,
          gioi_tinh: chuHo.gioi_tinh === 'Nam' ? 'Nam' : 'Nữ',
          loai_doi_tuong: 'Sinh vien',
        })
        if (khError) throw khError
        maKhachHang = newMaKH
      } else {
        maKhachHang = existingKH.ma_khach_hang
      }

      // 2. Lưu thông tin chủ hộ
      const { error: chuHoError } = await supabase.from('thongtincutru').insert({
        ma_thong_tin: generateId('TT'),
        ma_khach_hang: maKhachHang,
        ma_hop_dong: TEST_MA_HOP_DONG,
        ho_ten: chuHo.ho_ten,
        cccd: chuHo.cccd,
        ngay_sinh: chuHo.ngay_sinh,
        gioi_tinh: chuHo.gioi_tinh === 'Nam' ? 'Nam' : 'Nu',
        ngay_cap_cccd: '2020-01-01',
        noi_cap_cccd: 'Cục CS QLHC',
        dia_chi_thuong_tru: chuHo.dia_chi_thuong_tru,
        que_quan: chuHo.que_quan,
        nghe_nghiep: chuHo.nghe_nghiep,
        noi_lam_viec_hoc_tap: chuHo.noi_lam_viec,
        nguoi_lien_he_khan_cap: chuHo.nguoi_lien_he_khan_cap,
        sdt_khan_cap: chuHo.sdt_khan_cap,
        quan_he_chu_ho: 'Chủ hộ',
        ngay_cung_cap: new Date().toISOString(),
        trang_thai: 'Cho_duyet',
      })
      if (chuHoError) throw chuHoError

      // 3. Lưu danh sách người lưu trú (thành viên khác)
      for (const tv of nguoiList) {
        if (!tv.ho_ten.trim()) continue // Bỏ qua thành viên trống
        
        const { error: tvError } = await supabase.from('thongtincutru').insert({
          ma_thong_tin: generateId('TT'),
          ma_khach_hang: maKhachHang,
          ma_hop_dong: TEST_MA_HOP_DONG,
          ho_ten: tv.ho_ten,
          cccd: tv.cccd || `TEMP_${Date.now()}_${Math.random()}`,
          ngay_sinh: tv.ngay_sinh || '2000-01-01',
          gioi_tinh: tv.gioi_tinh === 'Nam' ? 'Nam' : 'Nu',
          ngay_cap_cccd: '2020-01-01',
          noi_cap_cccd: 'Cục CS QLHC',
          dia_chi_thuong_tru: chuHo.dia_chi_thuong_tru,
          que_quan: chuHo.que_quan,
          quan_he_chu_ho: tv.quan_he || 'Thành viên',
          ngay_cung_cap: new Date().toISOString(),
          trang_thai: 'Cho_duyet',
        })
        if (tvError) throw tvError
      }

      setSuccess(true)
    } catch (e: any) {
      setErrors([e.message ?? 'Có lỗi xảy ra'])
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-lg font-semibold text-gray-800">Gửi thông tin thành công!</p>
        <p className="text-sm text-gray-500">Hồ sơ đang chờ quản lý xét duyệt.</p>
        <button onClick={() => window.location.reload()}
          className="mt-2 text-sm text-blue-600 hover:underline">
          Gửi phiếu khác
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cung cấp thông tin cư trú</h1>
          <p className="text-sm text-gray-500 mt-1">Vui lòng điền thông tin cư trú chính xác cho khách hàng. Kiểm tra kỹ trước khi gửi.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Hệ thống yêu cầu xác minh CCCD
        </div>
      </div>

      {/* Form đại diện - Chủ hộ */}
      <div className="border-b border-gray-200 pb-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">👤 Thông tin chủ hộ</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên *</label>
            <input value={chuHo.ho_ten} onChange={e => updateChuHo('ho_ten', e.target.value)} 
              placeholder="Nguyễn Văn A"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CCCD *</label>
            <input value={chuHo.cccd} onChange={e => updateChuHo('cccd', e.target.value)} 
              placeholder="012345678901" maxLength={12}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
            <input value={chuHo.so_dien_thoai} onChange={e => updateChuHo('so_dien_thoai', e.target.value)} 
              placeholder="0987654321"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input value={chuHo.email} onChange={e => updateChuHo('email', e.target.value)} 
              placeholder="example@email.com"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính *</label>
            <div className="flex gap-4 items-center h-11">
              {(['Nam', 'Nu'] as const).map(gt => (
                <label key={gt} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="gioiTinhChuHo" value={gt}
                    checked={chuHo.gioi_tinh === gt}
                    onChange={() => updateChuHo('gioi_tinh', gt)}
                    className="accent-blue-600" />
                  <span className="text-sm">{gt === 'Nam' ? 'Nam' : 'Nữ'}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh *</label>
            <input type="date" value={chuHo.ngay_sinh} onChange={e => updateChuHo('ngay_sinh', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ thường trú *</label>
            <input value={chuHo.dia_chi_thuong_tru} onChange={e => updateChuHo('dia_chi_thuong_tru', e.target.value)}
              placeholder="Số nhà, đường, phường, quận, thành phố"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quê quán</label>
            <input value={chuHo.que_quan} onChange={e => updateChuHo('que_quan', e.target.value)}
              placeholder="Tỉnh/Thành phố"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nghề nghiệp</label>
            <input value={chuHo.nghe_nghiep} onChange={e => updateChuHo('nghe_nghiep', e.target.value)}
              placeholder="Sinh viên, nhân viên..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </div>

      {/* Lỗi */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6">
          <p className="text-xs font-semibold text-red-500 mb-1">Lỗi hiển thị:</p>
          {errors.map(e => <p key={e} className="text-xs text-red-400">• {e}</p>)}
        </div>
      )}

      {/* Danh sách người lưu trú */}
      <div className="flex items-center justify-between mb-3 mt-6">
        <h2 className="text-base font-semibold text-gray-900">👥 Danh sách người lưu trú</h2>
        <div className="flex gap-2">
          <button onClick={themNguoi}
            className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            + Thêm người
          </button>
          <button onClick={xoaNguoi} disabled={nguoiList.length <= 1}
            className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-40 transition-colors">
            - Xóa người
          </button>
        </div>
      </div>

      <div className="space-y-3 mb-8">
        {nguoiList.map((nguoi, i) => (
          <div key={i} className="border border-gray-200 rounded-xl p-4 bg-white">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-500">Thành viên {i + 1}</span>
              {i === 0 && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Người đại diện</span>}
            </div>
            <div className="grid grid-cols-5 gap-3 items-end">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Họ tên</label>
                <input value={nguoi.ho_ten} onChange={e => updateNguoi(i, 'ho_ten', e.target.value)}
                  placeholder="Họ và tên"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">CCCD</label>
                <input value={nguoi.cccd} onChange={e => updateNguoi(i, 'cccd', e.target.value)}
                  placeholder="012345678901" maxLength={12}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Ngày sinh</label>
                <input type="date" value={nguoi.ngay_sinh} onChange={e => updateNguoi(i, 'ngay_sinh', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Quan hệ với chủ hộ</label>
                <input value={nguoi.quan_he} onChange={e => updateNguoi(i, 'quan_he', e.target.value)}
                  placeholder="Bạn cùng phòng, anh em..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Giới tính</label>
                <div className="flex gap-3 items-center h-9">
                  {(['Nam', 'Nu'] as const).map(gt => (
                    <label key={gt} className="flex items-center gap-1 text-sm cursor-pointer">
                      <input type="radio" name={`gt_${i}`} value={gt}
                        checked={nguoi.gioi_tinh === gt}
                        onChange={() => updateNguoi(i, 'gioi_tinh', gt)}
                        className="accent-blue-600" />
                      {gt === 'Nam' ? 'Nam' : 'Nữ'}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Submit */}
      <div className="flex justify-center">
        <button onClick={handleSubmit} disabled={loading}
          className="bg-blue-600 text-white font-semibold px-10 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm">
          {loading ? 'Đang gửi...' : 'Gửi thông tin'}
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────
// Tab 2: Tra cứu kết quả (Giữ nguyên như cũ)
// ─────────────────────────────────────────────────
function TabTraCuu() {
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [inputError, setInputError] = useState('')

  async function handleSearch() {
    setInputError('')
    const val = keyword.trim()
    const isCCCD = /^\d{12}$/.test(val)
    const isSdt  = /^0\d{9}$/.test(val)

    if (!isCCCD && !isSdt) {
      setInputError('Vui lòng nhập CCCD hoặc số điện thoại hợp lệ')
      return
    }

    setLoading(true)
    setSearched(false)
    try {
      let maKH: string | null = null

      if (isSdt) {
        const { data: kh } = await supabase
          .from('KhachHang').select('ma_khach_hang').eq('so_dien_thoai', val).single()
        if (!kh) { setResult(null); setSearched(true); setLoading(false); return }
        maKH = kh.ma_khach_hang
      }

      const query = supabase
        .from('ThongTinCuTru')
        .select(`*, KetQuaXetDuyet (*)`)

      const { data } = await (isCCCD
        ? query.eq('cccd', val)
        : query.eq('ma_khach_hang', maKH!)
      ).order('ngay_cung_cap', { ascending: false }).limit(1).single()

      setResult(data ?? null)
    } catch {
      setResult(null)
    } finally {
      setLoading(false)
      setSearched(true)
    }
  }

  const ketQua = result?.KetQuaXetDuyet?.[0]
  const isDat = ketQua?.ket_qua === 'Dat'
  const isKhongDat = ketQua?.ket_qua === 'Khong_dat'

  function reset() { setSearched(false); setResult(null); setKeyword('') }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tra cứu kết quả cư trú</h1>
          <p className="text-sm text-gray-500 mt-1">Nhập CCCD hoặc số điện thoại để tra cứu trạng thái cư trú. Kết quả sẽ trả về nhanh chóng và bảo mật.</p>
        </div>
        <div className="w-20 h-14 bg-red-100 rounded-xl flex items-center justify-center text-3xl select-none">📋</div>
      </div>

      {/* Search */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">CCCD hoặc số điện thoại</label>
        <div className="flex gap-3 items-start">
          <div className="flex-1">
            <input value={keyword}
              onChange={e => { setKeyword(e.target.value); setInputError(''); setSearched(false) }}
              onKeyDown={e => e.key === 'Enter' && !loading && handleSearch()}
              placeholder="ví dụ: 0123456789 hoặc 123456789012"
              className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 ${inputError ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
            <p className="text-xs text-gray-400 mt-1">Vui lòng nhập 9-12 chữ số cho số điện thoại, 12 số cho CCCD.</p>
            {inputError && <p className="text-xs text-red-500 mt-1">⚠ {inputError}</p>}
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <button onClick={handleSearch} disabled={loading || !keyword.trim()}
              className="bg-red-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center gap-2 text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Tra cứu
            </button>
            {loading && (
              <div className="bg-red-300 text-white text-sm font-medium px-6 py-2 rounded-xl text-center">
                Đang xử lý...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Không tìm thấy */}
      {searched && !result && (
        <div className="text-center py-14 text-gray-400">
          <p className="text-base font-medium">Không tìm thấy thông tin</p>
          <p className="text-sm mt-1">Nếu không có kết quả, thử kiểm tra lại định dạng hoặc liên hệ hỗ trợ.</p>
        </div>
      )}

      {/* Chờ duyệt */}
      {searched && result && !ketQua && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 text-center">
          <p className="font-semibold text-yellow-800 text-lg mb-1">⏳ Đang chờ xét duyệt</p>
          <p className="text-sm text-yellow-700">Hồ sơ <strong>{result.ho_ten}</strong> đã được ghi nhận. Quản lý đang xem xét.</p>
        </div>
      )}

      {/* Không đạt */}
      {searched && result && isKhongDat && (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex gap-6">
            <div className="flex-1">
              <p className="text-lg font-bold text-red-700 mb-1">Trạng thái: Không đạt</p>
              <p className="text-sm text-red-600 mb-4">Hồ sơ của bạn chưa đạt yêu cầu kiểm duyệt. Vui lòng xem chi tiết nguyên nhân và các bước đề xuất phía dưới để hoàn thiện hồ sơ.</p>
              <button className="bg-red-500 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-600">Liên hệ hỗ trợ</button>
            </div>
            <div className="bg-white rounded-xl p-4 border border-red-100 min-w-52 text-sm">
              <p className="font-semibold text-gray-800 mb-3">Thông tin chi tiết</p>
              <p className="text-xs text-gray-400 mb-0.5">Mã hồ sơ: <span className="text-gray-700 font-medium">{result.ma_thong_tin}</span></p>
              <div className="flex items-center gap-1 text-gray-600 mt-2 mb-0.5">
                <span>👤</span><span className="text-xs">Họ và tên</span>
              </div>
              <p className="font-medium text-gray-900 mb-2">{result.ho_ten}</p>
              <div className="flex items-center gap-1 text-gray-600 mb-0.5">
                <span>🪪</span><span className="text-xs">CCCD / Số điện thoại</span>
              </div>
              <p className="font-medium text-gray-900">{result.cccd}</p>
            </div>
          </div>

          {ketQua?.chi_tiet_khong_hop_le?.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-gray-900">Lý do</p>
                <span className="text-sm text-gray-400">Tổng: {ketQua.chi_tiet_khong_hop_le.length} nguyên nhân</span>
              </div>
              <p className="text-sm text-gray-500 mb-4">Các nguyên nhân khiến hồ sơ không đạt được liệt kê bên dưới.</p>
              <div className="space-y-2">
                {ketQua.chi_tiet_khong_hop_le.map((c: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                    <span className="text-red-500 mt-0.5 shrink-0">⚠</span>
                    <div>
                      <p className="text-sm text-gray-800">{c.ly_do}</p>
                      {c.truong && <p className="text-xs text-red-500 mt-0.5">Yêu cầu: {c.truong}</p>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex justify-center">
                <button onClick={reset}
                  className="bg-red-500 text-white text-sm font-semibold px-8 py-2.5 rounded-xl hover:bg-red-600">
                  Tra cứu lại
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Đạt */}
      {searched && result && isDat && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">Trạng thái: <span className="text-green-600">Đạt</span></p>
                <p className="text-sm text-gray-500">Hồ sơ của bạn đã được xác nhận đạt nội quy ký túc xá</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={reset}
                className="border border-gray-300 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50">
                Tra cứu lại
              </button>
              <button className="bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-700">
                Xác nhận thuê
              </button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-900">Thông tin chi tiết</h3>
              <p className="text-xs text-gray-400">
                Bản ghi cập nhật: {ketQua?.ngay_duyet ? new Date(ketQua.ngay_duyet).toLocaleString('vi-VN') : '—'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-12 gap-y-5 text-sm">
              <InfoItem label="Họ tên" value={result.ho_ten} />
              <InfoItem label="Ngày cung cấp thông tin" value={result.ngay_cung_cap ? new Date(result.ngay_cung_cap).toLocaleString('vi-VN') : '—'} />
              <InfoItem label="CCCD/SDT" value={result.cccd} />
              <InfoItem label="Mã hồ sơ" value={result.ma_thong_tin} />
              <InfoItem label="Ghi chú liên quan" value={ketQua?.ghi_chu_chung || '—'} />
              <InfoItem label="Người xử lý" value={ketQua?.ma_quan_ly || '—'} />
              <InfoItem label="Trạng thái xử lý" value="Đã phê duyệt" valueClass="text-green-600 font-medium" />
              <InfoItem label="Ngày xác nhận" value={ketQua?.ngay_duyet ? new Date(ketQua.ngay_duyet).toLocaleDateString('vi-VN') : '—'} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function InfoItem({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="border-b border-gray-100 pb-3">
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className={`font-medium text-gray-900 ${valueClass ?? ''}`}>{value || '—'}</p>
    </div>
  )
}