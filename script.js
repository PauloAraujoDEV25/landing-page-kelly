const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".main-nav");
const slides = [...document.querySelectorAll(".hero-slide")];
const slideDots = [...document.querySelectorAll(".slide-dots button")];
const currentNumber = document.querySelector(".slide-number");
const progress = document.querySelector(".slide-line i");
const scrollProgress = document.querySelector(".scroll-progress span");
const slideTitle = document.querySelector(".slide-title");
const prevButton = document.querySelector(".slide-arrow.prev");
const nextButton = document.querySelector(".slide-arrow.next");
const form = document.querySelector(".lead-form");
const hero = document.querySelector(".hero");
const heroContent = document.querySelector(".hero-content");
const whatsappFloat = document.querySelector(".whatsapp-float");
const projectItems = [...document.querySelectorAll(".project-item")];
const modal = document.querySelector(".project-modal");
const modalImage = modal.querySelector("img");
const modalTitle = modal.querySelector("h2");
const modalMeta = modal.querySelector(".modal-meta");
const modalClose = modal.querySelector(".modal-close");
const modalPrev = modal.querySelector(".modal-prev");
const modalNext = modal.querySelector(".modal-next");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

const projects = [
  "Casa Horizonte · Residencial",
  "Refúgio Atlântico · Residencial",
  "Casa Pátio · Residencial",
  "Casa Ipê · Residencial"
];

let activeSlide = 0;
let activeProject = 0;
let carouselTimer;
let touchStartX = 0;
let modalTouchStartX = 0;
let scrollTicking = false;
let lastFocusedElement;

document.documentElement.classList.add("js-ready");

const revealGroups = [
  [".intro .section-label", ".intro-copy"],
  [".services .section-label", ".services .eyebrow", ".services h2"],
  [".service-card"],
  [".projects .section-label", ".projects .eyebrow", ".projects h2", ".projects-head > p"],
  [".project-item"],
  [".process .section-label", ".process .eyebrow", ".process h2"],
  [".process-list > div"],
  [".contact-copy", ".lead-form"]
];

revealGroups.forEach(group => {
  const elements = group.flatMap(selector => [...document.querySelectorAll(selector)]);
  elements.forEach((element, index) => {
    element.dataset.reveal = "";
    element.dataset.revealDelay = String(Math.min(index % 4, 3));
  });
});

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("is-visible");
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: "0px 0px -45px" });

document.querySelectorAll("[data-reveal]").forEach(element => revealObserver.observe(element));

function showSlide(index) {
  activeSlide = (index + slides.length) % slides.length;
  slides.forEach((slide, position) => slide.classList.toggle("active", position === activeSlide));
  slideDots.forEach((dot, position) => {
    const isActive = position === activeSlide;
    dot.classList.toggle("active", isActive);
    dot.toggleAttribute("aria-current", isActive);
  });
  currentNumber.textContent = String(activeSlide + 1).padStart(2, "0");
  progress.style.transform = `scaleX(${activeSlide + 1})`;
  slideTitle.textContent = projects[activeSlide];
}

function startCarousel() {
  clearInterval(carouselTimer);
  if (!document.hidden && !reduceMotion.matches) {
    carouselTimer = setInterval(() => showSlide(activeSlide + 1), 2000);
  }
}

function closeMenu() {
  nav.classList.remove("open");
  menuButton.classList.remove("active");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Abrir menu");
}

function updateScrollState() {
  const scrollTop = window.scrollY;
  const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
  const amount = scrollRange > 0 ? scrollTop / scrollRange : 0;
  header.classList.toggle("scrolled", scrollTop > 40);
  whatsappFloat.classList.toggle("visible", scrollTop > window.innerHeight * 0.55);
  scrollProgress.style.transform = `scaleX(${amount})`;

  if (!reduceMotion.matches) {
    const offset = Math.min(scrollTop * 0.1, 78);
    heroContent.style.transform = `translate3d(0, ${offset}px, 0)`;
  }
  scrollTicking = false;
}

window.addEventListener("scroll", () => {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(updateScrollState);
}, { passive: true });

prevButton.addEventListener("click", () => {
  showSlide(activeSlide - 1);
  startCarousel();
});

nextButton.addEventListener("click", () => {
  showSlide(activeSlide + 1);
  startCarousel();
});

slideDots.forEach((dot, index) => dot.addEventListener("click", () => {
  showSlide(index);
  startCarousel();
}));

hero.addEventListener("mouseenter", () => clearInterval(carouselTimer));
hero.addEventListener("mouseleave", () => {
  slides.forEach(slide => {
    slide.style.removeProperty("--hero-x");
    slide.style.removeProperty("--hero-y");
  });
  startCarousel();
});

hero.addEventListener("mousemove", event => {
  if (!finePointer.matches || reduceMotion.matches) return;
  const rect = hero.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width - 0.5) * 16;
  const y = ((event.clientY - rect.top) / rect.height - 0.5) * 10;
  slides[activeSlide].style.setProperty("--hero-x", `${x}px`);
  slides[activeSlide].style.setProperty("--hero-y", `${y}px`);
});

