'use client'

import React, { useState, ChangeEvent, FormEvent } from 'react';
import { dangKyThuePhong, findKhachHangByCCCD, RegisterFormData } from '@/lib/services/register_service';

export default function RegisterPage() {
    const [customer, setCustomer] = useState<RegisterFormData>({
        hoTen: '',
        soDienThoai: '',
        email: '',
        cccd: '',
        ngayDuKienVao: '',
        loaiPhongMuonThue: 'PhongDon'
    });

    const [loading, setLoading] = useState<boolean>(false);

    // 1. Hàm xử lý thay đổi Input
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCustomer({ ...customer, [name]: value });
    };

    // 2. Logic Auto-fill khi nhập xong CCCD
    const handleCCCDBlur = async () => {
        if (customer.cccd.length === 12) {
            try {
                const existing = await findKhachHangByCCCD(customer.cccd);
                if (existing) {
                    setCustomer(prev => ({
                        ...prev,
                        hoTen: existing.ten || prev.hoTen,
                        soDienThoai: existing.so_dien_thoai || prev.soDienThoai,
                        email: existing.email || prev.email
                    }));
                    alert("Tui tìm thấy thông tin cũ của ní rồi, đã tự điền giúp ní nhen!");
                }
            } catch (err) {
                console.error("Lỗi tìm kiếm khách hàng:", err);
            }
        }
    };

    // 3. Hàm gửi Form
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await dangKyThuePhong(customer);
            alert(`Xong rồi ní ơi! Đã lưu đơn đăng ký của ${customer.hoTen}.`);
            // Reset form
            setCustomer({
                hoTen: '', soDienThoai: '', email: '', 
                cccd: '', ngayDuKienVao: '', loaiPhongMuonThue: 'PhongDon'
            });
        } catch (error: any) {
            alert("Lỗi lưu dữ liệu: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                <h2 style={titleStyle}>ĐƠN ĐĂNG KÝ THUÊ PHÒNG</h2>
                <p style={subTitleStyle}>Nhập số CCCD để tự động điền thông tin khách cũ</p>
                <hr style={{ margin: '20px 0', opacity: 0.2 }} />

                <form onSubmit={handleSubmit} style={formStyle}>
                    <div>
                        <label style={labelStyle}>Số CCCD/CMND (12 số):</label>
                        <input 
                            type="text" name="cccd" value={customer.cccd} 
                            onChange={handleChange} onBlur={handleCCCDBlur}
                            placeholder="Nhập 12 số CCCD để kiểm tra..."
                            style={inputStyle} required disabled={loading} 
                        />
                    </div>

                    <div style={rowStyle}>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Họ và Tên:</label>
                            <input type="text" name="hoTen" value={customer.hoTen} onChange={handleChange} style={inputStyle} required disabled={loading} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Số điện thoại:</label>
                            <input type="tel" name="soDienThoai" value={customer.soDienThoai} onChange={handleChange} style={inputStyle} required disabled={loading} />
                        </div>
                    </div>

                    <div>
                        <label style={labelStyle}>Email:</label>
                        <input type="email" name="email" value={customer.email} onChange={handleChange} style={inputStyle} disabled={loading} />
                    </div>

                    <div style={rowStyle}>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Ngày dự kiến vào ở:</label>
                            <input type="date" name="ngayDuKienVao" value={customer.ngayDuKienVao} onChange={handleChange} style={inputStyle} disabled={loading} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Loại phòng:</label>
                            <select name="loaiPhongMuonThue" value={customer.loaiPhongMuonThue} onChange={handleChange} style={inputStyle} disabled={loading}>
                                <option value="PhongDon">Phòng Đơn</option>
                                <option value="PhongDoi">Phòng Đôi</option>
                                <option value="PhongGhep">Phòng Ở Ghép</option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} style={loading ? btnDisabledStyle : btnStyle}>
                        {loading ? 'Đang gửi dữ liệu...' : 'Xác nhận Đăng ký'}
                    </button>
                </form>
            </div>
        </div>
    );
}

// --- CSS-in-JS (Style cho đẹp) ---
const containerStyle: React.CSSProperties = { minHeight: '100vh', backgroundColor: '#f4f7f6', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' };
const cardStyle: React.CSSProperties = { backgroundColor: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', maxWidth: '600px', width: '100%' };
const titleStyle: React.CSSProperties = { textAlign: 'center', margin: 0, color: '#2c3e50', fontSize: '24px' };
const subTitleStyle: React.CSSProperties = { textAlign: 'center', fontSize: '13px', color: '#7f8c8d', marginTop: '5px' };
const formStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '20px' };
const rowStyle: React.CSSProperties = { display: 'flex', gap: '20px' };
const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px', color: '#34495e' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #dcdde1', outline: 'none', transition: 'border 0.3s' };
const btnStyle: React.CSSProperties = { marginTop: '10px', padding: '15px', backgroundColor: '#27ae60', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' };
const btnDisabledStyle: React.CSSProperties = { ...btnStyle, backgroundColor: '#95a5a6', cursor: 'not-allowed' };
