const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".main-nav");
const slides = [...document.querySelectorAll(".hero-slide")];
const currentNumber = document.querySelector(".slide-number");
const progress = document.querySelector(".slide-line i");
const slideTitle = document.querySelector(".slide-title");
const prevButton = document.querySelector(".slide-arrow.prev");
const nextButton = document.querySelector(".slide-arrow.next");
const form = document.querySelector(".lead-form");
const hero = document.querySelector(".hero");

const projects = [
  "Casa Horizonte · Residencial",
  "Refúgio Atlântico · Residencial",
  "Casa Pátio · Residencial",
  "Casa Ipê · Residencial"
];

let activeSlide = 0;
let carouselTimer;
let touchStartX = 0;

document.documentElement.classList.add("js-ready");

const revealGroups = [
  [".intro .section-label", ".intro-copy", ".intro-stat"],
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
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: "0px 0px -45px" });

document.querySelectorAll("[data-reveal]").forEach(element => revealObserver.observe(element));

function showSlide(index) {
  activeSlide = (index + slides.length) % slides.length;
  slides.forEach((slide, position) => slide.classList.toggle("active", position === activeSlide));
  currentNumber.textContent = String(activeSlide + 1).padStart(2, "0");
  progress.style.transform = `scaleX(${activeSlide + 1})`;
  slideTitle.textContent = projects[activeSlide];
}

function startCarousel() {
  clearInterval(carouselTimer);
  if (!document.hidden) {
    carouselTimer = setInterval(() => showSlide(activeSlide + 1), 6000);
  }
}

prevButton.addEventListener("click", () => {
  showSlide(activeSlide - 1);
  startCarousel();
});

nextButton.addEventListener("click", () => {
  showSlide(activeSlide + 1);
  startCarousel();
});

let scrollTicking = false;
window.addEventListener("scroll", () => {
  if (!scrollTicking) {
    requestAnimationFrame(() => {
      header.classList.toggle("scrolled", window.scrollY > 40);
      const offset = Math.min(window.scrollY * 0.12, 90);
      document.querySelector(".hero-content").style.transform = `translateY(${offset}px)`;
      scrollTicking = false;
    });
    scrollTicking = true;
  }
}, { passive: true });

hero.addEventListener("mouseenter", () => clearInterval(carouselTimer));
hero.addEventListener("mouseleave", startCarousel);
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

menuButton.addEventListener("click", () => {
  const open = menuButton.classList.toggle("active");
  nav.classList.toggle("open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
});

nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  nav.classList.remove("open");
  menuButton.classList.remove("active");
  menuButton.setAttribute("aria-expanded", "false");
}));

form.addEventListener("submit", event => {
  event.preventDefault();
  const name = new FormData(form).get("nome").trim().split(" ")[0];
  form.querySelector(".form-feedback").textContent = `Obrigada, ${name}! Sua mensagem foi recebida.`;
  form.reset();
});

showSlide(0);
startCarousel();
