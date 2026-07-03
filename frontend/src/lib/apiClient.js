import axios from 'axios'
import { supabase } from './supabaseClient'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach Supabase JWT (or mock token) to every request automatically
apiClient.interceptors.request.use(async (config) => {
  const isMock = !import.meta.env.VITE_SUPABASE_URL ||
    import.meta.env.VITE_SUPABASE_URL.includes('your-project-ref')

  if (isMock) {
    // In offline mode, read the mock session from localStorage
    const stored = localStorage.getItem('mock_user')
    if (stored) {
      config.headers.Authorization = 'Bearer dummy-token'
    }
  } else {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`
      }
    } catch (err) {
      console.warn('Supabase auth skipped:', err.message)
    }
  }
  return config
})

// Global error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isMock = !import.meta.env.VITE_SUPABASE_URL ||
      import.meta.env.VITE_SUPABASE_URL.includes('your-project-ref')
    if (!isMock && error.response?.status === 401) {
      supabase.auth.signOut()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
