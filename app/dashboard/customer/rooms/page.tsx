import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard/header'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Building2,
  BedDouble,
  MapPin,
  Users,
  Ruler,
  Wifi,
  Wind,
  Droplets,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
import { createServices } from '@/lib/services'

export default async function CustomerRoomsPage() {
  const supabase = await createClient()
  const services = createServices(supabase)
  
  const rooms = await services.property.getAvailableRooms()
  const buildings = await services.property.getAllBuildings()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  const getRoomTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      single: 'Single Room',
      double: 'Double Room',
      quad: 'Quad Room',
      dorm: 'Dormitory',
    }
    return labels[type] || type
  }

  const getAmenityIcon = (amenity: string) => {
    const icons: Record<string, React.ReactNode> = {
      wifi: <Wifi className="size-4" />,
      'air-conditioning': <Wind className="size-4" />,
      'water-heater': <Droplets className="size-4" />,
    }
    return icons[amenity.toLowerCase()] || null
  }

  return (
    <>
      <DashboardHeader
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard/customer' },
          { label: 'Browse Rooms' },
        ]}
      />

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mt-4">
          <h1 className="text-2xl font-bold tracking-tight">Available Rooms</h1>
          <p className="text-muted-foreground">
            Find your perfect room from our available listings.
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <Input placeholder="Search by room number or building..." />
              </div>
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Building" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Buildings</SelectItem>
                  {buildings.map((building) => (
                    <SelectItem key={building.id} value={building.id}>
                      {building.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Room Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="single">Single Room</SelectItem>
                  <SelectItem value="double">Double Room</SelectItem>
                  <SelectItem value="quad">Quad Room</SelectItem>
                  <SelectItem value="dorm">Dormitory</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Price</SelectItem>
                  <SelectItem value="0-2000000">Under 2M</SelectItem>
                  <SelectItem value="2000000-4000000">2M - 4M</SelectItem>
                  <SelectItem value="4000000-6000000">4M - 6M</SelectItem>
                  <SelectItem value="6000000+">Over 6M</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Rooms Grid */}
        {rooms.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => {
              const availableBeds = room.beds?.filter(b => b.status === 'available') || []
              const lowestPrice = availableBeds.length > 0 
                ? Math.min(...availableBeds.map(b => Number(b.price_per_month)))
                : room.base_price

              return (
                <Card key={room.id} className="overflow-hidden">
                  <div className="aspect-video bg-muted relative">
                    {room.images && room.images.length > 0 ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={room.images[0]}
                        alt={`Room ${room.room_number}`}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <BedDouble className="size-12 text-muted-foreground" />
                      </div>
                    )}
                    <Badge className="absolute top-2 right-2">
                      {availableBeds.length} beds available
                    </Badge>
                  </div>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          Room {room.room_number}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <Building2 className="size-3" />
                          {room.building?.name}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">
                        {getRoomTypeLabel(room.room_type)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="size-4" />
                          {room.capacity} people
                        </span>
                        {room.area_sqm && (
                          <span className="flex items-center gap-1">
                            <Ruler className="size-4" />
                            {room.area_sqm} sqm
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <MapPin className="size-4" />
                          Floor {room.floor}
                        </span>
                      </div>
                      
                      {room.amenities && room.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {room.amenities.slice(0, 4).map((amenity, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {getAmenityIcon(amenity)}
                              <span className="ml-1 capitalize">{amenity}</span>
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="pt-2">
                        <p className="text-lg font-bold text-primary">
                          From {formatCurrency(lowestPrice)}
                          <span className="text-sm font-normal text-muted-foreground">/month</span>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" asChild>
                      <Link href={`/dashboard/customer/rooms/${room.id}`}>
                        View Details
                        <ArrowRight className="ml-2 size-4" />
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
              <h3 className="text-lg font-medium">No Rooms Available</h3>
              <p className="text-sm text-muted-foreground">
                There are currently no rooms available. Please check back later.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}
