'use server'

import { createClient } from '@/lib/supabase/server'
import { createServices } from '@/lib/services'
import { redirect } from 'next/navigation'
import type { Profile } from '@/lib/types'

export async function getCurrentUser(): Promise<Profile | null> {
  const supabase = await createClient()
  const services = createServices(supabase)
  return services.auth.getCurrentUser()
}

export async function signOut() {
  const supabase = await createClient()
  const services = createServices(supabase)
  await services.auth.signOut()
  redirect('/auth/login')
}

export async function updateProfile(userId: string, data: Partial<Profile>) {
  const supabase = await createClient()
  const services = createServices(supabase)
  return services.auth.updateProfile(userId, data)
}

export async function requireAuth(): Promise<Profile> {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/login')
  }
  return user
}

export async function requireRole(allowedRoles: Profile['role'][]): Promise<Profile> {
  const user = await requireAuth()
  if (!allowedRoles.includes(user.role)) {
    redirect('/unauthorized')
  }
  return user
}
