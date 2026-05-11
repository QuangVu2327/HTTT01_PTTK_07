import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard/header'
import { ClipboardList, CalendarDays, FileText, Building2 } from 'lucide-react'
import { StatCard } from '@/components/dashboard/stat-card'
import { requireRole } from '@/app/dashboard/require-role'

export default async function SalesDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  return (
    <>
      <DashboardHeader heading="Sales Dashboard" text="Manage rental requests, appointments, and contracts." />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Rental Requests" value="—" icon={ClipboardList} description="Pending requests" />
          <StatCard title="Appointments" value="—" icon={CalendarDays} description="Scheduled viewings" />
          <StatCard title="Contracts" value="—" icon={FileText} description="Active contracts" />
          <StatCard title="Properties" value="—" icon={Building2} description="Available rooms" />
        </div>
      </div>
    </>
  )
}
