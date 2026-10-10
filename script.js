(() => {
  'use strict';
  const menuButton = document.querySelector('.menu-button');
  const mobileNav = document.querySelector('#mobile-nav');
  const closeMenu = () => {
    if (!mobileNav || !menuButton) return;
    mobileNav.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
    document.body.classList.remove('menu-open');
  };
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', () => {
      const opening = mobileNav.hidden;
      mobileNav.hidden = !opening;
      menuButton.setAttribute('aria-expanded', String(opening));
      menuButton.setAttribute('aria-label', opening ? 'Close navigation' : 'Open navigation');
      document.body.classList.toggle('menu-open', opening);
    });
    mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
    window.addEventListener('resize', () => { if (window.innerWidth > 780) closeMenu(); });
  }

  const filterButtons = [...document.querySelectorAll('.filter-button')];
  const projectCards = [...document.querySelectorAll('.project-card')];
  const projectCount = document.querySelector('.project-count');
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      filterButtons.forEach(item => {
        const selected = item === button;
        item.classList.toggle('active', selected);
        item.setAttribute('aria-pressed', String(selected));
      });
      let visible = 0;
      projectCards.forEach(card => {
        const show = filter === 'all' || card.dataset.category === filter;
        card.hidden = !show;
        if (show) visible++;
      });
      if (projectCount) projectCount.textContent = `SHOWING ${String(visible).padStart(2, '0')} OF ${String(projectCards.length).padStart(2, '0')}`;
    });
  });

  const copyButton = document.querySelector('#copy-email');
  if (copyButton) {
    let restoreTimeout;
    copyButton.addEventListener('click', async () => {
      const email = copyButton.dataset.email;
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(email);
        } else {
          const temp = document.createElement('textarea');
          temp.value = email;
          temp.style.position = 'fixed';
          temp.style.opacity = '0';
          document.body.appendChild(temp);
          temp.select();
          const success = document.execCommand('copy');
          temp.remove();
          if (!success) throw new Error('Copy unavailable');
        }
        copyButton.innerHTML = 'Copied! <span aria-hidden="true">✓</span>';
      } catch (_) {
        copyButton.textContent = 'Select the email address above';
      }
      window.clearTimeout(restoreTimeout);
      restoreTimeout = window.setTimeout(() => { copyButton.innerHTML = 'Copy email <span aria-hidden="true">⧉</span>'; }, 2800);
    });
  }

  const year = document.querySelector('#current-year');
  if (year) year.textContent = String(new Date().getFullYear());

  const header = document.querySelector('.site-header');
  const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 12);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
    document.querySelectorAll('.expertise-card, .project-card, .timeline-item, .about-copy, .about-visual').forEach(el => {
      el.classList.add('reveal');
      observer.observe(el);
    });
  }
})();
