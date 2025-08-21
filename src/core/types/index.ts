export interface User {
  id: string
  phone: string
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  icon: string
  displayOrder: number
}

export interface Service {
  id: string
  name: string
  logoUrl: string
  categoryId: string
  isFeatured: boolean
}

export interface UserService {
  userId: string
  serviceId: string
  createdAt: Date
}

export interface ServiceStats {
  totalUsers: number
  servicePopularity: Record<string, number>
  categoryCompletion: Record<string, number>
}

export interface AuthProvider {
  sendVerificationCode(phone: string): Promise<void>
  verifyCode(phone: string, code: string): Promise<User>
}

export interface DatabaseClient {
  saveUserService(userService: UserService): Promise<void>
  removeUserService(userId: string, serviceId: string): Promise<void>
  getUserServices(userId: string): Promise<UserService[]>
  getServicesByCategory(categoryId: string): Promise<Service[]>
  getAllCategories(): Promise<Category[]>
  createUser(phone: string): Promise<User>
  getUserByPhone(phone: string): Promise<User | null>
}

export interface AnalyticsTracker {
  trackServiceSelection(userId: string, serviceId: string): Promise<void>
  getAggregatedStats(): Promise<ServiceStats>
}

export type ProgressStatus = 'incomplete' | 'in-progress' | 'completed'

export interface CategoryProgress {
  categoryId: string
  status: ProgressStatus
  selectedServices: Service[]
  totalServices: number
}

export interface OverallProgress {
  completionPercentage: number
  categoriesCompleted: number
  totalCategories: number
  servicesSelected: number
  totalServices: number
}