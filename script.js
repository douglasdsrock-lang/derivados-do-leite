document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.querySelector('.site-header');
  const progressBar = document.querySelector('.scroll-progress span');
  const methodProgress = document.querySelector('.method-progress span');
  const methodSection = document.querySelector('.method');
  let lastScroll = 0;
  let scrollTicking = false;

  requestAnimationFrame(() => document.documentElement.classList.add('is-ready'));

  const updateScrollUi = () => {
    const y = window.scrollY;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const pageProgress = scrollable > 0 ? Math.min(y / scrollable, 1) : 0;

    document.documentElement.style.setProperty('--page-progress', pageProgress);
    document.querySelector('.hero')?.style.setProperty('--hero-shift', `${Math.min(y * .11, 72)}px`);

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

  document.querySelectorAll('.recognition, .authority, .offer, .final').forEach((section) => {
    section.addEventListener('pointermove', (event) => {
      if (scrollTicking) return;
      scrollTicking = true;
      requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        section.style.setProperty('--mx', `${event.clientX - rect.left}px`);
        section.style.setProperty('--my', `${event.clientY - rect.top}px`);
        scrollTicking = false;
      });
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

  const counter = document.querySelector('[data-count]');
  if (counter && 'IntersectionObserver' in window && !reduceMotion) {
    const target = Number(counter.dataset.count || counter.textContent);
    const counterObserver = new IntersectionObserver(([entry], observer) => {
      if (!entry.isIntersecting) return;
      const started = performance.now();
      const duration = 1350;
      const animateCount = (now) => {
        const progress = Math.min((now - started) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        counter.textContent = String(Math.round(target * eased));
        if (progress < 1) requestAnimationFrame(animateCount);
      };
      counter.textContent = '0';
      requestAnimationFrame(animateCount);
      observer.disconnect();
    }, { threshold: .5 });
    counterObserver.observe(counter);
  }

  const testimonialTrack = document.querySelector('.testimonial-track');
  const testimonialItems = Array.from(document.querySelectorAll('[data-testimonial]'));
  const testimonialDots = document.querySelector('.testimonial-dots');
  const testimonialCount = document.querySelector('.testimonial-count');
  const testimonialPrev = document.querySelector('.testimonial-prev');
  const testimonialNext = document.querySelector('.testimonial-next');

  if (testimonialTrack && testimonialItems.length && testimonialDots) {
    let testimonialIndex = 0;
    let testimonialTicking = false;

    const updateTestimonialUi = (index) => {
      testimonialIndex = Math.max(0, Math.min(index, testimonialItems.length - 1));
      testimonialCount.textContent = `${String(testimonialIndex + 1).padStart(2, '0')} / ${String(testimonialItems.length).padStart(2, '0')}`;
      testimonialDots.querySelectorAll('button').forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === testimonialIndex);
        dot.setAttribute('aria-current', dotIndex === testimonialIndex ? 'true' : 'false');
      });
    };

    const goToTestimonial = (index) => {
      const targetIndex = (index + testimonialItems.length) % testimonialItems.length;
      testimonialTrack.scrollTo({ left: testimonialItems[targetIndex].offsetLeft - testimonialTrack.offsetLeft, behavior: reduceMotion ? 'auto' : 'smooth' });
      updateTestimonialUi(targetIndex);
    };

    testimonialItems.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = 'testimonial-dot';
      dot.type = 'button';
      dot.setAttribute('aria-label', `Ir para o placeholder ${index + 1}`);
      dot.addEventListener('click', () => goToTestimonial(index));
      testimonialDots.appendChild(dot);
    });

    testimonialPrev?.addEventListener('click', () => goToTestimonial(testimonialIndex - 1));
    testimonialNext?.addEventListener('click', () => goToTestimonial(testimonialIndex + 1));
    testimonialTrack.addEventListener('scroll', () => {
      if (testimonialTicking) return;
      testimonialTicking = true;
      requestAnimationFrame(() => {
        const trackLeft = testimonialTrack.getBoundingClientRect().left;
        const closestIndex = testimonialItems.reduce((closest, item, index) => {
          const distance = Math.abs(item.getBoundingClientRect().left - trackLeft);
          return distance < closest.distance ? { index, distance } : closest;
        }, { index: 0, distance: Infinity }).index;
        updateTestimonialUi(closestIndex);
        testimonialTicking = false;
      });
    }, { passive: true });

    updateTestimonialUi(0);
  }

  const year = document.querySelector('#year');
  if (year) year.textContent = new Date().getFullYear();
});
