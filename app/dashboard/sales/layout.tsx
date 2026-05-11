import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { DashboardSidebar } from '@/components/dashboard/sidebar-nav'
import { signOut } from '@/lib/actions/auth'
import { requireRole } from '@/app/dashboard/require-role'

export default async function SalesLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole('sales')

  return (
    <SidebarProvider>
      <DashboardSidebar user={profile} onSignOut={signOut} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  )
}
