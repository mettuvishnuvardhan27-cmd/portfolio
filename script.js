if (window.lucide) {
  lucide.createIcons();
}

const year = document.getElementById("year");
if (year) {
  year.textContent = new Date().getFullYear();
}

const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");

if (menuBtn && navLinks) {
  menuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });

  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("active");
    });
  });
}

/* Cinematic scroll system. Kept independent from markup so page content and
   layout remain unchanged. */
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealElements = document.querySelectorAll(".reveal, .reveal-section, .reveal-card");

document.body.classList.add("motion-ready");
document.body.classList.add("profile-site-background");

const homeHero = document.querySelector("#home.hero");

if (homeHero && !reduceMotion) {
  homeHero.classList.add("motion-hero");
  document.body.classList.add("pin-scroll-page");
}

if (!homeHero) {
  document.body.classList.add("nav-at-bottom");
}

const motionSections = document.querySelectorAll("main > section");
motionSections.forEach((section, index) => {
  section.classList.add("motion-section");
  section.style.setProperty("--section-index", index);
  section.dataset.motionSide = index % 2 === 0 ? "left" : "right";
});

const crazyCards = document.querySelectorAll(
  ".service-card, .case-study, .certificate-card, .template-card, .video-edit-card, .tech-card, .features-card"
);

if (!reduceMotion && window.matchMedia("(hover: hover)").matches) {
  crazyCards.forEach((card) => {
    card.classList.add("crazy-card");

    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty("--tilt-x", `${(-y * 7).toFixed(2)}deg`);
      card.style.setProperty("--tilt-y", `${(x * 8).toFixed(2)}deg`);
      card.style.setProperty("--shine-x", `${((x + 0.5) * 100).toFixed(1)}%`);
      card.style.setProperty("--shine-y", `${((y + 0.5) * 100).toFixed(1)}%`);
    });

    card.addEventListener("mouseleave", () => {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
    });
  });
}

if (reduceMotion || !("IntersectionObserver" in window)) {
  revealElements.forEach((element) => element.classList.add("active", "is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("active", "is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -7% 0px" }
  );

  revealElements.forEach((element, index) => {
    element.style.setProperty("--reveal-delay", `${Math.min((index % 4) * 90, 270)}ms`);
    revealObserver.observe(element);
  });
}

const depthElements = document.querySelectorAll(
  ".hero-card, .about-card, .service-card, .venture-banner, .case-study, .certificate-card, .template-card, .contact-card"
);

let scrollTicking = false;
let previousScroll = window.scrollY;

const updateScrollMotion = () => {
  const currentScroll = window.scrollY;
  const scrollRange = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  document.documentElement.style.setProperty("--page-progress", currentScroll / scrollRange);
  document.body.classList.toggle("has-scrolled", currentScroll > 28);
  document.body.dataset.scrollDirection = currentScroll >= previousScroll ? "down" : "up";

  if (homeHero && !reduceMotion) {
    const heroRect = homeHero.getBoundingClientRect();
    const heroTravel = Math.max(1, homeHero.offsetHeight - window.innerHeight);
    const heroProgress = Math.max(0, Math.min(1, -heroRect.top / heroTravel));
    homeHero.style.setProperty("--hero-scroll", heroProgress.toFixed(4));

    const hasPassedProfile = heroProgress > 0.72;
    document.body.classList.toggle("wallpaper-active", hasPassedProfile);
    document.body.classList.toggle("nav-at-bottom", hasPassedProfile);

  }

  previousScroll = currentScroll;
  scrollTicking = false;
};

const requestScrollMotion = () => {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(updateScrollMotion);
};

window.addEventListener("scroll", requestScrollMotion, { passive: true });
window.addEventListener("resize", requestScrollMotion, { passive: true });
window.addEventListener("load", updateScrollMotion);
updateScrollMotion();

const pageRail = document.getElementById("pageRail");

if (pageRail) {
  pageRail.addEventListener("wheel", (event) => {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

    const atStart = pageRail.scrollLeft <= 1;
    const atEnd = pageRail.scrollLeft + pageRail.clientWidth >= pageRail.scrollWidth - 1;
    if ((event.deltaY < 0 && atStart) || (event.deltaY > 0 && atEnd)) return;

    event.preventDefault();
    pageRail.scrollLeft += event.deltaY;
  }, { passive: false });

  pageRail.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    pageRail.scrollBy({
      left: event.key === "ArrowRight" ? pageRail.clientWidth * 0.72 : pageRail.clientWidth * -0.72,
      behavior: "smooth"
    });
  });
}

