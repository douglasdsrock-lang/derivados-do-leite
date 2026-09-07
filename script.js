document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.querySelector('.site-header');
  const progressBar = document.querySelector('.scroll-progress span');
  const methodProgress = document.querySelector('.method-progress span');
  const methodSection = document.querySelector('.method');
  let lastScroll = 0;

  const updateScrollUi = () => {
    const y = window.scrollY;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const pageProgress = scrollable > 0 ? Math.min(y / scrollable, 1) : 0;

    if (header) {
      header.classList.toggle('scrolled', y > 34);
      header.classList.toggle('hidden', y > lastScroll && y > 300);
    }

    if (progressBar) progressBar.style.transform = `scaleX(${pageProgress})`;

    if (methodProgress && methodSection) {
      const rect = methodSection.getBoundingClientRect();
      const methodScrollable = methodSection.offsetHeight - window.innerHeight;
      const localProgress = methodScrollable > 0 ? Math.min(Math.max(-rect.top / methodScrollable, 0), 1) : 0;
      methodProgress.style.transform = `scaleX(${localProgress})`;
    }

    lastScroll = Math.max(0, y);
  };

  window.addEventListener('scroll', updateScrollUi, { passive: true });
  updateScrollUi();

  document.querySelectorAll('.faq-trigger').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.faq-item');
      const willOpen = !item.classList.contains('is-open');

      document.querySelectorAll('.faq-item.is-open').forEach((openItem) => {
        openItem.classList.remove('is-open');
        openItem.querySelector('.faq-trigger').setAttribute('aria-expanded', 'false');
      });

      item.classList.toggle('is-open', willOpen);
      trigger.setAttribute('aria-expanded', String(willOpen));
    });
  });

  document.querySelectorAll('.spotlight, .action').forEach((element) => {
    element.addEventListener('pointermove', (event) => {
      const rect = element.getBoundingClientRect();
      element.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      element.style.setProperty('--my', `${event.clientY - rect.top}px`);
    });
  });

  if (!reduceMotion) {
    document.querySelectorAll('.magnetic').forEach((element) => {
      element.addEventListener('pointermove', (event) => {
        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        element.style.transform = `translate(${x * .08}px, ${y * .1}px)`;
      });
      element.addEventListener('pointerleave', () => { element.style.transform = ''; });
    });
  }

  const revealItems = document.querySelectorAll('[data-reveal]');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: .12 });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('visible'));
  }

  const steps = Array.from(document.querySelectorAll('[data-step]'));
  if ('IntersectionObserver' in window) {
    const stepObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        steps.forEach((step) => step.classList.toggle('is-active', step === entry.target));
      });
    }, { rootMargin: '-38% 0px -45% 0px', threshold: 0 });
    steps.forEach((step) => stepObserver.observe(step));
  }

  const year = document.querySelector('#year');
  if (year) year.textContent = new Date().getFullYear();
});
