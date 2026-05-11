import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Profile } from '@/lib/types'

/**
 * Fetches the current user and resolves their role from the new DB schema
 * (KhachHang / NhanVien sub-tables) instead of the old `profiles` table.
 *
 * Returns a Profile-compatible object for use with DashboardSidebar.
 * Redirects to /auth/login if not authenticated.
 * Redirects to the correct dashboard if the user hits the wrong role route.
 */
export async function requireRole(expectedRole: Profile['role']): Promise<Profile> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // ── Resolve role + display info from the new schema ──────────────────────

  // Check KhachHang
  const { data: kh } = await supabase
    .from('KhachHang')
    .select('ma_khach_hang, ten, email, so_dien_thoai')
    .eq('auth_id', user.id)
    .maybeSingle()

  if (kh) {
    if (expectedRole !== 'customer') redirect('/dashboard/customer')
    return {
      id: user.id,
      email: kh.email ?? user.email ?? '',
      full_name: kh.ten ?? null,
      phone: kh.so_dien_thoai ?? null,
      role: 'customer',
      avatar_url: null,
      created_at: user.created_at,
      updated_at: user.updated_at ?? user.created_at,
    }
  }

  // Check NhanVien
  const { data: nv } = await supabase
    .from('NhanVien')
    .select('ma_nhan_vien, ten, email, so_dien_thoai')
    .eq('auth_id', user.id)
    .maybeSingle()

  if (nv) {
    const maNV = nv.ma_nhan_vien
    let resolvedRole: Profile['role'] = 'manager'

    const { data: ql } = await supabase.from('QuanLy').select('ma_nhan_vien').eq('ma_nhan_vien', maNV).maybeSingle()
    if (ql) resolvedRole = 'manager'
    else {
      const { data: sale } = await supabase.from('NhanVienSale').select('ma_nhan_vien').eq('ma_nhan_vien', maNV).maybeSingle()
      if (sale) resolvedRole = 'sales'
      else {
        const { data: kt } = await supabase.from('NhanVienKeToan').select('ma_nhan_vien').eq('ma_nhan_vien', maNV).maybeSingle()
        if (kt) resolvedRole = 'accountant'
        else resolvedRole = 'sales' // NhanVienPhuTrach → sales portal
      }
    }

    if (expectedRole !== resolvedRole) redirect(`/dashboard/${resolvedRole}`)

    return {
      id: user.id,
      email: nv.email ?? user.email ?? '',
      full_name: nv.ten ?? null,
      phone: nv.so_dien_thoai ?? null,
      role: resolvedRole,
      avatar_url: null,
      created_at: user.created_at,
      updated_at: user.updated_at ?? user.created_at,
    }
  }

  // Unknown user — send to login
  redirect('/auth/login')
}