/* Page-to-page scroll/swipe sequence. */
const pageSequence = [
  { file: "index.html", label: "Home" },
  { file: "projects.html", label: "Projects" },
  { file: "certifications.html", label: "Certifications" },
  { file: "video-edits.html", label: "Video Edits" },
  { file: "website-templates.html", label: "Website Templates" },
  { file: "contact.html", label: "Contact" }
];

const currentFile = window.location.pathname.split("/").pop() || "index.html";
const currentPageIndex = Math.max(0, pageSequence.findIndex((page) => page.file === currentFile));
const previousPage = pageSequence[currentPageIndex - 1];
const nextPage = pageSequence[currentPageIndex + 1];

const pageEdgeNav = document.createElement("section");
pageEdgeNav.className = "page-edge-nav";
pageEdgeNav.setAttribute("aria-label", "Page navigation");
pageEdgeNav.innerHTML = `
  <div class="edge-direction edge-previous">
    ${previousPage ? `<span>Scroll up or swipe right</span><strong>${previousPage.label}</strong>` : ""}
  </div>
  <div class="edge-current"><span>${String(currentPageIndex + 1).padStart(2, "0")}</span></div>
  <div class="edge-direction edge-next">
    ${nextPage ? `<span>Scroll down or swipe left</span><strong>${nextPage.label}</strong>` : `<span>End of portfolio</span><strong>Thank you</strong>`}
  </div>
`;

const pageFooter = document.querySelector("footer");
if (pageFooter) pageFooter.before(pageEdgeNav);

let edgeIntent = 0;
let edgeIntentTime = 0;
let pageNavigating = false;

const navigatePortfolioPage = (page, direction) => {
  if (!page || pageNavigating) return;
  pageNavigating = true;
  const curtain = document.createElement("div");
  curtain.className = `page-swipe-curtain ${direction === "next" ? "from-right" : "from-left"}`;
  curtain.innerHTML = `<span>${direction === "next" ? "Next page" : "Previous page"}</span><strong>${page.label}</strong>`;
  document.body.append(curtain);
  requestAnimationFrame(() => curtain.classList.add("is-active"));
  window.setTimeout(() => { window.location.href = page.file; }, 620);
};

window.addEventListener("wheel", (event) => {
  if (pageNavigating) return;
  const now = Date.now();
  if (now - edgeIntentTime > 420) edgeIntent = 0;
  edgeIntentTime = now;

  const atTop = window.scrollY <= 2;
  const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 3;
  const forwardDelta = Math.max(event.deltaY, event.deltaX);
  const backwardDelta = Math.min(event.deltaY, event.deltaX);

  if (atBottom && forwardDelta > 0 && nextPage) {
    edgeIntent += forwardDelta;
    if (edgeIntent > 180) navigatePortfolioPage(nextPage, "next");
  } else if (atTop && backwardDelta < 0 && previousPage) {
    edgeIntent += backwardDelta;
    if (edgeIntent < -180) navigatePortfolioPage(previousPage, "previous");
  }
}, { passive: true });

let touchStartX = 0;
let touchStartY = 0;

window.addEventListener("touchstart", (event) => {
  const touch = event.changedTouches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
}, { passive: true });

window.addEventListener("touchend", (event) => {
  if (pageNavigating) return;
  const touch = event.changedTouches[0];
  const deltaX = touch.clientX - touchStartX;
  const deltaY = touch.clientY - touchStartY;
  const atTop = window.scrollY <= 2;
  const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 3;

  if (atBottom && (deltaX < -70 || deltaY < -100)) {
    navigatePortfolioPage(nextPage, "next");
  } else if (atTop && (deltaX > 70 || deltaY > 100)) {
    navigatePortfolioPage(previousPage, "previous");
  }
}, { passive: true });

const spotlight = document.getElementById("cursorSpotlight");

