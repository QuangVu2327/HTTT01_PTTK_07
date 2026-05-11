import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // Check KhachHang
  const { data: kh } = await supabase
    .from('KhachHang')
    .select('ma_khach_hang')
    .eq('auth_id', user.id)
    .maybeSingle()
  if (kh) redirect('/dashboard/customer')

  // Check NhanVien sub-roles
  const { data: nv } = await supabase
    .from('NhanVien')
    .select('ma_nhan_vien')
    .eq('auth_id', user.id)
    .maybeSingle()

  if (nv) {
    const maNV = nv.ma_nhan_vien

    const { data: ql } = await supabase.from('QuanLy').select('ma_nhan_vien').eq('ma_nhan_vien', maNV).maybeSingle()
    if (ql) redirect('/dashboard/manager')

    const { data: sale } = await supabase.from('NhanVienSale').select('ma_nhan_vien').eq('ma_nhan_vien', maNV).maybeSingle()
    if (sale) redirect('/dashboard/sales')

    const { data: kt } = await supabase.from('NhanVienKeToan').select('ma_nhan_vien').eq('ma_nhan_vien', maNV).maybeSingle()
    if (kt) redirect('/dashboard/accountant')

    redirect('/dashboard/manager')
  }

  // Fallback
  redirect('/auth/login')
}
