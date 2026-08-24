// Shortcuts Unisex Salon - Supabase Client Initialization
// Supports both CDN window.supabase and ES Module imports

const SUPABASE_URL = window.NEXT_PUBLIC_SUPABASE_URL || "https://your-supabase-project.supabase.co";
const SUPABASE_ANON_KEY = window.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-supabase-anon-key";

let supabaseClient = null;

if (window.supabase && typeof window.supabase.createClient === 'function') {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log("⚡ Supabase Client initialized successfully!");
} else {
  console.warn("⚠️ Supabase JS SDK not loaded yet. Running in offline/fallback mode.");
}

/**
 * Inserts a new appointment directly into Supabase 'public.appointments' table
 */
async function saveAppointmentToSupabase(bookingData) {
  if (!supabaseClient) {
    return { success: false, mode: "fallback" };
  }

  try {
    const { data, error } = await supabaseClient
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
    console.error("Supabase insert error:", err);
    return { success: false, error: err.message };
  }
}
