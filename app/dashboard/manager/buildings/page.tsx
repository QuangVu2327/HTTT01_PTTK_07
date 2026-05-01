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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Building2, Plus, MoreHorizontal, Pencil, Trash2, Eye } from 'lucide-react'
import Link from 'next/link'
import { createServices } from '@/lib/services'

export default async function ManagerBuildingsPage() {
  const supabase = await createClient()
  const services = createServices(supabase)
  
  const buildings = await services.property.getAllBuildings(false)

  return (
    <>
      <DashboardHeader
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard/manager' },
          { label: 'Buildings' },
        ]}
      />

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mt-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Buildings</h1>
            <p className="text-muted-foreground">
              Manage your property buildings.
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/manager/buildings/new">
              <Plus className="mr-2 size-4" />
              Add Building
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Buildings</CardTitle>
            <CardDescription>
              {buildings.length} building{buildings.length !== 1 ? 's' : ''} registered
            </CardDescription>
          </CardHeader>
          <CardContent>
            {buildings.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>District</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amenities</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {buildings.map((building) => (
                    <TableRow key={building.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Building2 className="size-4 text-muted-foreground" />
                          {building.name}
                        </div>
                      </TableCell>
                      <TableCell>{building.address}</TableCell>
                      <TableCell>{building.district || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={building.is_active ? 'default' : 'secondary'}>
                          {building.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {building.amenities?.length || 0} amenities
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/manager/buildings/${building.id}`}>
                                <Eye className="mr-2 size-4" />
                                View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/manager/buildings/${building.id}/edit`}>
                                <Pencil className="mr-2 size-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 size-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <Building2 className="mb-4 size-12 text-muted-foreground" />
                <h3 className="text-lg font-medium">No Buildings Yet</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Get started by adding your first building.
                </p>
                <Button asChild>
                  <Link href="/dashboard/manager/buildings/new">
                    <Plus className="mr-2 size-4" />
                    Add Building
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
