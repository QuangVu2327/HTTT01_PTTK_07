import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ChevronRight, Mail, BedDouble, MapPin, User, ArrowRight } from 'lucide-react'

export default async function PickContractPage() {
    const supabase = await createClient()

    const { data: hopDongs } = await supabase
        .from('hopdong')
        .select(`
            ma_hop_dong,
            ngay_bat_dau,
            ngay_ket_thuc,
            ky_thanh_toan,
            khachhang ( ten, email ),
            chitiethopdong_giuong (
                giuong ( vi_tri_giuong, phong ( ma_phong, khu_vuc ) )
            )
        `)
        .eq('trang_thai', 'Hieu luc')
        .order('ngay_bat_dau', { ascending: false })

    return (
        <>
            <div className="border-b border-gray-200 bg-white px-6 py-4">
                <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Link href="/dashboard" className="hover:text-gray-900 transition-colors">
                        Dashboard
                    </Link>
                    <ChevronRight className="h-3.5 w-3.5" />
                    <span className="text-gray-900 font-medium">Chọn hợp đồng</span>
                </div>
            </div>

            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <div className="mt-4">
                    <h1 className="text-2xl font-bold tracking-tight">Chọn hợp đồng</h1>
                    <p className="text-muted-foreground">
                        Chọn hợp đồng đang hiệu lực để gửi email cho khách hàng.
                    </p>
                </div>

                {hopDongs && hopDongs.length > 0 ? (
                    <div className="grid gap-3">
                        {hopDongs.map((hd) => {
                            const giuong = hd.chitiethopdong_giuong?.[0]?.giuong
                            const phong = giuong?.phong

                            return (
                                <Link
                                    key={hd.ma_hop_dong}
                                    href={`/dashboard/manager/email?bookingId=${hd.ma_hop_dong}`}
                                    className="group flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5 hover:border-gray-400 hover:shadow-md transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 group-hover:bg-black transition-colors">
                                            <Mail className="h-5 w-5 text-gray-500 group-hover:text-white transition-colors" />
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-gray-900">
                                                    {hd.ma_hop_dong}
                                                </span>
                                                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                                                    Hiệu lực
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <User className="h-3.5 w-3.5" />
                                                    {hd.khachhang?.ten ?? '—'}
                                                </span>
                                                {phong && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="h-3.5 w-3.5" />
                                                        Phòng {phong.ma_phong} — {phong.khu_vuc}
                                                    </span>
                                                )}
                                                {giuong && (
                                                    <span className="flex items-center gap-1">
                                                        <BedDouble className="h-3.5 w-3.5" />
                                                        {giuong.vi_tri_giuong}
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-xs text-gray-400">
                                                {hd.ngay_bat_dau} → {hd.ngay_ket_thuc} · {hd.ky_thanh_toan}
                                            </p>
                                        </div>
                                    </div>

                                    <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-gray-700 transition-colors shrink-0" />
                                </Link>
                            )
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 py-16 text-center">
                        <Mail className="mb-4 h-12 w-12 text-gray-300" />
                        <p className="font-medium text-gray-600">Không có hợp đồng hiệu lực</p>
                        <p className="text-sm text-gray-400">Chưa có hợp đồng nào đang hoạt động.</p>
                    </div>
                )}
            </div>
        </>
    )
}