
window.toggleMenu = function (hamburger) {
  hamburger.classList.toggle("open");
  const navLinks = hamburger.closest("nav").querySelector(".nav-links");
  if (navLinks) navLinks.classList.toggle("active");
};


document.addEventListener("DOMContentLoaded", () => {
  // Flip cards
  const cards = document.querySelectorAll(".card");
  cards.forEach(card => {
    card.addEventListener("click", () => {
      card.classList.toggle("flip");
    });
  });

  // Smooth scroll from hero
  const exploreBtn = document.getElementById('exploreBtn');
  const features = document.getElementById('features');
  if (exploreBtn && features) {
    exploreBtn.addEventListener('click', () => {
      features.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Update year in footer if present
  const currentYear = document.getElementById("currentYear");
  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }
});


