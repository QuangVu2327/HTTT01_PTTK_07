import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard/header'
import { StatCard } from '@/components/dashboard/stat-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  CreditCard,
  ClipboardList,
  BedDouble,
  ArrowRight,
  Calendar,
} from 'lucide-react'
import Link from 'next/link'
import { createServices } from '@/lib/services'
import { format } from 'date-fns'

export default async function CustomerDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const services = createServices(supabase)
  const dashboardData = await services.dashboard.getCustomerDashboard(user.id)
  const pendingRequests = await services.rental.getAllRequests({ customerId: user.id, status: 'pending' })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  return (
    <>
      <DashboardHeader
        breadcrumbs={[
          { label: 'Dashboard' },
        ]}
        notificationCount={dashboardData.notifications.filter(n => !n.is_read).length}
      />

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mt-4">
          <h1 className="text-2xl font-bold tracking-tight">Welcome back!</h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening with your rentals.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Active Contract"
            value={dashboardData.activeContract ? '1' : '0'}
            description={dashboardData.activeContract ? 'Current rental' : 'No active rental'}
            icon={<FileText className="size-4" />}
          />
          <StatCard
            title="Pending Requests"
            value={pendingRequests.length}
            description="Awaiting approval"
            icon={<ClipboardList className="size-4" />}
          />
          <StatCard
            title="Upcoming Payments"
            value={dashboardData.upcomingPayments.length}
            description="Due this month"
            icon={<CreditCard className="size-4" />}
          />
          <StatCard
            title="Total Due"
            value={formatCurrency(
              dashboardData.upcomingPayments.reduce((sum, p) => sum + Number(p.amount), 0)
            )}
            description="Pending payments"
            icon={<CreditCard className="size-4" />}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Current Contract */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Current Rental</CardTitle>
              <CardDescription>
                Your active rental contract details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData.activeContract ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
                      <BedDouble className="size-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">
                        Contract #{dashboardData.activeContract.contract_number}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(dashboardData.activeContract.monthly_rent)}/month
                      </p>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Start Date</span>
                      <span>{format(new Date(dashboardData.activeContract.start_date), 'PP')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">End Date</span>
                      <span>{format(new Date(dashboardData.activeContract.end_date), 'PP')}</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/dashboard/customer/contracts/${dashboardData.activeContract.id}`}>
                      View Details
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <BedDouble className="mb-4 size-12 text-muted-foreground" />
                  <h3 className="font-medium">No Active Rental</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Browse available rooms and submit a rental request.
                  </p>
                  <Button asChild>
                    <Link href="/dashboard/customer/rooms">
                      Browse Rooms
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Payments */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Upcoming Payments</CardTitle>
              <CardDescription>
                Your next payment deadlines
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData.upcomingPayments.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.upcomingPayments.slice(0, 3).map((payment) => (
                    <div key={payment.id} className="flex items-center gap-4">
                      <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                        <Calendar className="size-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium capitalize">
                          {payment.payment_type} Payment
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Due {format(new Date(payment.due_date), 'PP')}
                        </p>
                      </div>
                      <span className="font-medium">
                        {formatCurrency(Number(payment.amount))}
                      </span>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/dashboard/customer/payments">
                      View All Payments
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CreditCard className="mb-4 size-12 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    No upcoming payments
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
                <Link href="/dashboard/customer/rooms">
                  <BedDouble className="size-6" />
                  <span>Browse Rooms</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
                <Link href="/dashboard/customer/requests">
                  <ClipboardList className="size-6" />
                  <span>My Requests</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
                <Link href="/dashboard/customer/payments">
                  <CreditCard className="size-6" />
                  <span>Payments</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
                <Link href="/dashboard/customer/appointments">
                  <Calendar className="size-6" />
                  <span>Schedule Viewing</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
