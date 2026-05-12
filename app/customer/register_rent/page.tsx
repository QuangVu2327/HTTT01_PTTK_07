'use client'

import React, { useState, ChangeEvent, FormEvent } from 'react';
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
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

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCustomer({ ...customer, [name]: value });
    };

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

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await dangKyThuePhong(customer);
            alert(`Xong rồi ní ơi! Đã lưu đơn đăng ký của ${customer.hoTen}.`);
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
        <div className="min-h-screen bg-gray-50">
            {/* Header giống hệt bài bạn của ní */}
            <div className="border-b border-gray-200 bg-white px-6 py-4">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Quay về Dashboard
                </Link>
            </div>

            {/* Nội dung chính */}
            <div className="flex justify-center items-center py-10 px-4">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-2xl w-full">
                    <div className="mb-8 text-center">
                        <h2 className="text-2xl font-bold text-gray-800">ĐƠN ĐĂNG KÝ THUÊ PHÒNG</h2>
                        <p className="text-sm text-gray-500 mt-2">Nhập số CCCD để tự động điền thông tin khách cũ</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* CCCD Field */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Số CCCD/CMND (12 số):</label>
                            <input 
                                type="text" name="cccd" value={customer.cccd} 
                                onChange={handleChange} onBlur={handleCCCDBlur}
                                placeholder="Nhập 12 số CCCD để kiểm tra..."
                                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                required disabled={loading} 
                            />
                        </div>

                        {/* Row: Họ tên & SĐT */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Họ và Tên:</label>
                                <input type="text" name="hoTen" value={customer.hoTen} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" required disabled={loading} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại:</label>
                                <input type="tel" name="soDienThoai" value={customer.soDienThoai} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" required disabled={loading} />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email:</label>
                            <input type="email" name="email" value={customer.email} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" disabled={loading} />
                        </div>

                        {/* Row: Ngày & Loại phòng */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Ngày dự kiến vào ở:</label>
                                <input type="date" name="ngayDuKienVao" value={customer.ngayDuKienVao} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" disabled={loading} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Loại phòng:</label>
                                <select name="loaiPhongMuonThue" value={customer.loaiPhongMuonThue} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" disabled={loading}>
                                    <option value="PhongDon">Phòng Đơn</option>
                                    <option value="PhongDoi">Phòng Đôi</option>
                                    <option value="PhongGhep">Phòng Ở Ghép</option>
                                </select>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading} 
                            className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
                                loading 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg'
                            }`}
                        >
                            {loading ? 'Đang gửi dữ liệu...' : 'Xác nhận Đăng ký'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
