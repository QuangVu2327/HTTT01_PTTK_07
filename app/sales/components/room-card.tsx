'use client'

import { RoomDisplay } from '../types'
import { formatCurrency, statusLabel, statusVariant } from '../lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BedDouble, MapPin, Users } from 'lucide-react'

interface Props {
  room: RoomDisplay
  selected: boolean
  onSelect: () => void
  onView: () => void
}

export default function RoomCard({
  room,
  selected,
  onSelect,
  onView,
}: Props) {
  const isAvailable = room.availableBeds.length > 0

  return (
    <div
      onClick={onSelect}
      className={`rounded-xl border p-4 flex items-center justify-between cursor-pointer transition-colors ${
        selected
          ? 'border-primary bg-primary/5'
          : 'hover:bg-muted/50'
      }`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Radio indicator */}
        <div
          className={`size-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
            selected ? 'border-primary' : 'border-muted-foreground'
          }`}
        >
          {selected && (
            <div className="size-2 rounded-full bg-primary" />
          )}
        </div>

        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold">{room.ma_phong}</h3>
            <Badge variant={statusVariant(room.trang_thai)}>
              {statusLabel(room.trang_thai)}
            </Badge>
            <Badge variant="outline">{room.gioi_tinh_phong}</Badge>
          </div>

          <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1">
              <MapPin className="size-3" />
              {room.khu_vuc}
            </span>
            <span className="flex items-center gap-1">
              <Users className="size-3" />
              {room.loai_doi_tuong_phong}
            </span>
            <span className="flex items-center gap-1">
              <BedDouble className="size-3" />
              {room.availableBeds.length}/{room.beds.length} giường sẵn sàng
            </span>
          </div>

          <p className="font-semibold text-sm">
            {isAvailable && room.minPrice
              ? `Từ ${formatCurrency(room.minPrice)}/tháng`
              : 'Không có giường trống'}
          </p>
        </div>
      </div>

      <Button
        size="sm"
        variant="outline"
        onClick={(e) => {
          e.stopPropagation()
          onView()
        }}
        disabled={!isAvailable}
      >
        View
      </Button>
    </div>
  )
}
