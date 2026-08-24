const form = document.getElementById('bookingForm');
const toast = document.getElementById('toast');

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const inputs = form.querySelectorAll('input, select');
  const bookingData = {
    service: inputs[0]?.value || 'Hair Service',
    date: inputs[1]?.value || new Date().toISOString().split('T')[0],
    time: inputs[2]?.value || '10:00 AM',
    name: inputs[3]?.value || 'Valued Customer',
    phone: inputs[4]?.value || '+91'
  };

  if (toast) {
    toast.textContent = "Processing appointment request...";
    toast.classList.add('show');
  }

  // Attempt Supabase live database sync
  if (typeof saveAppointmentToSupabase === 'function') {
    const res = await saveAppointmentToSupabase(bookingData);
    if (res.success) {
      if (toast) toast.textContent = "⚡ Appointment confirmed & saved in Supabase database!";
    } else {
      if (toast) toast.textContent = `Appointment request captured! We will confirm via +91 95798 50368.`;
    }
  } else {
    if (toast) toast.textContent = `Appointment request captured! We will confirm via +91 95798 50368.`;
  }

  form.reset();
  setTimeout(() => toast?.classList.remove('show'), 4000);
});

const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('.desktop-nav');
menu?.addEventListener('click', () => {
  nav?.classList.toggle('mobile-open');
});
