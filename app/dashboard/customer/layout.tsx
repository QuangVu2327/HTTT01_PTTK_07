import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { DashboardSidebar } from '@/components/dashboard/sidebar-nav'
import { signOut } from '@/lib/actions/auth'
import type { Profile } from '@/lib/types'
import { requireRole } from '@/app/dashboard/require-role'


export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const profile = await requireRole('customer')

  return (
    <SidebarProvider>
      <DashboardSidebar user={profile as Profile} onSignOut={signOut} />
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
