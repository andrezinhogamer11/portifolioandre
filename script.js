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

const desktop = document.querySelector("#desktop");
const windowLayer = document.querySelector("#desktop-windows");
const taskbarApps = document.querySelector("#taskbar-apps");
const startButton = document.querySelector("#start-button");
const startMenu = document.querySelector("#start-menu");
const startMenuGrid = document.querySelector(".start-menu-grid");
const appWindows = new Map();
let highestWindow = 10;

const applications = [
  { id: "janelas", title: "Janelas", glyph: "▱", description: "Bem-vindo ao meu espaço digital.", section: "#inicio" },
  { id: "sobre", title: "Sobre mim", glyph: "AM", description: "Um pouco sobre quem está por trás do código.", section: "#sobre" },
  { id: "projetos", title: "Meus Projetos", glyph: "▣", description: "Projetos reais publicados no GitHub.", section: "#projetos" },
  { id: "habilidades", title: "Habilidades", glyph: "</>", description: "Tecnologias presentes nos repositórios.", custom: "habilidades" },
  { id: "curriculo", title: "Currículo", glyph: "CV", description: "Minha trajetória de estudante.", custom: "curriculo" },
  { id: "contato", title: "Contato", glyph: "↗", description: "Canais para trocar uma ideia.", section: "#contato" },
  { id: "laboratorio", title: "Laboratório", glyph: "✳", description: "Um pequeno gerador de ideias.", custom: "laboratorio" },
];

const customApplicationContent = {
  habilidades: `
    <div class="desktop-custom">
      <p class="app-window-kicker">04 / tecnologias nos repositórios</p>
      <h2>O que venho <em>explorando.</em></h2>
      <p>Estas tecnologias aparecem nos projetos públicos do meu GitHub. Estou aprendendo e experimentando com elas no meu caminho como estudante.</p>
      <div class="skill-list">
        <div class="skill-chip">HTML <small>estrutura web</small></div>
        <div class="skill-chip">CSS · SCSS <small>estilo e layout</small></div>
        <div class="skill-chip">JavaScript <small>web</small></div>
        <div class="skill-chip">Vue · TypeScript <small>interfaces e aplicações</small></div>
        <div class="skill-chip">PHP <small>projetos web</small></div>
        <div class="skill-chip">Ionic · Capacitor <small>aplicativo mobile</small></div>
        <div class="skill-chip">Bootstrap <small>interface web</small></div>
        <div class="skill-chip">Bluetooth Low Energy <small>jogo mobile offline</small></div>
      </div>
    </div>`,
  curriculo: `
    <div class="desktop-custom">
      <p class="app-window-kicker">05 / currículo em construção</p>
      <h2>Minha trajetória,<br /><em>sem enrolação.</em></h2>
      <p>Um resumo do que estou estudando e criando agora. Este espaço pode receber um currículo em PDF quando houver um arquivo para compartilhar.</p>
      <div class="resume-grid">
        <div class="resume-item"><strong>André Mardula Neto</strong><small>19 anos · estudante de programação e tecnologia</small></div>
        <div class="resume-item"><strong>Ensino Médio integrado ao Técnico em Informática</strong><small>3º ano · Senac</small></div>
        <div class="resume-item"><strong>Interesses</strong><small>Programação · desenvolvimento web · design · desenho · música · criatividade</small></div>
        <div class="resume-item"><strong>Projetos práticos</strong><small>Aplicativos mobile · interfaces web · experimentos visuais</small></div>
      </div>
      <a class="desktop-contact-link" href="https://github.com/andrezinhogamer11" target="_blank" rel="noreferrer">Ver meus projetos no GitHub <span>↗</span></a>
    </div>`,
  laboratorio: `
    <div class="desktop-custom">
      <p class="app-window-kicker">07 / aplicação autoral · beta</p>
      <h2>Laboratório<br /><em>de ideias.</em></h2>
      <p>Um mini experimento que mistura alguns assuntos que me interessam. Aperte o botão e veja que ideia aparece.</p>
      <div class="idea-generator">
        <span class="idea-generator-label mono">IDEIA GERADA</span>
        <p class="idea-output" id="idea-output" aria-live="polite">Um sketchbook digital que transforma rabiscos em interfaces.</p>
        <button class="idea-button" id="idea-button" type="button">misturar referências <span aria-hidden="true">↗</span></button>
      </div>
    </div>`,
};

