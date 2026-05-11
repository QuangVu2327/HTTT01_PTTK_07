'use client'

import { useState } from 'react'
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { CheckCircle2, BedDouble, MapPin, Users, Banknote } from 'lucide-react'

import { KhachHang, RoomDisplay } from '../types'
import { formatCurrency, statusLabel, statusVariant } from '../lib/utils'

interface Props {
  room: RoomDisplay
  customer: KhachHang | null
}

export default function IntroPage({ room, customer }: Props) {
  const [questions, setQuestions] = useState('')
  const [decision,  setDecision]  = useState<'deposit' | 'more' | 'no' | ''>('')
  const [done,      setDone]      = useState(false)
  const [error,     setError]     = useState('')

  const handleFinish = () => {
    if (!decision) {
      setError('Vui lòng chọn quyết định của khách hàng')
      return
    }
    setDone(true)
  }

  if (done) {
    return (
      <div className="max-w-md mx-auto text-center space-y-6 py-12">
        <div className="flex justify-center">
          <CheckCircle2 className="size-16 text-green-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Giới thiệu phòng hoàn tất</h2>
          <p className="text-muted-foreground mt-1">
            {decision === 'deposit'
              ? 'Khách đồng ý đặt cọc – chuyển sang bước tiếp theo'
              : decision === 'more'
              ? 'Khách muốn xem thêm phòng khác'
              : 'Khách chưa có nhu cầu thuê'}
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => window.location.href = '/sales'}
          >
            ← Quay lại tìm kiếm
          </Button>
          {decision === 'deposit' && (
            <Button>
              Đặt cọc phòng →
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold">Quy trình thăm phòng</h1>

      {/* Thông tin khách */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Thông tin khách
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
              {customer?.ten?.charAt(0) ?? 'K'}
            </div>
            <div>
              <p className="font-semibold">
                {customer?.ten ?? '—'}
              </p>
              <p className="text-sm text-muted-foreground">
                {customer?.so_dien_thoai ?? '—'}
              </p>
            </div>
            {customer?.gioi_tinh && (
              <Badge variant="outline" className="ml-auto">
                {customer.gioi_tinh}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Yêu cầu của khách */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Yêu cầu của khách
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="min-h-[80px] rounded-md border bg-muted/30 p-3 text-sm">
            {/* In a real app this comes from YeuCauThue.yeu_cau_khac */}
            <span className="text-muted-foreground font-bold text-xl">None</span>
          </div>
        </CardContent>
      </Card>

      {/* Thông tin phòng — from Phong + Giuong tables */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Thông tin phòng
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Room header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold">{room.ma_phong}</h2>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <MapPin className="size-3" />
                {room.khu_vuc}
              </div>
            </div>
            <Badge variant={statusVariant(room.trang_thai)}>
              {statusLabel(room.trang_thai)}
            </Badge>
          </div>

          {/* Room stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: <Users className="size-4" />,    label: 'Sức chứa',  value: `${room.suc_chua} người` },
              { icon: <BedDouble className="size-4" />, label: 'Giường sv', value: `${room.availableBeds.length}/${room.beds.length}` },
              { icon: <Banknote className="size-4" />, label: 'Giá từ',    value: room.minPrice ? formatCurrency(room.minPrice) : '—' },
            ].map(({ icon, label, value }) => (
              <div key={label} className="rounded-lg border bg-muted/30 p-3 text-center">
                <div className="flex justify-center mb-1 text-muted-foreground">{icon}</div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="font-semibold text-sm">{value}</p>
              </div>
            ))}
          </div>

          {/* Bed details */}
          {room.beds.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Danh sách giường</p>
              <div className="space-y-2">
                {room.beds.map((bed) => (
                  <div
                    key={bed.ma_giuong}
                    className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <BedDouble className="size-3 text-muted-foreground" />
                      <span className="font-medium">{bed.ma_giuong}</span>
                      <span className="text-muted-foreground">{bed.vi_tri_giuong}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          bed.trang_thai === 'San sang' ? 'default' : 'secondary'
                        }
                        className="text-xs"
                      >
                        {statusLabel(bed.trang_thai)}
                      </Badge>
                      <span className="font-semibold">
                        {formatCurrency(bed.gia_giuong)}/tháng
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cost info */}
          <div className="rounded-md border bg-muted/20 p-3 text-sm space-y-1">
            <p className="font-medium mb-2">Chi phí dịch vụ</p>
            {[
              ['Tiền điện',   '3.500 đ/kWh (theo đồng hồ)'],
              ['Tiền nước',   '15.000 đ/m³'],
              ['Internet',    'Bao gồm trong giá thuê'],
              ['Vệ sinh chung', '2 lần/tuần'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-muted-foreground">{k}</span>
                <span>{v}</span>
              </div>
            ))}
          </div>

          {/* Vat dung table if available */}
          {room.vatDung && room.vatDung.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Vật dụng trong phòng</p>
              <div className="rounded-md border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      {['Tên vật dụng', 'Số lượng', 'Tình trạng'].map((h) => (
                        <th key={h} className="text-left px-3 py-2 font-medium text-muted-foreground text-xs">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {room.vatDung.map((v, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-3 py-2">{v.vatdung?.ten_vat_dung ?? '—'}</td>
                        <td className="px-3 py-2">{v.so_luong}</td>
                        <td className="px-3 py-2">{v.tinh_trang}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Rules */}
          <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm dark:bg-yellow-950/20 dark:border-yellow-800">
            <p className="font-medium mb-1 text-yellow-800 dark:text-yellow-200">
              📋 Nội quy & Quy định đặt cọc
            </p>
            <ul className="list-disc list-inside space-y-1 text-yellow-700 dark:text-yellow-300">
              <li>Giờ giới nghiêm: 23:00 – 05:00</li>
              <li>Không nuôi thú cưng, không hút thuốc trong phòng</li>
              <li>Tiền cọc: 2 tháng tiền thuê (theo hệ thống mới)</li>
              <li>Báo trước khi trả phòng tối thiểu 30 ngày</li>
              <li>Thanh toán trước ngày 5 hàng tháng</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Câu hỏi của khách hàng */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Câu hỏi của khách hàng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Questions"
            rows={3}
            value={questions}
            onChange={(e) => setQuestions(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Decision */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Quyết định của khách hàng
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            {
              val: 'deposit' as const,
              label: '✅ Đồng ý đặt cọc',
              desc: 'Tiến hành nghiệp vụ đặt cọc phòng',
            },
            {
              val: 'more' as const,
              label: '🔄 Muốn xem thêm phòng',
              desc: 'Quay lại tìm kiếm phòng phù hợp hơn',
            },
            {
              val: 'no' as const,
              label: '❌ Chưa có nhu cầu thuê',
              desc: 'Kết thúc quy trình giới thiệu',
            },
          ].map((opt) => (
            <div
              key={opt.val}
              onClick={() => { setDecision(opt.val); setError('') }}
              className={`rounded-lg border p-3 cursor-pointer transition-colors ${
                decision === opt.val
                  ? 'border-primary bg-primary/5'
                  : 'hover:bg-muted/50'
              }`}
            >
              <p className="font-medium text-sm">{opt.label}</p>
              <p className="text-xs text-muted-foreground">{opt.desc}</p>
            </div>
          ))}
          {error && (
            <p className="text-sm text-destructive">⚠️ {error}</p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pb-8">
        <Button
          variant="outline"
          onClick={() => window.location.href = '/sales'}
        >
          Cancel
        </Button>
        <Button onClick={handleFinish}>Finish</Button>
      </div>
    </div>
  )
}
