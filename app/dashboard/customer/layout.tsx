import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { DashboardSidebar } from '@/components/dashboard/sidebar-nav'
import { signOut } from '@/lib/actions/auth'
import type { Profile } from '@/lib/types'

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}