const ideaPrompts = [
  "Uma galeria de desenhos com trilha sonora escolhida por quem visita.",
  "Um mural digital que organiza referências como adesivos de skate.",
  "Um player musical com visual inspirado em um sketchbook.",
  "Uma interface para guardar ideias de projetos entre código e desenho.",
  "Um caderno interativo que transforma formas em pequenos experimentos visuais.",
];

function updateClock() {
  const now = new Date();
  document.querySelector("#taskbar-clock").textContent = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(now);
  document.querySelector("#desktop-date").textContent = new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(now);
}

function setStartMenuOpen(isOpen) {
  startButton.setAttribute("aria-expanded", String(isOpen));
  startMenu.hidden = !isOpen;
}

function getApplicationContent(application) {
  if (application.custom) return customApplicationContent[application.custom];

  const original = document.querySelector(application.section);
  if (!original) return "<p>Este conteúdo ainda não está disponível.</p>";

  const clone = original.cloneNode(true);
  const elementsWithIds = [clone, ...clone.querySelectorAll("[id]")].filter((element) => element.id);
  const idMap = new Map(elementsWithIds.map((element) => [element.id, `${application.id}-${element.id}`]));
  elementsWithIds.forEach((element) => {
    element.id = idMap.get(element.id);
  });
  [clone, ...clone.querySelectorAll("*")].forEach((element) => {
    ["aria-labelledby", "aria-describedby", "aria-controls"].forEach((attribute) => {
      const value = element.getAttribute(attribute);
      if (!value) return;
      element.setAttribute(attribute, value.split(/\s+/).map((id) => idMap.get(id) ?? id).join(" "));
    });
  });
  clone.querySelectorAll("[data-reveal]").forEach((element) => element.classList.add("is-visible"));
  return clone.outerHTML;
}

function focusWindow(windowElement) {
  highestWindow += 1;
  windowElement.style.zIndex = String(highestWindow);
  taskbarApps.querySelectorAll(".taskbar-app").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.window === windowElement.dataset.app);
  });
}

function createTaskbarButton(application) {
  const button = document.createElement("button");
  button.className = "taskbar-app is-open";
  button.type = "button";
  button.dataset.window = application.id;
  button.setAttribute("aria-label", `Mostrar janela ${application.title}`);
  button.innerHTML = `<span class="taskbar-glyph" aria-hidden="true">${application.glyph}</span><span class="taskbar-label">${application.title}</span>`;
  button.addEventListener("click", () => {
    const windowElement = appWindows.get(application.id);
    if (windowElement.hidden) {
      windowElement.hidden = false;
      focusWindow(windowElement);
    } else if (button.classList.contains("is-active")) {
      windowElement.hidden = true;
      button.classList.remove("is-active");
    } else {
      focusWindow(windowElement);
    }
  });
  taskbarApps.append(button);
}

function closeApplication(applicationId) {
  const windowElement = appWindows.get(applicationId);
  if (!windowElement) return;
  windowElement.remove();
  appWindows.delete(applicationId);
  taskbarApps.querySelector(`[data-window="${applicationId}"]`)?.remove();
}

function enableWindowDragging(windowElement, titlebar) {
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let dragging = false;

  titlebar.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button") || windowElement.classList.contains("is-maximized")) return;
    const bounds = windowElement.getBoundingClientRect();
    dragOffsetX = event.clientX - bounds.left;
    dragOffsetY = event.clientY - bounds.top;
    dragging = true;
    titlebar.setPointerCapture(event.pointerId);
    focusWindow(windowElement);
  });

  titlebar.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    const layerBounds = windowLayer.getBoundingClientRect();
    const bounds = windowElement.getBoundingClientRect();
    const left = Math.max(0, Math.min(event.clientX - layerBounds.left - dragOffsetX, layerBounds.width - bounds.width));
    const top = Math.max(0, Math.min(event.clientY - layerBounds.top - dragOffsetY, layerBounds.height - bounds.height));
    windowElement.style.left = `${left}px`;
    windowElement.style.top = `${top}px`;
  });

  titlebar.addEventListener("pointerup", () => {
    dragging = false;
  });
  titlebar.addEventListener("pointercancel", () => {
    dragging = false;
  });
}

