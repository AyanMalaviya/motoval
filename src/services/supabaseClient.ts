import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kgzyafseciwrwzfjouoq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtnenlhZnNlY2l3cnd6ZmpvdW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMDAzOTAsImV4cCI6MjA3MTY3NjM5MH0.xCiv1NzfP8bEstdRBZksKqISd709OhUWhxI9FAmRPuo'

export const supabase = createClient(supabaseUrl, supabaseKey)
