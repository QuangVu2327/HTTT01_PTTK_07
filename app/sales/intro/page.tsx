import { createClient } from '@/lib/supabase/server'
import IntroPage from '../components/intro-page'
import { getRooms } from '../lib/queries'
import { KhachHang } from '../types'

interface Props {
  searchParams: Promise<{ room?: string; customer?: string }>
}

export default async function IntroRoutePage({ searchParams }: Props) {
  const { room: roomId, customer: customerId } = await searchParams

  const rooms = await getRooms()
  const room  = rooms.find((r) => r.ma_phong === roomId)

  let customer: KhachHang | null = null
  if (customerId) {
    const supabase = await createClient()
    const { data } = await supabase
      .from('khachhang')
      .select('*')
      .eq('ma_khach_hang', customerId)
      .single()
    customer = data
  }

  if (!room) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <p>Không tìm thấy phòng. <a href="/sales" className="underline">Quay lại tìm kiếm</a></p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <IntroPage room={room} customer={customer} />
    </div>
  )
}
