
import { ref } from 'vue'
import { supabase } from './supabase.js'

const user = ref(null)
const loading = ref(true)

let initialized = false

export function useAuth() {
  if (!initialized) {
    initialized = true

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) console.error('Session error:', error)

      user.value = data?.session?.user ?? null
      loading.value = false
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user ?? null
      loading.value = false
    })
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })

    if (error) throw error
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return {
    user,
    loading,
    signInWithGoogle,
    signOut,
  }
}
