'use client';

import React, { useEffect, useState } from "react";
import { MH_XemYeuCauThueService } from "@/lib/services/check_form";

export default function Page() {
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
      const nv = await MH_XemYeuCauThueService.layThongTinNhanVien(yc.ma_nv_kinh_doanh);
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
      alert("Cập nhật trạng thái thành công!");
    } catch (err: any) {
      alert("Lỗi cập nhật: " + err.message);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
      <h2>Xem Yêu Cầu Thuê Giường Phòng</h2>

      <table border={1} cellPadding={5} style={{ width: "100%", marginBottom: "20px" }}>
        <thead>
          <tr>
            <th>Mã yêu cầu</th>
            <th>Loại phòng</th>
            <th>Ngày bắt đầu</th>
            <th>Ngày kết thúc</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {yeuCauList.map((yc) => (
            <tr key={yc.ma_yeu_cau}>
              <td>{yc.ma_yeu_cau}</td>
              <td>{yc.loai_phong}</td>
              <td>{yc.ngay_bat_dau}</td>
              <td>{yc.ngay_ket_thuc}</td>
              <td>{yc.tinh_trang}</td>
              <td>
                <button onClick={() => handleChiTiet(yc.ma_yeu_cau)}>Chi tiết</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedYeuCau && (
        <div style={{ border: "1px solid #ccc", padding: "10px" }}>
          <h3>Chi tiết yêu cầu</h3>
          <p><strong>Mã yêu cầu:</strong> {selectedYeuCau.ma_yeu_cau}</p>
          <p><strong>Khách hàng:</strong> {selectedYeuCau.khachHang?.ho_ten}</p>
          <p><strong>Nhân viên kinh doanh:</strong> {selectedYeuCau.nhanVien?.ten}</p>
          <p><strong>Loại phòng:</strong> {selectedYeuCau.loai_phong}</p>
          <p><strong>Số lượng:</strong> {selectedYeuCau.so_luong}</p>
          <p><strong>Ngày bắt đầu:</strong> {selectedYeuCau.ngay_bat_dau}</p>
          <p><strong>Ngày kết thúc:</strong> {selectedYeuCau.ngay_ket_thuc}</p>
          <p><strong>Ghi chú:</strong> {selectedYeuCau.ghi_chu}</p>
          <p><strong>Trạng thái:</strong> {selectedYeuCau.tinh_trang}</p>

          <button
            onClick={() => handleCapNhatTrangThai(selectedYeuCau.ma_yeu_cau, "Đã duyệt")}
            style={{ marginRight: "10px" }}
          >
            Duyệt yêu cầu
          </button>
          <button onClick={() => handleCapNhatTrangThai(selectedYeuCau.ma_yeu_cau, "Từ chối")}>
            Từ chối
          </button>
        </div>
      )}
    </div>
  );
}
