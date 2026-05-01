'use server'

import { createClient } from '@/lib/supabase/server'
import { createServices } from '@/lib/services'
import { revalidatePath } from 'next/cache'
import type { Building, Room, Bed } from '@/lib/types'

// ============================================
// Building Actions
// ============================================

export async function getBuildings(activeOnly = true) {
  const supabase = await createClient()
  const services = createServices(supabase)
  return services.property.getAllBuildings(activeOnly)
}

export async function getBuildingById(id: string) {
  const supabase = await createClient()
  const services = createServices(supabase)
  return services.property.getBuildingById(id)
}

export async function createBuilding(data: Omit<Building, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = await createClient()
  const services = createServices(supabase)
  const building = await services.property.createBuilding(data)
  revalidatePath('/dashboard/manager/buildings')
  return building
}

export async function updateBuilding(id: string, data: Partial<Building>) {
  const supabase = await createClient()
  const services = createServices(supabase)
  const building = await services.property.updateBuilding(id, data)
  revalidatePath('/dashboard/manager/buildings')
  return building
}

export async function deleteBuilding(id: string) {
  const supabase = await createClient()
  const services = createServices(supabase)
  await services.property.deleteBuilding(id)
  revalidatePath('/dashboard/manager/buildings')
}

// ============================================
// Room Actions
// ============================================

export async function getRooms(filters?: { buildingId?: string; roomType?: string }) {
  const supabase = await createClient()
  const services = createServices(supabase)
  return services.property.getAllRooms(filters)
}

export async function getRoomById(id: string) {
  const supabase = await createClient()
  const services = createServices(supabase)
  return services.property.getRoomById(id)
}

export async function getAvailableRooms() {
  const supabase = await createClient()
  const services = createServices(supabase)
  return services.property.getAvailableRooms()
}

export async function createRoom(data: Omit<Room, 'id' | 'created_at' | 'updated_at' | 'building' | 'beds'>) {
  const supabase = await createClient()
  const services = createServices(supabase)
  const room = await services.property.createRoom(data)
  revalidatePath('/dashboard/manager/rooms')
  return room
}

export async function updateRoom(id: string, data: Partial<Room>) {
  const supabase = await createClient()
  const services = createServices(supabase)
  const room = await services.property.updateRoom(id, data)
  revalidatePath('/dashboard/manager/rooms')
  return room
}

export async function deleteRoom(id: string) {
  const supabase = await createClient()
  const services = createServices(supabase)
  await services.property.deleteRoom(id)
  revalidatePath('/dashboard/manager/rooms')
}

// ============================================
// Bed Actions
// ============================================

export async function getBedsByRoom(roomId: string) {
  const supabase = await createClient()
  const services = createServices(supabase)
  return services.property.getBedsByRoom(roomId)
}

export async function getBedById(id: string) {
  const supabase = await createClient()
  const services = createServices(supabase)
  return services.property.getBedById(id)
}

export async function getAvailableBeds() {
  const supabase = await createClient()
  const services = createServices(supabase)
  return services.property.getAvailableBeds()
}

export async function createBed(data: Omit<Bed, 'id' | 'created_at' | 'updated_at' | 'room' | 'current_tenant'>) {
  const supabase = await createClient()
  const services = createServices(supabase)
  const bed = await services.property.createBed(data)
  revalidatePath('/dashboard/manager/rooms')
  return bed
}

export async function updateBedStatus(id: string, status: Bed['status'], tenantId?: string | null) {
  const supabase = await createClient()
  const services = createServices(supabase)
  const bed = await services.property.updateBedStatus(id, status, tenantId)
  revalidatePath('/dashboard/manager/rooms')
  return bed
}

export async function deleteBed(id: string) {
  const supabase = await createClient()
  const services = createServices(supabase)
  await services.property.deleteBed(id)
  revalidatePath('/dashboard/manager/rooms')
}
