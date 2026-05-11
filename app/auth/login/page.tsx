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

// DEV ACCOUNTS
const DEV_ACCOUNTS = [
  {
    label: 'Customer – Anh Tuan',
    email: 'tuan@gmail.com',
    password: 'password123',
  },
  {
    label: 'Customer – Chi Lan',
    email: 'lan@gmail.com',
    password: 'password123',
  },
  {
    label: 'Manager – Tran Quan Ly',
    email: 'manager01@nha.com',
    password: 'password123',
  },
  {
    label: 'Sale – Nguyen Van Sale',
    email: 'sale01@nha.com',
    password: 'password123',
  },
  {
    label: 'Accountant – Pham KT',
    email: 'accountant01@nha.com',
    password: 'password123',
  },
  {
    label: 'Support – Le Phu Trach',
    email: 'support01@nha.com',
    password: 'password123',
  },
]

const IS_DEV = process.env.NODE_ENV === 'development'

async function resolveDashboardPath(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  userMetaRole?: string
): Promise<string> {

  // 1. USER METADATA ROLE
  const metaMap: Record<string, string> = {
    customer: '/dashboard/customer',
    manager: '/dashboard/manager',
    sales: '/dashboard/sales',
    accountant: '/dashboard/accountant',
    staff: '/dashboard/staff',
  }

  if (userMetaRole && metaMap[userMetaRole]) {
    return metaMap[userMetaRole]
  }

  // 2. CUSTOMER
  const { data: kh } = await supabase
    .from('khachhang')
    .select('ma_khach_hang')
    .eq('auth_id', userId)
    .maybeSingle()

  if (kh) {
    return '/dashboard/customer'
  }

  // 3. STAFF BASE TABLE
  const { data: nv } = await supabase
    .from('nhanvien')
    .select('ma_nhan_vien')
    .eq('auth_id', userId)
    .maybeSingle()

  if (!nv) {
    return '/dashboard'
  }

  const maNV = nv.ma_nhan_vien

  // MANAGER
  const { data: ql } = await supabase
    .from('quanly')
    .select('ma_nhan_vien')
    .eq('ma_nhan_vien', maNV)
    .maybeSingle()

  if (ql) {
    return '/dashboard/manager'
  }

  // SALES
  const { data: sale } = await supabase
    .from('nhanviensale')
    .select('ma_nhan_vien')
    .eq('ma_nhan_vien', maNV)
    .maybeSingle()

  if (sale) {
    return '/dashboard/sales'
  }

  // ACCOUNTANT
  const { data: kt } = await supabase
    .from('nhanvienketoan')
    .select('ma_nhan_vien')
    .eq('ma_nhan_vien', maNV)
    .maybeSingle()

  if (kt) {
    return '/dashboard/accountant'
  }

  // SUPPORT STAFF
  const { data: pt } = await supabase
    .from('nhanvienphutrach')
    .select('ma_nhan_vien')
    .eq('ma_nhan_vien', maNV)
    .maybeSingle()

  if (pt) {
    return '/dashboard/staff'
  }

  // FALLBACK
  return '/dashboard'
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()

  const handleLogin = async (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    setError(null)
    setIsLoading(true)

    try {
      const supabase = createClient()

      const { data, error } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        })

      if (error) {
        throw error
      }

      if (!data.user) {
        throw new Error('Login failed')
      }

      const dashboardPath =
        await resolveDashboardPath(
          supabase,
          data.user.id,
          data.user.user_metadata?.role
        )

      router.push(dashboardPath)

    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred'
      )
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
            <span className="text-2xl font-bold">
              DormHub
            </span>
          </div>

          {IS_DEV && (
            <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-xs dark:border-yellow-700 dark:bg-yellow-950">
              <p className="mb-2 font-semibold text-yellow-800 dark:text-yellow-300">
                🛠 Dev accounts — click to fill
              </p>

              <div className="flex flex-col gap-1">
                {DEV_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => {
                      setEmail(acc.email)
                      setPassword(acc.password)
                      setError(null)
                    }}
                    className="text-left text-yellow-700 underline-offset-2 hover:underline dark:text-yellow-400"
                  >
                    {acc.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">
                Welcome back
              </CardTitle>

              <CardDescription>
                Sign in to your account to continue
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-4">

                  <div className="grid gap-2">
                    <Label htmlFor="email">
                      Email
                    </Label>

                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      required
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">

                      <Label htmlFor="password">
                        Password
                      </Label>

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
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-destructive">
                      {error}
                    </p>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading
                      ? 'Signing in...'
                      : 'Sign in'}
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

            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-primary"
            >
              Terms of Service
            </Link>

            {' '}and{' '}

            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-primary"
            >
              Privacy Policy
            </Link>

          </p>
        </div>
      </div>
    </div>
  )
}