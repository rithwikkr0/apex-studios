/**
 * Apex Studios - Main Application Script
 * Modular Vanilla JavaScript (ES6+)
 * Handles navigation, theme switching, filtering, pricing calculations,
 * animations, sliders, modals, and comprehensive form validations.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ==========================================
  // 1. Theme Management (Dark / Light Mode)
  // ==========================================
  const themeToggle = document.getElementById('theme-toggle');
  const htmlRoot = document.documentElement;

  // Initialize theme from localStorage or default to dark
  const savedTheme = localStorage.getItem('apex_theme') || 'dark';
  htmlRoot.setAttribute('data-theme', savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = htmlRoot.getAttribute('data-theme');
      const targetTheme = currentTheme === 'dark' ? 'light' : 'dark';

      htmlRoot.setAttribute('data-theme', targetTheme);
      localStorage.setItem('apex_theme', targetTheme);
      showToast(`Switched to ${targetTheme === 'dark' ? 'Dark' : 'Light'} Mode`, 'success');
    });
  }

  // ==========================================
  // 2. Navigation & Mobile Drawer
  // ==========================================
  const siteHeader = document.getElementById('header');
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  const mobileOverlay = document.getElementById('mobile-overlay');
  const navLinks = document.querySelectorAll('.nav-link');

  // Sticky Header Shadow on Scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      siteHeader?.classList.add('scrolled');
    } else {
      siteHeader?.classList.remove('scrolled');
    }
  }, { passive: true });

  // Mobile Menu Toggle
  function toggleMobileMenu(isOpen) {
    const active = isOpen !== undefined ? isOpen : !navMenu.classList.contains('active');
    menuToggle?.classList.toggle('active', active);
    navMenu?.classList.toggle('active', active);
    mobileOverlay?.classList.toggle('active', active);
    menuToggle?.setAttribute('aria-expanded', active.toString());
    document.body.style.overflow = active ? 'hidden' : '';
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', () => toggleMobileMenu());
  }

  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', () => toggleMobileMenu(false));
  }

  // Close Mobile Menu on Nav Link Click
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        toggleMobileMenu(false);
      }
    });
  });

  // ==========================================
  // 3. Scrollspy (Highlight Active Nav Link)
  // ==========================================
  const sections = document.querySelectorAll('section[id]');

  function updateActiveNavLink() {
    const scrollY = window.pageYOffset;
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');
      const query = `.nav-link[href="#${sectionId}"]`;
      const correspondingLink = document.querySelector(query);

      if (correspondingLink) {
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          correspondingLink.classList.add('active');
        } else {
          correspondingLink.classList.remove('active');
        }
      }
    });
  }

  window.addEventListener('scroll', updateActiveNavLink, { passive: true });

  // ==========================================
  // 4. Hero Metric Count-up Animation
  // ==========================================
  const metricNumbers = document.querySelectorAll('.metric-number');
  let metricsAnimated = false;

  function animateMetrics() {
    metricNumbers.forEach(metric => {
      const target = parseFloat(metric.getAttribute('data-target'));
      const suffix = metric.getAttribute('data-suffix') || '';
      const duration = 2000;
      const stepTime = 25;
      const steps = duration / stepTime;
      const increment = target / steps;
      let currentVal = 0;

      const timer = setInterval(() => {
        currentVal += increment;
        if (currentVal >= target) {
          currentVal = target;
          clearInterval(timer);
        }
        metric.textContent = Number.isInteger(target)
          ? Math.floor(currentVal) + suffix
          : currentVal.toFixed(1) + suffix;
      }, stepTime);
    });
  }

  const metricsObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !metricsAnimated) {
        metricsAnimated = true;
        animateMetrics();
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });

  const heroMetricsSection = document.querySelector('.hero-metrics');
  if (heroMetricsSection) {
    metricsObserver.observe(heroMetricsSection);
  }

  // ==========================================
  // 5. Portfolio Filtering System
  // ==========================================
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const filterVal = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterVal === 'all' || category === filterVal) {
          card.classList.remove('is-hidden');
        } else {
          card.classList.add('is-hidden');
        }
      });
    });
  });

  // ==========================================
  // 6. Dynamic Pricing Frequency Calculator
  // ==========================================
  const billingToggle = document.getElementById('billing-toggle');
  const monthlyLabel = document.getElementById('billing-monthly-label');
  const yearlyLabel = document.getElementById('billing-yearly-label');
  const priceAmounts = document.querySelectorAll('.price-amount');
  const selectPlanButtons = document.querySelectorAll('.select-plan-btn');
  const contactServiceSelect = document.getElementById('contact-service');

  if (billingToggle) {
    billingToggle.addEventListener('change', () => {
      const isYearly = billingToggle.checked;

      monthlyLabel?.classList.toggle('active', !isYearly);
      yearlyLabel?.classList.toggle('active', isYearly);

      priceAmounts.forEach(amountEl => {
        const targetPrice = isYearly
          ? amountEl.getAttribute('data-yearly')
          : amountEl.getAttribute('data-monthly');

        // Smooth number transition animation
        amountEl.style.opacity = '0';
        amountEl.style.transform = 'translateY(-8px)';
        setTimeout(() => {
          amountEl.textContent = targetPrice;
          amountEl.style.opacity = '1';
          amountEl.style.transform = 'translateY(0)';
        }, 150);
      });
    });
  }

  // Handle "Select Plan" buttons -> auto-fill contact dropdown & smooth scroll
  selectPlanButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const planName = btn.getAttribute('data-plan');

      if (contactServiceSelect) {
        let foundOption = false;
        for (let i = 0; i < contactServiceSelect.options.length; i++) {
          if (contactServiceSelect.options[i].value === planName) {
            contactServiceSelect.selectedIndex = i;
            foundOption = true;
            break;
          }
        }
        if (!foundOption) {
          contactServiceSelect.value = 'consulting';
        }
      }

      // Smooth scroll to contact section
      const contactSec = document.getElementById('contact');
      if (contactSec) {
        contactSec.scrollIntoView({ behavior: 'smooth' });
        // Briefly focus name input
        setTimeout(() => {
          document.getElementById('contact-name')?.focus();
        }, 600);
      }

      showToast(`Selected "${planName}". Complete your details below.`, 'success');
    });
  });

  // ==========================================
  // 7. Testimonials Carousel / Slider
  // ==========================================
  const slides = document.querySelectorAll('.testimonial-slide');
  const dotBtns = document.querySelectorAll('.dot-btn');
  const prevBtn = document.getElementById('prev-testimonial');
  const nextBtn = document.getElementById('next-testimonial');
  let currentSlideIndex = 0;
  let autoSlideInterval = null;

  function showSlide(index) {
    if (!slides.length) return;

    if (index >= slides.length) {
      currentSlideIndex = 0;
    } else if (index < 0) {
      currentSlideIndex = slides.length - 1;
    } else {
      currentSlideIndex = index;
    }

    slides.forEach((slide, idx) => {
      slide.classList.toggle('active', idx === currentSlideIndex);
    });

    dotBtns.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentSlideIndex);
      dot.setAttribute('aria-selected', (idx === currentSlideIndex).toString());
    });
  }

  function nextSlide() {
    showSlide(currentSlideIndex + 1);
  }

  function prevSlide() {
    showSlide(currentSlideIndex - 1);
  }

  if (nextBtn) nextBtn.addEventListener('click', nextSlide);
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);

  dotBtns.forEach(dot => {
    dot.addEventListener('click', () => {
      const slideIdx = parseInt(dot.getAttribute('data-slide'), 10);
      showSlide(slideIdx);
    });
  });

  // Auto rotation with pause on hover
  function startAutoSlide() {
    stopAutoSlide();
    autoSlideInterval = setInterval(nextSlide, 6500);
  }

  function stopAutoSlide() {
    if (autoSlideInterval) {
      clearInterval(autoSlideInterval);
      autoSlideInterval = null;
    }
  }

  const sliderContainer = document.querySelector('.testimonials-slider-container');
  if (sliderContainer) {
    sliderContainer.addEventListener('mouseenter', stopAutoSlide);
    sliderContainer.addEventListener('mouseleave', startAutoSlide);
    startAutoSlide();
  }

  // ==========================================
  // 8. FAQ Accordion
  // ==========================================
  const accordionHeaders = document.querySelectorAll('.accordion-header');

  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const isOpen = item.classList.contains('active');
      const collapseBody = item.querySelector('.accordion-collapse');

      // Close all other accordions for clean single-expanded view
      document.querySelectorAll('.accordion-item').forEach(otherItem => {
        if (otherItem !== item && otherItem.classList.contains('active')) {
          otherItem.classList.remove('active');
          const otherHeader = otherItem.querySelector('.accordion-header');
          const otherBody = otherItem.querySelector('.accordion-collapse');
          otherHeader?.setAttribute('aria-expanded', 'false');
          if (otherBody) otherBody.style.maxHeight = null;
        }
      });

      // Toggle current item
      if (isOpen) {
        item.classList.remove('active');
        header.setAttribute('aria-expanded', 'false');
        if (collapseBody) collapseBody.style.maxHeight = null;
      } else {
        item.classList.add('active');
        header.setAttribute('aria-expanded', 'true');
        if (collapseBody) collapseBody.style.maxHeight = collapseBody.scrollHeight + 'px';
      }
    });
  });

  // ==========================================
  // 9. Contact Form Real-Time Validation
  // ==========================================
  const contactForm = document.getElementById('contact-form');
  const nameInput = document.getElementById('contact-name');
  const emailInput = document.getElementById('contact-email');
  const messageInput = document.getElementById('contact-message');
  const consentCheckbox = document.getElementById('contact-consent');
  const charCountDisplay = document.getElementById('char-count');
  const submitBtn = document.getElementById('submit-btn');

  // Character counter for message textarea
  if (messageInput && charCountDisplay) {
    messageInput.addEventListener('input', () => {
      charCountDisplay.textContent = messageInput.value.length;
    });
  }

  // Field validation helpers
  function setFieldError(fieldId, errorMsg) {
    const group = document.getElementById(`group-${fieldId}`);
    const errorEl = document.getElementById(`error-${fieldId}`);
    if (group) {
      group.classList.add('has-error');
      group.classList.remove('has-success');
    }
    if (errorEl) {
      errorEl.textContent = errorMsg;
    }
  }

  function clearFieldError(fieldId) {
    const group = document.getElementById(`group-${fieldId}`);
    const errorEl = document.getElementById(`error-${fieldId}`);
    if (group) {
      group.classList.remove('has-error');
      group.classList.add('has-success');
    }
    if (errorEl) {
      errorEl.textContent = '';
    }
  }

  function validateName() {
    const val = nameInput?.value.trim() || '';
    if (!val) {
      setFieldError('name', 'Full name is required.');
      return false;
    }
    if (val.length < 2) {
      setFieldError('name', 'Name must be at least 2 characters.');
      return false;
    }
    if (!/^[a-zA-Z\s.'-]+$/.test(val)) {
      setFieldError('name', 'Please enter a valid full name.');
      return false;
    }
    clearFieldError('name');
    return true;
  }

  function validateEmail() {
    const val = emailInput?.value.trim() || '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!val) {
      setFieldError('email', 'Work email address is required.');
      return false;
    }
    if (!emailRegex.test(val)) {
      setFieldError('email', 'Please provide a valid email (e.g. name@domain.com).');
      return false;
    }
    clearFieldError('email');
    return true;
  }

  function validateMessage() {
    const val = messageInput?.value.trim() || '';
    if (!val) {
      setFieldError('message', 'Please describe your project requirements.');
      return false;
    }
    if (val.length < 10) {
      setFieldError('message', 'Message must be at least 10 characters.');
      return false;
    }
    clearFieldError('message');
    return true;
  }

  function validateConsent() {
    if (!consentCheckbox?.checked) {
      setFieldError('consent', 'You must agree to the Privacy Policy to proceed.');
      return false;
    }
    clearFieldError('consent');
    return true;
  }

  // Real-time input listeners
  nameInput?.addEventListener('input', () => { if (nameInput.value.length > 2) validateName(); });
  nameInput?.addEventListener('blur', validateName);

  emailInput?.addEventListener('input', () => { if (emailInput.value.includes('@')) validateEmail(); });
  emailInput?.addEventListener('blur', validateEmail);

  messageInput?.addEventListener('input', () => { if (messageInput.value.length >= 10) validateMessage(); });
  messageInput?.addEventListener('blur', validateMessage);

  consentCheckbox?.addEventListener('change', validateConsent);

  // Form Submit Handler
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const isNameValid = validateName();
      const isEmailValid = validateEmail();
      const isMsgValid = validateMessage();
      const isConsentValid = validateConsent();

      if (!isNameValid || !isEmailValid || !isMsgValid || !isConsentValid) {
        showToast('Please correct the highlighted form errors.', 'error');
        // Focus first failing element
        if (!isNameValid) nameInput?.focus();
        else if (!isEmailValid) emailInput?.focus();
        else if (!isMsgValid) messageInput?.focus();
        else if (!isConsentValid) consentCheckbox?.focus();
        return;
      }

      // Simulate submission state
      submitBtn?.classList.add('loading');
      submitBtn?.setAttribute('disabled', 'true');

      setTimeout(() => {
        submitBtn?.classList.remove('loading');
        submitBtn?.removeAttribute('disabled');

        // Reset form inputs & validation states
        contactForm.reset();
        if (charCountDisplay) charCountDisplay.textContent = '0';
        ['name', 'email', 'message', 'consent'].forEach(clearFieldError);
        document.querySelectorAll('.form-group').forEach(g => g.classList.remove('has-success'));

        showToast('Thank you! Your message was sent successfully. We will reply within 24 hours.', 'success');
      }, 1200);
    });
  }

  // ==========================================
  // 10. Newsletter Subscription Form
  // ==========================================
  const newsletterForm = document.getElementById('newsletter-form');
  const newsletterEmail = document.getElementById('newsletter-email');
  const newsletterStatus = document.getElementById('newsletter-status');

  if (newsletterForm && newsletterEmail) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = newsletterEmail.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

      if (!email || !emailRegex.test(email)) {
        if (newsletterStatus) {
          newsletterStatus.textContent = 'Please enter a valid email address.';
          newsletterStatus.className = 'newsletter-status error';
        }
        showToast('Invalid email address.', 'error');
        return;
      }

      if (newsletterStatus) {
        newsletterStatus.textContent = 'Subscribed successfully! Welcome aboard.';
        newsletterStatus.className = 'newsletter-status success';
      }
      showToast('Thank you for subscribing to Apex Bulletin!', 'success');
      newsletterForm.reset();

      setTimeout(() => {
        if (newsletterStatus) newsletterStatus.textContent = '';
      }, 5000);
    });
  }

  // ==========================================
  // 11. Interactive Modals (Project & Info)
  // ==========================================
  const projectModal = document.getElementById('project-modal');
  const projectModalContent = document.getElementById('modal-project-content');
  const projectModalClose = document.getElementById('modal-close');

  const infoModal = document.getElementById('info-modal');
  const infoModalContent = document.getElementById('info-modal-content');
  const infoModalClose = document.getElementById('info-modal-close');

  // Project Database for dynamic modal rendering
  const projectDatabase = {
    nexus: {
      tag: 'FinTech Platform',
      title: 'Nexus Capital Financial Dashboard',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
      gradient: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0284c7 100%)',
      description: 'Engineered an ultra-low-latency financial dashboard delivering live streaming quotes, multi-currency portfolio tracking, and sub-10ms UI renders under heavy WebSocket feeds.',
      client: 'Nexus Capital Partners',
      timeline: '6 Weeks Delivery',
      stack: 'HTML5, CSS Grid, Vanilla JS, WebSockets',
      impact: '+42% User Session Duration, 100/100 Core Web Vitals'
    },
    zenith: {
      tag: 'Health & Wellness',
      title: 'Pulse Vitality Mobile Companion',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
      gradient: 'linear-gradient(135deg, #064e3b 0%, #059669 50%, #10b981 100%)',
      description: 'A progressive mobile web application designed to synchronize personal fitness metrics, sleep cycles, and daily mindfulness routines with offline storage.',
      client: 'Zenith Health Global',
      timeline: '4 Weeks Delivery',
      stack: 'PWA, Responsive Touch CSS, Service Worker',
      impact: '250k+ Active Mobile Downloads, 4.9 App Store Rating'
    },
    aurora: {
      tag: 'Design System',
      title: 'Prism Enterprise Design System',
      image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
      gradient: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #c084fc 100%)',
      description: 'Created a unified, WCAG 2.1 AA compliant UI component architecture. Included dark/light theme tokens, Figma mirrors, and a fully interactive documentation portal.',
      client: 'Aurora Group Inc.',
      timeline: '8 Weeks Delivery',
      stack: 'CSS Custom Variables, Semantic HTML5, Figma',
      impact: '3x Faster Feature Prototyping across 14 teams'
    },
    hyperion: {
      tag: 'AI Platform',
      title: 'Hyperion Intelligent Copilot',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      gradient: 'linear-gradient(135deg, #831843 0%, #db2777 50%, #f472b6 100%)',
      description: 'Built a sleek SaaS marketing experience and interactive prompt playground enabling real-time streaming LLM outputs with syntax highlighting.',
      client: 'Hyperion Artificial Intelligence',
      timeline: '5 Weeks Delivery',
      stack: 'Vanilla JS, CSS Animations, Markdown Parser',
      impact: '$4.2M Seed Round Raised post-launch'
    },
    solaris: {
      tag: 'Architecture & Editorial',
      title: 'Solaris Architectural Showcase',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      gradient: 'linear-gradient(135deg, #78350f 0%, #d97706 50%, #fcd34d 100%)',
      description: 'A minimalist, typography-driven portfolio displaying luxury architectural blueprints, high-definition photo series, and fluid perspective shifts.',
      client: 'Solaris Architecture Studio',
      timeline: '3 Weeks Delivery',
      stack: 'CSS 3D Transforms, Fluid Typography, Vanilla JS',
      impact: 'Nominated for Awwwards Site of the Day'
    },
    orbit: {
      tag: 'Logistics Portal',
      title: 'FleetTrack Autonomous Dispatch',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
      gradient: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #64748b 100%)',
      description: 'Real-time telemetry and fleet management platform providing dispatch managers with live driver route updates and automated incident reports.',
      client: 'Orbit Logistics LLC',
      timeline: '7 Weeks Delivery',
      stack: 'HTML5 Geolocation, Canvas API, Modular JS',
      impact: '28% Fuel Efficiency Optimization'
    }
  };

  // Service Database for dynamic modal rendering
  const serviceDatabase = {
    'web-dev': {
      tag: 'Core Engineering',
      title: 'Responsive Web Applications',
      body: 'We engineer blazingly responsive, standards-compliant web platforms built with HTML5, CSS3, and modern JavaScript. Every platform is audited for sub-second performance, cross-browser compatibility, and zero-dependency resilience.'
    },
    'uiux': {
      tag: 'Creative Direction',
      title: 'UI/UX & Design Systems',
      body: 'Transforming complex product logic into effortless, delightful user journeys. We construct scalable design tokens, accessible color palettes, and micro-interactions that resonate with users and drive brand authority.'
    },
    'cloud': {
      tag: 'Infrastructure',
      title: 'Cloud & High-Availability Architecture',
      body: 'Guaranteed 99.99% uptime with global edge networks, SSL optimization, automated CI/CD deployments, and bulletproof security policies tailored for high-traffic platforms.'
    },
    'performance': {
      tag: 'Speed Engineering',
      title: 'Sub-Second Speed & Lighthouse SEO',
      body: 'Slow websites kill conversion. We diagnose, optimize, and rebuild assets to guarantee 95+ Google Lighthouse scores across Performance, Accessibility, Best Practices, and SEO.'
    }
  };

  // Legal Database for modal
  const legalDatabase = {
    privacy: {
      tag: 'Legal Policy',
      title: 'Privacy Policy',
      body: 'Apex Studios values your privacy. We do not sell or harvest user data. Information collected via our contact or newsletter forms is strictly used to communicate regarding your inquiry and project milestones.'
    },
    terms: {
      tag: 'Terms & Conditions',
      title: 'Terms of Service',
      body: 'By accessing Apex Studios, you agree to comply with all applicable copyright and software licensing regulations. Custom software delivered to clients comes with 100% intellectual property ownership upon completion.'
    },
    security: {
      tag: 'Security & Compliance',
      title: 'Security Statement',
      body: 'We adhere to industry-leading OWASP standards. Our codebases undergo strict sanitization against XSS, CSRF, and injection vectors, ensuring resilient and secure production environments.'
    }
  };

  // Open Project Modal
  document.querySelectorAll('.view-project-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const projId = btn.getAttribute('data-project');
      const proj = projectDatabase[projId];
      if (!proj || !projectModal || !projectModalContent) return;

      projectModalContent.innerHTML = `
        <span class="modal-header-tag">${proj.tag}</span>
        <h3 class="modal-title" id="modal-project-title">${proj.title}</h3>
        <div style="position: relative; height: 220px; border-radius: var(--radius-md); overflow: hidden; margin-bottom: 1.5rem; background: ${proj.gradient};">
          <img src="${proj.image}" alt="${proj.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'">
        </div>
        <p class="modal-text">${proj.description}</p>
        <div class="modal-spec-grid">
          <div class="spec-item"><span class="spec-label">Client</span><span class="spec-val">${proj.client}</span></div>
          <div class="spec-item"><span class="spec-label">Timeline</span><span class="spec-val">${proj.timeline}</span></div>
          <div class="spec-item"><span class="spec-label">Technology</span><span class="spec-val">${proj.stack}</span></div>
          <div class="spec-item"><span class="spec-label">Verified Impact</span><span class="spec-val">${proj.impact}</span></div>
        </div>
        <a href="#contact" class="btn btn-primary btn-block modal-cta">Inquire About Similar Project</a>
      `;

      // Connect modal CTA button
      projectModalContent.querySelector('.modal-cta')?.addEventListener('click', () => {
        closeAllModals();
      });

      projectModal.classList.add('open');
      projectModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  });

  // Open Service Modals
  document.querySelectorAll('.service-modal-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const serviceId = btn.getAttribute('data-modal');
      const service = serviceDatabase[serviceId];
      if (!service || !infoModal || !infoModalContent) return;

      infoModalContent.innerHTML = `
        <span class="modal-header-tag">${service.tag}</span>
        <h3 class="modal-title" id="modal-info-title">${service.title}</h3>
        <p class="modal-text">${service.body}</p>
        <div style="margin-top: 2rem;">
          <a href="#contact" class="btn btn-primary btn-block modal-cta">Get Started With This Service</a>
        </div>
      `;

      infoModalContent.querySelector('.modal-cta')?.addEventListener('click', () => {
        closeAllModals();
      });

      infoModal.classList.add('open');
      infoModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  });

  // Open Legal Modals (Privacy, Terms, Security)
  document.querySelectorAll('.modal-trigger, .open-privacy-link').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const modalKey = btn.getAttribute('data-modal') || 'privacy';
      const info = legalDatabase[modalKey];
      if (!info || !infoModal || !infoModalContent) return;

      infoModalContent.innerHTML = `
        <span class="modal-header-tag">${info.tag}</span>
        <h3 class="modal-title" id="modal-info-title">${info.title}</h3>
        <p class="modal-text">${info.body}</p>
        <div style="margin-top: 2rem;">
          <button class="btn btn-outline btn-block modal-close-action">Understood</button>
        </div>
      `;

      infoModalContent.querySelector('.modal-close-action')?.addEventListener('click', closeAllModals);

      infoModal.classList.add('open');
      infoModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeAllModals() {
    [projectModal, infoModal].forEach(m => {
      if (m) {
        m.classList.remove('open');
        m.setAttribute('aria-hidden', 'true');
      }
    });
    document.body.style.overflow = '';
  }

  projectModalClose?.addEventListener('click', closeAllModals);
  infoModalClose?.addEventListener('click', closeAllModals);

  // Close modals on clicking backdrop outside card
  [projectModal, infoModal].forEach(modal => {
    modal?.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeAllModals();
      }
    });
  });

  // Close on Escape Key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllModals();
      toggleMobileMenu(false);
    }
  });

  // ==========================================
  // 12. Floating Back-to-Top Button
  // ==========================================
  const backToTopBtn = document.getElementById('back-to-top');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 350) {
      backToTopBtn?.classList.add('visible');
    } else {
      backToTopBtn?.classList.remove('visible');
    }
  }, { passive: true });

  backToTopBtn?.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // ==========================================
  // 13. Toast Notification Utility
  // ==========================================
  const toastContainer = document.getElementById('toast-container');

  function showToast(message, type = 'success') {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const iconSvg = type === 'success'
      ? `<svg class="toast-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>`
      : `<svg class="toast-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>`;

    toast.innerHTML = `
      ${iconSvg}
      <span>${message}</span>
    `;

    toastContainer.appendChild(toast);

    // Trigger slide in
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // Remove after 3.8s
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3800);
  }

  // ==========================================
  // 14. Footer Current Year Auto-Updater
  // ==========================================
  const currentYearEl = document.getElementById('current-year');
  if (currentYearEl) {
    currentYearEl.textContent = new Date().getFullYear();
  }

  // Initial welcome greeting toast
  setTimeout(() => {
    showToast('Welcome to Apex Studios! Explore our responsive solutions.', 'success');
  }, 1000);
});
