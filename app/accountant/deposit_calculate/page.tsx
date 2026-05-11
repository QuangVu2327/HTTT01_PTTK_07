// src/screens/MH_TinhTiLeHoanCoc.tsx
'use client'
import React, { useState, useEffect } from 'react';
import { MH_TinhTiLeHoanCocService } from "@/lib/services/calculate_deposit";

const MH_TinhTiLeHoanCoc: React.FC = () => {
  const [maHopDong, setMaHopDong] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTinhToan = async () => {
    setLoading(true);
    try {
      const data = await MH_TinhTiLeHoanCocService.tinhHoanCoc(maHopDong);
      setResult(data);
    } catch (err: any) {
      alert("Có lỗi xảy ra: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleHuy = () => {
    setMaHopDong("");
    setResult(null);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h2>Màn hình Tính Tỉ Lệ Hoàn Cọc</h2>

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
        <button onClick={handleTinhToan} disabled={loading}>
          {loading ? "Đang tính..." : "Tính toán"}
        </button>
        <button onClick={handleHuy} style={{ marginLeft: "10px" }}>
          Hủy
        </button>
      </div>

      {result && (
        <div style={{ border: "1px solid #ccc", padding: "10px" }}>
          <p><strong>Mã hợp đồng:</strong> {result.maHopDong}</p>
          <p><strong>Mã khách hàng:</strong> {result.maKhachHang}</p>
          <p><strong>Tỉ lệ hoàn cọc:</strong> {result.tyLeHoanCoc}</p>
          <p><strong>Tiền hoàn cọc:</strong> {result.tienHoanCoc}</p>
          <p><strong>Tổng chi phí:</strong> {result.tongChiPhi}</p>
          <p><strong>Thành tiền cuối cùng:</strong> {result.thanhTienCuoiCung}</p>
        </div>
      )}
    </div>
  );
};

export default MH_TinhTiLeHoanCoc;
