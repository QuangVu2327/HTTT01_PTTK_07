import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ClipboardList, Check, X, Eye } from 'lucide-react'
import Link from 'next/link'
import { createServices } from '@/lib/services'
import { format } from 'date-fns'

export default async function ManagerRequestsPage() {
  const supabase = await createClient()
  const services = createServices(supabase)
  
  const allRequests = await services.rental.getAllRequests()
  const pendingRequests = allRequests.filter(r => r.status === 'pending')
  const approvedRequests = allRequests.filter(r => r.status === 'approved')
  const rejectedRequests = allRequests.filter(r => r.status === 'rejected')

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      approved: 'default',
      rejected: 'destructive',
      cancelled: 'outline',
      completed: 'default',
    }
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>
  }

  const RequestTable = ({ requests }: { requests: typeof allRequests }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>Room</TableHead>
          <TableHead>Move-in Date</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Requested</TableHead>
          <TableHead className="w-[120px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((request) => (
          <TableRow key={request.id}>
            <TableCell className="font-medium">
              {request.customer?.full_name || 'Unknown'}
            </TableCell>
            <TableCell>
              Room {request.bed?.room?.room_number} - Bed {request.bed?.bed_number}
            </TableCell>
            <TableCell>
              {format(new Date(request.requested_move_in), 'PP')}
            </TableCell>
            <TableCell>{request.duration_months} months</TableCell>
            <TableCell>{getStatusBadge(request.status)}</TableCell>
            <TableCell className="text-muted-foreground">
              {format(new Date(request.created_at), 'PP')}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/dashboard/manager/requests/${request.id}`}>
                    <Eye className="size-4" />
                  </Link>
                </Button>
                {request.status === 'pending' && (
                  <>
                    <Button variant="ghost" size="icon" className="text-green-600">
                      <Check className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive">
                      <X className="size-4" />
                    </Button>
                  </>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  return (
    <>
      <DashboardHeader
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard/manager' },
          { label: 'Rental Requests' },
        ]}
      />

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mt-4">
          <h1 className="text-2xl font-bold tracking-tight">Rental Requests</h1>
          <p className="text-muted-foreground">
            Review and process tenant rental requests.
          </p>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">
              Pending ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({approvedRequests.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({rejectedRequests.length})
            </TabsTrigger>
            <TabsTrigger value="all">
              All ({allRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Requests</CardTitle>
                <CardDescription>
                  Requests awaiting your review and approval
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingRequests.length > 0 ? (
                  <RequestTable requests={pendingRequests} />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <ClipboardList className="mb-4 size-12 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      No pending requests
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approved">
            <Card>
              <CardHeader>
                <CardTitle>Approved Requests</CardTitle>
                <CardDescription>
                  Requests that have been approved
                </CardDescription>
              </CardHeader>
              <CardContent>
                {approvedRequests.length > 0 ? (
                  <RequestTable requests={approvedRequests} />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <ClipboardList className="mb-4 size-12 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      No approved requests
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rejected">
            <Card>
              <CardHeader>
                <CardTitle>Rejected Requests</CardTitle>
                <CardDescription>
                  Requests that have been rejected
                </CardDescription>
              </CardHeader>
              <CardContent>
                {rejectedRequests.length > 0 ? (
                  <RequestTable requests={rejectedRequests} />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <ClipboardList className="mb-4 size-12 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      No rejected requests
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>All Requests</CardTitle>
                <CardDescription>
                  Complete list of all rental requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {allRequests.length > 0 ? (
                  <RequestTable requests={allRequests} />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <ClipboardList className="mb-4 size-12 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      No requests yet
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
