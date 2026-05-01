'use server'

import { createClient } from '@/lib/supabase/server'
import { createServices } from '@/lib/services'
import { revalidatePath } from 'next/cache'
import type { RentalRequestStatus } from '@/lib/types'

// ============================================
// Rental Request Actions
// ============================================

export async function getRentalRequests(filters?: { status?: RentalRequestStatus; customerId?: string }) {
  const supabase = await createClient()
  const services = createServices(supabase)
  return services.rental.getAllRequests(filters)
}

export async function getRentalRequestById(id: string) {
  const supabase = await createClient()
  const services = createServices(supabase)
  return services.rental.getRequestById(id)
}

export async function createRentalRequest(
  customerId: string,
  bedId: string,
  moveInDate: string,
  durationMonths: number,
  message?: string
) {
  const supabase = await createClient()
  const services = createServices(supabase)
  const request = await services.rental.createRentalRequest(
    customerId,
    bedId,
    moveInDate,
    durationMonths,
    message
  )
  revalidatePath('/dashboard/customer/requests')
  revalidatePath('/dashboard/sales/requests')
  revalidatePath('/dashboard/manager/requests')
  return request
}

export async function processRentalRequest(
  requestId: string,
  status: RentalRequestStatus,
  processedBy: string,
  rejectionReason?: string
) {
  const supabase = await createClient()
  const services = createServices(supabase)
  const request = await services.rental.processRentalRequest(
    requestId,
    status,
    processedBy,
    rejectionReason
  )
  revalidatePath('/dashboard/customer/requests')
  revalidatePath('/dashboard/sales/requests')
  revalidatePath('/dashboard/manager/requests')
  return request
}

export async function createContractFromRequest(requestId: string, createdBy: string) {
  const supabase = await createClient()
  const services = createServices(supabase)
  const contract = await services.rental.createContractFromRequest(requestId, createdBy)
  revalidatePath('/dashboard/customer/contracts')
  revalidatePath('/dashboard/sales/contracts')
  revalidatePath('/dashboard/manager/contracts')
  return contract
}

// ============================================
// Contract Actions
// ============================================

export async function getContracts(filters?: { status?: string; customerId?: string }) {
  const supabase = await createClient()
  const services = createServices(supabase)
  return services.contract.getAllContracts(filters as Parameters<typeof services.contract.getAllContracts>[0])
}

export async function getContractById(id: string) {
  const supabase = await createClient()
  const services = createServices(supabase)
  return services.contract.getContractById(id)
}

export async function activateContract(contractId: string) {
  const supabase = await createClient()
  const services = createServices(supabase)
  const contract = await services.contract.activateContract(contractId)
  revalidatePath('/dashboard/customer/contracts')
  revalidatePath('/dashboard/sales/contracts')
  revalidatePath('/dashboard/manager/contracts')
  return contract
}

export async function terminateContract(contractId: string, reason?: string) {
  const supabase = await createClient()
  const services = createServices(supabase)
  const contract = await services.contract.terminateContract(contractId, reason)
  revalidatePath('/dashboard/customer/contracts')
  revalidatePath('/dashboard/sales/contracts')
  revalidatePath('/dashboard/manager/contracts')
  return contract
}

// ============================================
// Payment Actions
// ============================================

export async function getPayments(filters?: { status?: string; customerId?: string; contractId?: string }) {
  const supabase = await createClient()
  const services = createServices(supabase)
  return services.payment.getAllPayments(filters as Parameters<typeof services.payment.getAllPayments>[0])
}

export async function getUpcomingPayments(customerId: string) {
  const supabase = await createClient()
  const services = createServices(supabase)
  return services.payment.getUpcomingPayments(customerId)
}

export async function recordPayment(
  paymentId: string,
  method: 'cash' | 'bank_transfer' | 'card' | 'e_wallet',
  recordedBy: string
) {
  const supabase = await createClient()
  const services = createServices(supabase)
  const payment = await services.payment.recordPayment(paymentId, method, recordedBy)
  revalidatePath('/dashboard/customer/payments')
  revalidatePath('/dashboard/accountant/payments')
  revalidatePath('/dashboard/manager/payments')
  return payment
}

// ============================================
// Dashboard Actions
// ============================================

export async function getManagerDashboardStats() {
  const supabase = await createClient()
  const services = createServices(supabase)
  return services.dashboard.getManagerStats()
}

export async function getCustomerDashboard(customerId: string) {
  const supabase = await createClient()
  const services = createServices(supabase)
  return services.dashboard.getCustomerDashboard(customerId)
}

// ============================================
// Notification Actions
// ============================================

export async function getNotifications(userId: string, unreadOnly = false) {
  const supabase = await createClient()
  const services = createServices(supabase)
  return services.notification.getNotifications(userId, unreadOnly)
}

export async function markNotificationAsRead(notificationId: string) {
  const supabase = await createClient()
  const services = createServices(supabase)
  await services.notification.markAsRead(notificationId)
  revalidatePath('/dashboard')
}

export async function markAllNotificationsAsRead(userId: string) {
  const supabase = await createClient()
  const services = createServices(supabase)
  await services.notification.markAllAsRead(userId)
  revalidatePath('/dashboard')
}
