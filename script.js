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
const wallpaperImageLayer = document.querySelector("#desktop-wallpaper-image");
const mediaGalleryAssets = [
  { id: "desenho-personagem", name: "Desenho · personagem", src: "assets/desenho-personagem.jpg", description: "Ilustração de personagem" },
  { id: "estudo-visual-player", name: "Estudo visual · player", src: "assets/estudo-visual-player.png", description: "Estudo visual de player de música" },
  { id: "ideia-personagem-01", name: "Estudo · ideia 01", src: "assets/ideia-personagem-01.jpg", description: "Primeiro estudo a lápis do personagem" },
  { id: "ideia-personagem-02", name: "Estudo · ideia 02", src: "assets/ideia-personagem-02.jpg", description: "Segundo estudo a lápis do personagem" },
  { id: "ideia-personagem-03", name: "Estudo · ideia 03", src: "assets/ideia-personagem-03.jpg", description: "Terceiro estudo a lápis do personagem" },
];
const wallpaperPresets = [
  { id: "graphite", name: "Grafite", description: "O mural original" },
  { id: "twilight", name: "Fim de tarde", description: "Violeta e coral" },
  { id: "meadow", name: "Verde ácido", description: "Verde e carvão" },
  { id: "blueprint", name: "Blueprint", description: "Azul de sketchbook" },
];
const appWindows = new Map();
const imageObjectUrls = new Map();
let highestWindow = 10;
let mediaDatabasePromise;
let currentViewerImage;
let calendarMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
let activeWallpaperChoice = "preset:graphite";

