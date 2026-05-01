'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Building2,
  Home,
  BedDouble,
  FileText,
  CreditCard,
  CalendarDays,
  Users,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  Search,
  ClipboardList,
  Wallet,
  RefreshCcw,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Profile } from '@/lib/types'

interface NavItem {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const navigationByRole: Record<Profile['role'], NavGroup[]> = {
  customer: [
    {
      label: 'Overview',
      items: [
        { title: 'Dashboard', url: '/dashboard/customer', icon: Home },
        { title: 'Browse Rooms', url: '/dashboard/customer/rooms', icon: Search },
      ],
    },
    {
      label: 'My Rentals',
      items: [
        { title: 'My Requests', url: '/dashboard/customer/requests', icon: ClipboardList },
        { title: 'My Contracts', url: '/dashboard/customer/contracts', icon: FileText },
        { title: 'Payments', url: '/dashboard/customer/payments', icon: CreditCard },
      ],
    },
    {
      label: 'Schedule',
      items: [
        { title: 'Appointments', url: '/dashboard/customer/appointments', icon: CalendarDays },
      ],
    },
  ],
  sales: [
    {
      label: 'Overview',
      items: [
        { title: 'Dashboard', url: '/dashboard/sales', icon: Home },
      ],
    },
    {
      label: 'Sales',
      items: [
        { title: 'Rental Requests', url: '/dashboard/sales/requests', icon: ClipboardList },
        { title: 'Appointments', url: '/dashboard/sales/appointments', icon: CalendarDays },
        { title: 'Contracts', url: '/dashboard/sales/contracts', icon: FileText },
      ],
    },
    {
      label: 'Properties',
      items: [
        { title: 'Buildings', url: '/dashboard/sales/buildings', icon: Building2 },
        { title: 'Rooms', url: '/dashboard/sales/rooms', icon: BedDouble },
      ],
    },
  ],
  accountant: [
    {
      label: 'Overview',
      items: [
        { title: 'Dashboard', url: '/dashboard/accountant', icon: Home },
      ],
    },
    {
      label: 'Finance',
      items: [
        { title: 'Payments', url: '/dashboard/accountant/payments', icon: Wallet },
        { title: 'Refunds', url: '/dashboard/accountant/refunds', icon: RefreshCcw },
        { title: 'Reports', url: '/dashboard/accountant/reports', icon: BarChart3 },
      ],
    },
    {
      label: 'Records',
      items: [
        { title: 'Contracts', url: '/dashboard/accountant/contracts', icon: FileText },
      ],
    },
  ],
  manager: [
    {
      label: 'Overview',
      items: [
        { title: 'Dashboard', url: '/dashboard/manager', icon: Home },
        { title: 'Analytics', url: '/dashboard/manager/analytics', icon: BarChart3 },
      ],
    },
    {
      label: 'Properties',
      items: [
        { title: 'Buildings', url: '/dashboard/manager/buildings', icon: Building2 },
        { title: 'Rooms', url: '/dashboard/manager/rooms', icon: BedDouble },
      ],
    },
    {
      label: 'Operations',
      items: [
        { title: 'Rental Requests', url: '/dashboard/manager/requests', icon: ClipboardList },
        { title: 'Contracts', url: '/dashboard/manager/contracts', icon: FileText },
        { title: 'Payments', url: '/dashboard/manager/payments', icon: CreditCard },
      ],
    },
    {
      label: 'Administration',
      items: [
        { title: 'Users', url: '/dashboard/manager/users', icon: Users },
        { title: 'Settings', url: '/dashboard/manager/settings', icon: Settings },
      ],
    },
  ],
}

interface DashboardSidebarProps {
  user: Profile
  onSignOut: () => void
}

export function DashboardSidebar({ user, onSignOut }: DashboardSidebarProps) {
  const pathname = usePathname()
  const navigation = navigationByRole[user.role]

  const getInitials = (name: string | null) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={`/dashboard/${user.role}`}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Building2 className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">DormHub</span>
                  <span className="truncate text-xs capitalize text-muted-foreground">
                    {user.role} Portal
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {navigation.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                      tooltip={item.title}
                    >
                      <Link href={item.url}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="size-8">
                    <AvatarImage src={user.avatar_url || undefined} alt={user.full_name || 'User'} />
                    <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.full_name || 'User'}</span>
                    <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/${user.role}/profile`}>
                    <Settings className="mr-2 size-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/${user.role}/notifications`}>
                    <Bell className="mr-2 size-4" />
                    Notifications
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onSignOut}>
                  <LogOut className="mr-2 size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
