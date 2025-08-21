import { Service } from '@/core/types'
import { randomUUID } from 'crypto'

export interface CreateServiceData {
  name: string
  logoUrl: string
  categoryId: string
  isFeatured?: boolean
}

export interface UpdateServiceData {
  name?: string
  logoUrl?: string
  categoryId?: string
  isFeatured?: boolean
}

export function createService(data: CreateServiceData): Service {
  if (!validateServiceData(data)) {
    throw new Error('Invalid service data')
  }

  return {
    id: randomUUID(),
    name: data.name,
    logoUrl: data.logoUrl,
    categoryId: data.categoryId,
    isFeatured: data.isFeatured ?? false,
  }
}

export function validateServiceData(data: Partial<CreateServiceData>): boolean {
  if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
    return false
  }

  if (!data.logoUrl || typeof data.logoUrl !== 'string') {
    return false
  }

  // Basic URL validation
  try {
    new URL(data.logoUrl)
  } catch {
    return false
  }

  if (!data.categoryId || typeof data.categoryId !== 'string' || data.categoryId.trim() === '') {
    return false
  }

  return true
}

export function updateServiceData(service: Service, updates: UpdateServiceData): Service {
  // Validate that updates don't break required fields
  const updatedData = { ...service, ...updates }
  
  if (!validateServiceData(updatedData)) {
    throw new Error('Invalid update data')
  }

  return {
    ...service,
    ...updates,
  }
}