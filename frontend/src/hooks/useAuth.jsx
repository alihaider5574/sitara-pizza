import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '../lib/supabaseClient'

// ─── Pre-seeded accounts for offline/mock mode ──────────────────────────────
const SEED_ACCOUNTS = [
  {
    id: '00000000-0000-0000-0000-000000000001',
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

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const isMock = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('your-project-ref');

    if (isMock) {
      ensureSeedAccounts()
      const stored = localStorage.getItem('mock_user')
      if (stored) {
        const u = JSON.parse(stored)
        setUser(u)
        setSession({ access_token: `dummy-token:${u.id}:${u.email}:${u.user_metadata?.full_name || 'User'}:${u.user_metadata?.phone || '00000000000'}`, user: u })
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
    const isMock = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('your-project-ref');
    if (isMock) {
      ensureSeedAccounts()
      const users = JSON.parse(localStorage.getItem('mock_users') || '[]')
      const matched = users.find(u => u.email === email && u.password === password)
      if (!matched) {
        return { data: null, error: { message: 'Invalid email or password' } }
      }
      const mockUser = {
        id: matched.id || crypto.randomUUID(),
        email,
        user_metadata: { full_name: matched.fullName, phone: matched.phone }
      }
      localStorage.setItem('mock_user', JSON.stringify(mockUser))
      setUser(mockUser)
      const token = `dummy-token:${mockUser.id}:${mockUser.email}:${matched.fullName}:${matched.phone}`
      setSession({ access_token: token, user: mockUser })
      return { data: { session: { access_token: token } }, error: null }
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  const signUp = async ({ email, password, fullName, phone }) => {
    const isMock = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('your-project-ref');
    if (isMock) {
      const newId = crypto.randomUUID()
      const mockUser = {
        id: newId,
        email,
        user_metadata: { full_name: fullName, phone }
      }
      const users = JSON.parse(localStorage.getItem('mock_users') || '[]')
      if (users.find(u => u.email === email)) {
        return { data: null, error: { message: "User already exists" } }
      }
      users.push({ email, password, fullName, phone, id: newId })
      localStorage.setItem('mock_users', JSON.stringify(users))

      // Auto login
      localStorage.setItem('mock_user', JSON.stringify(mockUser))
      setUser(mockUser)
      const token = `dummy-token:${mockUser.id}:${mockUser.email}:${fullName}:${phone}`
      setSession({ access_token: token, user: mockUser })

      return { data: { user: mockUser, session: { access_token: token } }, error: null }
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
    const isMock = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('your-project-ref');
    if (isMock) {
      localStorage.removeItem('mock_user')
      setUser(null)
      setSession(null)
      return
    }
    await supabase.auth.signOut()
  }

  const signInWithGoogle = async () => {
    const isMock = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('your-project-ref');
    if (isMock) {
      return { data: null, error: { message: "OAuth not supported in offline mode" } }
    }
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    return { data, error }
  }

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      isAuthenticated: !!user,
      signIn,
      signUp,
      signOut,
      signInWithGoogle,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
