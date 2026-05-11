import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Get user role từ user_metadata (đã lưu khi sign up)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Lấy role từ user_metadata
        const role = user.user_metadata?.role || 'customer'
        
        // Map role sang dashboard path
        let dashboardPath = '/dashboard'
        switch (role) {
          case 'customer':
            dashboardPath = '/dashboard/customer'
            break
          case 'sales':
            dashboardPath = '/dashboard/sales'
            break
          case 'accountant':
            dashboardPath = '/dashboard/accountant'
            break
          case 'manager':
            dashboardPath = '/dashboard/manager'
            break
          default:
            dashboardPath = '/dashboard'
        }
        
        // Redirect đến dashboard đúng role
        return NextResponse.redirect(`${origin}${dashboardPath}`)
      }
      
      // Fallback nếu không có user
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Nếu có lỗi, redirect về trang error
  return NextResponse.redirect(`${origin}/auth/error`)
}