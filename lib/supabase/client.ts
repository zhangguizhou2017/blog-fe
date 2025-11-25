import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xufnxrefgvhhfxjcmoad.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1Zm54cmVmZ3ZoaGZ4amNtb2FkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0NTgxOTEsImV4cCI6MjA2MDAzNDE5MX0.2nrCuUAvc61b5FDY_ndGTI_XofThjku5IzUOJ8-Mjbg"

// 创建客户端单例
let supabaseClient: ReturnType<typeof createClient> | null = null

export const getSupabaseClient = () => {
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseClient
}
