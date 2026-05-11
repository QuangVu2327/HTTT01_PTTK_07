import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  FileText,
  CreditCard,
  ClipboardList,
  BedDouble,
} from 'lucide-react'
import Link from 'next/link'

export default async function CustomerDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Not logged in
  if (!user) {
    redirect('/auth/login')
  }

  // CUSTOMER PROFILE
  const {
    data: customer,
    error: customerError,
  } = await supabase
    .from('KhachHang')
    .select('*')
    .eq('auth_id', user.id)
    .maybeSingle()

  if (customerError || !customer) {
    console.error(customerError)

    redirect('/')
  }

  // CONTRACTS
  const {
    data: contracts,
    error: contractsError,
  } = await supabase
    .from('HopDong')
    .select('*')
    .eq('ma_khach_hang', customer.ma_khach_hang)

  if (contractsError) {
    console.error(contractsError)
  }

  // REQUESTS
  const {
    data: requests,
    error: requestsError,
  } = await supabase
    .from('YeuCauThue')
    .select('*')
    .eq('ma_khach_hang', customer.ma_khach_hang)

  if (requestsError) {
    console.error(requestsError)
  }

  // PAYMENTS
  let payments: any[] = []

  if (contracts && contracts.length > 0) {
    const contractIds = contracts.map(
      (c) => c.ma_hop_dong
    )

    const {
      data: paymentData,
      error: paymentError,
    } = await supabase
      .from('PhieuThu')
      .select('*')
      .in('ma_hop_dong', contractIds)

    if (paymentError) {
      console.error(paymentError)
    }

    payments = paymentData || []
  }

  // ACTIVE CONTRACT
  const activeContract =
    contracts?.find(
      (c) => c.trang_thai === 'Hiệu lực'
    ) || null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">
          Customer Dashboard
        </h1>

        <p className="text-muted-foreground">
          Welcome back, {customer.ten}
        </p>
      </div>

      {/* STATS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground">
                Active Contracts
              </p>

              <p className="text-2xl font-bold">
                {activeContract ? '1' : '0'}
              </p>
            </div>

            <FileText className="size-8 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground">
                Rental Requests
              </p>

              <p className="text-2xl font-bold">
                {requests?.length || 0}
              </p>
            </div>

            <ClipboardList className="size-8 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground">
                Payments
              </p>

              <p className="text-2xl font-bold">
                {payments.length}
              </p>
            </div>

            <CreditCard className="size-8 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground">
                Total Paid
              </p>

              <p className="text-2xl font-bold">
                {formatCurrency(
                  payments.reduce(
                    (sum, p) =>
                      sum + Number(p.gia_tien || 0),
                    0
                  )
                )}
              </p>
            </div>

            <BedDouble className="size-8 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      {/* ACTIVE CONTRACT */}
      <Card>
        <CardHeader>
          <CardTitle>
            Current Contract
          </CardTitle>

          <CardDescription>
            Your active rental information
          </CardDescription>
        </CardHeader>

        <CardContent>
          {activeContract ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">
                    Contract ID:{' '}
                    {activeContract.ma_hop_dong}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Start:{' '}
                    {activeContract.ngay_bat_dau}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    End:{' '}
                    {activeContract.ngay_ket_thuc}
                  </p>
                </div>

                <Badge>
                  {activeContract.trang_thai}
                </Badge>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">
              No active contract found.
            </p>
          )}
        </CardContent>
      </Card>

      {/* REQUESTS */}
      <Card>
        <CardHeader>
          <CardTitle>
            Rental Requests
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {requests && requests.length > 0 ? (
            requests.map((request) => (
              <div
                key={request.ma_yeu_cau}
                className="flex items-center justify-between border-b pb-4"
              >
                <div>
                  <p className="font-medium">
                    {request.khu_vuc_mong_muon}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Budget:{' '}
                    {formatCurrency(
                      Number(request.muc_gia || 0)
                    )}
                  </p>
                </div>

                <Badge variant="outline">
                  {request.tinh_trang_don}
                </Badge>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">
              No rental requests found.
            </p>
          )}
        </CardContent>
      </Card>

      {/* PAYMENTS */}
      <Card>
        <CardHeader>
          <CardTitle>Payments</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {payments.length > 0 ? (
            payments.map((payment) => (
              <div
                key={payment.ma_phieu}
                className="flex items-center justify-between border-b pb-4"
              >
                <div>
                  <p className="font-medium">
                    Receipt:{' '}
                    {payment.ma_phieu}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {payment.ngay}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-semibold">
                    {formatCurrency(
                      Number(payment.gia_tien)
                    )}
                  </p>

                  <Badge variant="secondary">
                    {payment.tinh_trang}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">
              No payments found.
            </p>
          )}
        </CardContent>
      </Card>

      {/* ACTIONS */}
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/">
            Home
          </Link>
        </Button>
      </div>
    </div>
  )
}