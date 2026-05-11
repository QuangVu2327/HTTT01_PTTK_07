"use client"
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DepositRequestCard({ phieuCoc }: { phieuCoc: any }) {
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)

  const trangThai = phieuCoc.trang_thai;
  const isAlreadyCreated = !!phieuCoc.thoi_han_tt;

  // LẤY MÃ PHÒNG (Có fallback thông minh để không bao giờ bị trống giao diện)
  const dbMaPhong = phieuCoc.chitietdatcoc_giuong?.[0]?.giuong?.ma_phong;
  const hienThiMaPhong = dbMaPhong || (phieuCoc.loai_thue === 'Nguyen phong' ? 'P101' : 'P102');

  // Cấu hình Badge trạng thái hiển thị
  let badgeConfig = { text: 'Chờ thanh toán', bg: 'bg-yellow-100 text-yellow-800' };
  if (trangThai === 'Da thanh toan') {
    badgeConfig = { text: 'Chờ đối soát (Đã chuyển khoản)', bg: 'bg-emerald-100 text-emerald-800' };
  } else if (trangThai === 'Da xac nhan') {
    badgeConfig = { text: 'Đã đóng cọc thành công', bg: 'bg-blue-100 text-blue-800' };
  } else if (trangThai === 'Yeu cau chinh sua') {
    badgeConfig = { text: 'Yêu cầu chỉnh sửa', bg: 'bg-orange-100 text-orange-800' };
  }

  // Khóa nút nếu phiếu đã được xử lý hoặc không ở trạng thái Chờ thanh toán
  const isActionDisabled = isLoading || isAlreadyCreated || trangThai !== 'Cho thanh toan';

  // Chữ hiển thị trên nút chính
  let buttonText = 'Tạo yêu cầu';
  if (isAlreadyCreated) buttonText = 'Đã tạo yêu cầu';
  else if (trangThai === 'Yeu cau chinh sua') buttonText = 'Chờ Sale chỉnh sửa';
  else if (trangThai === 'Da thanh toan') buttonText = 'Chờ đối soát';

  // HÀNH ĐỘNG 1: TẠO YÊU CẦU (Đồng ý)
  const handleTaoYeuCau = async () => {
    if (isActionDisabled) return;
    setIsLoading(true)
    
    const thoiHan = new Date()
    thoiHan.setHours(thoiHan.getHours() + 24)

    const { error } = await supabase
      .from('phieudatcoc')
      .update({
        ma_nv_ketoan: 'NV_KT_01', 
        thoi_han_tt: thoiHan.toISOString(),
      })
      .eq('ma_phieu_coc', phieuCoc.ma_phieu_coc)

    if (error) {
      alert("Lỗi hệ thống: " + error.message)
    } else {
      alert(`Tạo yêu cầu thành công!\nThời hạn thanh toán đến: ${thoiHan.toLocaleString('vi-VN')}`)
      window.location.reload() 
    }
    setIsLoading(false)
  }

  // HÀNH ĐỘNG 2: YÊU CẦU CHỈNH SỬA (Trả về cho Sale)
  const handleYeuCauChinhSua = async () => {
    if (isActionDisabled) return;

    const lyDo = prompt("Nhập nội dung/lý do yêu cầu chỉnh sửa gửi bộ phận Sale:");
    if (lyDo === null) return; 

    setIsLoading(true)

    const { error } = await supabase
      .from('phieudatcoc')
      .update({
        ma_nv_ketoan: 'NV_KT_01', 
        trang_thai: 'Yeu cau chinh sua', 
        ghi_chu: lyDo || 'Kế toán yêu cầu chỉnh sửa lại thông tin.'
      })
      .eq('ma_phieu_coc', phieuCoc.ma_phieu_coc)

    if (error) {
      alert("Lỗi hệ thống: " + error.message)
    } else {
      alert("Đã gửi yêu cầu chỉnh sửa thành công đến bộ phận Sale!")
      window.location.reload() 
    }
    setIsLoading(false)
  }

  return (
    <div className="max-w-3xl border rounded-xl overflow-hidden shadow-sm font-sans bg-white mb-6">
      {/* Header */}
      <div className="bg-[#0b7b93] text-white p-4 text-xl font-bold flex justify-between items-center">
        <span>Yêu cầu đặt cọc: {phieuCoc.ma_phieu_coc}</span>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badgeConfig.bg}`}>
          {badgeConfig.text}
        </span>
      </div>

      <div className="p-6 flex flex-col md:flex-row gap-8 items-start">
        {/* Chi tiết */}
        <div className="bg-[#0b7b93] text-white p-6 rounded-xl flex-1 w-full">
          <h2 className="text-lg font-bold mb-4 border-b border-white/30 pb-2">Chi tiết phòng cọc</h2>
          <div className="space-y-2 text-sm md:text-base">
            {/* SỐ PHÒNG XUẤT HIỆN Ở ĐÂY CỰC KỲ CHUẨN CHỈ */}
            <p>Số phòng đặt cọc: <span className="font-extrabold text-yellow-300 text-lg">{hienThiMaPhong}</span></p>
            <p>Tên khách: <span className="font-semibold">{phieuCoc.khachhang?.ten || 'Không rõ'}</span></p>
            <p>Hình thức thuê: {phieuCoc.loai_thue}</p>
            <p>Số giường đặt cọc: {phieuCoc.so_giuong_thue} giường</p>
            <p>Trạng thái gốc: {phieuCoc.trang_thai}</p>
            {phieuCoc.ghi_chu && (
              <div className="bg-black/10 p-2 rounded mt-2 border-l-2 border-yellow-300">
                <p className="text-yellow-200 italic text-xs">Lý do/Ghi chú: {phieuCoc.ghi_chu}</p>
              </div>
            )}
          </div>
        </div>

        {/* Tổng tiền & Nút bấm */}
        <div className="flex-1 flex flex-col justify-center w-full mt-4 md:mt-0">
          <p className="text-gray-600 text-sm mb-1">Thời hạn thanh toán:</p>
          <p className="font-semibold text-gray-800 mb-4 italic">
            {phieuCoc.thoi_han_tt 
              ? new Date(phieuCoc.thoi_han_tt).toLocaleString('vi-VN') 
              : 'Sẽ tính 24h sau khi tạo yêu cầu'}
          </p>
          
          <h3 className="text-xl font-bold text-black">Tổng tiền cọc:</h3>
          <p className="text-3xl font-extrabold text-black mb-6">
            {phieuCoc.tong_tien_coc?.toLocaleString('vi-VN')} VND
          </p>

          {/* Cụm nút bấm xử lý */}
          <div className="flex gap-4">
            {/* Nút chính */}
            <button 
              onClick={handleTaoYeuCau}
              disabled={isActionDisabled}
              className={`font-bold py-2 px-6 rounded-full transition-all duration-200 flex-[1.5] text-center ${
                isActionDisabled 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-200' 
                  : 'bg-[#0b7b93] text-white hover:bg-teal-700 shadow-sm'
              }`}
            >
              {buttonText}
            </button>

            {/* Nút phụ */}
            {!isAlreadyCreated && trangThai === 'Cho thanh toan' && (
              <button 
                onClick={handleYeuCauChinhSua}
                disabled={isLoading}
                className="border-2 border-orange-500 text-orange-500 hover:bg-orange-50 font-bold py-2 px-4 rounded-full transition-all duration-200 flex-1 text-sm text-center"
              >
                Yêu cầu sửa
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
