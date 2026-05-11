"use client"
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DepositRequestCard({ phieuCoc }: { phieuCoc: any }) {
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)

  // Kiểm tra xem phiếu này đã được tạo yêu cầu thanh toán chưa
  const isAlreadyCreated = !!phieuCoc.thoi_han_tt;

  const handleTaoYeuCau = async () => {
    // Nếu đã tạo rồi thì không cho chạy tiếp phòng trường hợp bypass qua code client
    if (isAlreadyCreated) return;

    setIsLoading(true)
    
    // Tính hạn thanh toán 24h
    const thoiHan = new Date()
    thoiHan.setHours(thoiHan.getHours() + 24)

    // Cập nhật DB
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
      window.location.reload() // Reload trang để lock nút lại ngay lập tức
    }
    setIsLoading(false)
  }

  return (
    <div className="max-w-3xl border rounded-xl overflow-hidden shadow-sm font-sans bg-white mb-6">
      {/* Header */}
      <div className="bg-[#0b7b93] text-white p-4 text-xl font-bold">
        Yêu cầu đặt cọc: {phieuCoc.ma_phieu_coc}
      </div>

      <div className="p-6 flex flex-col md:flex-row gap-8 items-start">
        {/* Chi tiết */}
        <div className="bg-[#0b7b93] text-white p-6 rounded-xl flex-1 w-full">
          <h2 className="text-lg font-bold mb-4 border-b border-white/30 pb-2">Chi tiết phòng cọc</h2>
          <div className="space-y-2 text-sm md:text-base">
            <p>Tên khách: <span className="font-semibold">{phieuCoc.khachhang?.ten || 'Không rõ'}</span></p>
            <p>Hình thức thuê: {phieuCoc.loai_thue}</p>
            <p>Số giường: {phieuCoc.so_giuong_thue}</p>
            <p>Trạng thái: {phieuCoc.trang_thai}</p>
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

          <div className="flex justify-start">
            <button 
              onClick={handleTaoYeuCau}
              disabled={isLoading || isAlreadyCreated} // Khóa nút nếu đang load hoặc đã tạo
              className={`font-bold py-2 px-6 rounded-full transition-all duration-200 ${
                isAlreadyCreated 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed border border-gray-300' 
                  : 'bg-[#0b7b93] text-white hover:bg-teal-700'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Đang xử lý...' : isAlreadyCreated ? 'Đã tạo yêu cầu' : 'Tạo yêu cầu'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}