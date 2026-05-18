// EduPath AI - Supabase Client (ESM)
// Load via: <script type="module" src="/js/supabase-client.js"></script>

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL = window.SUPABASE_URL || 'https://fmjxagkltxekuovwhbnp.supabase.co'
const SUPABASE_KEY = window.SUPABASE_KEY || 'sb_publishable_WaDShA2vmS5dMN5xVtE7Jw_uIU_e9rp'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Track page view
export function trackPage(path, userId) {
  if (!supabase) return
  supabase.from('page_analytics').insert({
    path: path,
    user_id: userId || null,
    user_agent: navigator.userAgent,
    referrer: document.referrer
  }).then()
}

// Verify payment status
export async function checkPaymentStatus(email) {
  if (!supabase || !email) return { paid: false }
  const { data } = await supabase
    .from('users')
    .select('has_paid')
    .eq('email', email.toLowerCase())
    .single()
  return { paid: data?.has_paid || false }
}

// Save user session
export async function saveSession(sessionId, data) {
  if (!supabase) return
  await supabase.from('sessions').upsert({
    session_token: sessionId,
    data: data,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  })
}

// Log AI query
export async function logAIQuery(sessionId, role, content) {
  if (!supabase) return
  await supabase.from('ai_queries').insert({
    session_id: sessionId,
    role: role,
    content: content
  })
}

export async function fetchOverviewStats() {
  if (!supabase) return { pageViews: 0, users: 0, paidUsers: 0, sessions: 0, aiQueries: 0 }
  const [pageRes, coursesRes, usersRes, paidRes, sessionsRes, aiRes] = await Promise.all([
    supabase.from('page_analytics').select('*', { count: 'exact', head: true }),
    supabase.from('courses').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('has_paid', true),
    supabase.from('sessions').select('*', { count: 'exact', head: true }),
    supabase.from('ai_queries').select('*', { count: 'exact', head: true }),
  ])
  return {
    pageViews: pageRes.count || 0,
    courses: coursesRes.count || 0,
    users: usersRes.count || 0,
    paidUsers: paidRes.count || 0,
    sessions: sessionsRes.count || 0,
    aiQueries: aiRes.count || 0,
  }
}

export async function fetchCourses(limit = 50) {
  if (!supabase) return []
  const { data } = await supabase.from('courses').select('*').order('name', { ascending: true }).limit(limit)
  return data || []
}

export async function fetchUsers(limit = 50) {
  if (!supabase) return []
  const { data } = await supabase
    .from('users')
    .select('email, has_paid, registered_at, updated_at')
    .order('registered_at', { ascending: false })
    .limit(limit)
  return data || []
}

export async function fetchPaidUsers(limit = 50) {
  if (!supabase) return []
  const { data } = await supabase
    .from('users')
    .select('email, has_paid, registered_at, updated_at')
    .eq('has_paid', true)
    .order('registered_at', { ascending: false })
    .limit(limit)
  return data || []
}

export async function fetchSessions(limit = 50) {
  if (!supabase) return []
  const { data } = await supabase
    .from('sessions')
    .select('session_token, expires_at, data')
    .order('created_at', { ascending: false })
    .limit(limit)
  return data || []
}

export async function fetchTopPaths(limit = 10) {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('page_analytics')
    .select('path')
    .order('created_at', { ascending: false })
    .limit(1000)
  if (error || !data) return []
  const counts = data.reduce((acc, row) => {
    const path = row.path || '/'
    acc[path] = (acc[path] || 0) + 1
    return acc
  }, {})
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([path, count]) => ({ path, count }))
}

export async function recordUser(email, metadata = {}) {
  if (!supabase || !email) return null
  const clean = email.toLowerCase().trim()
  await supabase.from('users').upsert(
    { email: clean, has_paid: false, registered_at: new Date().toISOString(), metadata },
    { onConflict: 'email' }
  ).catch(() => {})
  return clean
}

export async function recordPayment(email, amount, reference, sessionId) {
  if (!supabase || !email) return null
  const clean = email.toLowerCase().trim()
  await supabase.from('users').upsert(
    { email: clean, has_paid: true, registered_at: new Date().toISOString() },
    { onConflict: 'email' }
  ).catch(() => {})
  await supabase.from('paid_users').insert({
    email: clean,
    amount: amount || 0,
    reference: reference || null,
    session_id: sessionId || null,
    paid_at: new Date().toISOString()
  }).catch(() => {})
  return clean
}

// Initialize page tracking on load
document.addEventListener('DOMContentLoaded', () => {
  trackPage(window.location.pathname)
})

window.supabase = supabase
window.supabaseApi = {
  trackPage,
  checkPaymentStatus,
  saveSession,
  logAIQuery,
  fetchOverviewStats,
  fetchCourses,
  fetchUsers,
  fetchPaidUsers,
  fetchSessions,
  fetchTopPaths,
  recordUser,
  recordPayment
}