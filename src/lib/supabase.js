import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://yhokvqhllmmssyvgwzqv.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlob2t2cWhsbG1tc3N5dmd3enF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4Mzg2MTEsImV4cCI6MjEwMzQxNDYxMX0.6Mfxb8cRy_l9yy3WecDRgtQ84HLmTtDsZbtinrt0AX8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Inserts customer website lead / membership inquiry directly into public.leads table
 * Triggered by booking modal or contact form on the public website
 */
export async function saveLeadToSupabase(bookingData) {
  try {
    const { data, error } = await supabase
      .from('leads')
      .insert([
        {
          name: bookingData.name || 'Website Visitor',
          phone: bookingData.phone || '+91 77750 77653',
          email: bookingData.email || null,
          source: 'Public Website',
          stage: 'new',
          score: 92,
          interested_tier: bookingData.service || bookingData.program || 'General Membership Enquiry',
          notes: `Preferred Date: ${bookingData.date || 'Flexible'} | Time Slot: ${bookingData.time || 'Flexible'}${bookingData.message ? ' | Message: ' + bookingData.message : ''}`
        }
      ])
      .select();

    if (error) {
      console.warn('Supabase lead capture notice:', error.message);
      return { success: false, error: error.message };
    }

    console.log('✅ Lead captured into Supabase CRM:', data);
    return { success: true, data };
  } catch (err) {
    console.error('Supabase lead error:', err);
    return { success: false, error: err.message };
  }
}

export const saveAppointmentToSupabase = saveLeadToSupabase;
