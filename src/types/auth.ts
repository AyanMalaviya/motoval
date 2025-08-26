import type { User as SupabaseUser, Session } from '@supabase/supabase-js'

// Extended User interface with custom properties
export interface User extends SupabaseUser {
  // Supabase built-in properties (already included):
  // - id: string
  // - email: string
  // - email_confirmed_at?: string
  // - phone?: string
  // - created_at: string
  // - updated_at: string
  // - last_sign_in_at?: string
  // - app_metadata: Record<string, any>
  // - user_metadata: Record<string, any>

  // Custom properties for car rental app
  profile?: UserProfile
}

// User profile stored in your custom users table
export interface UserProfile {
  id: string
  first_name?: string
  last_name?: string
  phone?: string
  date_of_birth?: string
  address?: UserAddress
  role: UserRole
  is_active: boolean
  email_verified: boolean
  phone_verified: boolean
  driver_license?: DriverLicense
  preferences?: UserPreferences
  created_at: string
  updated_at: string
}

export interface UserAddress {
  street: string
  city: string
  state: string
  postal_code: string
  country: string
}

export interface DriverLicense {
  license_number: string
  issue_date: string
  expiry_date: string
  issuing_state: string
  is_verified: boolean
}

export interface UserPreferences {
  preferred_car_type?: string[]
  preferred_pickup_locations?: string[]
  email_notifications: boolean
  sms_notifications: boolean
  marketing_emails: boolean
}

export type UserRole = 'customer' | 'admin' | 'super_admin'

export interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  isAuthenticated: boolean
}

// Form data types
export interface SignUpData {
  email: string
  password: string
  first_name: string
  last_name: string
  phone?: string
}

export interface LoginData {
  email: string
  password: string
}

export interface UserUpdateData {
  first_name?: string
  last_name?: string
  phone?: string
  date_of_birth?: string
  address?: UserAddress
  preferences?: UserPreferences
}
