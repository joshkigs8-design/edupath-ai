// Supabase client configuration for EduPath AI
// Install: npm install @supabase/supabase-js

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://fmjxagkltxekuovwhbnp.supabase.co'
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_WaDShA2vmS5dMN5xVtE7Jw_uIU_e9rp'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// TypeScript types for tables
export interface User {
  id: string
  email: string
  full_name?: string
  has_paid: boolean
  session_token?: string
  last_login?: string
  verified: boolean
  created_at: string
}

export interface Session {
  id: string
  user_id?: string
  session_token: string
  data?: any
  created_at: string
  expires_at?: string
}

export interface Payment {
  id: string
  email: string
  amount: number
  reference: string
  status: string
  user_id?: string
  created_at: string
}

// Auth functions
export async function signUp(email: string, fullName?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: Math.random().toString(36).slice(2), // Temp password, will use OTP
  })
  if (data.user) {
    await supabase.from('users').upsert({
      id: data.user.id,
      email,
      full_name: fullName,
    })
  }
  return { data, error }
}

export async function signIn(email: string) {
  // Send magic link for passwordless auth
  return await supabase.auth.signInWithOtp({ email })
}

export async function verifySession(token: string) {
  const { data: session } = await supabase
    .from('sessions')
    .select('*, users(*)')
    .eq('session_token', token)
    .gt('expires_at', new Date().toISOString())
    .single()
  return session
}

// Admin auth
export async function adminLogin(email: string, pin: string) {
  const { data: admin } = await supabase
    .from('admin_auth')
    .select('*')
    .eq('email', email)
    .single()
  
  if (!admin) return null
  
  // Verify PIN (bcrypt comparison)
  const bcrypt = require('bcryptjs')
  const isValid = await bcrypt.compare(pin, admin.pin_hash)
  
  if (isValid) {
    await supabase
      .from('admin_auth')
      .update({ last_login: new Date().toISOString() })
      .eq('id', admin.id)
    return admin
  }
  return null
}

// Analytics
export async function trackPageView(path: string, userId?: string, ip?: string) {
  return await supabase.from('page_analytics').insert({
    path,
    user_id: userId,
    ip_address: ip,
    user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    referrer: typeof document !== 'undefined' ? document.referrer : undefined,
  })
}

// Payments
export async function verifyPayment(reference: string, email: string, amount: number) {
  const { data, error } = await supabase
    .from('payments')
    .upsert({
      email,
      amount,
      reference,
      status: 'success',
    })
    .select()
    .single()
  
  if (data && !error) {
    // Update user has_paid status
    await supabase
      .from('users')
      .update({ has_paid: true })
      .eq('email', email)
  }
  
  return { data, error }
}