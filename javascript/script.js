document.addEventListener("DOMContentLoaded", () => {
  /* Elements */
  const burger = document.getElementById("burger");
  const navLinks = document.getElementById("nav-links");
  const dropdowns = Array.from(document.querySelectorAll(".dropdown"));
  const themeCheckbox = document.getElementById("theme-toggle");
  const textToggle = document.getElementById("text-toggle");
  const aaModal = document.getElementById("aa-modal");
  const aaClose = document.getElementById("aa-close");
  const aaIncrease = document.getElementById("aa-increase");
  const aaDecrease = document.getElementById("aa-decrease");
  const aaFontSize = document.getElementById("aa-font-size");
  const aaContrast = document.getElementById("aa-contrast");
  const cookieConsent = document.getElementById("cookie-consent");
  const cookieAccept = document.getElementById("cookie-accept");

  /* Theme (persist) */
  const savedTheme = localStorage.getItem("site-theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
    if (themeCheckbox) themeCheckbox.checked = true;
  }
  themeCheckbox && themeCheckbox.addEventListener("change", () => {
    const dark = themeCheckbox.checked;
    document.body.classList.toggle("dark-theme", dark);
    localStorage.setItem("site-theme", dark ? "dark" : "light");
  });

  /* Contrast toggle */
  let highContrast = localStorage.getItem("high-contrast") === "1";
  function applyContrast() {
    document.body.classList.toggle("high-contrast", highContrast);
    aaContrast && (aaContrast.textContent = highContrast ? "Normāls kontrasts" : "Augsts kontrasts");
  }
  applyContrast();

  aaContrast && aaContrast.addEventListener("click", () => {
    highContrast = !highContrast;
    localStorage.setItem("high-contrast", highContrast ? "1" : "0");
    applyContrast();
  });

  /* Text size toggle (persist) */
  let fontSize = parseInt(localStorage.getItem("font-size") || "100", 10);
  function applyFontSettings() {
    document.documentElement.style.fontSize = fontSize + "%";
    aaFontSize && (aaFontSize.textContent = fontSize + "%");
    if (textToggle) textToggle.setAttribute("aria-pressed", String(fontSize > 100));
  }
  applyFontSettings();

  // Old text toggle now opens modal
  if (textToggle && aaModal) {
    textToggle.addEventListener("click", () => {
      aaModal.hidden = false;
      aaModal.focus();
    });
  }
  if (aaClose && aaModal) {
    aaClose.addEventListener("click", () => { aaModal.hidden = true; });
  }
  aaIncrease && aaIncrease.addEventListener("click", () => {
    if (fontSize < 160) {
      fontSize += 10;
      localStorage.setItem("font-size", fontSize);
      applyFontSettings();
    }
  });
  aaDecrease && aaDecrease.addEventListener("click", () => {
    if (fontSize > 80) {
      fontSize -= 10;
      localStorage.setItem("font-size", fontSize);
      applyFontSettings();
    }
  });
  // Close modal on outside click or Esc
  aaModal && aaModal.addEventListener("mousedown", (e) => {
    if (e.target === aaModal) aaModal.hidden = true;
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && aaModal && !aaModal.hidden) aaModal.hidden = true;
  });

  /* Burger button toggles nav on mobile, with animation */
  if (burger && navLinks) {
    // Replace burger text with span for animation
    if (!burger.querySelector("span")) {
      burger.innerHTML = '<span></span>';
    }
    burger.addEventListener("click", (ev) => {
      ev.stopPropagation();
      const opened = navLinks.classList.toggle("active");
      burger.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(opened));
      
      // Close all dropdowns when closing the menu
      if (!opened) {
        document.querySelectorAll(".dropdown.open").forEach(d => d.classList.remove("open"));
      }
    });

    // Close menu when clicking outside
    document.addEventListener("click", (ev) => {
      const path = ev.composedPath ? ev.composedPath() : (ev.path || []);
      if (!path.includes(navLinks) && !path.includes(burger)) {
        navLinks.classList.remove("active");
        burger.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
        document.querySelectorAll(".dropdown.open").forEach(d => d.classList.remove("open"));
      }
    });
  }

  /* Dropdowns: only open on click in mobile */
  dropdowns.forEach(dropdown => {
    const link = dropdown.querySelector(".nav-link");
    if (link) {
      link.addEventListener("click", (ev) => {
        if (window.innerWidth <= 768) {
          ev.preventDefault();
          // Close other dropdowns
          dropdowns.forEach(d => { if (d !== dropdown) d.classList.remove("open"); });
          dropdown.classList.toggle("open");
        }
      });
    }
  });

  // Close dropdowns and nav when resizing to desktop
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      navLinks.classList.remove("active");
      burger && burger.classList.remove("open");
      burger && burger.setAttribute("aria-expanded", "false");
      document.querySelectorAll(".dropdown.open").forEach(d => d.classList.remove("open"));
    }
  });

  /* --- Carousel (fade, autoplay with pause on hover) --- */
  const carousel = document.querySelector(".carousel");
  const slides = Array.from(document.querySelectorAll(".slide"));
  const nextBtn = document.querySelector(".carousel .next");
  const prevBtn = document.querySelector(".carousel .prev");
  const dots = Array.from(document.querySelectorAll(".dot"));
  let idx = 0;
  let intervalId = null;
  const INTERVAL = 4000;

  function showSlide(i) {
    if (!slides.length) return;
    idx = (i + slides.length) % slides.length;
    slides.forEach((s, j) => s.classList.toggle("active", j === idx));
    dots.forEach((d, j) => d.classList.toggle("active", j === idx));
  }
  function nextSlide() { showSlide(idx + 1); }
  function prevSlide() { showSlide(idx - 1); }
  function startAuto() { stopAuto(); intervalId = setInterval(nextSlide, INTERVAL); }
  function stopAuto() { if (intervalId) { clearInterval(intervalId); intervalId = null; } }

  if (nextBtn) nextBtn.addEventListener("click", () => { nextSlide(); resetAuto(); });
  if (prevBtn) prevBtn.addEventListener("click", () => { prevSlide(); resetAuto(); });
  dots.forEach((d, i) => d.addEventListener("click", () => { showSlide(i); resetAuto(); }));

  function resetAuto() { stopAuto(); startAuto(); }
  if (carousel) {
    carousel.addEventListener("mouseenter", stopAuto);
    carousel.addEventListener("mouseleave", startAuto);
  }
  showSlide(0);
  startAuto();

  /* Accessibility: allow Enter/Space to toggle dropdown parent link on mobile */
  document.querySelectorAll(".dropdown > a").forEach(a => {
    a.addEventListener("keydown", (ev) => {
      if ((ev.key === "Enter" || ev.key === " ") && window.innerWidth <= 768) {
        ev.preventDefault();
        const parent = a.parentElement;
        if (parent) {
          // Close other dropdowns
          dropdowns.forEach(d => { if (d !== parent) d.classList.remove("open"); });
          parent.classList.toggle("open");
        }
      }
    });
  });

  /* Cookie Consent - show every time */
  if (cookieConsent && cookieAccept) {
    // Always show on page load
    cookieConsent.hidden = false;
    
    cookieAccept.addEventListener("click", () => {
      cookieConsent.hidden = true;
    });
  }

  /* Update burger button content */
  if (burger) {
    burger.innerHTML = '<span></span>';
    burger.setAttribute('aria-label', 'Toggle menu');
  }
});
