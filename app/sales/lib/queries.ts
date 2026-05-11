import { createClient } from '@/lib/supabase/server'
import { RoomDisplay, YeuCauThue, LichXemPhong } from '../types'

export async function getCustomers() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('khachhang')
    .select('*')
    .order('ten')

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getRooms(): Promise<RoomDisplay[]> {
  const supabase = await createClient()

  const { data: rooms, error: roomError } = await supabase
    .from('phong')
    .select('*')

  if (roomError) throw new Error(roomError.message)

  const { data: beds, error: bedError } = await supabase
    .from('giuong')
    .select('*')

  if (bedError) throw new Error(bedError.message)

  // Also fetch vat dung for intro page
  const { data: vatDung } = await supabase
    .from('chitietvatdung')
    .select('*, vatdung(*)')

  return (rooms ?? []).map((room) => {
    const roomBeds = (beds ?? []).filter(
      (bed) => bed.ma_phong === room.ma_phong
    )
    const availableBeds = roomBeds.filter(
      (bed) => bed.trang_thai === 'San sang'
    )
    return {
      ...room,
      beds: roomBeds,
      availableBeds,
      minPrice:
        availableBeds.length > 0
          ? Math.min(...availableBeds.map((b) => Number(b.gia_giuong)))
          : null,
      vatDung: (vatDung ?? []).filter(
        (v) => v.ma_phong === room.ma_phong
      ),
    }
  })
}

export async function getCustomerRequests(
  customerId: string
): Promise<YeuCauThue[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('yeucauthue')
    .select('*')
    .eq('ma_khach_hang', customerId)
    .order('tinh_trang_don')

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createLichXemPhong(
  payload: Omit<LichXemPhong, 'ma_lich'>
) {
  const supabase = await createClient()

  // Generate a simple ID: LXP_ + timestamp
  const ma_lich = `LXP_${Date.now()}`

  const { error } = await supabase
    .from('lichxemphong')
    .insert({ ma_lich, ...payload })

  if (error) throw new Error(error.message)
  return ma_lich
}

export async function createYeuCauThue(
  payload: Omit<YeuCauThue, 'ma_yeu_cau'>
) {
  const supabase = await createClient()

  const ma_yeu_cau = `YC_${Date.now()}`

  const { error } = await supabase
    .from('yeucauthue')
    .insert({ ma_yeu_cau, ...payload })

  if (error) throw new Error(error.message)
  return ma_yeu_cau
}
