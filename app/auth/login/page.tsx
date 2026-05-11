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
                // ✅ Read role from user_metadata — same as route.ts
                const role = data.user.user_metadata?.role || 'customer'

                const roleMap: Record<string, string> = {
                    customer: '/dashboard/customer',
                    sales: '/dashboard/manager',
                    accountant: '/dashboard/manager',
                    manager: '/dashboard/manager',
                }

                router.push(roleMap[role] ?? '/dashboard/manager')
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An error occurred')
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
                            <CardDescription>Sign in to your account to continue</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleLogin}>
                                <div className="flex flex-col gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email" type="email" placeholder="name@example.com" required
                                            value={email} onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="password">Password</Label>
                                            <Link href="/auth/forgot-password"
                                                className="text-sm text-muted-foreground hover:text-primary">
                                                Forgot password?
                                            </Link>
                                        </div>
                                        <Input
                                            id="password" type="password" required
                                            value={password} onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>

                                    {error && <p className="text-sm text-destructive">{error}</p>}

                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading ? 'Signing in...' : 'Sign in'}
                                    </Button>
                                </div>

                                <div className="mt-4 text-center text-sm text-muted-foreground">
                                    Don&apos;t have an account?{' '}
                                    <Link href="/auth/sign-up"
                                        className="text-primary underline-offset-4 hover:underline">
                                        Sign up
                                    </Link>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}