const applications = [
  { id: "janelas", title: "Janelas", glyph: "▱", description: "Bem-vindo ao meu espaço digital.", section: "#inicio" },
  { id: "sobre", title: "Sobre mim", glyph: "AM", description: "Um pouco sobre quem está por trás do código.", section: "#sobre" },
  { id: "projetos", title: "Meus Projetos", glyph: "▣", description: "Projetos reais publicados no GitHub.", section: "#projetos" },
  { id: "habilidades", title: "Habilidades", glyph: "</>", description: "Tecnologias presentes nos repositórios.", custom: "habilidades" },
  { id: "curriculo", title: "Currículo", glyph: "CV", description: "Minha trajetória de estudante.", custom: "curriculo" },
  { id: "contato", title: "Contato", glyph: "↗", description: "Canais para trocar uma ideia.", section: "#contato" },
  { id: "laboratorio", title: "Laboratório", glyph: "✳", description: "Um pequeno gerador de ideias.", custom: "laboratorio" },
  { id: "imagens", title: "Imagens", glyph: "▧", description: "Abra imagens e personalize o wallpaper.", custom: "imagens" },
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
  imagens: `
    <div class="desktop-custom image-gallery-app">
      <p class="app-window-kicker">08 / galeria e personalização</p>
      <h2>Seu espaço,<br /><em>seu wallpaper.</em></h2>
      <p>Escolha um visual para a área de trabalho, abra uma imagem da galeria ou importe arquivos do seu dispositivo. As imagens ficam salvas neste navegador.</p>
      <div class="wallpaper-choices" role="group" aria-label="Wallpapers predefinidos">
        ${wallpaperPresets.map((preset) => `<button class="wallpaper-choice" type="button" data-preset="${preset.id}"><span class="wallpaper-preview wallpaper-preview-${preset.id}"></span><span><strong>${preset.name}</strong><small>${preset.description}</small></span><i aria-hidden="true">✓</i></button>`).join("")}
      </div>
      <div class="gallery-toolbar">
        <div><strong>Imagens</strong><span class="gallery-count mono" id="gallery-count"></span></div>
        <label class="image-upload-button">＋ importar imagens<input id="image-upload" type="file" accept="image/*" multiple /></label>
      </div>
      <p class="gallery-status mono" id="gallery-status" aria-live="polite">imagens do sketchbook</p>
      <div class="image-gallery-grid" id="image-gallery-grid"></div>
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
  const time = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).format(now);
  const date = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(now);
  const taskbarClock = document.querySelector("#taskbar-clock");
  taskbarClock.dateTime = now.toISOString();
  taskbarClock.textContent = time;
  document.querySelector("#taskbar-date").textContent = date;
  document.querySelector("#desktop-date").textContent = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(now);
  document.querySelector("#widget-time").textContent = time.slice(0, 5);
  document.querySelector("#clock-hour-hand").style.transform = `rotate(${(now.getHours() % 12) * 30 + now.getMinutes() * 0.5}deg)`;
  document.querySelector("#clock-minute-hand").style.transform = `rotate(${now.getMinutes() * 6 + now.getSeconds() * 0.1}deg)`;
  document.querySelector("#clock-second-hand").style.transform = `rotate(${now.getSeconds() * 6}deg)`;
}

function renderCalendar() {
  const monthLabel = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(calendarMonth);
  document.querySelector("#calendar-month").textContent = monthLabel;
  const grid = document.querySelector("#calendar-grid");
  grid.replaceChildren();
  ["seg", "ter", "qua", "qui", "sex", "sáb", "dom"].forEach((label) => {
    const heading = document.createElement("span");
    heading.className = "calendar-weekday";
    heading.setAttribute("role", "columnheader");
    heading.textContent = label;
    grid.append(heading);
  });

  const firstDay = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const startDate = new Date(firstDay);
  startDate.setDate(firstDay.getDate() - startOffset);
  const today = new Date();

  for (let dayIndex = 0; dayIndex < 42; dayIndex += 1) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + dayIndex);
    const dayButton = document.createElement("button");
    dayButton.type = "button";
    dayButton.className = "calendar-day";
    dayButton.setAttribute("role", "gridcell");
    dayButton.textContent = String(date.getDate());
    if (date.getMonth() !== calendarMonth.getMonth()) dayButton.classList.add("is-outside");
    if (date.toDateString() === today.toDateString()) {
      dayButton.classList.add("is-today");
      dayButton.setAttribute("aria-current", "date");
    }
    dayButton.setAttribute("aria-label", new Intl.DateTimeFormat("pt-BR", { dateStyle: "full" }).format(date));
    dayButton.addEventListener("click", () => {
      grid.querySelector(".is-selected")?.classList.remove("is-selected");
      dayButton.classList.add("is-selected");
    });
    grid.append(dayButton);
  }
}

function setCalendarOpen(isOpen) {
  const calendar = document.querySelector("#clock-calendar");
  const clockButton = document.querySelector("#clock-button");
  calendar.hidden = !isOpen;
  clockButton.setAttribute("aria-expanded", String(isOpen));
  if (isOpen) renderCalendar();
}

function openMediaDatabase() {
  if (mediaDatabasePromise) return mediaDatabasePromise;
  mediaDatabasePromise = new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("Este navegador não oferece armazenamento local de imagens."));
      return;
    }

    const request = indexedDB.open("mardula-os-media", 2);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains("images")) database.createObjectStore("images", { keyPath: "id" });
      if (!database.objectStoreNames.contains("settings")) database.createObjectStore("settings", { keyPath: "key" });
      if (!database.objectStoreNames.contains("audio")) database.createObjectStore("audio", { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Não foi possível abrir a galeria local."));
    request.onblocked = () => reject(new Error("Feche as outras abas do portfólio e tente novamente."));
  });
  return mediaDatabasePromise;
}

async function mediaStoreRequest(storeName, mode, action) {
  const database = await openMediaDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, mode);
    const request = action(transaction.objectStore(storeName));
    let result;
    request.onsuccess = () => {
      result = request.result;
    };
    request.onerror = () => reject(request.error ?? new Error("Não foi possível acessar a galeria."));
    transaction.oncomplete = () => resolve(result);
    transaction.onerror = () => reject(transaction.error ?? new Error("Não foi possível acessar a galeria."));
    transaction.onabort = () => reject(transaction.error ?? new Error("A alteração na galeria foi cancelada."));
  });
}

function getImageObjectUrl(record) {
  if (!imageObjectUrls.has(record.id)) {
    imageObjectUrls.set(record.id, URL.createObjectURL(record.blob));
  }
  return imageObjectUrls.get(record.id);
}

async function applyWallpaperChoice(choice) {
  if (choice.startsWith("image:")) {
    const imageId = choice.slice("image:".length);
    const image = await mediaStoreRequest("images", "readonly", (store) => store.get(imageId));
    if (!image) throw new Error("A imagem escolhida não está mais na galeria.");
    wallpaperImageLayer.style.backgroundImage = `linear-gradient(rgba(18, 20, 19, 0.48), rgba(18, 20, 19, 0.58)), url("${getImageObjectUrl(image)}")`;
    wallpaperImageLayer.hidden = false;
    desktop.dataset.wallpaper = "custom";
  } else if (choice.startsWith("asset:")) {
    const image = mediaGalleryAssets.find((item) => item.id === choice.slice("asset:".length));
    if (!image) throw new Error("A imagem escolhida não foi encontrada.");
    wallpaperImageLayer.style.backgroundImage = `linear-gradient(rgba(18, 20, 19, 0.48), rgba(18, 20, 19, 0.58)), url("${image.src}")`;
    wallpaperImageLayer.hidden = false;
    desktop.dataset.wallpaper = "custom";
  } else {
    wallpaperImageLayer.hidden = true;
    wallpaperImageLayer.style.backgroundImage = "";
    desktop.dataset.wallpaper = choice.slice("preset:".length);
  }
  activeWallpaperChoice = choice;
  updateWallpaperChoices();
}

async function saveWallpaperChoice(choice) {
  await mediaStoreRequest("settings", "readwrite", (store) => store.put({ key: "wallpaper", value: choice }));
  await applyWallpaperChoice(choice);
}

function updateWallpaperChoices() {
  document.querySelectorAll(".wallpaper-choice").forEach((button) => {
    const isSelected = button.dataset.preset === activeWallpaperChoice;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });
}

async function restoreWallpaperChoice() {
  let savedChoice = "preset:graphite";
  try {
    const setting = await mediaStoreRequest("settings", "readonly", (store) => store.get("wallpaper"));
    if (setting?.value) savedChoice = setting.value;
    await applyWallpaperChoice(savedChoice);
  } catch (error) {
    console.error("Não foi possível restaurar o wallpaper salvo.", error);
    activeWallpaperChoice = "preset:graphite";
    desktop.dataset.wallpaper = "graphite";
    wallpaperImageLayer.hidden = true;
  }
}

function openImageViewer(image) {
  currentViewerImage = image;
  const imageUrl = image.blob ? getImageObjectUrl(image) : image.src;
  const viewerImage = document.querySelector("#viewer-image");
  viewerImage.src = imageUrl;
  viewerImage.alt = image.description ?? image.name;
  document.querySelector("#viewer-caption").textContent = image.name;
  document.querySelector("#viewer-wallpaper").disabled = false;
  document.querySelector("#viewer-wallpaper").dataset.wallpaper = `${image.blob ? "image" : "asset"}:${image.id}`;
  const viewer = document.querySelector("#image-viewer");
  if (!viewer.open) viewer.showModal();
}

function createImageCard(image) {
  const card = document.createElement("article");
  card.className = "image-gallery-card";
  const source = image.blob ? getImageObjectUrl(image) : image.src;

  const preview = document.createElement("button");
  preview.className = "image-preview";
  preview.type = "button";
  preview.setAttribute("aria-label", `Abrir imagem: ${image.name}`);
  const thumbnail = document.createElement("img");
  thumbnail.src = source;
  thumbnail.alt = "";
  thumbnail.loading = "lazy";
  preview.append(thumbnail);
  preview.addEventListener("click", () => openImageViewer(image));

  const details = document.createElement("div");
  details.className = "image-card-details";
  const title = document.createElement("span");
  title.textContent = image.name;
  const actions = document.createElement("div");
  actions.className = "image-card-actions";

  const viewButton = document.createElement("button");
  viewButton.type = "button";
  viewButton.textContent = "abrir";
  viewButton.addEventListener("click", () => openImageViewer(image));

  const wallpaperButton = document.createElement("button");
  wallpaperButton.type = "button";
  wallpaperButton.textContent = "wallpaper";
  wallpaperButton.addEventListener("click", async () => {
    const status = card.closest(".image-gallery-app").querySelector("#gallery-status");
    try {
      await saveWallpaperChoice(`${image.blob ? "image" : "asset"}:${image.id}`);
      status.textContent = `${image.name}: wallpaper aplicado`;
    } catch (error) {
      console.error("Não foi possível aplicar a imagem como wallpaper.", error);
      status.textContent = error.message;
    }
  });

  actions.append(viewButton, wallpaperButton);
  details.append(title, actions);
  card.append(preview, details);
  return card;
}

async function populateImageGallery(windowElement) {
  const gallery = windowElement.querySelector("#image-gallery-grid");
  const count = windowElement.querySelector("#gallery-count");
  const status = windowElement.querySelector("#gallery-status");
  const fileInput = windowElement.querySelector("#image-upload");
  if (!gallery || gallery.dataset.initialized === "true") return;
  gallery.dataset.initialized = "true";

  async function refreshGallery() {
    const savedImages = await mediaStoreRequest("images", "readonly", (store) => store.getAll());
    gallery.replaceChildren(...mediaGalleryAssets.map(createImageCard), ...savedImages.map(createImageCard));
    count.textContent = `${mediaGalleryAssets.length + savedImages.length} itens`;
    updateWallpaperChoices();
  }

  try {
    await refreshGallery();
    status.textContent = "escolha uma imagem ou wallpaper";
  } catch (error) {
    console.error("Não foi possível carregar as imagens salvas.", error);
    status.textContent = error.message;
  }

  windowElement.querySelectorAll(".wallpaper-choice").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await saveWallpaperChoice(`preset:${button.dataset.preset}`);
        status.textContent = `wallpaper “${button.querySelector("strong").textContent}” aplicado`;
      } catch (error) {
        console.error("Não foi possível trocar o wallpaper.", error);
        status.textContent = error.message;
      }
    });
  });

  fileInput.addEventListener("change", async () => {
    const selectedFiles = [...fileInput.files];
    if (!selectedFiles.length) return;
    const validFiles = selectedFiles.filter((file) => file.type.startsWith("image/"));
    if (validFiles.length !== selectedFiles.length) {
      status.textContent = "selecione apenas arquivos de imagem";
      fileInput.value = "";
      return;
    }
    try {
      for (const file of validFiles) {
        await mediaStoreRequest("images", "readwrite", (store) => store.put({
          id: crypto.randomUUID(),
          name: file.name,
          description: file.name,
          blob: file,
          addedAt: Date.now(),
        }));
      }
      await refreshGallery();
      status.textContent = `${validFiles.length} imagem(ns) adicionada(s) à galeria`;
    } catch (error) {
      console.error("Não foi possível importar as imagens.", error);
      status.textContent = error.message;
    } finally {
      fileInput.value = "";
    }
  });
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

  if (application.id === "imagens") populateImageGallery(windowElement);
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
  if (!document.querySelector("#clock-calendar").hidden
    && !document.querySelector("#clock-calendar").contains(event.target)
    && !document.querySelector("#clock-button").contains(event.target)) {
    setCalendarOpen(false);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setStartMenuOpen(false);
});

document.querySelector("#clock-button").addEventListener("click", () => {
  setCalendarOpen(document.querySelector("#clock-calendar").hidden);
});
document.querySelector("#calendar-previous").addEventListener("click", () => {
  calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1);
  renderCalendar();
});
document.querySelector("#calendar-next").addEventListener("click", () => {
  calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1);
  renderCalendar();
});
document.querySelector("#calendar-today").addEventListener("click", () => {
  const now = new Date();
  calendarMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  renderCalendar();
});

const imageViewer = document.querySelector("#image-viewer");
document.querySelector("#viewer-close").addEventListener("click", () => imageViewer.close());
document.querySelector("#viewer-wallpaper").addEventListener("click", async (event) => {
  const status = document.querySelector("#gallery-status");
  try {
    await saveWallpaperChoice(event.currentTarget.dataset.wallpaper);
    if (status) status.textContent = `${currentViewerImage.name}: wallpaper aplicado`;
    imageViewer.close();
  } catch (error) {
    console.error("Não foi possível aplicar a imagem como wallpaper.", error);
    if (status) status.textContent = error.message;
  }
});
imageViewer.addEventListener("click", (event) => {
  if (event.target === imageViewer) imageViewer.close();
});
imageViewer.addEventListener("close", () => {
  document.querySelector("#viewer-image").removeAttribute("src");
  currentViewerImage = undefined;
});

updateClock();
window.setInterval(updateClock, 1_000);
restoreWallpaperChoice();
window.addEventListener("pagehide", () => {
  imageObjectUrls.forEach((url) => URL.revokeObjectURL(url));
  imageObjectUrls.clear();
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
const musicTitle = document.querySelector(".music-title");
const musicLibraryToggle = document.querySelector("#music-library-toggle");
const musicLibrary = document.querySelector("#music-library");
const musicLibraryCount = document.querySelector("#music-library-count");
const musicLibraryStatus = document.querySelector("#music-library-status");
const musicTrackList = document.querySelector("#music-track-list");
const musicUpload = document.querySelector("#music-upload");
const musicPlayer = document.querySelector(".music-player");
const musicDragHandle = document.querySelector("#music-drag-handle");
const audioFileUrl = new URL(backgroundAudio.querySelector("source").getAttribute("src"), document.baseURI);
let selectedMusicTrack = "default";
let activeMusicObjectUrl = "";
let musicTracks = [];

function getClampedMusicPosition(left, top) {
  const rect = musicPlayer.getBoundingClientRect();
  return {
    left: Math.min(Math.max(0, left), Math.max(0, window.innerWidth - rect.width)),
    top: Math.min(Math.max(0, top), Math.max(0, window.innerHeight - rect.height)),
  };
}

function setMusicPlayerPosition(left, top, persist = true) {
  const position = getClampedMusicPosition(left, top);
  musicPlayer.style.left = `${position.left}px`;
  musicPlayer.style.top = `${position.top}px`;
  musicPlayer.style.right = "auto";
  musicPlayer.style.bottom = "auto";
  if (persist) {
    try {
      localStorage.setItem("mardula-music-player-position", JSON.stringify(position));
    } catch (error) {
      console.error("Não foi possível salvar a posição do player.", error);
    }
  }
}

function restoreMusicPlayerPosition() {
  try {
    const savedPosition = JSON.parse(localStorage.getItem("mardula-music-player-position") ?? "null");
    if (
      savedPosition
      && Number.isFinite(savedPosition.left)
      && Number.isFinite(savedPosition.top)
    ) {
      setMusicPlayerPosition(savedPosition.left, savedPosition.top, false);
    }
  } catch (error) {
    console.error("Não foi possível restaurar a posição do player.", error);
  }
}

let musicDrag = null;
musicDragHandle.addEventListener("pointerdown", (event) => {
  if (event.button !== 0) return;
  const rect = musicPlayer.getBoundingClientRect();
  musicDrag = {
    pointerId: event.pointerId,
    offsetX: event.clientX - rect.left,
    offsetY: event.clientY - rect.top,
    startX: event.clientX,
    startY: event.clientY,
    moved: false,
  };
  musicDragHandle.setPointerCapture(event.pointerId);
});

musicDragHandle.addEventListener("pointermove", (event) => {
  if (!musicDrag || musicDrag.pointerId !== event.pointerId) return;
  if (!musicDrag.moved && Math.hypot(event.clientX - musicDrag.startX, event.clientY - musicDrag.startY) < 4) return;
  musicDrag.moved = true;
  musicPlayer.classList.add("is-dragging");
  setMusicPlayerPosition(event.clientX - musicDrag.offsetX, event.clientY - musicDrag.offsetY);
});

function finishMusicDrag(event) {
  if (!musicDrag || musicDrag.pointerId !== event.pointerId) return;
  if (musicDragHandle.hasPointerCapture(event.pointerId)) musicDragHandle.releasePointerCapture(event.pointerId);
  musicPlayer.classList.remove("is-dragging");
  musicDrag = null;
}

musicDragHandle.addEventListener("pointerup", finishMusicDrag);
musicDragHandle.addEventListener("pointercancel", finishMusicDrag);
musicDragHandle.addEventListener("keydown", (event) => {
  const rect = musicPlayer.getBoundingClientRect();
  const step = event.shiftKey ? 30 : 10;
  const movement = {
    ArrowLeft: [-step, 0],
    ArrowRight: [step, 0],
    ArrowUp: [0, -step],
    ArrowDown: [0, step],
  }[event.key];
  if (!movement) return;
  event.preventDefault();
  setMusicPlayerPosition(rect.left + movement[0], rect.top + movement[1]);
});

window.addEventListener("resize", () => {
  const rect = musicPlayer.getBoundingClientRect();
  setMusicPlayerPosition(rect.left, rect.top);
});

function getAudioErrorMessage() {
  if (selectedMusicTrack === "default" && window.location.protocol === "file:") {
    return "abra com Live Server";
  }

  if (selectedMusicTrack === "default" && audioFileUrl.protocol === "file:" && window.location.protocol !== "file:") {
    return "use o site por localhost";
  }

  return "não foi possível reproduzir esta faixa";
}

function setMusicLibraryOpen(isOpen) {
  musicLibrary.hidden = !isOpen;
  musicLibraryToggle.setAttribute("aria-expanded", String(isOpen));
  musicLibraryToggle.setAttribute("aria-label", isOpen ? "Fechar biblioteca de músicas" : "Abrir biblioteca de músicas");
}

async function selectMusicTrack(track, shouldSave = true) {
  backgroundAudio.pause();
  if (activeMusicObjectUrl) URL.revokeObjectURL(activeMusicObjectUrl);
  activeMusicObjectUrl = "";

  if (track.id === "default") {
    backgroundAudio.removeAttribute("src");
    selectedMusicTrack = "default";
    musicTitle.textContent = "som de fundo";
  } else {
    activeMusicObjectUrl = URL.createObjectURL(track.blob);
    backgroundAudio.src = activeMusicObjectUrl;
    selectedMusicTrack = track.id;
    musicTitle.textContent = track.name;
  }

  backgroundAudio.load();
  musicStatus.textContent = track.id === "default" && window.location.protocol === "file:"
    ? getAudioErrorMessage()
    : "faixa selecionada";
  updateMusicButtons();
  if (shouldSave) {
    try {
      await mediaStoreRequest("settings", "readwrite", (store) => store.put({ key: "music-track", value: selectedMusicTrack }));
    } catch (error) {
      console.error("Não foi possível salvar a faixa selecionada.", error);
      musicLibraryStatus.textContent = error.message;
    }
  }
  renderMusicTrackList();
}

function renderMusicTrackList(tracks = musicTracks) {
  const defaultTrack = document.createElement("button");
  defaultTrack.type = "button";
  defaultTrack.className = "music-track";
  defaultTrack.setAttribute("aria-pressed", String(selectedMusicTrack === "default"));
  defaultTrack.innerHTML = '<span class="music-track-glyph" aria-hidden="true">♫</span><span class="music-track-name">som de fundo</span><span class="music-track-source">padrão</span>';
  defaultTrack.addEventListener("click", () => {
    void selectMusicTrack({ id: "default" });
    musicLibraryStatus.textContent = "faixa selecionada";
  });

  const trackItems = tracks.map((track) => {
    const item = document.createElement("div");
    item.className = "music-track-row";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "music-track";
    button.setAttribute("aria-pressed", String(selectedMusicTrack === track.id));
    const glyph = document.createElement("span");
    glyph.className = "music-track-glyph";
    glyph.setAttribute("aria-hidden", "true");
    glyph.textContent = "♫";
    const name = document.createElement("span");
    name.className = "music-track-name";
    name.textContent = track.name;
    const source = document.createElement("span");
    source.className = "music-track-source";
    source.textContent = "importada";
    button.append(glyph, name, source);
    button.addEventListener("click", () => {
      void selectMusicTrack(track);
      musicLibraryStatus.textContent = "faixa selecionada";
    });

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "music-track-remove";
    remove.setAttribute("aria-label", `Remover ${track.name} da biblioteca`);
    remove.textContent = "×";
    remove.addEventListener("click", async () => {
      try {
        if (selectedMusicTrack === track.id) await selectMusicTrack({ id: "default" });
        await mediaStoreRequest("audio", "readwrite", (store) => store.delete(track.id));
        await refreshMusicLibrary();
        musicLibraryStatus.textContent = "faixa removida da biblioteca";
      } catch (error) {
        console.error("Não foi possível remover a faixa.", error);
        musicLibraryStatus.textContent = error.message;
      }
    });
    item.append(button, remove);
    return item;
  });

  musicTrackList.replaceChildren(defaultTrack, ...trackItems);
  musicLibraryCount.textContent = `${tracks.length + 1} ${tracks.length === 0 ? "faixa" : "faixas"}`;
}

async function refreshMusicLibrary() {
  musicTracks = await mediaStoreRequest("audio", "readonly", (store) => store.getAll());
  renderMusicTrackList();
  return musicTracks;
}

async function initializeMusicLibrary() {
  try {
    const tracks = await refreshMusicLibrary();
    const savedTrack = await mediaStoreRequest("settings", "readonly", (store) => store.get("music-track"));
    if (savedTrack?.value === "default") return;
    const selectedTrack = tracks.find((track) => track.id === savedTrack?.value);
    if (selectedTrack) await selectMusicTrack(selectedTrack, false);
    else if (savedTrack?.value) {
      await mediaStoreRequest("settings", "readwrite", (store) => store.put({ key: "music-track", value: "default" }));
    }
  } catch (error) {
    console.error("Não foi possível carregar a biblioteca de músicas.", error);
    musicLibraryStatus.textContent = error.message;
  }
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

  if (selectedMusicTrack === "default" && window.location.protocol === "file:") {
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

musicLibraryToggle.addEventListener("click", () => {
  setMusicLibraryOpen(musicLibrary.hidden);
});

musicUpload.addEventListener("change", async () => {
  const files = [...musicUpload.files];
  if (!files.length) return;
  const invalidFiles = files.filter((file) => (
    !file.type.startsWith("audio/")
    && !/\.(mp3|m4a|aac|wav|ogg|oga|opus|flac|webm)$/i.test(file.name)
  ));
  if (invalidFiles.length) {
    musicLibraryStatus.textContent = "selecione apenas arquivos de áudio";
    musicUpload.value = "";
    return;
  }

  try {
    const importedTracks = files.map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      blob: file,
      addedAt: Date.now(),
    }));
    await mediaStoreRequest("audio", "readwrite", (store) => {
      importedTracks.forEach((track) => store.put(track));
      return store.count();
    });
    await refreshMusicLibrary();
    musicLibraryStatus.textContent = `${files.length} música(s) adicionada(s)`;
  } catch (error) {
    console.error("Não foi possível importar as músicas.", error);
    musicLibraryStatus.textContent = error.message;
  } finally {
    musicUpload.value = "";
  }
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
renderMusicTrackList();
initializeMusicLibrary();
restoreMusicPlayerPosition();

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
