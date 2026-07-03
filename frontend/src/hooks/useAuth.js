import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

// ─── Pre-seeded accounts for offline/mock mode ──────────────────────────────
const SEED_ACCOUNTS = [
  {
    id: 'admin-00000000-0000-0000-0000-000000000001',
    email: 'admin@sitara.com',
    password: 'admin123',
    fullName: 'Admin User',
    phone: '0300-0000000',
  },
]

function ensureSeedAccounts() {
  const users = JSON.parse(localStorage.getItem('mock_users') || '[]')
  let changed = false
  for (const seed of SEED_ACCOUNTS) {
    if (!users.find(u => u.email === seed.email)) {
      users.push(seed)
      changed = true
    }
  }
  if (changed) localStorage.setItem('mock_users', JSON.stringify(users))
}

export function useAuth() {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const isMock = import.meta.env.VITE_SUPABASE_URL?.includes('your-project-ref');

    if (isMock) {
      // Ensure admin & seed accounts exist every time
      ensureSeedAccounts()

      const stored = localStorage.getItem('mock_user')
      if (stored) {
        const u = JSON.parse(stored)
        setUser(u)
        setSession({ access_token: 'dummy-token', user: u })
      }
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }).catch(err => {
      console.warn('Supabase auth not configured properly:', err.message)
      setLoading(false)
    })

    // Subscribe to auth changes
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      })
      return () => subscription.unsubscribe()
    } catch (e) {}
  }, [])

  const signIn = async ({ email, password }) => {
    const isMock = import.meta.env.VITE_SUPABASE_URL?.includes('your-project-ref');
    if (isMock) {
      // Re-ensure seed accounts are present before every login attempt
      ensureSeedAccounts()
      const users = JSON.parse(localStorage.getItem('mock_users') || '[]')
      const matched = users.find(u => u.email === email && u.password === password)
      if (!matched) {
        return { data: null, error: { message: 'Invalid email or password' } }
      }
      const mockUser = {
        id: matched.id || '00000000-0000-0000-0000-000000000000',
        email,
        user_metadata: { full_name: matched.fullName, phone: matched.phone }
      }
      localStorage.setItem('mock_user', JSON.stringify(mockUser))
      setUser(mockUser)
      setSession({ access_token: 'dummy-token', user: mockUser })
      return { data: { session: { access_token: 'dummy-token' } }, error: null }
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  const signUp = async ({ email, password, fullName, phone }) => {
    const isMock = import.meta.env.VITE_SUPABASE_URL?.includes('your-project-ref');
    if (isMock) {
      const mockUser = {
        id: '00000000-0000-0000-0000-000000000000',
        email,
        user_metadata: { full_name: fullName, phone }
      }
      const users = JSON.parse(localStorage.getItem('mock_users') || '[]')
      if (users.find(u => u.email === email)) {
        return { data: null, error: { message: "User already exists" } }
      }
      users.push({ email, password, fullName, phone, id: '00000000-0000-0000-0000-000000000000' })
      localStorage.setItem('mock_users', JSON.stringify(users))
      return { data: { user: mockUser }, error: null }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone },
      },
    })
    return { data, error }
  }

  const signOut = async () => {
    const isMock = import.meta.env.VITE_SUPABASE_URL?.includes('your-project-ref');
    if (isMock) {
      localStorage.removeItem('mock_user')
      setUser(null)
      setSession(null)
      return
    }
    await supabase.auth.signOut()
  }

  const signInWithGoogle = async () => {
    const isMock = import.meta.env.VITE_SUPABASE_URL?.includes('your-project-ref');
    if (isMock) {
      return { data: null, error: { message: "OAuth not supported in offline mode" } }
    }
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    return { data, error }
  }

  return {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
  }
}
