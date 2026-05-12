'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Calculator, RotateCcw, FileText, BadgeDollarSign } from 'lucide-react';
import { MH_TinhTiLeHoanCocService } from "@/lib/services/calculate_deposit";

const MH_TinhTiLeHoanCoc: React.FC = () => {
  const [maHopDong, setMaHopDong] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTinhToan = async () => {
    if (!maHopDong) {
      alert("Ní ơi, nhập mã hợp đồng giúp tui với!");
      return;
    }
    setLoading(true);
    try {
      const data = await MH_TinhTiLeHoanCocService.tinhHoanCoc(maHopDong);
      setResult(data);
    } catch (err: any) {
      alert("Có lỗi xảy ra rồi ní ui: " + err.message);
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
      {/* 1. Header giống mẫu Accountant */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Quay về Dashboard
        </Link>
      </div>

      <div className="p-6 md:p-10 max-w-4xl mx-auto">
        {/* 2. Tiêu đề trang */}
        <h1 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-4">
          Hệ thống Tính toán Hoàn cọc
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* CỘT TRÁI: Form nhập liệu */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                Thông tin hợp đồng
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mã hợp đồng</label>
                  <input
                    type="text"
                    value={maHopDong}
                    onChange={(e) => setMaHopDong(e.target.value)}
                    placeholder="VD: HD001..."
                    className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <button 
                    onClick={handleTinhToan} 
                    disabled={loading}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-white transition-all ${
                      loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 shadow-md'
                    }`}
                  >
                    <Calculator className="h-4 w-4" />
                    {loading ? "Đang tính..." : "Tính toán"}
                  </button>
                  
                  <button 
                    onClick={handleHuy}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Làm mới
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: Kết quả (Hiển thị kiểu Card giống Accountant) */}
          <div className="lg:col-span-2">
            {!result ? (
              <div className="h-full flex flex-col items-center justify-center p-10 border-2 border-dashed border-gray-200 rounded-xl bg-white text-gray-400">
                <Calculator className="h-12 w-12 mb-2 opacity-20" />
                <p>Nhập mã và bấm tính toán để xem kết quả ní nhen!</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
                  <h2 className="text-blue-800 font-bold flex items-center gap-2">
                    <BadgeDollarSign className="h-5 w-5" />
                    KẾT QUẢ TÍNH TOÁN CHI TIẾT
                  </h2>
                </div>
                
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Mã hợp đồng</p>
                      <p className="text-lg font-bold text-gray-800">{result.maHopDong}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Mã khách hàng</p>
                      <p className="text-gray-700">{result.maKhachHang}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-600">Tỉ lệ hoàn cọc:</span>
                      <span className="font-bold text-emerald-600">{result.tyLeHoanCoc}%</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-600">Tiền hoàn cọc:</span>
                      <span className="font-semibold">{result.tienHoanCoc?.toLocaleString()} VNĐ</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-600">Tổng chi phí:</span>
                      <span className="font-semibold text-red-500">-{result.tongChiPhi?.toLocaleString()} VNĐ</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-gray-800 font-bold uppercase text-sm">Thành tiền:</span>
                      <span className="text-xl font-extrabold text-blue-700">
                        {result.thanhTienCuoiCung?.toLocaleString()} VNĐ
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 text-right">
                  <p className="text-xs text-gray-400 italic">* Dữ liệu được tính toán dựa trên quy định hoàn cọc năm 2026</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MH_TinhTiLeHoanCoc;
