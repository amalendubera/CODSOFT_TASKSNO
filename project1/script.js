document.addEventListener("DOMContentLoaded", () => {
  /* ========================================================================
     1. MOBILE NAVIGATION MENU TOGGLE
     ======================================================================== */
  const hamburger = document.getElementById("hamburger");
  const navMenu = document.getElementById("nav-menu");
  const navLinks = document.querySelectorAll(".nav-link");

  const toggleMenu = () => {
    const isOpen = navMenu.classList.toggle("open");
    hamburger.classList.toggle("active", isOpen);
    hamburger.setAttribute("aria-expanded", String(isOpen));
  };

  hamburger.addEventListener("click", toggleMenu);

  // Close mobile menu when a link is clicked
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (navMenu.classList.contains("open")) {
        toggleMenu();
      }
    });
  });

  /* ========================================================================
     2. DARK / LIGHT THEME TOGGLE WITH LOCALSTORAGE
     ======================================================================== */
  const themeToggle = document.getElementById("theme-toggle");
  const themeIcon = document.getElementById("theme-icon");
  const savedTheme = localStorage.getItem("portfolio-theme") || "dark";

  const applyTheme = (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    themeIcon.textContent = theme === "dark" ? "☀️" : "🌙";
    localStorage.setItem("portfolio-theme", theme);
  };

  applyTheme(savedTheme);

  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    applyTheme(currentTheme === "dark" ? "light" : "dark");
  });

  /* ========================================================================
     3. HERO TYPING EFFECT
     ======================================================================== */
  const typingElement = document.getElementById("typing-text");
  const roles = [
    "Frontend Web Apps",
    "AI Agent Workflows",
    "Responsive UI Dashboards",
    "IoT Smart Prototypes"
  ];
  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  const typeLoop = () => {
    const currentRole = roles[roleIndex];
    if (isDeleting) {
      charIndex--;
    } else {
      charIndex++;
    }

    typingElement.textContent = currentRole.substring(0, charIndex);

    let speed = isDeleting ? 45 : 90;

    if (!isDeleting && charIndex === currentRole.length) {
      speed = 1800; // Pause at full phrase
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      speed = 350;
    }

    setTimeout(typeLoop, speed);
  };

  typeLoop();

  /* ========================================================================
     4. SCROLL SPY & REVEAL ANIMATIONS (INTERSECTION OBSERVER)
     ======================================================================== */
  const sections = document.querySelectorAll("main section[id]");

  const highlightActiveNav = () => {
    const scrollY = window.scrollY + 140;
    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute("id");
      const navItem = document.querySelector(`.nav-link[href="#${id}"]`);

      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach((l) => l.classList.remove("active"));
        if (navItem) navItem.classList.add("active");
      }
    });
  };

  window.addEventListener("scroll", highlightActiveNav);

  // Reveal elements and animate skill bars when scrolled into view
  const revealElements = document.querySelectorAll(".reveal");
  const skillFills = document.querySelectorAll(".progress-fill");

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");

          // If inside skills section, trigger progress bar fill
          if (entry.target.classList.contains("skill-card")) {
            const bars = entry.target.querySelectorAll(".progress-fill");
            bars.forEach((bar) => {
              bar.style.width = bar.getAttribute("data-width");
            });
          }
        }
      });
    },
    { threshold: 0.15 }
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  /* ========================================================================
     5. INTERACTIVE PROJECT FILTERING
     ======================================================================== */
  const filterButtons = document.querySelectorAll(".filter-btn");
  const projectCards = document.querySelectorAll(".project-card");

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const selectedFilter = btn.getAttribute("data-filter");

      projectCards.forEach((card) => {
        const categories = card.getAttribute("data-category");
        if (selectedFilter === "all" || categories.includes(selectedFilter)) {
          card.classList.remove("hidden");
        } else {
          card.classList.add("hidden");
        }
      });
    });
  });

  /* ========================================================================
     6. CONTACT FORM VALIDATION BEFORE SUBMISSION
     ======================================================================== */
  const contactForm = document.getElementById("contact-form");
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const subjectInput = document.getElementById("subject");
  const messageInput = document.getElementById("message");
  const charCount = document.getElementById("char-count");
  const formStatus = document.getElementById("form-status");

  const setError = (inputEl, errorId, message) => {
    const errorEl = document.getElementById(errorId);
    inputEl.classList.add("input-error");
    inputEl.classList.remove("input-success");
    errorEl.textContent = message;
    return false;
  };

  const setSuccess = (inputEl, errorId) => {
    const errorEl = document.getElementById(errorId);
    inputEl.classList.remove("input-error");
    inputEl.classList.add("input-success");
    errorEl.textContent = "";
    return true;
  };

  const validateName = () => {
    const val = nameInput.value.trim();
    if (val.length < 2) {
      return setError(nameInput, "name-error", "Please enter your full name (at least 2 characters).");
    }
    return setSuccess(nameInput, "name-error");
  };

  const validateEmail = () => {
    const val = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(val)) {
      return setError(emailInput, "email-error", "Please enter a valid email address.");
    }
    return setSuccess(emailInput, "email-error");
  };

  const validateSubject = () => {
    const val = subjectInput.value.trim();
    if (val.length < 4) {
      return setError(subjectInput, "subject-error", "Subject must be at least 4 characters long.");
    }
    return setSuccess(subjectInput, "subject-error");
  };

  const validateMessage = () => {
    const val = messageInput.value.trim();
    if (val.length < 15) {
      return setError(messageInput, "message-error", "Message must be at least 15 characters long.");
    }
    return setSuccess(messageInput, "message-error");
  };

  // Live character counter & field validation
  messageInput.addEventListener("input", () => {
    charCount.textContent = `${messageInput.value.length} / 500`;
    if (messageInput.classList.contains("input-error")) validateMessage();
  });

  nameInput.addEventListener("input", () => {
    if (nameInput.classList.contains("input-error")) validateName();
  });

  emailInput.addEventListener("input", () => {
    if (emailInput.classList.contains("input-error")) validateEmail();
  });

  subjectInput.addEventListener("input", () => {
    if (subjectInput.classList.contains("input-error")) validateSubject();
  });

  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    formStatus.textContent = "";
    formStatus.className = "form-status";

    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    const isSubjectValid = validateSubject();
    const isMessageValid = validateMessage();

    if (isNameValid && isEmailValid && isSubjectValid && isMessageValid) {
      formStatus.textContent = `Thank you, ${nameInput.value.trim()}! Your message has been validated and sent.`;
      formStatus.classList.add("success");
      contactForm.reset();
      charCount.textContent = "0 / 500";
      [nameInput, emailInput, subjectInput, messageInput].forEach((input) =>
        input.classList.remove("input-success")
      );
    }
  });

  // Update footer copyright year dynamically
  document.getElementById("current-year").textContent = new Date().getFullYear();
});