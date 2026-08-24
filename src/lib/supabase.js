import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-supabase-project.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

export const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY !== 'your-supabase-anon-key')
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export async function saveAppointmentToSupabase(bookingData) {
  if (!supabase) {
    return { success: false, mode: 'fallback' };
  }

  try {
    const { data, error } = await supabase
      .from('appointments')
      .insert([
        {
          customer_name: bookingData.name,
          customer_phone: bookingData.phone,
          service_name: bookingData.service,
          appointment_date: bookingData.date,
          appointment_time: bookingData.time,
          status: 'pending'
        }
      ]);

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('Supabase error:', err);
    return { success: false, error: err.message };
  }
}
