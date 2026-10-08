const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");

function closeMenu() {
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Abrir menu");
  siteNav.classList.remove("is-open");
}

menuToggle.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  menuToggle.setAttribute("aria-label", isExpanded ? "Abrir menu" : "Fechar menu");
  siteNav.classList.toggle("is-open", !isExpanded);
});

siteNav.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

const revealElements = document.querySelectorAll("[data-reveal]");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

const carousel = document.querySelector(".sketch-carousel");

if (carousel) {
  const slides = [...carousel.querySelectorAll(".carousel-slide")];
  const count = carousel.querySelector(".carousel-count");
  const pauseButton = carousel.querySelector(".carousel-pause");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let activeIndex = 0;
  let timer;
  let isPaused = reducedMotion.matches;
  let isHovered = false;
  let hasFocus = false;
  let isInView = false;

  function showSlide(index) {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeIndex;
      slide.hidden = !isActive;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
    });
    count.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
  }

  function stopRotation() {
    window.clearInterval(timer);
    timer = undefined;
  }

  function startRotation() {
    stopRotation();
    if (!isPaused && !isHovered && !hasFocus && isInView && !document.hidden) {
      timer = window.setInterval(() => showSlide(activeIndex + 1), 3500);
    }
  }

  function updatePauseButton() {
    pauseButton.textContent = isPaused ? "▶" : "Ⅱ";
    pauseButton.setAttribute("aria-label", isPaused ? "Retomar troca automática" : "Pausar troca automática");
  }

  carousel.querySelector(".carousel-previous").addEventListener("click", () => {
    showSlide(activeIndex - 1);
    startRotation();
  });

  carousel.querySelector(".carousel-next").addEventListener("click", () => {
    showSlide(activeIndex + 1);
    startRotation();
  });

  pauseButton.addEventListener("click", () => {
    isPaused = !isPaused;
    updatePauseButton();
    startRotation();
  });

  carousel.addEventListener("mouseenter", () => {
    isHovered = true;
    stopRotation();
  });
  carousel.addEventListener("mouseleave", () => {
    isHovered = false;
    startRotation();
  });
  carousel.addEventListener("focusin", () => {
    hasFocus = true;
    stopRotation();
  });
  carousel.addEventListener("focusout", (event) => {
    hasFocus = carousel.contains(event.relatedTarget);
    startRotation();
  });
  document.addEventListener("visibilitychange", startRotation);
  reducedMotion.addEventListener("change", (event) => {
    isPaused = event.matches;
    updatePauseButton();
    startRotation();
  });

  if ("IntersectionObserver" in window) {
    const carouselObserver = new IntersectionObserver(([entry]) => {
      isInView = entry.isIntersecting;
      startRotation();
    });
    carouselObserver.observe(carousel);
  } else {
    isInView = true;
  }

  updatePauseButton();
  startRotation();
}

const backgroundAudio = document.querySelector("#background-audio");
const musicPlay = document.querySelector("#music-play");
const musicMute = document.querySelector("#music-mute");
const musicStatus = document.querySelector("#music-status");
const audioFileUrl = new URL(backgroundAudio.querySelector("source").getAttribute("src"), document.baseURI);

function getAudioErrorMessage() {
  if (window.location.protocol === "file:") {
    return "abra com Live Server";
  }

  if (audioFileUrl.protocol === "file:" && window.location.protocol !== "file:") {
    return "use o site por localhost";
  }

  return "verifique assets/musica-fundo.mp3";
}

function updateMusicButtons() {
  const isPlaying = !backgroundAudio.paused;
  musicPlay.querySelector("span").textContent = isPlaying ? "Ⅱ" : "▶";
  musicPlay.setAttribute("aria-label", isPlaying ? "Pausar música" : "Tocar música");
  musicPlay.title = isPlaying ? "Pausar música" : "Tocar música";
  musicMute.setAttribute("aria-pressed", String(backgroundAudio.muted));
  musicMute.setAttribute("aria-label", backgroundAudio.muted ? "Ativar som" : "Mutar música");
  musicMute.title = backgroundAudio.muted ? "Ativar som" : "Mutar música";
}

musicPlay.addEventListener("click", async () => {
  if (!backgroundAudio.paused) {
    backgroundAudio.pause();
    musicStatus.textContent = "pausado";
    return;
  }

  if (window.location.protocol === "file:") {
    musicStatus.textContent = getAudioErrorMessage();
    return;
  }

  try {
    await backgroundAudio.play();
    musicStatus.textContent = "reproduzindo";
  } catch {
    musicStatus.textContent = getAudioErrorMessage();
  }

  updateMusicButtons();
});

musicMute.addEventListener("click", () => {
  backgroundAudio.muted = !backgroundAudio.muted;
  musicStatus.textContent = backgroundAudio.muted ? "som mutado" : "som ativado";
  updateMusicButtons();
});

backgroundAudio.addEventListener("play", updateMusicButtons);
backgroundAudio.addEventListener("pause", updateMusicButtons);
backgroundAudio.addEventListener("ended", updateMusicButtons);
backgroundAudio.addEventListener("error", () => {
  musicStatus.textContent = getAudioErrorMessage();
  updateMusicButtons();
});
if (window.location.protocol === "file:") {
  musicStatus.textContent = "abra com Live Server";
}
updateMusicButtons();

const contactLinks = {
  github: "https://github.com/andrezinhogamer11",
  linkedIn: "https://www.linkedin.com/in/andr%C3%A9-mardula-neto-b2767436a/?isSelfProfile=true",
  email: "andremardulaneto1@gmail.com",
  otherSocial: "",
};

document.querySelectorAll(".contact-row[data-contact]").forEach((row) => {
  const key = row.dataset.contact;
  const value = contactLinks[key];

  if (!value) return;

  if (key === "github") {
    row.href = value;
    row.querySelector(".contact-value").textContent = new URL(value).pathname.replace(/^\/|\/$/g, "");
    return;
  }

  const link = document.createElement("a");
  link.className = row.className;
  link.href = key === "email" ? `mailto:${value}` : value;
  if (key !== "email") {
    link.target = "_blank";
    link.rel = "noreferrer";
  }
  while (row.firstChild) link.append(row.firstChild);
  link.querySelector(".contact-value").textContent = value;
  row.replaceWith(link);
});
