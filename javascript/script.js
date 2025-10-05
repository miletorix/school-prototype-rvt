document.addEventListener("DOMContentLoaded", () => {
  /* mainīgie lielumi vietnei */
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

  /* aktīvās izvēlnes izgaismošana navigācijas joslā, pārejot uz saiti */
  function setActiveNavLink() {
    const currentPath = window.location.pathname;
    const currentPathNormalized = currentPath.replace(/\/$/, '') || '/';
    const navLinks = document.querySelectorAll('.nav-link');
    
    // noņemt aktīvo klasi no visām navigācijas saitēm
    navLinks.forEach(link => link.classList.remove('active'));
    
    // atrast un izcelt aktīvo saiti
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href !== '#') {
        // mainīga vertība, lai rīkojieties ar relatīvajiem ceļiem
        const linkPath = href.startsWith('./') ? href.substring(2) : href;
        
        // pārbaude, vai pašreizējā lapa atbilst šai navigācijas saitei
        if (currentPathNormalized.includes(linkPath) || 
            linkPath.includes(currentPathNormalized.replace(/^\//, ''))) {
          link.classList.add('active');
        }
      }
    });
    
    // īpaša rīcība ar izvēlnes augšējām saitēm
    const dropdownLinks = document.querySelectorAll('.dropdown > .nav-link');
    dropdownLinks.forEach(dropdownLink => {
      const dropdown = dropdownLink.closest('.dropdown');
      const dropdownMenuLinks = dropdown.querySelectorAll('.dropdown-menu a');
      
      // Pārbaude, vai kāda izvēlnes saite ir aktīva
      const hasActiveChild = Array.from(dropdownMenuLinks).some(childLink => {
        const childHref = childLink.getAttribute('href');
        if (childHref && childHref !== '#') {
          const childPath = childHref.startsWith('./') ? childHref.substring(2) : childHref;
          return currentPathNormalized.includes(childPath) || 
                 childPath.includes(currentPathNormalized.replace(/^\//, ''));
        }
        return false;
      });
      
      if (hasActiveChild) {
        dropdownLink.classList.add('active');
      }
    });
  }
  
  // Iestatīt aktīvu navigācijas saiti lapas ielādes brīdī
  setActiveNavLink();

  /* vietnes tēma */
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

  /* augsta kontrastība */
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

  /* teksta izmēra maiņa */
  let fontSize = parseInt(localStorage.getItem("font-size") || "100", 10);
  function applyFontSettings() {
    document.documentElement.style.fontSize = fontSize + "%";
    aaFontSize && (aaFontSize.textContent = fontSize + "%");
    if (textToggle) textToggle.setAttribute("aria-pressed", String(fontSize > 100));
  }
  applyFontSettings();

  // Aa pogas atvēršana
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
  // Aa pogas aizvēršana
  aaModal && aaModal.addEventListener("mousedown", (e) => {
    if (e.target === aaModal) aaModal.hidden = true;
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && aaModal && !aaModal.hidden) aaModal.hidden = true;
  });

  /* poga, lai atvērtu navigācijas joslu telefonā */
  if (burger && navLinks) {
    if (!burger.querySelector("span")) {
      burger.innerHTML = '<span></span>';
    }
    burger.addEventListener("click", (ev) => {
      ev.stopPropagation();
      const opened = navLinks.classList.toggle("active");
      burger.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(opened));
      
      // visu izvēlņu aizvēršana pēc iziešanas no navigācijas joslas telefonā
      if (!opened) {
        document.querySelectorAll(".dropdown.open").forEach(d => d.classList.remove("open"));
      }
    });

    // izvēlnes aizvēršana
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

  /* Dropdowns: atvēršana tikai mobilajā ierīcē */
  dropdowns.forEach(dropdown => {
    const link = dropdown.querySelector(".nav-link");
    if (link) {
      link.addEventListener("click", (ev) => {
        if (window.innerWidth <= 768) {
          ev.preventDefault();
          // pārējo izvēlņu aizvēršana
          dropdowns.forEach(d => { if (d !== dropdown) d.classList.remove("open"); });
          dropdown.classList.toggle("open");
        }
      });
    }
  });

  // dropdown izvēlnes aizvēršana
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      navLinks.classList.remove("active");
      burger && burger.classList.remove("open");
      burger && burger.setAttribute("aria-expanded", "false");
      document.querySelectorAll(".dropdown.open").forEach(d => d.classList.remove("open"));
    }
  });

  /* attēlu pārslēgšanas karuseļš */
  const carousel = document.querySelector(".carousel");
  const slides = Array.from(document.querySelectorAll(".slide"));
  const nextBtn = document.querySelector(".carousel .next");
  const prevBtn = document.querySelector(".carousel .prev");
  const dots = Array.from(document.querySelectorAll(".dot"));
  let idx = 0;
  let intervalId = null;
  const INTERVAL = 3000;

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

  /* logs Sīkdatne */
  if (cookieConsent && cookieAccept) {
    // loga parādīšana pēc pārstartēšanas
    cookieConsent.hidden = false;
    
    cookieAccept.addEventListener("click", () => {
      cookieConsent.hidden = true;
    });
  }

  if (burger) {
    burger.innerHTML = '<span></span>';
    burger.setAttribute('aria-label', 'Toggle menu');
  }
});
