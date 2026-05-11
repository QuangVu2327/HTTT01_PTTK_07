import { createClient } from '@/lib/supabase/server' 
import DepositRequestCard from '@/components/accountant/DepositRequestCard'

export default async function DepositRequestsPage() {
  // THÊM CHỮ "await" Ở ĐÂY NÈ:
  const supabase = await createClient() 
  
  // Lấy dữ liệu từ bảng PhieuDatCoc ghép với bảng KhachHang
  const { data: danhSachPhieu, error } = await supabase
    .from('phieudatcoc')
    .select('*, khachhang(ten)')
    .eq('trang_thai', 'Cho thanh toan')
    .order('ngay_tao', { ascending: false })

  if (error) {
    return <div className="p-10 text-red-500">Lỗi tải dữ liệu: {error.message}</div>
  }

  return (
    <div className="p-10 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-4">
        Danh sách chờ tạo yêu cầu thanh toán
      </h1>
      
      {!danhSachPhieu || danhSachPhieu.length === 0 ? (
        <p className="text-gray-500 italic">Hiện không có phiếu đặt cọc nào chờ xử lý.</p>
      ) : (
        <div className="space-y-6">
          {danhSachPhieu.map((phieu) => (
            <DepositRequestCard key={phieu.ma_phieu_coc} phieuCoc={phieu} />
          ))}
        </div>
      )}
    </div>
  )
}