import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Building2,
  BedDouble,
  FileText,
  CreditCard,
  Users,
  Shield,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="flex min-h-svh flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Building2 className="size-6 text-primary" />
            <span className="text-xl font-bold">DormHub</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container flex flex-1 flex-col items-center justify-center gap-8 py-24 text-center">
        <div className="flex max-w-3xl flex-col gap-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-balance">
            Modern Dormitory Management System
          </h1>
          <p className="text-lg text-muted-foreground text-pretty">
            Streamline your boarding house operations with our comprehensive management platform. 
            Handle rentals, contracts, payments, and tenant communications all in one place.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/auth/sign-up">
              Start Free Trial
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/auth/login">
              Sign In
            </Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-muted/30 py-24">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Everything You Need to Manage Your Property
            </h2>
            <p className="mt-2 text-muted-foreground">
              Comprehensive tools for property managers, staff, and tenants.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <BedDouble className="mb-2 size-10 text-primary" />
                <CardTitle>Room Management</CardTitle>
                <CardDescription>
                  Manage buildings, rooms, and individual beds with detailed tracking 
                  of availability, pricing, and amenities.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <FileText className="mb-2 size-10 text-primary" />
                <CardTitle>Contract Management</CardTitle>
                <CardDescription>
                  Create, track, and manage rental contracts with automated 
                  renewals and expiration notifications.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CreditCard className="mb-2 size-10 text-primary" />
                <CardTitle>Payment Tracking</CardTitle>
                <CardDescription>
                  Track rent payments, deposits, and utilities. Generate invoices 
                  and send payment reminders automatically.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Users className="mb-2 size-10 text-primary" />
                <CardTitle>Multi-Role Access</CardTitle>
                <CardDescription>
                  Separate portals for managers, sales staff, accountants, 
                  and tenants with role-based permissions.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Shield className="mb-2 size-10 text-primary" />
                <CardTitle>Secure & Reliable</CardTitle>
                <CardDescription>
                  Enterprise-grade security with row-level data protection 
                  ensuring tenant privacy and data integrity.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Building2 className="mb-2 size-10 text-primary" />
                <CardTitle>Analytics & Reports</CardTitle>
                <CardDescription>
                  Real-time occupancy rates, revenue tracking, and customizable 
                  reports for informed decision making.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section className="py-24">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Built for Every Team Member
            </h2>
            <p className="mt-2 text-muted-foreground">
              Tailored dashboards and features for each role in your organization.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <Users className="size-4" />
                  </div>
                  Customer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-green-600" />
                    Browse available rooms
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-green-600" />
                    Submit rental requests
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-green-600" />
                    View contracts & payments
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-green-600" />
                    Schedule viewings
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <Users className="size-4" />
                  </div>
                  Sales Staff
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-green-600" />
                    Process rental requests
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-green-600" />
                    Manage appointments
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-green-600" />
                    Create contracts
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-green-600" />
                    Update room info
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
                    <CreditCard className="size-4" />
                  </div>
                  Accountant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-green-600" />
                    Record payments
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-green-600" />
                    Process refunds
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-green-600" />
                    Generate reports
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-green-600" />
                    Track revenue
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                    <Shield className="size-4" />
                  </div>
                  Manager
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-green-600" />
                    Full system access
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-green-600" />
                    Manage properties
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-green-600" />
                    User management
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-green-600" />
                    Analytics dashboard
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-primary py-16 text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Ready to Streamline Your Property Management?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
            Join hundreds of property managers who trust DormHub to manage their 
            boarding houses efficiently.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/auth/sign-up">
                Get Started Free
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <Building2 className="size-5 text-primary" />
            <span className="font-semibold">DormHub</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} DormHub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
