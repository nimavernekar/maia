import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://mrnequleyeuipcqcxoct.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ybmVxdWxleWV1aXBjcWN4b2N0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MDAzMjYsImV4cCI6MjA4OTI3NjMyNn0.qOWb_-HDBKRTPSVwXwzaXGxyk8l1U2_hBNOAbu0qTJs'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export function getAnonId() {
  let id = localStorage.getItem('maia_anon_id')
  if (!id) {
    id = 'anon_' + Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem('maia_anon_id', id)
  }
  return id
}
