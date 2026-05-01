// ============================================
// BUSINESS LAYER - Services
// Contains business logic, orchestrates repositories
// ============================================

import { SupabaseClient } from '@supabase/supabase-js'
import {
  ProfileRepository,
  BuildingRepository,
  RoomRepository,
  BedRepository,
  RentalRequestRepository,
  ContractRepository,
  PaymentRepository,
  NotificationRepository,
  StatsRepository,
} from '@/lib/repositories'
import type {
  Profile,
  Building,
  Room,
  Bed,
  RentalRequest,
  Contract,
  Payment,
  RentalRequestStatus,
} from '@/lib/types'

// ============================================
// Auth Service
// ============================================
export class AuthService {
  constructor(private supabase: SupabaseClient) {}

  async getCurrentUser(): Promise<Profile | null> {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) return null

    const profileRepo = new ProfileRepository(this.supabase)
    return profileRepo.getById(user.id)
  }

  async signUp(email: string, password: string, fullName: string, role: Profile['role'] = 'customer') {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? 
          `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
        data: {
          full_name: fullName,
          role,
        },
      },
    })

    if (error) throw error
    return data
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
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

  async updateProfile(userId: string, updates: Partial<Profile>) {
    const profileRepo = new ProfileRepository(this.supabase)
    return profileRepo.update(userId, updates)
  }
}

// ============================================
// Property Service (Buildings, Rooms, Beds)
// ============================================
export class PropertyService {
  private buildingRepo: BuildingRepository
  private roomRepo: RoomRepository
  private bedRepo: BedRepository

  constructor(private supabase: SupabaseClient) {
    this.buildingRepo = new BuildingRepository(supabase)
    this.roomRepo = new RoomRepository(supabase)
    this.bedRepo = new BedRepository(supabase)
  }

  // Buildings
  async getAllBuildings(activeOnly = true): Promise<Building[]> {
    return this.buildingRepo.getAll(activeOnly)
  }

  async getBuildingById(id: string): Promise<Building | null> {
    return this.buildingRepo.getById(id)
  }

  async createBuilding(data: Omit<Building, 'id' | 'created_at' | 'updated_at'>): Promise<Building> {
    return this.buildingRepo.create(data)
  }

  async updateBuilding(id: string, data: Partial<Building>): Promise<Building> {
    return this.buildingRepo.update(id, data)
  }

  async deleteBuilding(id: string): Promise<void> {
    return this.buildingRepo.delete(id)
  }

  // Rooms
  async getAllRooms(filters?: { buildingId?: string; roomType?: string }): Promise<Room[]> {
    return this.roomRepo.getAll(filters)
  }

  async getRoomById(id: string): Promise<Room | null> {
    return this.roomRepo.getById(id)
  }

  async getAvailableRooms(): Promise<Room[]> {
    return this.roomRepo.getAvailableRooms()
  }

  async createRoom(data: Omit<Room, 'id' | 'created_at' | 'updated_at' | 'building' | 'beds'>): Promise<Room> {
    return this.roomRepo.create(data)
  }

  async updateRoom(id: string, data: Partial<Room>): Promise<Room> {
    return this.roomRepo.update(id, data)
  }

  async deleteRoom(id: string): Promise<void> {
    return this.roomRepo.delete(id)
  }

  // Beds
  async getBedsByRoom(roomId: string): Promise<Bed[]> {
    return this.bedRepo.getByRoom(roomId)
  }

  async getBedById(id: string): Promise<Bed | null> {
    return this.bedRepo.getById(id)
  }

  async getAvailableBeds(): Promise<Bed[]> {
    return this.bedRepo.getAvailable()
  }

  async createBed(data: Omit<Bed, 'id' | 'created_at' | 'updated_at' | 'room' | 'current_tenant'>): Promise<Bed> {
    return this.bedRepo.create(data)
  }

  async updateBedStatus(id: string, status: Bed['status'], tenantId?: string | null): Promise<Bed> {
    return this.bedRepo.updateStatus(id, status, tenantId)
  }

  async deleteBed(id: string): Promise<void> {
    return this.bedRepo.delete(id)
  }
}

// ============================================
// Rental Service
// ============================================
export class RentalService {
  private requestRepo: RentalRequestRepository
  private bedRepo: BedRepository
  private contractRepo: ContractRepository
  private paymentRepo: PaymentRepository
  private notificationRepo: NotificationRepository

  constructor(private supabase: SupabaseClient) {
    this.requestRepo = new RentalRequestRepository(supabase)
    this.bedRepo = new BedRepository(supabase)
    this.contractRepo = new ContractRepository(supabase)
    this.paymentRepo = new PaymentRepository(supabase)
    this.notificationRepo = new NotificationRepository(supabase)
  }

  // Create a new rental request
  async createRentalRequest(
    customerId: string,
    bedId: string,
    moveInDate: string,
    durationMonths: number,
    message?: string
  ): Promise<RentalRequest> {
    // Check if bed is available
    const bed = await this.bedRepo.getById(bedId)
    if (!bed || bed.status !== 'available') {
      throw new Error('This bed is not available for rental')
    }

    // Create the request
    const request = await this.requestRepo.create({
      customer_id: customerId,
      bed_id: bedId,
      status: 'pending',
      requested_move_in: moveInDate,
      duration_months: durationMonths,
      message: message || null,
      assigned_sales_id: null,
      processed_at: null,
      rejection_reason: null,
    })

    // Reserve the bed
    await this.bedRepo.updateStatus(bedId, 'reserved')

    return request
  }

  // Process a rental request (approve/reject)
  async processRentalRequest(
    requestId: string,
    status: RentalRequestStatus,
    processedBy: string,
    rejectionReason?: string
  ): Promise<RentalRequest> {
    const request = await this.requestRepo.getById(requestId)
    if (!request) throw new Error('Request not found')

    const updatedRequest = await this.requestRepo.updateStatus(requestId, status, {
      assigned_sales_id: processedBy,
      rejection_reason: status === 'rejected' ? rejectionReason : null,
    })

    // Update bed status based on decision
    if (status === 'rejected' || status === 'cancelled') {
      await this.bedRepo.updateStatus(request.bed_id, 'available')
    }

    // Notify customer
    await this.notificationRepo.create({
      user_id: request.customer_id,
      title: status === 'approved' ? 'Request Approved!' : 'Request Update',
      message: status === 'approved'
        ? 'Your rental request has been approved. Please proceed to sign the contract.'
        : `Your rental request has been ${status}. ${rejectionReason || ''}`,
      type: status === 'approved' ? 'success' : 'info',
      category: 'rental',
      is_read: false,
      action_url: `/customer/requests/${requestId}`,
    })

    return updatedRequest
  }

  // Get all requests
  async getAllRequests(filters?: { status?: RentalRequestStatus; customerId?: string }): Promise<RentalRequest[]> {
    return this.requestRepo.getAll(filters)
  }

  // Get request by ID
  async getRequestById(id: string): Promise<RentalRequest | null> {
    return this.requestRepo.getById(id)
  }

  // Create contract from approved request
  async createContractFromRequest(
    requestId: string,
    createdBy: string
  ): Promise<Contract> {
    const request = await this.requestRepo.getById(requestId)
    if (!request || request.status !== 'approved') {
      throw new Error('Request must be approved to create contract')
    }

    const bed = await this.bedRepo.getById(request.bed_id)
    if (!bed) throw new Error('Bed not found')

    // Generate contract number
    const contractNumber = await this.contractRepo.generateContractNumber()

    // Calculate dates
    const startDate = new Date(request.requested_move_in)
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + request.duration_months)

    // Create contract
    const contract = await this.contractRepo.create({
      contract_number: contractNumber,
      customer_id: request.customer_id,
      bed_id: request.bed_id,
      rental_request_id: requestId,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      monthly_rent: bed.price_per_month,
      deposit_amount: bed.price_per_month * 2, // 2 months deposit
      status: 'draft',
      terms: null,
      signed_at: null,
      created_by: createdBy,
    })

    // Update request status
    await this.requestRepo.updateStatus(requestId, 'completed')

    // Update bed status
    await this.bedRepo.updateStatus(request.bed_id, 'occupied', request.customer_id)

    return contract
  }
}

// ============================================
// Contract Service
// ============================================
export class ContractService {
  private contractRepo: ContractRepository
  private paymentRepo: PaymentRepository
  private bedRepo: BedRepository
  private notificationRepo: NotificationRepository

  constructor(private supabase: SupabaseClient) {
    this.contractRepo = new ContractRepository(supabase)
    this.paymentRepo = new PaymentRepository(supabase)
    this.bedRepo = new BedRepository(supabase)
    this.notificationRepo = new NotificationRepository(supabase)
  }

  async getAllContracts(filters?: { status?: Contract['status']; customerId?: string }): Promise<Contract[]> {
    return this.contractRepo.getAll(filters)
  }

  async getContractById(id: string): Promise<Contract | null> {
    return this.contractRepo.getById(id)
  }

  async activateContract(contractId: string): Promise<Contract> {
    const contract = await this.contractRepo.getById(contractId)
    if (!contract) throw new Error('Contract not found')

    // Update contract status
    const updatedContract = await this.contractRepo.updateStatus(contractId, 'active')

    // Create initial payment records (deposit + first month)
    const today = new Date()
    
    // Deposit payment
    await this.paymentRepo.create({
      contract_id: contractId,
      customer_id: contract.customer_id,
      amount: contract.deposit_amount,
      payment_type: 'deposit',
      payment_method: null,
      due_date: today.toISOString().split('T')[0],
      paid_date: null,
      status: 'pending',
      reference_number: null,
      notes: 'Security deposit',
      recorded_by: null,
    })

    // First month rent
    await this.paymentRepo.create({
      contract_id: contractId,
      customer_id: contract.customer_id,
      amount: contract.monthly_rent,
      payment_type: 'rent',
      payment_method: null,
      due_date: contract.start_date,
      paid_date: null,
      status: 'pending',
      reference_number: null,
      notes: 'First month rent',
      recorded_by: null,
    })

    // Notify customer
    await this.notificationRepo.create({
      user_id: contract.customer_id,
      title: 'Contract Activated',
      message: `Your contract ${contract.contract_number} is now active. Please complete the initial payments.`,
      type: 'success',
      category: 'contract',
      is_read: false,
      action_url: `/customer/contracts/${contractId}`,
    })

    return updatedContract
  }

  async terminateContract(contractId: string, reason?: string): Promise<Contract> {
    const contract = await this.contractRepo.getById(contractId)
    if (!contract) throw new Error('Contract not found')

    // Update contract status
    const updatedContract = await this.contractRepo.updateStatus(contractId, 'terminated')

    // Release the bed
    await this.bedRepo.updateStatus(contract.bed_id, 'available', null)

    // Notify customer
    await this.notificationRepo.create({
      user_id: contract.customer_id,
      title: 'Contract Terminated',
      message: `Your contract ${contract.contract_number} has been terminated. ${reason || ''}`,
      type: 'warning',
      category: 'contract',
      is_read: false,
      action_url: `/customer/contracts/${contractId}`,
    })

    return updatedContract
  }
}

// ============================================
// Payment Service
// ============================================
export class PaymentService {
  private paymentRepo: PaymentRepository
  private notificationRepo: NotificationRepository

  constructor(private supabase: SupabaseClient) {
    this.paymentRepo = new PaymentRepository(supabase)
    this.notificationRepo = new NotificationRepository(supabase)
  }

  async getAllPayments(filters?: { status?: Payment['status']; customerId?: string; contractId?: string }): Promise<Payment[]> {
    return this.paymentRepo.getAll(filters)
  }

  async getUpcomingPayments(customerId: string): Promise<Payment[]> {
    return this.paymentRepo.getUpcoming(customerId)
  }

  async recordPayment(
    paymentId: string,
    method: Payment['payment_method'],
    recordedBy: string
  ): Promise<Payment> {
    const payment = await this.paymentRepo.recordPayment(paymentId, method, recordedBy)

    // Notify customer
    await this.notificationRepo.create({
      user_id: payment.customer_id,
      title: 'Payment Received',
      message: `Your payment of ${payment.amount.toLocaleString()} VND has been recorded. Thank you!`,
      type: 'success',
      category: 'payment',
      is_read: false,
      action_url: `/customer/payments`,
    })

    return payment
  }

  async createPayment(data: Omit<Payment, 'id' | 'created_at' | 'updated_at' | 'contract' | 'customer'>): Promise<Payment> {
    return this.paymentRepo.create(data)
  }
}

// ============================================
// Dashboard Service
// ============================================
export class DashboardService {
  private statsRepo: StatsRepository
  private contractRepo: ContractRepository
  private paymentRepo: PaymentRepository
  private notificationRepo: NotificationRepository

  constructor(private supabase: SupabaseClient) {
    this.statsRepo = new StatsRepository(supabase)
    this.contractRepo = new ContractRepository(supabase)
    this.paymentRepo = new PaymentRepository(supabase)
    this.notificationRepo = new NotificationRepository(supabase)
  }

  async getManagerStats() {
    return this.statsRepo.getDashboardStats()
  }

  async getCustomerDashboard(customerId: string) {
    const [contracts, upcomingPayments, notifications] = await Promise.all([
      this.contractRepo.getAll({ customerId, status: 'active' }),
      this.paymentRepo.getUpcoming(customerId),
      this.notificationRepo.getByUser(customerId),
    ])

    return {
      activeContract: contracts[0] || null,
      upcomingPayments,
      notifications,
    }
  }
}

// ============================================
// Notification Service
// ============================================
export class NotificationService {
  private notificationRepo: NotificationRepository

  constructor(private supabase: SupabaseClient) {
    this.notificationRepo = new NotificationRepository(supabase)
  }

  async getNotifications(userId: string, unreadOnly = false) {
    return this.notificationRepo.getByUser(userId, unreadOnly)
  }

  async markAsRead(notificationId: string) {
    return this.notificationRepo.markAsRead(notificationId)
  }

  async markAllAsRead(userId: string) {
    return this.notificationRepo.markAllAsRead(userId)
  }

  async createNotification(data: Parameters<NotificationRepository['create']>[0]) {
    return this.notificationRepo.create(data)
  }
}

// ============================================
// Service Factory
// Creates all services with a single Supabase client
// ============================================
export function createServices(supabase: SupabaseClient) {
  return {
    auth: new AuthService(supabase),
    property: new PropertyService(supabase),
    rental: new RentalService(supabase),
    contract: new ContractService(supabase),
    payment: new PaymentService(supabase),
    dashboard: new DashboardService(supabase),
    notification: new NotificationService(supabase),
  }
}

export type Services = ReturnType<typeof createServices>
