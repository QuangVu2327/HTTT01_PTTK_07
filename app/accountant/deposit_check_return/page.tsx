'use client';

import React, { useState } from "react";
import Link from 'next/link';
import { ChevronLeft, Search, RotateCcw, ClipboardCheck, Wallet } from 'lucide-react';
import { MH_KiemTraThongTinHoanCocService } from "@/lib/services/check_return_deposit";

export default function Page() {
  const [maHopDong, setMaHopDong] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleKiemTra = async () => {
    if (!maHopDong) {
      alert("Ní quên nhập mã hợp đồng kìa!");
      return;
    }
    setLoading(true);
    try {
      const data = await MH_KiemTraThongTinHoanCocService.tinhTienHoanCoc(maHopDong);
      setResult(data);
    } catch (err: any) {
      alert("Lỗi rồi ní ơi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleHuy = () => {
    setMaHopDong("");
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 1. Header chuẩn Dashboard */}
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
        {/* 2. Tiêu đề chính */}
        <h1 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-4">
          Kiểm Tra Thông Tin Hoàn Cọc
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* CỘT TRÁI: Nhập mã */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-700">
                <Search className="h-5 w-5 text-emerald-500" />
                Tra cứu hợp đồng
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Mã hợp đồng</label>
                  <input
                    type="text"
                    value={maHopDong}
                    onChange={(e) => setMaHopDong(e.target.value)}
                    placeholder="VD: HD123456..."
                    className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={handleKiemTra} 
                    disabled={loading}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-white transition-all ${
                      loading ? 'bg-gray-400' : 'bg-emerald-600 hover:bg-emerald-700 shadow-sm'
                    }`}
                  >
                    {loading ? "Chờ tẹo..." : "Kiểm tra"}
                  </button>
                  
                  <button 
                    onClick={handleHuy}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: Hiển thị kết quả */}
          <div className="lg:col-span-2">
            {!result ? (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-10 border-2 border-dashed border-gray-200 rounded-xl bg-white text-gray-400">
                <ClipboardCheck className="h-16 w-16 mb-4 opacity-10" />
                <p className="text-center">Chưa có dữ liệu tra cứu.<br/>Ní nhập mã hợp đồng bên trái nhen!</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100 flex justify-between items-center">
                  <h2 className="text-emerald-800 font-bold flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    THÔNG TIN CHI TIẾT HOÀN CỌC
                  </h2>
                  <span className="text-xs bg-emerald-200 text-emerald-800 px-2 py-1 rounded-full font-bold">
                    Hợp đồng: {result.maHopDong}
                  </span>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Bảng giá tiền */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-500 uppercase font-bold mb-1">Tiền hoàn cọc dự kiến</p>
                      <p className="text-xl font-bold text-gray-800">{result.tienHoanCoc?.toLocaleString()} VNĐ</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                      <p className="text-xs text-red-400 uppercase font-bold mb-1">Tổng chi phí khấu trừ</p>
                      <p className="text-xl font-bold text-red-600">-{result.tongChiPhi?.toLocaleString()} VNĐ</p>
                    </div>
                  </div>

                  {/* Tổng kết cuối cùng */}
                  <div className="border-t border-b border-gray-100 py-4 flex justify-between items-center">
                    <span className="text-gray-700 font-medium italic">Thành tiền cuối cùng thực nhận:</span>
                    <span className="text-2xl font-black text-emerald-700">
                      {result.thanhTienCuoiCung?.toLocaleString()} VNĐ
                    </span>
                  </div>

                  {/* Thông tin thêm */}
                  <div className="space-y-3">
                    <div className="flex gap-2 text-sm">
                      <span className="text-gray-500 font-semibold w-32">Phương thức:</span>
                      <span className="text-gray-800 bg-gray-100 px-2 py-0.5 rounded">{result.phuongThucThanhToan}</span>
                    </div>
                    <div className="flex gap-2 text-sm">
                      <span className="text-gray-500 font-semibold w-32">Ghi chú:</span>
                      <span className="text-gray-600 leading-relaxed">{result.ghiChu || "Không có ghi chú thêm."}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-6 py-3 text-center text-[11px] text-gray-400 uppercase tracking-widest">
                  Xác nhận bởi Hệ thống Quản lý Ký túc xá - 2026
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
