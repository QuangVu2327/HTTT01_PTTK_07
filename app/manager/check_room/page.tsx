'use client';

import React, { useEffect, useState } from "react";
import Link from 'next/link';
import { 
  ChevronLeft, 
  ListChecks, 
  User, 
  Calendar, 
  Info, 
  CheckCircle, 
  XCircle, 
  Eye, 
  ArrowRight 
} from 'lucide-react';
import { MH_XemYeuCauThueService } from "@/lib/services/check_form";

export default function ManagerPage() {
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
      alert(`Đã cập nhật trạng thái: ${trang_thai}`);
      // Refresh lại danh sách sau khi cập nhật
      const data = await MH_XemYeuCauThueService.layDanhSachYeuCau();
      setYeuCauList(data);
      if (selectedYeuCau?.ma_yeu_cau === ma_yeu_cau) {
        setSelectedYeuCau(null); // Đóng panel chi tiết
      }
    } catch (err: any) {
      alert("Lỗi cập nhật: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* 1. Header chuẩn */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Quay về Dashboard
        </Link>
      </div>

      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Xét Duyệt Yêu Cầu Thuê</h1>
            <p className="text-gray-500 mt-1 text-sm italic">Quản lý và phê duyệt các đơn đăng ký thuê phòng từ khách hàng.</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 flex items-center gap-2 text-sm font-medium shadow-sm">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            Tổng số: {yeuCauList.length} yêu cầu
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* CỘT TRÁI: DANH SÁCH (8 columns) */}
          <div className="xl:col-span-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4">Mã đơn</th>
                    <th className="px-6 py-4">Loại phòng</th>
                    <th className="px-6 py-4">Thời gian</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {yeuCauList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-gray-400 italic">Hiện không có yêu cầu nào cần duyệt.</td>
                    </tr>
                  ) : (
                    yeuCauList.map((yc) => (
                      <tr 
                        key={yc.ma_yeu_cau} 
                        className={`hover:bg-blue-50/50 transition-colors ${selectedYeuCau?.ma_yeu_cau === yc.ma_yeu_cau ? 'bg-blue-50' : ''}`}
                      >
                        <td className="px-6 py-4 font-mono font-bold text-gray-700">{yc.ma_yeu_cau}</td>
                        <td className="px-6 py-4 text-sm font-medium">{yc.loai_phong}</td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-gray-600">Bắt đầu: {yc.ngay_bat_dau}</div>
                          <div className="text-xs text-gray-400">Kết thúc: {yc.ngay_ket_thuc}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                            yc.tinh_trang === 'Đã duyệt' ? 'bg-emerald-100 text-emerald-700' : 
                            yc.tinh_trang === 'Từ chối' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {yc.tinh_trang}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => handleChiTiet(yc.ma_yeu_cau)}
                            className="p-2 hover:bg-white rounded-full text-blue-600 hover:shadow-sm border border-transparent hover:border-blue-200 transition-all"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* CỘT PHẢI: CHI TIẾT & ACTION (4 columns) */}
          <div className="xl:col-span-4">
            {!selectedYeuCau ? (
              <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-8 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
                <ListChecks className="h-12 w-12 text-gray-200 mb-3" />
                <p className="text-gray-400 text-sm">Chọn một yêu cầu để xem chi tiết<br/>và thực hiện xét duyệt</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md border border-blue-100 overflow-hidden flex flex-col sticky top-6">
                <div className="bg-blue-600 px-6 py-4 text-white">
                  <h3 className="font-bold flex items-center gap-2 uppercase tracking-wide">
                    <Info className="h-4 w-4" /> Chi tiết xét duyệt
                  </h3>
                </div>

                <div className="p-6 space-y-5 flex-grow overflow-y-auto max-h-[60vh]">
                  {/* Info Blocks */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase">Khách hàng</p>
                        <p className="font-bold text-gray-800">{selectedYeuCau.khachHang?.ho_ten || 'Chưa cập nhật'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase">Thời gian thuê</p>
                        <p className="text-sm font-medium flex items-center gap-2">
                          {selectedYeuCau.ngay_bat_dau} <ArrowRight className="h-3 w-3" /> {selectedYeuCau.ngay_ket_thuc}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Loại phòng:</span>
                        <span className="font-bold">{selectedYeuCau.loai_phong}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Số lượng giường:</span>
                        <span className="font-bold">{selectedYeuCau.so_luong}</span>
                      </div>
                      <div className="border-t border-gray-200 pt-2 mt-2">
                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">NV Kinh Doanh:</p>
                        <p className="text-sm italic">{selectedYeuCau.nhanVien?.ten || 'N/A'}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase mb-1">Ghi chú yêu cầu:</p>
                      <p className="text-sm text-gray-600 bg-amber-50 p-3 rounded-lg border border-amber-100 italic">
                        "{selectedYeuCau.ghi_chu || 'Không có ghi chú thêm.'}"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-gray-50 border-t border-gray-100 grid grid-cols-2 gap-3">
                  <button
                    disabled={loading}
                    onClick={() => handleCapNhatTrangThai(selectedYeuCau.ma_yeu_cau, "Đã duyệt")}
                    className="flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
                  >
                    <CheckCircle className="h-4 w-4" /> Duyệt
                  </button>
                  <button
                    disabled={loading}
                    onClick={() => handleCapNhatTrangThai(selectedYeuCau.ma_yeu_cau, "Từ chối")}
                    className="flex items-center justify-center gap-2 py-3 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-lg font-bold transition-all active:scale-95 disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" /> Từ chối
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
