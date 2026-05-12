'use client';

import React, { useEffect, useState } from "react";
import Link from 'next/link';
import { 
  ChevronLeft, 
  ClipboardList, 
  UserCircle, 
  Briefcase, 
  Calendar Days, 
  Tag, 
  CheckCircle2, 
  XCircle, 
  Search,
  ExternalLink
} from 'lucide-react';
import { MH_XemYeuCauThueService } from "@/lib/services/check_form";

export default function SalesPage() {
  const [yeuCauList, setYeuCauList] = useState<any[]>([]);
  const [selectedYeuCau, setSelectedYeuCau] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await MH_XemYeuCauThueService.layDanhSachYeuCau();
        setYeuCauList(data);
      } catch (err: any) {
        alert("Lỗi tải danh sách: " + err.message);
      }
    };
    fetchData();
  }, []);

  const handleChiTiet = async (ma_yeu_cau: string) => {
    setLoading(true);
    try {
      const yc = await MH_XemYeuCauThueService.layThongTinYeuCau(ma_yeu_cau);
      const kh = await MH_XemYeuCauThueService.layThongTinKhachHang(yc.ma_khach_hang);
      const nv = await MH_XemYeuCauThueService.layThongTinNhanVien(yc.ma_nv_kin_doanh);
      setSelectedYeuCau({ ...yc, khachHang: kh, nhanVien: nv });
    } catch (err: any) {
      alert("Lỗi tải chi tiết: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCapNhatTrangThai = async (ma_yeu_cau: string, trang_thai: string) => {
    try {
      await MH_XemYeuCauThueService.capNhatTrangThai(ma_yeu_cau, trang_thai);
      alert(`Sales đã cập nhật trạng thái đơn ${ma_yeu_cau} thành: ${trang_thai}`);
      // Refresh list
      const data = await MH_XemYeuCauThueService.layDanhSachYeuCau();
      setYeuCauList(data);
    } catch (err: any) {
      alert("Lỗi cập nhật: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* 1. Header chuẩn */}
      <div className="border-b border-gray-200 bg-white px-6 py-4 sticky top-0 z-10 shadow-sm">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-600 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Quay về Dashboard
        </Link>
      </div>

      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Khu vực Nhân viên Kinh doanh</h1>
          <p className="text-gray-500 text-sm">Theo dõi và xử lý nhanh các yêu cầu thuê phòng từ khách hàng tiềm năng.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* DANH SÁCH BÊN TRÁI */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-orange-50/50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-bold text-orange-800 flex items-center gap-2">
                <ClipboardList className="h-5 w-5" /> Danh sách yêu cầu
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white border-b border-gray-100">
                    <th className="px-6 py-4 text-left text-gray-400 font-semibold">Mã đơn</th>
                    <th className="px-6 py-4 text-left text-gray-400 font-semibold">Phân loại</th>
                    <th className="px-6 py-4 text-left text-gray-400 font-semibold">Trạng thái</th>
                    <th className="px-6 py-4 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {yeuCauList.map((yc) => (
                    <tr key={yc.ma_yeu_cau} className="group hover:bg-orange-50/30 transition-all">
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-700">{yc.ma_yeu_cau}</span>
                        <div className="text-[10px] text-gray-400 uppercase tracking-widest">{yc.ngay_bat_dau}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-600">{yc.loai_phong}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          yc.tinh_trang === 'Đã duyệt' ? 'bg-green-100 text-green-700' : 
                          yc.tinh_trang === 'Từ chối' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {yc.tinh_trang}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleChiTiet(yc.ma_yeu_cau)}
                          className="text-orange-600 font-bold hover:underline inline-flex items-center gap-1"
                        >
                          Xử lý <ExternalLink className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* CHI TIẾT BÊN PHẢI */}
          <div className="lg:col-span-5">
            {!selectedYeuCau ? (
              <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center h-full flex flex-col items-center justify-center">
                <div className="bg-orange-50 p-4 rounded-full mb-4">
                  <Search className="h-8 w-8 text-orange-300" />
                </div>
                <p className="text-gray-500 font-medium font-mono text-sm uppercase tracking-tighter">Vui lòng chọn 1 đơn hàng</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="p-6 border-b border-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded font-bold uppercase mb-2 inline-block">
                        Dữ liệu chi tiết
                      </span>
                      <h3 className="text-xl font-black text-gray-800 tracking-tight">Đơn: {selectedYeuCau.ma_yeu_cau}</h3>
                    </div>
                    <div className="bg-orange-600 text-white p-3 rounded-xl shadow-lg shadow-orange-200">
                      <Tag className="h-6 w-6" />
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Người liên quan */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1">
                        <UserCircle className="h-3 w-3" /> Khách hàng
                      </p>
                      <p className="text-sm font-bold text-gray-700">{selectedYeuCau.khachHang?.ho_ten || 'N/A'}</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1 justify-end">
                        <Briefcase className="h-3 w-3" /> Sales phụ trách
                      </p>
                      <p className="text-sm font-medium text-gray-600">{selectedYeuCau.nhanVien?.ten || 'Chưa gán'}</p>
                    </div>
                  </div>

                  {/* Thông tin thuê */}
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Loại hình:</span>
                      <span className="text-sm font-bold text-orange-700">{selectedYeuCau.loai_phong}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                      <div className="text-center">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Từ ngày</p>
                        <p className="text-xs font-bold">{selectedYeuCau.ngay_bat_dau}</p>
                      </div>
                      <div className="h-px w-8 bg-gray-300"></div>
                      <div className="text-center">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Đến ngày</p>
                        <p className="text-xs font-bold">{selectedYeuCau.ngay_ket_thuc}</p>
                      </div>
                    </div>
                  </div>

                  {/* Ghi chú */}
                  <div className="space-y-2">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Ghi chú từ Sales:</p>
                    <textarea 
                      className="w-full text-sm p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                      rows={2}
                      defaultValue={selectedYeuCau.ghi_chu}
                      placeholder="Nhập phản hồi cho khách..."
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 flex flex-col gap-3">
                    <button
                      onClick={() => handleCapNhatTrangThai(selectedYeuCau.ma_yeu_cau, "Đã duyệt")}
                      className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-orange-600 transition-all active:scale-95 shadow-lg shadow-gray-200"
                    >
                      <CheckCircle2 className="h-5 w-5" /> Chấp thuận & Gửi thông báo
                    </button>
                    <button
                      onClick={() => handleCapNhatTrangThai(selectedYeuCau.ma_yeu_cau, "Từ chối")}
                      className="w-full bg-white text-gray-400 py-4 rounded-2xl font-bold border border-gray-200 hover:text-red-600 hover:border-red-100 transition-all"
                    >
                      <XCircle className="h-5 w-5 mr-2 inline" /> Từ chối đơn này
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
