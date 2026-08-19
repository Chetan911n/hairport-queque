import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 
  import.meta.env.VITE_SUPABASE_URL || 
  import.meta.env.VITE_PUBLIC_SUPABASE_URL || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 
  import.meta.env.SUPABASE_URL || 
  'https://eggtejmtahbcbhokgyll.supabase.co';

const supabaseKey = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  import.meta.env.SUPABASE_ANON_KEY || 
  import.meta.env.SUPABASE_KEY || 
  import.meta.env.VITE_SUPABASE_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnZ3Rlam10YWhiY2Job2tneWxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzODg0NzMsImV4cCI6MjA5OTk2NDQ3M30.7EEwWnfKqQ8wvr3Fe4kKh-4dFFg-wqT3xdHKSnS6TVI';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseKey && 
  supabaseKey.trim().length > 0 && 
  !supabaseUrl.includes('placeholder')
);

let client = null;
if (isSupabaseConfigured) {
  try {
    client = createClient(supabaseUrl, supabaseKey);
  } catch (err) {
    console.warn("Supabase client initialization warning:", err);
    client = null;
  }
}

export const supabase = client;
