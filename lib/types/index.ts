// ============================================
// DATA LAYER - Type Definitions
// ============================================

// User roles
export type UserRole = 'customer' | 'sales' | 'accountant' | 'manager'

// Profile (User)
export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: UserRole
  avatar_url: string | null
  created_at: string
  updated_at: string
}

// Building
export interface Building {
  id: string
  name: string
  address: string
  district: string | null
  city: string
  description: string | null
  amenities: string[]
  images: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

// Room types
export type RoomType = 'single' | 'double' | 'quad' | 'dorm'

// Room
export interface Room {
  id: string
  building_id: string
  room_number: string
  floor: number
  room_type: RoomType
  capacity: number
  base_price: number
  area_sqm: number | null
  amenities: string[]
  images: string[]
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  // Joined relations
  building?: Building
  beds?: Bed[]
}

// Bed status
export type BedStatus = 'available' | 'occupied' | 'reserved' | 'maintenance'

// Bed
export interface Bed {
  id: string
  room_id: string
  bed_number: string
  price_per_month: number
  status: BedStatus
  current_tenant_id: string | null
  created_at: string
  updated_at: string
  // Joined relations
  room?: Room
  current_tenant?: Profile
}

// Rental request status
export type RentalRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed'

// Rental Request
export interface RentalRequest {
  id: string
  customer_id: string
  bed_id: string
  status: RentalRequestStatus
  requested_move_in: string
  duration_months: number
  message: string | null
  assigned_sales_id: string | null
  processed_at: string | null
  rejection_reason: string | null
  created_at: string
  updated_at: string
  // Joined relations
  customer?: Profile
  bed?: Bed
  assigned_sales?: Profile
}

// Viewing appointment status
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show'

// Viewing Appointment
export interface ViewingAppointment {
  id: string
  customer_id: string
  room_id: string
  sales_id: string | null
  scheduled_date: string
  scheduled_time: string
  status: AppointmentStatus
  notes: string | null
  created_at: string
  updated_at: string
  // Joined relations
  customer?: Profile
  room?: Room
  sales?: Profile
}

// Contract status
export type ContractStatus = 'draft' | 'active' | 'expired' | 'terminated' | 'renewed'

// Contract
export interface Contract {
  id: string
  contract_number: string
  customer_id: string
  bed_id: string
  rental_request_id: string | null
  start_date: string
  end_date: string
  monthly_rent: number
  deposit_amount: number
  status: ContractStatus
  terms: string | null
  signed_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  // Joined relations
  customer?: Profile
  bed?: Bed
  created_by_user?: Profile
}

// Payment type
export type PaymentType = 'rent' | 'deposit' | 'utility' | 'penalty' | 'other'
export type PaymentMethod = 'cash' | 'bank_transfer' | 'card' | 'e_wallet'
export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'cancelled'

// Payment
export interface Payment {
  id: string
  contract_id: string
  customer_id: string
  amount: number
  payment_type: PaymentType
  payment_method: PaymentMethod | null
  due_date: string
  paid_date: string | null
  status: PaymentStatus
  reference_number: string | null
  notes: string | null
  recorded_by: string | null
  created_at: string
  updated_at: string
  // Joined relations
  contract?: Contract
  customer?: Profile
}

// Refund type
export type RefundType = 'deposit' | 'overpayment' | 'early_termination' | 'other'
export type RefundStatus = 'pending' | 'approved' | 'processed' | 'rejected'

// Refund
export interface Refund {
  id: string
  contract_id: string
  customer_id: string
  amount: number
  refund_type: RefundType
  status: RefundStatus
  reason: string | null
  approved_by: string | null
  processed_at: string | null
  created_at: string
  updated_at: string
  // Joined relations
  contract?: Contract
  customer?: Profile
}

// Notification
export type NotificationType = 'info' | 'success' | 'warning' | 'error'
export type NotificationCategory = 'rental' | 'payment' | 'contract' | 'appointment' | 'system'

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: NotificationType
  category: NotificationCategory | null
  is_read: boolean
  action_url: string | null
  created_at: string
}

// ============================================
// Dashboard Stats Types
// ============================================

export interface DashboardStats {
  totalBuildings: number
  totalRooms: number
  totalBeds: number
  availableBeds: number
  occupiedBeds: number
  pendingRequests: number
  activeContracts: number
  monthlyRevenue: number
}

export interface CustomerStats {
  activeContract: Contract | null
  pendingRequests: number
  upcomingPayments: Payment[]
  notifications: Notification[]
}
