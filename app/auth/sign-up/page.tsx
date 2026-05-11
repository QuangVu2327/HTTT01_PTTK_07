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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Building2 } from 'lucide-react'

type Role =
  | 'customer'
  | 'manager'
  | 'sales'
  | 'accountant'

function generateId(prefix: string) {
  return `${prefix}_${Date.now()}`
}

async function createUserProfile(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  role: Role,
  fullName: string,
  email: string,
  phone: string
) {
  // CUSTOMER
  if (role === 'customer') {
    const customerId = generateId('KH')

    const { error } = await supabase
      .from('khachhang')
      .insert({
        ma_khach_hang: customerId,
        auth_id: userId,
        ten: fullName,
        email,
        so_dien_thoai: phone || null,
        gioi_tinh: null,
        loai_doi_tuong: 'Khách thuê',
      })

    if (error) {
      throw new Error(
        `khachhang insert failed: ${error.message}`
      )
    }

    return
  }

  // STAFF
  const staffId = generateId('NV')

  const { error: staffError } = await supabase
    .from('nhanvien')
    .insert({
      ma_nhan_vien: staffId,
      auth_id: userId,
      ten: fullName,
      email,
      so_dien_thoai: phone || null,
    })

  if (staffError) {
    throw new Error(
      `nhanvien insert failed: ${staffError.message}`
    )
  }

  // ROLE TABLE
  let roleTable = ''

  switch (role) {
    case 'manager':
      roleTable = 'quanly'
      break

    case 'sales':
      roleTable = 'nhanviensale'
      break

    case 'accountant':
      roleTable = 'nhanvienketoan'
      break
  }

  const { error: roleError } = await supabase
    .from(roleTable)
    .insert({
      ma_nhan_vien: staffId,
    })

  if (roleError) {
    throw new Error(
      `${roleTable} insert failed: ${roleError.message}`
    )
  }
}

export default function SignUpPage() {
  const router = useRouter()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] =
    useState('')

  const [role, setRole] =
    useState<Role>('customer')

  const [error, setError] =
    useState<string | null>(null)

  const [isLoading, setIsLoading] =
    useState(false)

  const handleSignUp = async (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    setError(null)
    setIsLoading(true)

    try {
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match')
      }

      if (password.length < 6) {
        throw new Error(
          'Password must be at least 6 characters'
        )
      }

      const supabase = createClient()

      const { data, error: signUpError } =
        await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo:
              process.env
                .NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
              `${window.location.origin}/auth/callback`,
            data: {
              role,
              full_name: fullName,
            },
          },
        })

      if (signUpError) {
        throw signUpError
      }

      if (!data.user) {
        throw new Error('User creation failed')
      }

      // CREATE DB PROFILE
      await createUserProfile(
        supabase,
        data.user.id,
        role,
        fullName,
        email,
        phone
      )

      // REDIRECT BASED ON ROLE
      switch (role) {
        case 'manager':
          router.push('/dashboard/manager')
          break

        case 'sales':
          router.push('/dashboard/sales')
          break

        case 'accountant':
          router.push('/dashboard/accountant')
          break

        default:
          router.push('/dashboard/customer')
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 p-6">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2">
          <Building2 className="h-8 w-8 text-primary" />

          <h1 className="text-2xl font-bold">
            DormHub
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Account</CardTitle>

            <CardDescription>
              Register a new account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={handleSignUp}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>Full Name</Label>

                <Input
                  value={fullName}
                  onChange={(e) =>
                    setFullName(e.target.value)
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>

                <Input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Phone</Label>

                <Input
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Role</Label>

                <Select
                  value={role}
                  onValueChange={(v) =>
                    setRole(v as Role)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="customer">
                      Customer
                    </SelectItem>

                    <SelectItem value="sales">
                      Sales
                    </SelectItem>

                    <SelectItem value="accountant">
                      Accountant
                    </SelectItem>

                    <SelectItem value="manager">
                      Manager
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Password</Label>

                <Input
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Confirm Password</Label>

                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  required
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
                  ? 'Creating Account...'
                  : 'Create Account'}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link
                  href="/auth/login"
                  className="text-primary hover:underline"
                >
                  Login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}