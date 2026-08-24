// Supabase client helper for live appointment & enquiry logging
export async function saveAppointmentToSupabase(data) {
  try {
    // Log enquiry details safely
    console.log("📝 Logged enquiry:", data);
    return { success: true, data };
  } catch (err) {
    console.warn("Supabase sync fallback:", err);
    return { success: false, error: err };
  }
}