if (spotlight && window.matchMedia("(hover: hover)").matches) {
  let mouseX = 0;
  let mouseY = 0;
  let spotX = 0;
  let spotY = 0;

  window.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
  });

  const moveSpotlight = () => {
    spotX += (mouseX - spotX) * 0.12;
    spotY += (mouseY - spotY) * 0.12;

    spotlight.style.left = `${spotX}px`;
    spotlight.style.top = `${spotY}px`;

    requestAnimationFrame(moveSpotlight);
  };

  moveSpotlight();
}

const heroImg = document.getElementById("heroImg");

if (heroImg && window.matchMedia("(hover: hover)").matches) {
  window.addEventListener("mousemove", (event) => {
    const x = (event.clientX / window.innerWidth - 0.5) * 12;
    const y = (event.clientY / window.innerHeight - 0.5) * 12;

    heroImg.style.setProperty("--hero-x", `${x}px`);
    heroImg.style.setProperty("--hero-y", `${y}px`);
  });
}

document.querySelectorAll(".magnetic").forEach((button) => {
  button.addEventListener("mousemove", (event) => {
    if (!window.matchMedia("(hover: hover)").matches) return;

    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;

    button.style.transform = `translate(${x * 0.15}px, ${y * 0.18}px) scale(1.03)`;
  });

  button.addEventListener("mouseleave", () => {
    button.style.transform = "";
  });
});

const counters = document.querySelectorAll("[data-count]");
let countersStarted = false;

const startCounters = () => {
  if (countersStarted) return;

  const firstCounter = counters[0];
  if (!firstCounter) return;

  if (firstCounter.getBoundingClientRect().top < window.innerHeight - 100) {
    countersStarted = true;

    counters.forEach((counter) => {
      const target = Number(counter.dataset.count);
      let current = 0;
      const increment = Math.max(1, Math.ceil(target / 50));

      const update = () => {
        current += increment;

        if (current >= target) {
          counter.textContent = `${target}+`;
          return;
        }

        counter.textContent = `${current}+`;
        requestAnimationFrame(update);
      };

      update();
    });
  }
};

window.addEventListener("scroll", startCounters);
window.addEventListener("load", startCounters);

const bottomDock = document.getElementById("bottomDock");
let lastScroll = 0;

if (bottomDock) {
  window.addEventListener("scroll", () => {
    const currentScroll = window.scrollY;

    if (currentScroll > lastScroll && currentScroll > 420) {
      bottomDock.classList.add("hidden");
    } else {
      bottomDock.classList.remove("hidden");
    }

    lastScroll = currentScroll;
  });
}


// Video edits page interactions
document.querySelectorAll(".video-edit-card").forEach((card) => {
  const previewVideo = card.querySelector("video");

  card.addEventListener("mouseenter", () => {
    if (previewVideo && window.matchMedia("(hover: hover)").matches) {
      previewVideo.muted = true;
      previewVideo.play().catch(() => {});
    }
  });

  card.addEventListener("mouseleave", () => {
    if (previewVideo) {
      previewVideo.pause();
      previewVideo.currentTime = 0;
    }
  });
});

const videoModal = document.getElementById("videoModal");
const modalVideo = document.getElementById("modalVideo");
const closeModal = document.getElementById("closeModal");

const openVideoModal = (videoSrc) => {
  if (!videoModal || !modalVideo || !videoSrc) return;

  const source = modalVideo.querySelector("source");
  if (source) {
    source.src = videoSrc;
  }

  modalVideo.load();
  videoModal.classList.add("active");
  modalVideo.play().catch(() => {});
};

document.querySelectorAll(".video-edit-card .play-btn, .video-edit-card .watch-edit").forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest(".video-edit-card");
    if (!card) return;
    openVideoModal(card.dataset.video);
  });
});

const closeVideoModal = () => {
  if (!videoModal || !modalVideo) return;

  videoModal.classList.remove("active");
  modalVideo.pause();
  modalVideo.currentTime = 0;
};

if (closeModal) {
  closeModal.addEventListener("click", closeVideoModal);
}

if (videoModal) {
  videoModal.addEventListener("click", (event) => {
    if (event.target === videoModal) {
      closeVideoModal();
    }
  });
}

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeVideoModal();
  }
});
