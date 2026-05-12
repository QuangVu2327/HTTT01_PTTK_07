'use client';

import React, { useState } from "react";
import Link from 'next/link';
import { ChevronLeft, ShieldCheck, XCircle, CheckCircle2, Info, Banknote } from 'lucide-react';
import { MH_XacNhanHoanCocService } from "@/lib/services/confirm_deposit_return";

export default function Page() {
  const [maHopDong, setMaHopDong] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleXacNhan = async () => {
    if (!maHopDong) {
      alert("Lỗi, yêu cầu nhập mã hợp đồng!");
      return;
    }
    
    setLoading(true);
    try {
      // Tính toán lại trước khi xác nhận để đảm bảo con số chính xác
      const data = await MH_XacNhanHoanCocService.tinhToanHoanCoc(maHopDong);
      setResult(data);
      
      // Gọi lệnh cập nhật trạng thái
      await MH_XacNhanHoanCocService.capNhatPhieu(maHopDong, "Đã hoàn cọc");
      alert("Xác nhận hoàn cọc thành công! Hệ thống đã cập nhật trạng thái.");
    } catch (err: any) {
      alert("Có lỗi xảy ra: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleHuyBo = () => {
    setMaHopDong("");
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header chuẩn Dashboard giống  */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Quay về Dashboard
        </Link>
      </div>

      <div className="p-6 md:p-10 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-4 flex items-center gap-3">
          Xác Nhận Hoàn Tất Hoàn Cọc
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* CỘT TRÁI: Bảng điều khiển */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-indigo-700">
                <ShieldCheck className="h-5 w-5" />
                Thao tác hệ thống
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Mã hợp đồng cần chốt</label>
                  <input
                    type="text"
                    value={maHopDong}
                    onChange={(e) => setMaHopDong(e.target.value)}
                    placeholder="Nhập mã hợp đồng..."
                    className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleXacNhan} 
                    disabled={loading}
                    className={`flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-white transition-all shadow-md ${
                      loading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
                    }`}
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    {loading ? "Đang xử lý..." : "Xác nhận hoàn cọc"}
                  </button>
                  
                  <button 
                    onClick={handleHuyBo}
                    className="flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-all"
                  >
                    <XCircle className="h-4 w-4" />
                    Hủy bỏ thao tác
                  </button>
                </div>
              </div>

              <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-100">
                <p className="text-xs text-amber-700 flex gap-2">
                  <Info className="h-4 w-4 shrink-0" />
                  Lưu ý: Thao tác này sẽ cập nhật trạng thái phiếu thành "Đã hoàn cọc" và không thể hoàn tác.
                </p>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: Chi tiết phiếu đã chốt */}
          <div className="lg:col-span-2">
            {!result ? (
              <div className="h-full min-h-[350px] flex flex-col items-center justify-center p-10 border-2 border-dashed border-gray-200 rounded-xl bg-white text-gray-400">
                <Banknote className="h-16 w-16 mb-4 opacity-10" />
                <p>Vui lòng nhập mã hợp đồng và bấm xác nhận.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg border border-indigo-100 overflow-hidden">
                <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center text-white">
                  <div>
                    <h2 className="font-bold text-lg flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-indigo-200" />
                      CHỨNG TỪ HOÀN TẤT
                    </h2>
                    <p className="text-xs text-indigo-200 uppercase mt-1">Mã số: {result.maHopDong}</p>
                  </div>
                  <div className="text-right">
                    <span className="bg-indigo-500 px-3 py-1 rounded-full text-xs font-bold border border-indigo-400">
                      STATUS: SUCCESS
                    </span>
                  </div>
                </div>
                
                <div className="p-8">
                  <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                      <p className="text-gray-400 text-xs uppercase font-bold mb-2">Thông tin tài chính</p>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Tỉ lệ hoàn:</span>
                          <span className="font-bold">{result.tyLeHoanCoc}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Tiền cọc gốc:</span>
                          <span className="font-semibold">{result.tienHoanCoc?.toLocaleString()} VNĐ</span>
                        </div>
                        <div className="flex justify-between text-sm text-red-500">
                          <span>Chi phí khấu trừ:</span>
                          <span>-{result.tongChiPhi?.toLocaleString()} VNĐ</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-indigo-50 p-5 rounded-2xl flex flex-col justify-center items-center border border-indigo-100">
                      <p className="text-indigo-600 text-xs uppercase font-black mb-1">Số tiền đã thực chi</p>
                      <p className="text-3xl font-black text-indigo-900">
                        {result.thanhTienCuoiCung?.toLocaleString()}
                      </p>
                      <p className="text-xs text-indigo-700 font-bold">VNĐ</p>
                    </div>
                  </div>

                  <div className="space-y-4 border-t border-gray-100 pt-6">
                    <div className="flex items-start gap-4">
                      <div className="w-1/3 text-sm font-bold text-gray-500">Phương thức:</div>
                      <div className="w-2/3 text-sm text-gray-800 font-medium bg-gray-50 px-3 py-1 rounded-md border border-gray-100">
                        {result.phuongThucThanhToan}
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-1/3 text-sm font-bold text-gray-500">Ghi chú xác nhận:</div>
                      <div className="w-2/3 text-sm text-gray-600 italic">
                        {result.ghiChu || "Hệ thống tự động ghi nhận hoàn cọc."}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 px-6 py-3 flex justify-between items-center">
                  <span className="text-[10px] text-gray-400 font-mono">AUTHCODE: CONFIRM-2026-XNC</span>
                  <span className="text-[10px] text-gray-400 font-mono">{new Date().toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
