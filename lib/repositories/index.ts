// ============================================
// DATA LAYER - Repository Pattern
// All database operations go through repositories
// ============================================

import { SupabaseClient } from '@supabase/supabase-js'
import type {
  Profile,
  Building,
  Room,
  Bed,
  RentalRequest,
  ViewingAppointment,
  Contract,
  Payment,
  Refund,
  Notification,
  BedStatus,
  RentalRequestStatus,
  ContractStatus,
  PaymentStatus,
} from '@/lib/types'

// ============================================
// Profile Repository
// ============================================
export class ProfileRepository {
  constructor(private supabase: SupabaseClient) {}

  async getById(id: string): Promise<Profile | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }

  async getByRole(role: string): Promise<Profile[]> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('role', role)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  async update(id: string, updates: Partial<Profile>): Promise<Profile> {
    const { data, error } = await this.supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// ============================================
// Building Repository
// ============================================
export class BuildingRepository {
  constructor(private supabase: SupabaseClient) {}

  async getAll(activeOnly = true): Promise<Building[]> {
    let query = this.supabase.from('buildings').select('*')
    if (activeOnly) query = query.eq('is_active', true)
    
    const { data, error } = await query.order('name')
    if (error) throw error
    return data || []
  }

  async getById(id: string): Promise<Building | null> {
    const { data, error } = await this.supabase
      .from('buildings')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }

  async create(building: Omit<Building, 'id' | 'created_at' | 'updated_at'>): Promise<Building> {
    const { data, error } = await this.supabase
      .from('buildings')
      .insert(building)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async update(id: string, updates: Partial<Building>): Promise<Building> {
    const { data, error } = await this.supabase
      .from('buildings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('buildings')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// ============================================
// Room Repository
// ============================================
export class RoomRepository {
  constructor(private supabase: SupabaseClient) {}

  async getAll(filters?: { buildingId?: string; roomType?: string; activeOnly?: boolean }): Promise<Room[]> {
    let query = this.supabase
      .from('rooms')
      .select(`
        *,
        building:buildings(*),
        beds(*)
      `)
    
    if (filters?.buildingId) query = query.eq('building_id', filters.buildingId)
    if (filters?.roomType) query = query.eq('room_type', filters.roomType)
    if (filters?.activeOnly !== false) query = query.eq('is_active', true)
    
    const { data, error } = await query.order('room_number')
    if (error) throw error
    return data || []
  }

  async getById(id: string): Promise<Room | null> {
    const { data, error } = await this.supabase
      .from('rooms')
      .select(`
        *,
        building:buildings(*),
        beds(*)
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }

  async getAvailableRooms(): Promise<Room[]> {
    const { data, error } = await this.supabase
      .from('rooms')
      .select(`
        *,
        building:buildings(*),
        beds!inner(*)
      `)
      .eq('is_active', true)
      .eq('beds.status', 'available')
    
    if (error) throw error
    return data || []
  }

  async create(room: Omit<Room, 'id' | 'created_at' | 'updated_at' | 'building' | 'beds'>): Promise<Room> {
    const { data, error } = await this.supabase
      .from('rooms')
      .insert(room)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async update(id: string, updates: Partial<Room>): Promise<Room> {
    const { data, error } = await this.supabase
      .from('rooms')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from('rooms').delete().eq('id', id)
    if (error) throw error
  }
}

// ============================================
// Bed Repository
// ============================================
export class BedRepository {
  constructor(private supabase: SupabaseClient) {}

  async getByRoom(roomId: string): Promise<Bed[]> {
    const { data, error } = await this.supabase
      .from('beds')
      .select(`
        *,
        current_tenant:profiles(*)
      `)
      .eq('room_id', roomId)
      .order('bed_number')
    
    if (error) throw error
    return data || []
  }

  async getById(id: string): Promise<Bed | null> {
    const { data, error } = await this.supabase
      .from('beds')
      .select(`
        *,
        room:rooms(*, building:buildings(*)),
        current_tenant:profiles(*)
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }

  async getAvailable(): Promise<Bed[]> {
    const { data, error } = await this.supabase
      .from('beds')
      .select(`
        *,
        room:rooms(*, building:buildings(*))
      `)
      .eq('status', 'available')
      .order('price_per_month')
    
    if (error) throw error
    return data || []
  }

  async create(bed: Omit<Bed, 'id' | 'created_at' | 'updated_at' | 'room' | 'current_tenant'>): Promise<Bed> {
    const { data, error } = await this.supabase
      .from('beds')
      .insert(bed)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async updateStatus(id: string, status: BedStatus, tenantId?: string | null): Promise<Bed> {
    const { data, error } = await this.supabase
      .from('beds')
      .update({
        status,
        current_tenant_id: tenantId ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from('beds').delete().eq('id', id)
    if (error) throw error
  }
}

// ============================================
// Rental Request Repository
// ============================================
export class RentalRequestRepository {
  constructor(private supabase: SupabaseClient) {}

  async getAll(filters?: { status?: RentalRequestStatus; customerId?: string }): Promise<RentalRequest[]> {
    let query = this.supabase
      .from('rental_requests')
      .select(`
        *,
        customer:profiles!customer_id(*),
        bed:beds(*, room:rooms(*, building:buildings(*))),
        assigned_sales:profiles!assigned_sales_id(*)
      `)
    
    if (filters?.status) query = query.eq('status', filters.status)
    if (filters?.customerId) query = query.eq('customer_id', filters.customerId)
    
    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  }

  async getById(id: string): Promise<RentalRequest | null> {
    const { data, error } = await this.supabase
      .from('rental_requests')
      .select(`
        *,
        customer:profiles!customer_id(*),
        bed:beds(*, room:rooms(*, building:buildings(*))),
        assigned_sales:profiles!assigned_sales_id(*)
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }

  async create(request: Omit<RentalRequest, 'id' | 'created_at' | 'updated_at' | 'customer' | 'bed' | 'assigned_sales'>): Promise<RentalRequest> {
    const { data, error } = await this.supabase
      .from('rental_requests')
      .insert(request)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async updateStatus(id: string, status: RentalRequestStatus, additionalData?: Partial<RentalRequest>): Promise<RentalRequest> {
    const { data, error } = await this.supabase
      .from('rental_requests')
      .update({
        status,
        ...additionalData,
        processed_at: ['approved', 'rejected'].includes(status) ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// ============================================
// Viewing Appointment Repository
// ============================================
export class ViewingAppointmentRepository {
  constructor(private supabase: SupabaseClient) {}

  async getAll(filters?: { customerId?: string; salesId?: string }): Promise<ViewingAppointment[]> {
    let query = this.supabase
      .from('viewing_appointments')
      .select(`
        *,
        customer:profiles!customer_id(*),
        room:rooms(*, building:buildings(*)),
        sales:profiles!sales_id(*)
      `)
    
    if (filters?.customerId) query = query.eq('customer_id', filters.customerId)
    if (filters?.salesId) query = query.eq('sales_id', filters.salesId)
    
    const { data, error } = await query.order('scheduled_date', { ascending: true })
    if (error) throw error
    return data || []
  }

  async create(appointment: Omit<ViewingAppointment, 'id' | 'created_at' | 'updated_at' | 'customer' | 'room' | 'sales'>): Promise<ViewingAppointment> {
    const { data, error } = await this.supabase
      .from('viewing_appointments')
      .insert(appointment)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async updateStatus(id: string, status: ViewingAppointment['status']): Promise<ViewingAppointment> {
    const { data, error } = await this.supabase
      .from('viewing_appointments')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// ============================================
// Contract Repository
// ============================================
export class ContractRepository {
  constructor(private supabase: SupabaseClient) {}

  async getAll(filters?: { status?: ContractStatus; customerId?: string }): Promise<Contract[]> {
    let query = this.supabase
      .from('contracts')
      .select(`
        *,
        customer:profiles!customer_id(*),
        bed:beds(*, room:rooms(*, building:buildings(*)))
      `)
    
    if (filters?.status) query = query.eq('status', filters.status)
    if (filters?.customerId) query = query.eq('customer_id', filters.customerId)
    
    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  }

  async getById(id: string): Promise<Contract | null> {
    const { data, error } = await this.supabase
      .from('contracts')
      .select(`
        *,
        customer:profiles!customer_id(*),
        bed:beds(*, room:rooms(*, building:buildings(*)))
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }

  async create(contract: Omit<Contract, 'id' | 'created_at' | 'updated_at' | 'customer' | 'bed' | 'created_by_user'>): Promise<Contract> {
    const { data, error } = await this.supabase
      .from('contracts')
      .insert(contract)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async updateStatus(id: string, status: ContractStatus): Promise<Contract> {
    const { data, error } = await this.supabase
      .from('contracts')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async generateContractNumber(): Promise<string> {
    const year = new Date().getFullYear()
    const { count } = await this.supabase
      .from('contracts')
      .select('*', { count: 'exact', head: true })
    
    const sequence = (count || 0) + 1
    return `HD-${year}-${sequence.toString().padStart(5, '0')}`
  }
}

// ============================================
// Payment Repository
// ============================================
export class PaymentRepository {
  constructor(private supabase: SupabaseClient) {}

  async getAll(filters?: { status?: PaymentStatus; customerId?: string; contractId?: string }): Promise<Payment[]> {
    let query = this.supabase
      .from('payments')
      .select(`
        *,
        contract:contracts(*),
        customer:profiles!customer_id(*)
      `)
    
    if (filters?.status) query = query.eq('status', filters.status)
    if (filters?.customerId) query = query.eq('customer_id', filters.customerId)
    if (filters?.contractId) query = query.eq('contract_id', filters.contractId)
    
    const { data, error } = await query.order('due_date', { ascending: true })
    if (error) throw error
    return data || []
  }

  async getUpcoming(customerId: string): Promise<Payment[]> {
    const { data, error } = await this.supabase
      .from('payments')
      .select(`
        *,
        contract:contracts(*)
      `)
      .eq('customer_id', customerId)
      .eq('status', 'pending')
      .gte('due_date', new Date().toISOString().split('T')[0])
      .order('due_date', { ascending: true })
      .limit(5)
    
    if (error) throw error
    return data || []
  }

  async create(payment: Omit<Payment, 'id' | 'created_at' | 'updated_at' | 'contract' | 'customer'>): Promise<Payment> {
    const { data, error } = await this.supabase
      .from('payments')
      .insert(payment)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async recordPayment(id: string, method: Payment['payment_method'], recordedBy: string): Promise<Payment> {
    const { data, error } = await this.supabase
      .from('payments')
      .update({
        status: 'paid',
        payment_method: method,
        paid_date: new Date().toISOString().split('T')[0],
        recorded_by: recordedBy,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// ============================================
// Refund Repository
// ============================================
export class RefundRepository {
  constructor(private supabase: SupabaseClient) {}

  async getAll(filters?: { status?: RefundStatus; customerId?: string }): Promise<Refund[]> {
    let query = this.supabase
      .from('refunds')
      .select(`
        *,
        contract:contracts(*),
        customer:profiles!customer_id(*)
      `)
    
    if (filters?.status) query = query.eq('status', filters.status)
    if (filters?.customerId) query = query.eq('customer_id', filters.customerId)
    
    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  }

  async create(refund: Omit<Refund, 'id' | 'created_at' | 'updated_at' | 'contract' | 'customer'>): Promise<Refund> {
    const { data, error } = await this.supabase
      .from('refunds')
      .insert(refund)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async approve(id: string, approvedBy: string): Promise<Refund> {
    const { data, error } = await this.supabase
      .from('refunds')
      .update({
        status: 'approved',
        approved_by: approvedBy,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async process(id: string): Promise<Refund> {
    const { data, error } = await this.supabase
      .from('refunds')
      .update({
        status: 'processed',
        processed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// ============================================
// Notification Repository
// ============================================
export class NotificationRepository {
  constructor(private supabase: SupabaseClient) {}

  async getByUser(userId: string, unreadOnly = false): Promise<Notification[]> {
    let query = this.supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
    
    if (unreadOnly) query = query.eq('is_read', false)
    
    const { data, error } = await query.order('created_at', { ascending: false }).limit(50)
    if (error) throw error
    return data || []
  }

  async create(notification: Omit<Notification, 'id' | 'created_at'>): Promise<Notification> {
    const { data, error } = await this.supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async markAsRead(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
    
    if (error) throw error
  }

  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
    
    if (error) throw error
  }
}

// ============================================
// Stats Repository (for dashboards)
// ============================================
export class StatsRepository {
  constructor(private supabase: SupabaseClient) {}

  async getDashboardStats() {
    const [buildings, beds, requests, contracts, payments] = await Promise.all([
      this.supabase.from('buildings').select('id', { count: 'exact' }).eq('is_active', true),
      this.supabase.from('beds').select('id, status'),
      this.supabase.from('rental_requests').select('id', { count: 'exact' }).eq('status', 'pending'),
      this.supabase.from('contracts').select('id', { count: 'exact' }).eq('status', 'active'),
      this.supabase
        .from('payments')
        .select('amount')
        .eq('status', 'paid')
        .gte('paid_date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]),
    ])

    const bedsData = beds.data || []
    const availableBeds = bedsData.filter(b => b.status === 'available').length
    const occupiedBeds = bedsData.filter(b => b.status === 'occupied').length
    const monthlyRevenue = (payments.data || []).reduce((sum, p) => sum + Number(p.amount), 0)

    return {
      totalBuildings: buildings.count || 0,
      totalBeds: bedsData.length,
      availableBeds,
      occupiedBeds,
      pendingRequests: requests.count || 0,
      activeContracts: contracts.count || 0,
      monthlyRevenue,
    }
  }
}
