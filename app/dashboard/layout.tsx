import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}