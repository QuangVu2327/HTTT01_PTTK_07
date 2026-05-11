'use client';

import React, { useState } from "react";
import { MH_KiemTraThongTinHoanCocService } from "@/lib/services/check_return_deposit";

export default function Page() {
  const [maHopDong, setMaHopDong] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleKiemTra = async () => {
    setLoading(true);
    try {
      const data = await MH_KiemTraThongTinHoanCocService.tinhTienHoanCoc(maHopDong);
      setResult(data);
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleHuy = () => {
    setMaHopDong("");
    setResult(null);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "700px", margin: "auto" }}>
      <h2>Kiểm Tra Thông Tin Hoàn Cọc</h2>

      <div style={{ marginBottom: "10px" }}>
        <label>Mã hợp đồng: </label>
        <input
          type="text"
          value={maHopDong}
          onChange={(e) => setMaHopDong(e.target.value)}
          placeholder="Nhập mã hợp đồng..."
        />
      </div>

      <div style={{ marginBottom: "10px" }}>
        <button onClick={handleKiemTra} disabled={loading}>
          {loading ? "Đang kiểm tra..." : "Kiểm tra"}
        </button>
        <button onClick={handleHuy} style={{ marginLeft: "10px" }}>
          Hủy
        </button>
      </div>

      {result && (
        <div style={{ border: "1px solid #ccc", padding: "10px" }}>
          <p><strong>Mã hợp đồng:</strong> {result.maHopDong}</p>
          <p><strong>Tiền hoàn cọc:</strong> {result.tienHoanCoc}</p>
          <p><strong>Tổng chi phí:</strong> {result.tongChiPhi}</p>
          <p><strong>Thành tiền cuối cùng:</strong> {result.thanhTienCuoiCung}</p>
          <p><strong>Phương thức thanh toán:</strong> {result.phuongThucThanhToan}</p>
          <p><strong>Ghi chú:</strong> {result.ghiChu}</p>
        </div>
      )}
    </div>
  );
}
