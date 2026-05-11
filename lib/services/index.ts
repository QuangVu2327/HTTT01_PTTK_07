// lib/services/index.ts

import { SupabaseClient } from '@supabase/supabase-js'

import {
  ProfileRepository,
  RoomRepository,
  BedRepository,
  RentalRequestRepository,
  ContractRepository,
  PaymentRepository,
  StatsRepository,
} from '@/lib/repositories'

// ============================================
// AUTH SERVICE
// ============================================

export class AuthService {
  private profileRepo: ProfileRepository

  constructor(private supabase: SupabaseClient) {
    this.profileRepo = new ProfileRepository(supabase)
  }

  async signUp(
    email: string,
    password: string,
    fullName: string
  ) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
    })

    if (error) throw error

    if (data.user) {
      await this.profileRepo.create({
        auth_user_id: data.user.id,
        ten: fullName,
        email,
      })
    }

    return data
  }

  async signIn(email: string, password: string) {
    const { data, error } =
      await this.supabase.auth.signInWithPassword({
        email,
        password,
      })

    if (error) throw error

    return data
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut()

    if (error) throw error
  }

  async getCurrentUser() {
    const {
      data: { user },
    } = await this.supabase.auth.getUser()

    if (!user) return null

    return this.profileRepo.getById(user.id)
  }
}

// ============================================
// PROPERTY SERVICE
// ============================================

export class PropertyService {
  private roomRepo: RoomRepository
  private bedRepo: BedRepository

  constructor(private supabase: SupabaseClient) {
    this.roomRepo = new RoomRepository(supabase)
    this.bedRepo = new BedRepository(supabase)
  }

  async getRooms() {
    return this.roomRepo.getAll()
  }

  async getBeds() {
    return this.bedRepo.getAll()
  }

  async getAvailableBeds() {
    return this.bedRepo.getAvailable()
  }
}

// ============================================
// RENTAL SERVICE
// ============================================

export class RentalService {
  private rentalRepo: RentalRequestRepository

  constructor(private supabase: SupabaseClient) {
    this.rentalRepo = new RentalRequestRepository(supabase)
  }

  async createRentalRequest(data: any) {
    return this.rentalRepo.create(data)
  }

  async getRequests() {
    return this.rentalRepo.getAll()
  }
}

// ============================================
// CONTRACT SERVICE
// ============================================

export class ContractService {
  private contractRepo: ContractRepository

  constructor(private supabase: SupabaseClient) {
    this.contractRepo = new ContractRepository(supabase)
  }

  async getContracts(ma_khach_hang: string) {
    return this.contractRepo.getByCustomer(ma_khach_hang)
  }
}

// ============================================
// PAYMENT SERVICE
// ============================================

export class PaymentService {
  private paymentRepo: PaymentRepository

  constructor(private supabase: SupabaseClient) {
    this.paymentRepo = new PaymentRepository(supabase)
  }

  async getPayments(ma_hop_dong: string) {
    return this.paymentRepo.getByContract(ma_hop_dong)
  }
}

// ============================================
// DASHBOARD SERVICE
// ============================================

export class DashboardService {
  private statsRepo: StatsRepository

  constructor(private supabase: SupabaseClient) {
    this.statsRepo = new StatsRepository(supabase)
  }

  async getStats() {
    return this.statsRepo.getDashboardStats()
  }
}

// ============================================
// FACTORY
// ============================================

export function createServices(supabase: SupabaseClient) {
  return {
    auth: new AuthService(supabase),
    property: new PropertyService(supabase),
    rental: new RentalService(supabase),
    contract: new ContractService(supabase),
    payment: new PaymentService(supabase),
    dashboard: new DashboardService(supabase),
  }
}