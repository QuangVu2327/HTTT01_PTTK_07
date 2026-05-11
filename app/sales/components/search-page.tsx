'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { CheckCircle2, CalendarDays, Search } from 'lucide-react'

import { KhachHang, RoomDisplay, YeuCauThue } from '../types'
import RoomCard from './room-card'
import { formatCurrency } from '../lib/utils'

interface Props {
  customers: KhachHang[]
  rooms: RoomDisplay[]
  customerRequests?: YeuCauThue[]
}

export default function SearchPage({ customers, rooms }: Props) {
  // ── Step 1: Customer + request inputs ──
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [custReq, setCustReq]       = useState('')
  const [condition, setCondition]   = useState('')

  // ── Step 2: Filters (shown after Check) ──
  const [checked,    setChecked]    = useState(false)
  const [search,     setSearch]     = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterGia,  setFilterGia]  = useState('all')

  // ── Step 3: Room selection ──
  const [selectedRoomId, setSelectedRoomId] = useState('')

  // ── Step 4: Appointment ──
  const [apptDate, setApptDate] = useState('')
  const [apptTime, setApptTime] = useState('')

  // ── Success state ──
  const [booked, setBooked] = useState(false)

  const selectedCustomer = customers.find(
    (c) => c.ma_khach_hang === selectedCustomerId
  )
  const selectedRoom = rooms.find(
    (r) => r.ma_phong === selectedRoomId
  )

  // Filter logic
  const filteredRooms = rooms.filter((room) => {
    const matchSearch =
      room.ma_phong.toLowerCase().includes(search.toLowerCase()) ||
      room.khu_vuc.toLowerCase().includes(search.toLowerCase())

    const matchType =
      filterType === 'all' ||
      room.loai_doi_tuong_phong === filterType

    const matchGia = (() => {
      if (filterGia === 'all' || !room.minPrice) return true
      if (filterGia === 'lt2m')  return room.minPrice < 2_000_000
      if (filterGia === '2to3m') return room.minPrice >= 2_000_000 && room.minPrice <= 3_000_000
      if (filterGia === 'gt3m')  return room.minPrice > 3_000_000
      return true
    })()

    return matchSearch && matchType && matchGia
  })

  // Auto-fill dropdown to match selected customer's gender
  const handleCustomerChange = (id: string) => {
    setSelectedCustomerId(id)
    setChecked(false)
    setSelectedRoomId('')
  }

  const handleCheck = () => {
    // Auto-filter by customer gender if available
    if (selectedCustomer?.gioi_tinh) {
      // No auto-set needed — just show results
    }
    setChecked(true)
    setSelectedRoomId('')
  }

  const handleBook = () => {
    if (!selectedRoomId) {
      alert('Vui lòng chọn phòng từ danh sách')
      return
    }
    if (!apptDate) {
      alert('Vui lòng chọn ngày hẹn')
      return
    }
    setBooked(true)
  }

  // ── Success screen ──
  if (booked && selectedRoom && selectedCustomer) {
    return (
      <div className="max-w-lg mx-auto text-center space-y-6 py-12">
        <div className="flex justify-center">
          <CheckCircle2 className="size-16 text-green-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Đặt lịch hẹn thành công</h2>
          <p className="text-muted-foreground mt-1">
            Lịch xem phòng đã được ghi nhận vào LichXemPhong
          </p>
        </div>

        <Card>
          <CardContent className="pt-4 space-y-2 text-left">
            {[
              ['Khách hàng',  selectedCustomer.ten],
              ['SĐT',         selectedCustomer.so_dien_thoai ?? '—'],
              ['Phòng',       `${selectedRoom.ma_phong} – ${selectedRoom.khu_vuc}`],
              ['Giá từ',      selectedRoom.minPrice ? formatCurrency(selectedRoom.minPrice) : '—'],
              ['Ngày hẹn',    apptDate],
              ['Giờ hẹn',     apptTime || '—'],
              ['Yêu cầu',     custReq || '—'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm py-1 border-b last:border-0">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => {
              setBooked(false)
              setChecked(false)
              setSelectedCustomerId('')
              setSelectedRoomId('')
              setCustReq('')
              setCondition('')
              setApptDate('')
              setApptTime('')
            }}
          >
            Tìm kiếm mới
          </Button>
          <Button
            onClick={() => {
              // Pass room + customer to intro page via URL
              window.location.href =
                `/sales/intro?room=${selectedRoom.ma_phong}&customer=${selectedCustomer.ma_khach_hang}`
            }}
          >
            Giới thiệu phòng →
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold">Quản lý tìm phòng phù hợp</h1>

      {/* Customer selector */}
      <Card>
        <CardContent className="pt-4 space-y-3">
          <div className="space-y-1">
            <Label>Khách hàng</Label>
            <Select
              value={selectedCustomerId}
              onValueChange={handleCustomerChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="-- Chọn khách hàng --" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.ma_khach_hang} value={c.ma_khach_hang}>
                    {c.ma_khach_hang} – {c.ten}
                    {c.gioi_tinh ? ` (${c.gioi_tinh})` : ''}
                    {c.loai_doi_tuong ? `, ${c.loai_doi_tuong}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedCustomer && (
              <div className="flex gap-2 flex-wrap pt-1">
                <Badge variant="outline">📞 {selectedCustomer.so_dien_thoai}</Badge>
                <Badge variant="outline">✉️ {selectedCustomer.email}</Badge>
                {selectedCustomer.gioi_tinh && (
                  <Badge variant="secondary">{selectedCustomer.gioi_tinh}</Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Yêu cầu khách */}
      <Card>
        <CardContent className="pt-4 space-y-3">
          <div className="space-y-1">
            <Label>Yêu cầu khách</Label>
            <Input
              placeholder="Nhập yêu cầu"
              value={custReq}
              onChange={(e) => setCustReq(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Điều kiện thuê</Label>
            <Input
              placeholder="Vị trí, loại, ..."
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Check button */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              Kiểm tra phòng trống hoặc phù hợp
            </span>
            <Button variant="outline" size="sm" onClick={handleCheck}>
              <Search className="size-3 mr-1" />
              Check
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Chọn phòng dropdown */}
      <Card>
        <CardContent className="pt-4 space-y-1">
          <Label>Chọn phòng</Label>
          <Select
            value={selectedRoomId}
            onValueChange={setSelectedRoomId}
          >
            <SelectTrigger>
              <SelectValue placeholder="-- Chọn phòng --" />
            </SelectTrigger>
            <SelectContent>
              {rooms
                .filter((r) => r.availableBeds.length > 0)
                .map((r) => (
                  <SelectItem key={r.ma_phong} value={r.ma_phong}>
                    {r.ma_phong} – {r.khu_vuc}
                    {r.minPrice ? ` – từ ${formatCurrency(r.minPrice)}` : ''}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Appointment */}
      <Card>
        <CardContent className="pt-4 space-y-1">
          <Label className="flex items-center gap-1">
            <CalendarDays className="size-4" />
            Đặt lịch hẹn thăm phòng
          </Label>
          <div className="flex gap-2">
            <Input
              type="date"
              className="flex-1"
              value={apptDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setApptDate(e.target.value)}
            />
            <Select value={apptTime} onValueChange={setApptTime}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Giờ" />
              </SelectTrigger>
              <SelectContent>
                {['08:00','09:00','10:00','11:00','14:00','15:00','16:00'].map(
                  (t) => <SelectItem key={t} value={t}>{t}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Button className="w-full" onClick={handleBook}>
        Đặt lịch hẹn
      </Button>

      {/* Results list — shown after Check */}
      {checked && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-base">Phòng trống</CardTitle>
              <div className="flex gap-2 flex-wrap">
                <Input
                  className="w-40 h-8 text-sm"
                  placeholder="Tìm vị trí..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-36 h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả loại</SelectItem>
                    <SelectItem value="Sinh vien">Sinh viên</SelectItem>
                    <SelectItem value="Nguoi di lam">Người đi làm</SelectItem>
                    <SelectItem value="Tat ca">Tất cả</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterGia} onValueChange={setFilterGia}>
                  <SelectTrigger className="w-36 h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả giá</SelectItem>
                    <SelectItem value="lt2m">{'< 2.000.000'}</SelectItem>
                    <SelectItem value="2to3m">2M – 3M</SelectItem>
                    <SelectItem value="gt3m">{'> 3.000.000'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-2">
            {filteredRooms.length === 0 ? (
              <p className="text-center text-muted-foreground py-6 text-sm">
                Không tìm thấy phòng trống phù hợp
              </p>
            ) : (
              filteredRooms.map((room) => (
                <RoomCard
                  key={room.ma_phong}
                  room={room}
                  selected={selectedRoomId === room.ma_phong}
                  onSelect={() => setSelectedRoomId(room.ma_phong)}
                  onView={() => {
                    window.location.href =
                      `/sales/intro?room=${room.ma_phong}&customer=${selectedCustomerId}`
                  }}
                />
              ))
            )}

            <Button
              className="w-full mt-2"
              variant={selectedRoomId ? 'default' : 'secondary'}
              disabled={!selectedRoomId}
              onClick={() => {
                if (!selectedRoomId) return
                window.location.href =
                  `/sales/intro?room=${selectedRoomId}&customer=${selectedCustomerId}`
              }}
            >
              CONFIRM
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
