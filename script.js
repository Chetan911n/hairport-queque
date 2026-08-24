const form = document.getElementById('bookingForm');
const toast = document.getElementById('toast');

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const inputs = form.querySelectorAll('input, select');
  const bookingData = {
    program: inputs[0]?.value || 'Free Trial Pass',
    date: inputs[1]?.value || new Date().toISOString().split('T')[0],
    time: inputs[2]?.value || '5:00 PM – 7:00 PM',
    name: inputs[3]?.value || 'Valued Gym Member',
    phone: inputs[4]?.value || '+91 77750 77653'
  };

  if (toast) {
    toast.textContent = "⚡ Confirming Free Trial Pass...";
    toast.classList.add('show');
  }

  // Attempt Supabase live database sync
  if (typeof saveAppointmentToSupabase === 'function') {
    const res = await saveAppointmentToSupabase({
      name: bookingData.name,
      phone: bookingData.phone,
      service: bookingData.program,
      date: bookingData.date,
      time: bookingData.time
    });

    if (res.success) {
      if (toast) toast.textContent = "🔥 Free Trial Pass confirmed & saved in M Square Database!";
    } else {
      if (toast) toast.textContent = `Trial Pass requested! Redirecting to M Square WhatsApp (+91 77750 77653)...`;
    }
  } else {
    if (toast) toast.textContent = `Trial Pass requested! Redirecting to M Square WhatsApp (+91 77750 77653)...`;
  }

  // Direct WhatsApp Message Trigger for instant booking confirmation
  const whatsappMsg = `Hi M Square Fitness! I want to claim my Free Trial Pass.%0A%0A*Name:* ${encodeURIComponent(bookingData.name)}%0A*Phone:* ${encodeURIComponent(bookingData.phone)}%0A*Program:* ${encodeURIComponent(bookingData.program)}%0A*Preferred Date:* ${encodeURIComponent(bookingData.date)}%0A*Time Slot:* ${encodeURIComponent(bookingData.time)}`;
  
  setTimeout(() => {
    window.open(`https://wa.me/917775077653?text=${whatsappMsg}`, '_blank');
  }, 1200);

  form.reset();
  setTimeout(() => toast?.classList.remove('show'), 4000);
});

const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('.desktop-nav');
menu?.addEventListener('click', () => {
  nav?.classList.toggle('mobile-open');
});
