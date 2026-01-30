import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Singleton instance
let supabaseInstance: SupabaseClient | null = null

export function useSupabase() {
  const isConfigured = computed(() => !!(SUPABASE_URL && SUPABASE_ANON_KEY))

  const client = computed(() => {
    if (!isConfigured.value) return null
    
    if (!supabaseInstance) {
      supabaseInstance = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!)
    }
    
    return supabaseInstance
  })

  return {
    client,
    isConfigured,
  }
}
