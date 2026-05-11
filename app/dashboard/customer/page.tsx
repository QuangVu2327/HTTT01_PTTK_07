import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, CreditCard, ClipboardList, BedDouble, Calendar } from 'lucide-react'
import Link from 'next/link'

export default async function CustomerDashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    // Get KhachHang record
    const { data: khachHang } = await supabase
        .from('KhachHang')
        .select('ma_khach_hang, ten')
        .eq('auth_id', user.id)
        .single()

    // Get active HopDong
    const { data: hopDong } = await supabase
        .from('HopDong')
        .select(`
      ma_hop_dong, ngay_bat_dau, ngay_ket_thuc, trang_thai,
      ChiTietHopDong_Giuong (
        Giuong ( vi_tri_giuong, gia_giuong, Phong ( ma_phong, khu_vuc ) )
      )
    `)
        .eq('ma_khach_hang', khachHang?.ma_khach_hang ?? '')
        .eq('trang_thai', 'Hieu luc')
        .single()

    // Get pending YeuCauThue
    const { data: yeuCau } = await supabase
        .from('YeuCauThue')
        .select('ma_yeu_cau, tinh_trang_don')
        .eq('ma_khach_hang', khachHang?.ma_khach_hang ?? '')
        .eq('tinh_trang_don', 'Cho xu ly')

    // Get unpaid PhieuThu
    const { data: phieuThu } = await supabase
        .from('PhieuThu')
        .select('ma_phieu, gia_tien, ngay, tinh_trang')
        .eq('ma_hop_dong', hopDong?.ma_hop_dong ?? '')
        .eq('tinh_trang', 'Chua thanh toan')

    const phong = hopDong?.ChiTietHopDong_Giuong?.[0]?.Giuong?.Phong
    const giuong = hopDong?.ChiTietHopDong_Giuong?.[0]?.Giuong

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount)

    return (
        <>
            <DashboardHeader breadcrumbs={[{ label: 'Dashboard' }]} />

            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <div className="mt-4">
                    <h1 className="text-2xl font-bold tracking-tight">
                        Xin chào, {khachHang?.ten ?? user.email} 👋
                    </h1>
                    <p className="text-muted-foreground">Thông tin thuê phòng của bạn.</p>
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Hợp đồng</CardTitle>
                            <FileText className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{hopDong ? '1' : '0'}</p>
                            <p className="text-xs text-muted-foreground">{hopDong ? 'Đang hiệu lực' : 'Chưa có hợp đồng'}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Yêu cầu chờ</CardTitle>
                            <ClipboardList className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{yeuCau?.length ?? 0}</p>
                            <p className="text-xs text-muted-foreground">Đang chờ xử lý</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Phiếu thu chưa trả</CardTitle>
                            <CreditCard className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{phieuThu?.length ?? 0}</p>
                            <p className="text-xs text-muted-foreground">
                                {phieuThu && phieuThu.length > 0
                                    ? formatCurrency(phieuThu.reduce((s, p) => s + Number(p.gia_tien), 0))
                                    : 'Không có khoản nợ'}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Current contract */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Phòng hiện tại</CardTitle>
                            <CardDescription>Thông tin hợp đồng đang hiệu lực</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {hopDong ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-4">
                                        <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
                                            <BedDouble className="size-6 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Phòng {phong?.ma_phong} — {giuong?.vi_tri_giuong}</p>
                                            <p className="text-sm text-muted-foreground">{phong?.khu_vuc}</p>
                                        </div>
                                        <Badge className="ml-auto">Hiệu lực</Badge>
                                    </div>
                                    <div className="grid gap-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Ngày bắt đầu</span>
                                            <span>{hopDong.ngay_bat_dau}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Ngày kết thúc</span>
                                            <span>{hopDong.ngay_ket_thuc}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Giá giường</span>
                                            <span className="font-medium">{formatCurrency(Number(giuong?.gia_giuong))}/tháng</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <BedDouble className="mb-4 size-12 text-muted-foreground" />
                                    <p className="font-medium">Chưa có hợp đồng</p>
                                    <p className="text-sm text-muted-foreground mb-4">Tìm phòng và gửi yêu cầu thuê.</p>
                                    <Button asChild><Link href="/dashboard/customer/rooms">Xem phòng trống</Link></Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Thao tác nhanh</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3">
                                <Button variant="outline" className="justify-start h-auto py-3" asChild>
                                    <Link href="/dashboard/customer/rooms">
                                        <BedDouble className="mr-3 size-5" />
                                        <div className="text-left">
                                            <p className="font-medium">Xem phòng trống</p>
                                            <p className="text-xs text-muted-foreground">Tìm và đặt phòng mới</p>
                                        </div>
                                    </Link>
                                </Button>
                                <Button variant="outline" className="justify-start h-auto py-3" asChild>
                                    <Link href="/customer/provide_information">
                                        <ClipboardList className="mr-3 size-5" />
                                        <div className="text-left">
                                            <p className="font-medium">Cung cấp thông tin cư trú</p>
                                            <p className="text-xs text-muted-foreground">Điền thông tin khi nhận phòng</p>
                                        </div>
                                    </Link>
                                </Button>
                                <Button variant="outline" className="justify-start h-auto py-3" asChild>
                                    <Link href="/dashboard/customer/rooms">
                                        <Calendar className="mr-3 size-5" />
                                        <div className="text-left">
                                            <p className="font-medium">Đặt lịch xem phòng</p>
                                            <p className="text-xs text-muted-foreground">Xem trực tiếp trước khi thuê</p>
                                        </div>
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    )
}