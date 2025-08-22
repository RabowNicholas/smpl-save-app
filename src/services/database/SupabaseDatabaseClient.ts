import { supabase, createServiceClient } from './supabase'
import { DatabaseClient, UserService, Service, Category, User } from '@/core/types'
import { createUser } from '@/core/entities/User'

export class SupabaseDatabaseClient implements DatabaseClient {
  async saveUserService(userService: UserService): Promise<void> {
    const { data, error } = await supabase
      .from('user_services')
      .insert({
        user_id: userService.userId,
        service_id: userService.serviceId,
        created_at: userService.createdAt.toISOString(),
      })
      .select()

    if (error) {
      throw new Error(`Failed to save user service: ${error.message}`)
    }
  }

  async removeUserService(userId: string, serviceId: string): Promise<void> {
    const { data, error } = await supabase
      .from('user_services')
      .delete()
      .eq('user_id', userId)
      .eq('service_id', serviceId)

    if (error) {
      throw new Error(`Failed to remove user service: ${error.message}`)
    }
  }

  async getUserServices(userId: string): Promise<UserService[]> {
    const { data, error } = await supabase
      .from('user_services')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to fetch user services: ${error.message}`)
    }

    return (data || []).map(row => ({
      userId: row.user_id,
      serviceId: row.service_id,
      createdAt: new Date(row.created_at),
    }))
  }

  async getServicesByCategory(categoryId: string): Promise<Service[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('category_id', categoryId)

    if (error) {
      throw new Error(`Failed to fetch services: ${error.message}`)
    }

    return (data || []).map(row => ({
      id: row.id,
      name: row.name,
      logoUrl: row.logo_url,
      categoryId: row.category_id,
      isFeatured: row.is_featured,
    }))
  }

  async getAllCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order')

    if (error) {
      throw new Error(`Failed to fetch categories: ${error.message}`)
    }

    return (data || []).map(row => ({
      id: row.id,
      name: row.name,
      icon: row.icon,
      displayOrder: row.display_order,
    }))
  }

  async createUser(phone: string): Promise<User> {
    const user = createUser(phone)
    
    // Use service client to bypass RLS for user creation during phone auth
    const serviceClient = createServiceClient()
    
    const { data, error } = await serviceClient
      .from('users')
      .insert({
        id: user.id,
        phone: user.phone,
        created_at: user.createdAt.toISOString(),
        updated_at: user.updatedAt.toISOString(),
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`)
    }

    return user
  }

  async getUserByPhone(phone: string): Promise<User | null> {
    // Use service client to bypass RLS for user lookup during phone auth
    const serviceClient = createServiceClient()
    
    const { data, error } = await serviceClient
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single()

    if (error) {
      // User not found is not an error for this method
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to fetch user: ${error.message}`)
    }

    if (!data) {
      return null
    }

    return {
      id: data.id,
      phone: data.phone,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    }
  }
}