const form = document.getElementById('bookingForm');
const toast = document.getElementById('toast');
form?.addEventListener('submit', (e) => {
  e.preventDefault();
  toast?.classList.add('show');
  form.reset();
  setTimeout(() => toast?.classList.remove('show'), 3500);
});

const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('.desktop-nav');
menu?.addEventListener('click', () => {
  nav?.classList.toggle('mobile-open');
});