function openApplication(applicationId) {
  const application = applications.find((item) => item.id === applicationId);
  if (!application) return;
  setStartMenuOpen(false);

  const existing = appWindows.get(application.id);
  if (existing) {
    existing.hidden = false;
    focusWindow(existing);
    return;
  }

  const windowElement = document.createElement("section");
  windowElement.className = "desktop-window";
  windowElement.dataset.app = application.id;
  windowElement.setAttribute("aria-label", `${application.title} — janela`);
  windowElement.innerHTML = `
    <header class="app-window-bar">
      <span class="app-window-glyph" aria-hidden="true">${application.glyph}</span>
      <span class="app-window-title">${application.title}</span>
      <div class="app-window-controls">
        <button class="app-window-control app-window-minimize" type="button" aria-label="Minimizar ${application.title}">−</button>
        <button class="app-window-control app-window-maximize" type="button" aria-label="Maximizar ${application.title}">□</button>
        <button class="app-window-control app-window-close" type="button" aria-label="Fechar ${application.title}">×</button>
      </div>
    </header>
    <div class="app-window-body"><div class="app-window-content">${getApplicationContent(application)}</div></div>
  `;

  windowLayer.append(windowElement);
  appWindows.set(application.id, windowElement);
  createTaskbarButton(application);
  enableWindowDragging(windowElement, windowElement.querySelector(".app-window-bar"));

  windowElement.addEventListener("pointerdown", () => focusWindow(windowElement));
  windowElement.querySelector(".app-window-close").addEventListener("click", () => closeApplication(application.id));
  windowElement.querySelector(".app-window-minimize").addEventListener("click", () => {
    windowElement.hidden = true;
    taskbarApps.querySelector(`[data-window="${application.id}"]`)?.classList.remove("is-active");
  });
  windowElement.querySelector(".app-window-maximize").addEventListener("click", (event) => {
    const isMaximized = windowElement.classList.toggle("is-maximized");
    event.currentTarget.setAttribute("aria-label", `${isMaximized ? "Restaurar" : "Maximizar"} ${application.title}`);
    if (isMaximized) {
      windowElement.dataset.previousLeft = windowElement.style.left;
      windowElement.dataset.previousTop = windowElement.style.top;
      windowElement.style.left = "";
      windowElement.style.top = "";
    } else {
      windowElement.style.left = windowElement.dataset.previousLeft ?? "";
      windowElement.style.top = windowElement.dataset.previousTop ?? "";
    }
  });

  windowElement.querySelector(".app-window-body").addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const target = link.getAttribute("href");
    const targetApp = target === "#projetos"
      ? "projetos"
      : target === "#sobre"
        ? "sobre"
        : target === "#contato"
          ? "contato"
          : target === "#caderno"
            ? "laboratorio"
            : target === "#inicio"
              ? "janelas"
              : null;
    if (targetApp) {
      event.preventDefault();
      openApplication(targetApp);
    }
  });

  const ideaButton = windowElement.querySelector("#idea-button");
  if (ideaButton) {
    ideaButton.addEventListener("click", () => {
      const output = windowElement.querySelector("#idea-output");
      let nextIdea = output.textContent;
      while (ideaPrompts.length > 1 && nextIdea === output.textContent) {
        nextIdea = ideaPrompts[Math.floor(Math.random() * ideaPrompts.length)];
      }
      output.textContent = nextIdea;
    });
  }

  focusWindow(windowElement);
}

applications.forEach((application) => {
  const icon = desktop.querySelector(`[data-app="${application.id}"]`);
  icon.addEventListener("click", () => openApplication(application.id));

  const menuItem = document.createElement("button");
  menuItem.className = "start-menu-item";
  menuItem.type = "button";
  menuItem.innerHTML = `<span class="start-menu-glyph" aria-hidden="true">${application.glyph}</span>${application.title}`;
  menuItem.addEventListener("click", () => openApplication(application.id));
  startMenuGrid.append(menuItem);
});

startButton.addEventListener("click", () => {
  setStartMenuOpen(startMenu.hidden);
});

document.addEventListener("click", (event) => {
  if (!startMenu.hidden && !startMenu.contains(event.target) && !startButton.contains(event.target)) {
    setStartMenuOpen(false);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setStartMenuOpen(false);
});

updateClock();
window.setInterval(updateClock, 15_000);

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
