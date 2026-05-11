import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard/header'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Building2, BedDouble, MapPin, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default async function CustomerRoomsPage() {
    const supabase = await createClient()

    // Get all rooms with available beds
    const { data: phong } = await supabase
        .from('Phong')
        .select(`
      ma_phong, khu_vuc, suc_chua, gioi_tinh_phong, loai_doi_tuong_phong, trang_thai,
      Giuong ( ma_giuong, vi_tri_giuong, gia_giuong, trang_thai )
    `)
        .eq('trang_thai', 'Con trong')

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount)

    return (
        <>
            <DashboardHeader breadcrumbs={[
                { label: 'Dashboard', href: '/dashboard/customer' },
                { label: 'Phòng trống' },
            ]} />

            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <div className="mt-4">
                    <h1 className="text-2xl font-bold tracking-tight">Phòng đang trống</h1>
                    <p className="text-muted-foreground">Chọn phòng phù hợp và gửi yêu cầu thuê.</p>
                </div>

                {phong && phong.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {phong.map((p) => {
                            const availableBeds = p.Giuong?.filter(g => g.trang_thai === 'San sang') ?? []
                            const lowestPrice = availableBeds.length > 0
                                ? Math.min(...availableBeds.map(g => Number(g.gia_giuong)))
                                : 0

                            return (
                                <Card key={p.ma_phong} className="overflow-hidden">
                                    <div className="aspect-video bg-muted flex items-center justify-center relative">
                                        <BedDouble className="size-12 text-muted-foreground" />
                                        <Badge className="absolute top-2 right-2">
                                            {availableBeds.length} giường trống
                                        </Badge>
                                    </div>
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle>Phòng {p.ma_phong}</CardTitle>
                                                <CardDescription className="flex items-center gap-1 mt-1">
                                                    <MapPin className="size-3" /> {p.khu_vuc}
                                                </CardDescription>
                                            </div>
                                            <Badge variant="secondary">{p.gioi_tinh_phong}</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="size-4" />
                                                <span>Sức chứa: {p.suc_chua} giường</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <BedDouble className="size-4" />
                                                <span>Đối tượng: {p.loai_doi_tuong_phong}</span>
                                            </div>
                                            {lowestPrice > 0 && (
                                                <p className="text-lg font-bold text-primary pt-1">
                                                    Từ {formatCurrency(lowestPrice)}
                                                    <span className="text-sm font-normal text-muted-foreground">/tháng</span>
                                                </p>
                                            )}
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button className="w-full" asChild>
                                            <Link href={`/dashboard/customer/rooms/${p.ma_phong}`}>
                                                Xem chi tiết <ArrowRight className="ml-2 size-4" />
                                            </Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            )
                        })}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <BedDouble className="mb-4 size-12 text-muted-foreground" />
                            <h3 className="text-lg font-medium">Không có phòng trống</h3>
                            <p className="text-sm text-muted-foreground">Hiện tại không có phòng nào đang trống.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    )
}