
    // ----- NAVBAR SCROLL -----
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    });

    // ----- MOBILE MENU -----
    function toggleMobile() {
      document.getElementById('hamburger').classList.toggle('open');
      document.getElementById('mobileMenu').classList.toggle('open');
    }
    function closeMobile() {
      document.getElementById('hamburger').classList.remove('open');
      document.getElementById('mobileMenu').classList.remove('open');
    }

    // ----- SCROLL REVEAL -----
    const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => revealObserver.observe(el));

    // ----- NEWSLETTER -----
    function subscribeNewsletter() {
      const email = document.getElementById('nlEmail').value.trim();
      const msg = document.getElementById('nlMsg');
      if (!email || !email.includes('@')) {
        document.getElementById('nlEmail').style.borderColor = 'var(--orange)';
        return;
      }
      document.getElementById('nlEmail').value = '';
      document.getElementById('nlEmail').style.borderColor = '';
      msg.style.display = 'block';
      setTimeout(() => { msg.style.display = 'none'; }, 4000);
    }

    // Enter key for newsletter
    document.getElementById('nlEmail').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') subscribeNewsletter();
    });

    // ----- SMOOTH ANCHOR SCROLL -----
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
