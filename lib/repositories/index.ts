// lib/repositories/index.ts

import { SupabaseClient } from '@supabase/supabase-js'

// ============================================
// PROFILE REPOSITORY
// ============================================

export class ProfileRepository {
  constructor(private supabase: SupabaseClient) {}

  async getById(id: string) {
    const { data, error } = await this.supabase
      .from('khachhang')
      .select('*')
      .eq('auth_user_id', id)
      .single()

    if (error) throw error
    return data
  }

  async getByEmail(email: string) {
    const { data, error } = await this.supabase
      .from('khachhang')
      .select('*')
      .eq('email', email)
      .single()

    if (error) return null
    return data
  }

  async create(profile: {
    auth_user_id: string
    ten: string
    email: string
    so_dien_thoai?: string
  }) {
    const ma_khach_hang = `KH${Date.now()}`

    const { data, error } = await this.supabase
      .from('khachhang')
      .insert({
        ma_khach_hang,
        auth_user_id: profile.auth_user_id,
        ten: profile.ten,
        email: profile.email,
        so_dien_thoai: profile.so_dien_thoai || '',
        gioi_tinh: '',
        loai_doi_tuong: '',
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async update(id: string, updates: any) {
    const { data, error } = await this.supabase
      .from('khachhang')
      .update(updates)
      .eq('auth_user_id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// ============================================
// ROOM REPOSITORY
// ============================================

export class RoomRepository {
  constructor(private supabase: SupabaseClient) {}

  async getAll() {
    const { data, error } = await this.supabase
      .from('phong')
      .select('*')

    if (error) throw error
    return data || []
  }

  async getById(id: string) {
    const { data, error } = await this.supabase
      .from('phong')
      .select('*')
      .eq('ma_phong', id)
      .single()

    if (error) throw error
    return data
  }
}

// ============================================
// BED REPOSITORY
// ============================================

export class BedRepository {
  constructor(private supabase: SupabaseClient) {}

  async getAll() {
    const { data, error } = await this.supabase
      .from('giuong')
      .select('*')

    if (error) throw error
    return data || []
  }

  async getById(id: string) {
    const { data, error } = await this.supabase
      .from('giuong')
      .select('*')
      .eq('ma_giuong', id)
      .single()

    if (error) throw error
    return data
  }

  async getAvailable() {
    const { data, error } = await this.supabase
      .from('giuong')
      .select('*')
      .eq('trang_thai', 'Sẵn sàng')

    if (error) throw error
    return data || []
  }
}

// ============================================
// RENTAL REQUEST REPOSITORY
// ============================================

export class RentalRequestRepository {
  constructor(private supabase: SupabaseClient) {}

  async getAll() {
    const { data, error } = await this.supabase
      .from('yeucauthue')
      .select('*')

    if (error) throw error
    return data || []
  }

  async create(request: any) {
    const ma_yeu_cau = `YC_${Date.now()}`

    const { data, error } = await this.supabase
      .from('yeucauthue')
      .insert({
        ma_yeu_cau,
        ...request,
      })
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// ============================================
// CONTRACT REPOSITORY
// ============================================

export class ContractRepository {
  constructor(private supabase: SupabaseClient) {}

  async getAll() {
    const { data, error } = await this.supabase
      .from('hopdong')
      .select('*')

    if (error) throw error
    return data || []
  }

  async getByCustomer(ma_khach_hang: string) {
    const { data, error } = await this.supabase
      .from('hopdong')
      .select('*')
      .eq('ma_khach_hang', ma_khach_hang)

    if (error) throw error
    return data || []
  }
}

// ============================================
// PAYMENT REPOSITORY
// ============================================

export class PaymentRepository {
  constructor(private supabase: SupabaseClient) {}

  async getByContract(ma_hop_dong: string) {
    const { data, error } = await this.supabase
      .from('phieuthu')
      .select('*')
      .eq('ma_hop_dong', ma_hop_dong)

    if (error) throw error
    return data || []
  }
}

// ============================================
// DASHBOARD REPOSITORY
// ============================================

export class StatsRepository {
  constructor(private supabase: SupabaseClient) {}

  async getDashboardStats() {
    const [rooms, beds, contracts] = await Promise.all([
      this.supabase.from('phong').select('*', { count: 'exact', head: true }),
      this.supabase.from('giuong').select('*', { count: 'exact', head: true }),
      this.supabase.from('hopdong').select('*', { count: 'exact', head: true }),
    ])

    return {
      totalRooms: rooms.count || 0,
      totalBeds: beds.count || 0,
      totalContracts: contracts.count || 0,
    }
  }
}