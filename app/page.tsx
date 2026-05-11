'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Building2 } from 'lucide-react'

/**
 * Resolve the dashboard path for a logged-in user.
 *
 * Strategy (new schema, no `profiles` table):
 *   1. Check `user_metadata.role` set during sign-up — fast and works for
 *      staff accounts created via the sign-up flow.
 *   2. Fall back to querying the DB: check KhachHang first, then NhanVien
 *      sub-tables (QuanLy → manager, NhanVienSale → sales,
 *      NhanVienKeToan → accountant, NhanVienPhuTrach → staff).
 */
async function resolveDashboardPath(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  userMetaRole?: string
): Promise<string> {

  if (userMetaRole) {
    const metaMap: Record<string, string> = {
      customer: '/dashboard/customer',
      manager: '/dashboard/manager',
      sales: '/dashboard/sales',
      accountant: '/dashboard/accountant',
      staff: '/dashboard/staff',
    }

    if (metaMap[userMetaRole]) {
      return metaMap[userMetaRole]
    }
  }

  // CUSTOMER
  const { data: kh } = await supabase
    .from('khachhang')
    .select('ma_khach_hang')
    .eq('auth_user_id', userId)
    .maybeSingle()

  if (kh) {
    return '/dashboard/customer'
  }

  // STAFF
  const { data: nv } = await supabase
    .from('nhanvien')
    .select('ma_nhan_vien')
    .eq('auth_user_id', userId)
    .maybeSingle()

  if (nv) {
    const maNV = nv.ma_nhan_vien

    const { data: ql } = await supabase
      .from('quanly')
      .select('ma_nhan_vien')
      .eq('ma_nhan_vien', maNV)
      .maybeSingle()

    if (ql) return '/dashboard/manager'

    const { data: sale } = await supabase
      .from('nhanviensale')
      .select('ma_nhan_vien')
      .eq('ma_nhan_vien', maNV)
      .maybeSingle()

    if (sale) return '/dashboard/sales'

    const { data: kt } = await supabase
      .from('nhanvienketoan')
      .select('ma_nhan_vien')
      .eq('ma_nhan_vien', maNV)
      .maybeSingle()

    if (kt) return '/dashboard/accountant'

    const { data: pt } = await supabase
      .from('nhanvienphutrach')
      .select('ma_nhan_vien')
      .eq('ma_nhan_vien', maNV)
      .maybeSingle()

    if (pt) return '/dashboard/staff'

    return '/dashboard/staff'
  }

  return '/dashboard'
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

    if (data.user) {
      // TEMP OVERRIDE FOR TESTING ONLY
      router.push('/sales')
    }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-muted/30 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">DormHub</span>
          </div>

          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Welcome back</CardTitle>
              <CardDescription>
                Sign in to your account to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link
                        href="/auth/forgot-password"
                        className="text-sm text-muted-foreground hover:text-primary"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign in'}
                  </Button>
                </div>

                <div className="mt-4 text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?{' '}
                  <Link
                    href="/auth/sign-up"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Sign up
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground">
            By continuing, you agree to our{' '}
            <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
