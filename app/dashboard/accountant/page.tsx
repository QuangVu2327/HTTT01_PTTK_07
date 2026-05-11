import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard/header'
import { Wallet, RefreshCcw, BarChart3, FileText } from 'lucide-react'
import { StatCard } from '@/components/dashboard/stat-card'

export default async function AccountantDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  return (
    <>
      <DashboardHeader heading="Accountant Dashboard" text="Track payments, refunds, and financial reports." />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Payments" value="—" icon={Wallet} description="This month" />
          <StatCard title="Pending" value="—" icon={RefreshCcw} description="Awaiting payment" />
          <StatCard title="Refunds" value="—" icon={RefreshCcw} description="Pending refunds" />
          <StatCard title="Reports" value="—" icon={BarChart3} description="Financial reports" />
        </div>
      </div>
    </>
  )
}
