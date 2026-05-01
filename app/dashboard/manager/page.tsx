import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard/header'
import { StatCard } from '@/components/dashboard/stat-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Building2,
  BedDouble,
  FileText,
  CreditCard,
  Users,
  TrendingUp,
  ClipboardList,
  ArrowRight,
  Plus,
} from 'lucide-react'
import Link from 'next/link'
import { createServices } from '@/lib/services'

export default async function ManagerDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const services = createServices(supabase)
  const stats = await services.dashboard.getManagerStats()
  const pendingRequests = await services.rental.getAllRequests({ status: 'pending' })
  const recentContracts = await services.contract.getAllContracts({ status: 'active' })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const occupancyRate = stats.totalBeds > 0 
    ? Math.round((stats.occupiedBeds / stats.totalBeds) * 100)
    : 0

  return (
    <>
      <DashboardHeader
        breadcrumbs={[
          { label: 'Dashboard' },
        ]}
      />

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mt-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manager Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of your dormitory management system.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/manager/buildings">
                <Building2 className="mr-2 size-4" />
                Manage Buildings
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/manager/rooms/new">
                <Plus className="mr-2 size-4" />
                Add Room
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Buildings"
            value={stats.totalBuildings}
            description="Active properties"
            icon={<Building2 className="size-4" />}
          />
          <StatCard
            title="Total Beds"
            value={stats.totalBeds}
            description={`${stats.availableBeds} available, ${stats.occupiedBeds} occupied`}
            icon={<BedDouble className="size-4" />}
          />
          <StatCard
            title="Active Contracts"
            value={stats.activeContracts}
            description="Current tenants"
            icon={<FileText className="size-4" />}
          />
          <StatCard
            title="Monthly Revenue"
            value={formatCurrency(stats.monthlyRevenue)}
            description="This month"
            icon={<TrendingUp className="size-4" />}
            trend={{ value: 12, isPositive: true }}
          />
        </div>

        {/* Occupancy Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Occupancy Overview</CardTitle>
              <CardDescription>
                Current bed occupancy status across all buildings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Overall Occupancy Rate</p>
                    <p className="text-3xl font-bold">{occupancyRate}%</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{stats.availableBeds}</p>
                      <p className="text-xs text-muted-foreground">Available</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{stats.occupiedBeds}</p>
                      <p className="text-xs text-muted-foreground">Occupied</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">{stats.pendingRequests}</p>
                      <p className="text-xs text-muted-foreground">Pending</p>
                    </div>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all"
                    style={{ width: `${occupancyRate}%` }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/dashboard/manager/buildings">
                      View Buildings
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/dashboard/manager/rooms">
                      View Rooms
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/dashboard/manager/analytics">
                      View Analytics
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Requests */}
          <Card className="col-span-3">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Pending Requests</CardTitle>
                <CardDescription>
                  Rental requests awaiting approval
                </CardDescription>
              </div>
              <Badge variant="secondary">{pendingRequests.length} pending</Badge>
            </CardHeader>
            <CardContent>
              {pendingRequests.length > 0 ? (
                <div className="space-y-4">
                  {pendingRequests.slice(0, 4).map((request) => (
                    <div key={request.id} className="flex items-center gap-4">
                      <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                        <ClipboardList className="size-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {request.customer?.full_name || 'Customer'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Room {request.bed?.room?.room_number}
                        </p>
                      </div>
                      <Badge variant="outline">Pending</Badge>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/dashboard/manager/requests">
                      View All Requests
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <ClipboardList className="mb-4 size-12 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    No pending requests
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Contracts & Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Active Contracts</CardTitle>
              <CardDescription>
                Latest tenant contracts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentContracts.length > 0 ? (
                <div className="space-y-4">
                  {recentContracts.slice(0, 5).map((contract) => (
                    <div key={contract.id} className="flex items-center gap-4">
                      <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                        <FileText className="size-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          {contract.contract_number}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {contract.customer?.full_name}
                        </p>
                      </div>
                      <span className="text-sm font-medium">
                        {formatCurrency(contract.monthly_rent)}/mo
                      </span>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/dashboard/manager/contracts">
                      View All Contracts
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="mb-4 size-12 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    No active contracts
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common management tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <Button variant="outline" className="justify-start h-auto py-3" asChild>
                  <Link href="/dashboard/manager/buildings/new">
                    <Building2 className="mr-3 size-5" />
                    <div className="text-left">
                      <p className="font-medium">Add New Building</p>
                      <p className="text-xs text-muted-foreground">Register a new property</p>
                    </div>
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start h-auto py-3" asChild>
                  <Link href="/dashboard/manager/rooms/new">
                    <BedDouble className="mr-3 size-5" />
                    <div className="text-left">
                      <p className="font-medium">Add New Room</p>
                      <p className="text-xs text-muted-foreground">Create room and beds</p>
                    </div>
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start h-auto py-3" asChild>
                  <Link href="/dashboard/manager/users">
                    <Users className="mr-3 size-5" />
                    <div className="text-left">
                      <p className="font-medium">Manage Users</p>
                      <p className="text-xs text-muted-foreground">Staff and tenants</p>
                    </div>
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start h-auto py-3" asChild>
                  <Link href="/dashboard/manager/payments">
                    <CreditCard className="mr-3 size-5" />
                    <div className="text-left">
                      <p className="font-medium">View Payments</p>
                      <p className="text-xs text-muted-foreground">Track all transactions</p>
                    </div>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