hero.addEventListener("touchstart", event => {
  touchStartX = event.changedTouches[0].clientX;
}, { passive: true });

hero.addEventListener("touchend", event => {
  const distance = event.changedTouches[0].clientX - touchStartX;
  if (Math.abs(distance) > 55) {
    showSlide(activeSlide + (distance < 0 ? 1 : -1));
    startCarousel();
  }
}, { passive: true });

document.addEventListener("visibilitychange", startCarousel);
reduceMotion.addEventListener("change", startCarousel);

menuButton.addEventListener("click", () => {
  const open = menuButton.classList.toggle("active");
  nav.classList.toggle("open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
});

nav.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));

document.addEventListener("click", event => {
  if (nav.classList.contains("open") && !nav.contains(event.target) && !menuButton.contains(event.target)) {
    closeMenu();
  }
});

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting || !entry.target.id) return;
    nav.querySelectorAll("a[href^='#']").forEach(link => {
      link.classList.toggle("current", link.getAttribute("href") === `#${entry.target.id}`);
    });
  });
}, { rootMargin: "-35% 0px -58%", threshold: 0 });

document.querySelectorAll("main section[id]").forEach(section => sectionObserver.observe(section));

document.querySelectorAll(".service-card").forEach(card => {
  card.addEventListener("mousemove", event => {
    if (!finePointer.matches || reduceMotion.matches) return;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.setProperty("--tilt-x", `${y * -5}deg`);
    card.style.setProperty("--tilt-y", `${x * 6}deg`);
  });
  card.addEventListener("mouseleave", () => {
    card.style.removeProperty("--tilt-x");
    card.style.removeProperty("--tilt-y");
  });
});

function getProjectData(index) {
  const item = projectItems[index];
  const image = item.querySelector("img");
  return {
    src: image.currentSrc || image.src,
    alt: image.alt,
    title: item.querySelector("h3").textContent,
    meta: item.querySelector(".project-info span").textContent
  };
}

function showProject(index) {
  activeProject = (index + projectItems.length) % projectItems.length;
  const project = getProjectData(activeProject);
  modalImage.src = project.src;
  modalImage.alt = project.alt;
  modalTitle.textContent = project.title;
  modalMeta.textContent = project.meta;
}

function openProject(index) {
  lastFocusedElement = document.activeElement;
  showProject(index);
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  modalClose.focus();
}

function closeProject() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  modalImage.src = "";
  lastFocusedElement?.focus();
}

projectItems.forEach((item, index) => {
  item.addEventListener("click", () => openProject(index));
  item.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openProject(index);
    }
  });
});

modalClose.addEventListener("click", closeProject);
modalPrev.addEventListener("click", () => showProject(activeProject - 1));
modalNext.addEventListener("click", () => showProject(activeProject + 1));
modal.addEventListener("click", event => {
  if (event.target === modal) closeProject();
});
modal.addEventListener("touchstart", event => {
  modalTouchStartX = event.changedTouches[0].clientX;
}, { passive: true });
modal.addEventListener("touchend", event => {
  const distance = event.changedTouches[0].clientX - modalTouchStartX;
  if (Math.abs(distance) > 60) showProject(activeProject + (distance < 0 ? 1 : -1));
}, { passive: true });

document.addEventListener("keydown", event => {
  if (!modal.classList.contains("open")) return;
  if (event.key === "Escape") closeProject();
  if (event.key === "ArrowLeft") showProject(activeProject - 1);
  if (event.key === "ArrowRight") showProject(activeProject + 1);
});

form.addEventListener("submit", event => {
  event.preventDefault();
  const data = new FormData(form);
  const name = String(data.get("nome")).trim().split(" ")[0] || "cliente";
  const button = form.querySelector("button");
  const feedback = form.querySelector(".form-feedback");
  const message = [
    "Olá, Kelly! Vim pelo seu site e gostaria de conversar sobre um projeto.",
    "",
    `Nome: ${String(data.get("nome")).trim()}`,
    `E-mail: ${String(data.get("email")).trim()}`,
    `Telefone / WhatsApp: ${String(data.get("telefone")).trim()}`,
    `Tipo de projeto: ${String(data.get("tipo")).trim()}`,
    `Sobre o projeto: ${String(data.get("mensagem")).trim() || "Não informado"}`
  ].join("\n");
  const whatsappUrl = `https://wa.me/553496491514?text=${encodeURIComponent(message)}`;

  button.disabled = true;
  button.innerHTML = "Abrindo WhatsApp <span>✓</span>";
  button.classList.add("is-sent");
  feedback.textContent = `${name}, confirme o envio da mensagem no WhatsApp.`;
  window.open(whatsappUrl, "_blank", "noopener,noreferrer");

  window.setTimeout(() => {
    button.disabled = false;
    button.innerHTML = "Enviar projeto pelo WhatsApp <span>↗</span>";
    button.classList.remove("is-sent");
  }, 2500);
});

showSlide(0);
updateScrollState();
startCarousel();
