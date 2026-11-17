"use strict";

const app = document.querySelector("#app");
const dialog = document.querySelector("#action-dialog");
const announcer = document.querySelector("#announcer");
const validDemoDni = "40374767";
const dniIds = ["dni", "declaration-dni", "tracking-dni", "login-dni"];

const state = {
  screen: "splash",
  recordFrom: "",
  registrationStatus: "Vigente",
  verifiedDni: "",
  study: ["Título profesional", "Ingeniería de sistemas", "Universidad de demostración", "Lima / Perú"],
  personal: {
    names: "Ludkant Ronald",
    paternal: "Yabar",
    maternal: "Galindo",
    email: "ciudadano@ejemplo.pe",
    phone: "900 000 000",
    address: "Dirección de demostración",
    department: "Puno",
    province: "Puno",
    district: "Puno",
  },
  accepted: new Set(),
  courses: [
    ["Curso", "Gestión de proyectos", "Instituto de demostración", "80"],
    ["Taller", "Herramientas digitales", "Centro de formación", "40"],
  ],
  experience: [
    ["Entidad de demostración", "Asistente administrativo", "01/2022 - 12/2023"],
    ["Organización de ejemplo", "Soporte técnico", "03/2020 - 11/2021"],
  ],
  trackingSearched: false,
};

const stepNames = [
  "Datos personales",
  "Formación académica",
  "Experiencia laboral",
  "Declaración jurada",
  "Confirmación",
];

const declarations = [
  "Declaro que no me encuentro inscrito en el Registro de Deudores Alimentarios Morosos (REDAM).",
  "Declaro que no estoy impedido o impedida de contratar con el Estado.",
  "Declaro que la documentación y la información presentada son verdaderas.",
];

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}
function field({
  id,
  label,
  value = "",
  type = "text",
  required = false,
  hint = "",
  disabled = false,
  autocomplete = "",
  inputmode = "",
}) {
  const describedBy = hint ? ` aria-describedby="${id}-hint"` : "";
  const extra = [
    required ? " required" : "",
    disabled ? " disabled" : "",
    autocomplete ? ` autocomplete="${autocomplete}"` : "",
    inputmode ? ` inputmode="${inputmode}"` : "",
    describedBy,
  ].join("");
  return `
    <div class="field">
      <label for="${id}">${label}${required ? ' <span class="required-mark" aria-hidden="true">*</span>' : ""}</label>
      <input id="${id}" name="${id}" type="${type}" value="${escapeHTML(value)}"${extra}>
      ${hint ? `<p class="field-hint" id="${id}-hint">${hint}</p>` : ""}
    </div>`;
}

const backTargets = {
  personal: "home", academic: "personal", complementary: "academic", experience: "complementary",
  declaration: "experience", confirmation: "declaration",
};

function backTarget() {
  if (state.screen === "record-detail") return state.recordFrom || "tracking";
  return backTargets[state.screen];
}

const screenTitles = {
  home: "SIRLOC", personal: "Datos personales", academic: "Formación académica",
  complementary: "Formación complementaria", experience: "Experiencia laboral",
  declaration: "Declaración jurada", confirmation: "Ficha de inscripción",
  tracking: "Consultar registro", "record-detail": "Ficha del registro", help: "Ayuda y contacto",
};

const topLevel = ["home", "tracking", "help"];
const bareScreens = ["splash", "login"];
const statusBarHTML = '<div class="statusbar" aria-hidden="true"><span>9:41</span><span class="sb-notch"></span><span>5G ▂▄▆ ▮</span></div>';
const keypadHTML = '<div class="keypad" id="keypad" hidden></div>';

function shell(content) {
  if (bareScreens.includes(state.screen)) {
    return `<div class="phone bare">${statusBarHTML}<div class="screen"><main id="main-content">${content}</main>${keypadHTML}</div><div class="home-bar" aria-hidden="true"></div></div>`;
  }
  const nav = [["home", "⌂", "Inicio"], ["personal", "＋", "Registrar"], ["tracking", "▣", "Consultar"]];
  const back = backTarget();
  const hasNav = topLevel.includes(state.screen);
  return `
    <div class="phone${hasNav ? " has-nav" : ""}">
      ${statusBarHTML}
      <div class="screen">
        <header class="app-bar">
          ${back
            ? `<button class="icon-btn" type="button" data-screen="${back}" aria-label="Volver a la pantalla anterior">←</button>`
            : `<button class="icon-btn" type="button" data-action="open-drawer" aria-label="Abrir menú" aria-haspopup="dialog" aria-expanded="false">☰</button>`}
          <h1 id="page-title" tabindex="-1">${screenTitles[state.screen] || "SIRLOC"}</h1>
        </header>
        <main id="main-content">${content}</main>
        ${keypadHTML}
        ${hasNav ? `<nav class="bottom-nav" aria-label="Navegación principal">
          ${nav.map(([screen, icon, label]) => `
            <a href="#${screen}" data-screen="${screen}"${screen === state.screen ? ' aria-current="page"' : ""}>
              <span class="nav-icon" aria-hidden="true">${icon}</span><span>${label}</span>
            </a>`).join("")}
        </nav>` : ""}
      </div>
      <div class="home-bar" aria-hidden="true"></div>
      <div class="drawer-layer">
        <div class="scrim" data-action="close-drawer"></div>
        <aside class="drawer" role="dialog" aria-modal="true" aria-label="Menú de la aplicación">
          <div class="drawer-head">
            <span class="brand-mark" aria-hidden="true">JNE</span>
            <div class="drawer-user"><strong>Ciudadano de ejemplo</strong><small>Modo demostración</small></div>
            <button class="icon-btn" type="button" data-action="close-drawer" aria-label="Cerrar menú">✕</button>
          </div>
          <ul class="drawer-list">
            <li><a class="drawer-item" href="#help" data-screen="help"><span class="di-icon" aria-hidden="true">?</span>Ayuda y contacto</a></li>
            <li><button class="drawer-item" type="button" data-action="about"><span class="di-icon" aria-hidden="true">i</span>Acerca de SIRLOC</button></li>
          </ul>
          <ul class="drawer-list drawer-danger">
            <li><button class="drawer-item danger" type="button" data-action="cancel-registration"${state.registrationStatus === "Vigente" ? "" : " disabled"}><span class="di-icon" aria-hidden="true">✕</span>Solicitar cancelación</button></li>
            <li><button class="drawer-item danger" type="button" data-action="logout"><span class="di-icon" aria-hidden="true">⎋</span>Cerrar sesión</button></li>
          </ul>
          <p class="drawer-version">SIRLOC móvil · prototipo v1.0</p>
        </aside>
      </div>
    </div>`;
}

function cta(label, { screen = "", action = "", disabled = false, submit = false } = {}) {
  const attrs = submit ? 'type="submit"' : `type="button" ${screen ? `data-screen="${screen}"` : `data-action="${action}"`}`;
  return `<div class="cta"><button class="button" ${attrs}${disabled ? " disabled" : ""}>${label}</button></div>`;
}

function homePage() {
  const active = state.registrationStatus === "Vigente";
  return shell(`
    <section class="hero" aria-labelledby="hero-title">
      <p class="hero-kicker">Bienvenido(a)</p>
      <h2 id="hero-title">Registro de locadores</h2>
      <p>Tu perfil para las convocatorias del Jurado Nacional de Elecciones.</p>
    </section>
    <section class="card" aria-labelledby="status-title">
      <h2 id="status-title">Tu inscripción</h2>
      <p><span class="status${active ? "" : " cancelled"}">${state.registrationStatus}</span> · REG-2026-0042</p>
      <p class="help-text">Última actualización: 15 de octubre de 2026.</p>
      <button class="button tonal" type="button" data-screen="record-detail">Ver ficha</button>
    </section>
    <p class="proto-note">Prototipo con datos simulados.</p>
    ${cta("Iniciar registro", { screen: "personal" })}`);
}

function helpPage() {
  return shell(`
    <section class="card"><h2>¿Necesitas ayuda?</h2><p>El equipo de soporte puede orientarte sobre el uso del sistema.</p></section>
    <section class="card"><h2>Horario de atención</h2><p>Lunes a viernes, de 8:30 a. m. a 5:30 p. m.</p></section>`);
}

function splashPage() {
  return shell(`
    <div class="splash">
      <span class="brand-mark xl" aria-hidden="true">JNE</span>
      <h1 id="page-title" tabindex="-1">SIRLOC</h1>
      <p>Registro de locadores</p>
      <div class="spinner" role="status" aria-label="Cargando"></div>
    </div>`);
}

function loginPage() {
  return shell(`
    <div class="login-hero">
      <span class="brand-mark xl" aria-hidden="true">JNE</span>
      <h1 id="page-title" tabindex="-1">SIRLOC</h1>
      <p>Registro de locadores</p>
    </div>
    <form id="login-form" class="login-form" novalidate>
      <h2>Iniciar sesión</h2>
      ${field({ id: "login-dni", label: "DNI", required: true, inputmode: "numeric", autocomplete: "username", hint: "8 dígitos. En la demostración usa 40374767." })}
      <div class="field">
        <label for="login-password">Contraseña <span class="required-mark" aria-hidden="true">*</span></label>
        <div class="pw-wrap">
          <input id="login-password" name="login-password" type="password" autocomplete="current-password" required aria-describedby="login-password-hint">
          <button class="pw-toggle" type="button" data-action="toggle-password" aria-pressed="false">Mostrar</button>
        </div>
        <p class="field-hint" id="login-password-hint">Mínimo 6 caracteres. En la demostración vale cualquiera.</p>
      </div>
      <p class="notice error" id="login-error" role="alert" hidden></p>
      <button class="link-btn" type="button" data-action="forgot-password">¿Olvidaste tu contraseña?</button>
      ${cta("Iniciar sesión", { submit: true })}
    </form>`);
}

function registrationHeader(step) {
  return `
    <nav aria-label="Progreso del registro">
      <ol class="steps">
        ${stepNames.map((name, index) => `<li class="step${index + 1 < step ? " done" : ""}"${index + 1 === step ? ' aria-current="step"' : ""}><span class="step-label">${name}</span></li>`).join("")}
      </ol>
    </nav>
    <p class="step-text">Paso ${step} de 5</p>`;
}

function registrationPage(content, step) {
  return shell(`${registrationHeader(step)}${content}`);
}

function personalPage() {
  const verified = state.verifiedDni.length === 8;
  const d = state.personal;
  return registrationPage(`
    <form id="personal-form">
      <div class="card">
        ${field({ id: "dni", label: "Número de DNI", value: state.verifiedDni, required: true, inputmode: "numeric", autocomplete: "off", hint: "8 dígitos. En la demostración usa 40374767." })}
        <p class="notice${verified ? " success" : ""}" id="dni-status" role="status" aria-live="polite">${verified ? "Datos de demostración cargados correctamente." : "Escribe el DNI de ejemplo para continuar."}</p>
      </div>
      <section id="found-data" aria-labelledby="found-title"${verified ? "" : " hidden"}>
        <h2 id="found-title">Tus datos</h2>
        <div class="card"><dl class="data-list">
          <dt>Nombres</dt><dd>${d.names}</dd>
          <dt>Apellidos</dt><dd>${d.paternal} ${d.maternal}</dd>
          <dt>Dirección</dt><dd>${d.address}</dd>
          <dt>Ubicación</dt><dd>${d.district}, ${d.province}, ${d.department}</dd>
        </dl></div>
        <div class="card">
          ${field({ id: "email", label: "Correo electrónico", value: verified ? d.email : "", type: "email", inputmode: "email", autocomplete: "email" })}
          ${field({ id: "phone", label: "Celular", value: verified ? d.phone : "", type: "tel", autocomplete: "tel" })}
        </div>
      </section>
      <section aria-labelledby="documents-title">
        <h2 id="documents-title">Documentos</h2>
        <div class="card">
          ${field({ id: "cv-file", label: "Currículum vitae (PDF)", type: "file" })}
          ${field({ id: "identity-file", label: "Documento de identidad (PDF)", type: "file" })}
        </div>
      </section>
      ${cta("Continuar", { submit: true, disabled: !verified })}
    </form>`, 1);
}

function table(headers, rows, caption, hasIndex = true) {
  return `
    <div class="table-wrap">
      <table>
        <caption>${caption}</caption>
        <thead><tr>${headers.map((header) => `<th scope="col">${header}</th>`).join("")}</tr></thead>
        <tbody>
          ${rows.map((row, rowIndex) => `
              <tr>
                <th scope="row" data-label="${headers[0]}">${rowIndex + 1}</th>
                ${row.map((cell, cellIndex) => `<td data-label="${headers[cellIndex + 1]}">${escapeHTML(cell)}</td>`).join("")}
              </tr>`).join("")}
        </tbody>
      </table>
    </div>`;
}

function sectionNavigation(active) {
  const sections = [["academic", "Nivel de estudio"], ["complementary", "Formación complementaria"]];
  return `<nav class="section-nav" aria-label="Secciones de formación">
    ${sections.map(([screen, label]) => `<a href="#${screen}" data-screen="${screen}"${screen === active ? ' aria-current="page"' : ""}>${label}</a>`).join("")}
  </nav>`;
}

function academicPage() {
  return registrationPage(`
    ${sectionNavigation("academic")}
    ${table(["N.º", "Nivel de estudio", "Carrera", "Institución", "Ciudad / país"], [state.study], "Estudios registrados")}
    <button class="button tonal" type="button" data-action="add-study">＋ Agregar estudio</button>
    <p class="help-text">El nivel mínimo de estudios depende de cada convocatoria.</p>
    ${cta("Continuar", { screen: "complementary" })}`, 2);
}

function complementaryPage() {
  return registrationPage(`
    ${sectionNavigation("complementary")}
    ${table(["N.º", "Tipo", "Nombre de la formación", "Institución", "Horas"], state.courses, "Formación complementaria registrada")}
    <button class="button tonal" type="button" data-action="add-course">＋ Agregar formación</button>
    ${cta("Continuar", { screen: "experience" })}`, 2);
}

function experiencePage() {
  return registrationPage(`
    ${table(["N.º", "Empresa o entidad", "Función o actividad", "Periodo"], state.experience, "Experiencia profesional registrada")}
    <button class="button tonal" type="button" data-action="add-experience">＋ Agregar experiencia</button>
    ${cta("Continuar", { screen: "declaration" })}`, 3);
}

function declarationPage() {
  const valid = state.verifiedDni.length === 8;
  const allAccepted = state.accepted.size === declarations.length;
  return registrationPage(`
    <form id="declaration-form">
      <div class="card">
        ${field({ id: "declaration-dni", label: "Número de DNI", value: state.verifiedDni, required: true, inputmode: "numeric", autocomplete: "off", hint: "8 dígitos." })}
        <p class="notice${valid ? " success" : ""}" id="eligibility-status" role="status" aria-live="polite">${valid ? "Validación simulada: puedes continuar." : "Ingresa tu DNI para validar tus requisitos."}</p>
      </div>
      <fieldset class="check-list">
        <legend>Declaro bajo juramento que:</legend>
        ${declarations.map((text, index) => `
          <label class="check-row" for="declaration-${index}">
            <input id="declaration-${index}" name="declarations" type="checkbox" value="${index}"${state.accepted.has(index) ? " checked" : ""}${valid ? "" : " disabled"}>
            <span>${text}</span>
          </label>`).join("")}
      </fieldset>
      ${cta("Revisar ficha", { submit: true, disabled: !(valid && allAccepted) })}
    </form>`, 4);
}

function confirmationPage() {
  const d = state.personal;
  return registrationPage(`
    <article class="document-preview" aria-labelledby="document-title">
      <header><p class="eyebrow">Jurado Nacional de Elecciones · SIRLOC</p><h2 id="document-title">Ficha de inscripción</h2></header>
      <section aria-labelledby="summary-personal"><h3 id="summary-personal">1. Datos personales</h3>
        <dl class="data-list"><dt>Documento</dt><dd>DNI ${state.verifiedDni}</dd><dt>Nombres</dt><dd>${d.names} ${d.paternal} ${d.maternal}</dd><dt>Correo</dt><dd>${d.email}</dd></dl>
      </section>
      <section aria-labelledby="summary-academic"><h3 id="summary-academic">2. Formación académica</h3><p>${state.study[0]} · ${state.study[1]}</p></section>
      <section aria-labelledby="summary-experience"><h3 id="summary-experience">3. Experiencia laboral</h3><p>${state.experience.length} registros de demostración.</p></section>
      <section aria-labelledby="summary-declaration"><h3 id="summary-declaration">4. Declaración jurada</h3><p>Declaraciones aceptadas.</p></section>
    </article>
    <button class="button tonal" type="button" data-action="print">Imprimir o guardar como PDF</button>
    ${cta("Finalizar registro", { action: "complete-registration" })}`, 5);
}

function trackingPage() {
  const result = state.trackingSearched
    ? `<section class="card result-card" aria-labelledby="record-result-title">
        <h2 id="record-result-title" tabindex="-1">Resultado</h2>
        <dl class="data-list">
          <dt>Registro</dt><dd>REG-2026-0042</dd>
          <dt>Titular</dt><dd>Ciudadano de demostración</dd>
          <dt>Estado</dt><dd><span class="status${state.registrationStatus === "Vigente" ? "" : " cancelled"}">${state.registrationStatus}</span></dd>
          <dt>Actualizado</dt><dd>15 de octubre de 2026</dd>
        </dl>
        <button class="button tonal" type="button" data-screen="record-detail">Ver ficha del registro</button>
      </section>`
    : "";
  return shell(`
    <form id="tracking-form">
      <div class="card">${field({ id: "tracking-dni", label: "Número de DNI", value: state.verifiedDni, required: true, inputmode: "numeric", autocomplete: "off", hint: "8 dígitos. La búsqueda es simulada." })}</div>
      ${result}
      ${cta("Consultar registro", { submit: true })}
    </form>`);
}

function recordDetailPage() {
  return shell(`
    <article class="document-preview" aria-labelledby="detail-document-title">
      <header><p class="eyebrow">Jurado Nacional de Elecciones · SIRLOC</p><h2 id="detail-document-title">Ficha del registro REG-2026-0042</h2></header>
      <section><h3>Titular</h3><p>Ciudadano de demostración</p><p>Estado: <span class="status${state.registrationStatus === "Vigente" ? "" : " cancelled"}">${state.registrationStatus}</span></p></section>
      <section><h3>Información profesional</h3><p>Formación y experiencia registradas para fines de demostración.</p></section>
    </article>
    ${cta("Imprimir o guardar como PDF", { action: "print" })}`);
}

function render({ focus = true } = {}) {
  const pages = {
    home: homePage,
    personal: personalPage,
    academic: academicPage,
    complementary: complementaryPage,
    experience: experiencePage,
    declaration: declarationPage,
    confirmation: confirmationPage,
    tracking: trackingPage,
    help: helpPage,
    splash: splashPage,
    login: loginPage,
    "record-detail": recordDetailPage,
  };
  app.innerHTML = (pages[state.screen] || homePage)();
  kb.input = null;
  kb.host = null;
  if (focus) {
    const heading = app.querySelector("#page-title");
    heading?.focus();
  }
}

function navigate(screen) {
  state.screen = screen;
  render();
  window.scrollTo({ top: 0, behavior: "auto" });
}

function showToast(message, undo) {
  let toast = document.querySelector("#toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.append(toast);
  }
  toast.replaceChildren();
  const text = document.createElement("span");
  text.textContent = message;
  toast.append(text);
  toast.setAttribute("aria-hidden", undo ? "false" : "true");
  if (undo) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "toast-undo";
    button.textContent = undo.label;
    button.addEventListener("click", () => {
      toast.hidden = true;
      undo.run();
    });
    toast.append(button);
  }
  toast.hidden = false;
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => { toast.hidden = true; }, undo ? 7000 : 3500);
}

function notify(message, undo) {
  announcer.textContent = "";
  window.setTimeout(() => {
    announcer.textContent = message;
  }, 20);
  showToast(message, undo);
}

function openDrawer() {
  const phone = document.querySelector(".phone");
  if (!phone) return;
  phone.classList.add("drawer-open");
  phone.querySelector(".screen")?.setAttribute("inert", "");
  phone.querySelector('[data-action="open-drawer"]')?.setAttribute("aria-expanded", "true");
  phone.querySelector('.drawer [data-action="close-drawer"]')?.focus();
}

function closeDrawer(restoreFocus) {
  const phone = document.querySelector(".phone");
  if (!phone || !phone.classList.contains("drawer-open")) return;
  phone.classList.remove("drawer-open");
  phone.querySelector(".screen")?.removeAttribute("inert");
  const opener = phone.querySelector('[data-action="open-drawer"]');
  opener?.setAttribute("aria-expanded", "false");
  if (restoreFocus) opener?.focus();
}

function openAboutDialog() {
  dialog.innerHTML = `
    <div class="dialog-content">
      <h2 id="dialog-title">Acerca de SIRLOC</h2>
      <p>Prototipo móvil del Sistema Integrado de Registro de Locadores. Los datos son de demostración y no se envían a servicios externos.</p>
      <div class="dialog-actions"><button class="button" type="button" data-action="close-dialog">Entendido</button></div>
    </div>`;
  dialog.showModal();
}

function showDialog(title, body, onSubmit) {
  dialog.innerHTML = `
    <form class="dialog-content" method="dialog" id="dialog-form">
      <h2 id="dialog-title">${title}</h2>
      ${body}
      <div class="dialog-actions">
        <button class="button secondary" type="button" data-action="close-dialog">Cancelar</button>
        <button class="button" type="submit">Guardar</button>
      </div>
    </form>`;
  dialog.showModal();
  const dialogForm = dialog.querySelector("#dialog-form");
  const save = () => {
    if (!dialogForm.reportValidity()) return;
    onSubmit(new FormData(dialogForm));
    dialog.close();
    render();
    notify("El registro de demostración se agregó correctamente.");
  };
  dialogForm.addEventListener("submit", (event) => {
    event.preventDefault();
    save();
  });
  dialogForm.querySelector('[type="submit"]').addEventListener("click", (event) => {
    event.preventDefault();
    save();
  });
}

function openCancelDialog() {
  dialog.innerHTML = `
    <div class="dialog-content">
      <h2 id="dialog-title">¿Anular la inscripción?</h2>
      <p>Esta acción cambiará el estado del registro de demostración a “Anulada”. La información seguirá disponible para consulta.</p>
      <div class="dialog-actions">
        <button class="button tonal" type="button" data-action="close-dialog">Volver</button>
        <button class="button danger" type="button" data-action="confirm-cancel">Sí, anular inscripción</button>
      </div>
    </div>`;
  dialog.showModal();
  dialog.querySelector('[data-action="close-dialog"]').focus();
}

function openLogoutDialog() {
  dialog.innerHTML = `
    <div class="dialog-content">
      <h2 id="dialog-title">¿Cerrar sesión?</h2>
      <p>Tendrás que ingresar de nuevo con tu DNI y contraseña.</p>
      <div class="dialog-actions">
        <button class="button tonal" type="button" data-action="close-dialog">Cancelar</button>
        <button class="button danger" type="button" data-action="confirm-logout">Sí, cerrar sesión</button>
      </div>
    </div>`;
  dialog.showModal();
  dialog.querySelector('[data-action="close-dialog"]').focus();
}

function openForgotDialog() {
  dialog.innerHTML = `
    <div class="dialog-content">
      <h2 id="dialog-title">¿Olvidaste tu contraseña?</h2>
      <p>En esta demostración no se envían correos. Usa el DNI 40374767 y cualquier contraseña de 6 o más caracteres.</p>
      <div class="dialog-actions"><button class="button" type="button" data-action="close-dialog">Entendido</button></div>
    </div>`;
  dialog.showModal();
}

function openAddDialog(kind) {
  if (kind === "study") {
    showDialog("Agregar nivel de estudio", `
      ${field({ id: "study-level", label: "Nivel de estudio", required: true })}
      ${field({ id: "study-career", label: "Carrera profesional", required: true })}
      ${field({ id: "study-institution", label: "Institución", required: true })}`, (form) => {
      state.study = [
        form.get("study-level"),
        form.get("study-career"),
        form.get("study-institution"),
        "Ciudad de demostración",
      ];
    });
    return;
  }

  if (kind === "course") {
    showDialog("Agregar formación complementaria", `
      ${field({ id: "course-type", label: "Tipo de formación", required: true })}
      ${field({ id: "course-name", label: "Nombre de la formación", required: true })}
      ${field({ id: "course-institution", label: "Institución", required: true })}
      ${field({ id: "course-hours", label: "Total de horas", type: "number", required: true })}`, (form) => {
      state.courses.push([
        form.get("course-type"),
        form.get("course-name"),
        form.get("course-institution"),
        form.get("course-hours"),
      ]);
    });
    return;
  }

  showDialog("Agregar experiencia laboral", `
    ${field({ id: "experience-company", label: "Empresa o entidad", required: true })}
    ${field({ id: "experience-role", label: "Función o actividad", required: true })}
    ${field({ id: "experience-period", label: "Periodo (inicio - fin)", required: true })}`, (form) => {
    state.experience.push([
      form.get("experience-company"),
      form.get("experience-role"),
      form.get("experience-period"),
    ]);
  });
}

const kb = { input: null, host: null, mode: "", layer: "letters", shift: false, email: false };

const letterRows = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l", "ñ"],
  ["z", "x", "c", "v", "b", "n", "m"],
];
const symbolRows = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  ["-", "/", ":", ";", "(", ")", "%", "&", "@", "+"],
  [".", ",", "?", "!", "'", "_", "#"],
];

function kbMode(el) {
  if (!(el instanceof HTMLInputElement)) return "";
  if (["file", "checkbox", "radio", "button", "submit", "range", "color"].includes(el.type)) return "";
  if (el.inputMode === "numeric" || el.type === "tel" || el.type === "number") return "numeric";
  return "text";
}

function keyButton(key, label, cls = "", aria = "") {
  return `<button class="key${cls ? ` ${cls}` : ""}" type="button" data-key="${key}"${aria ? ` aria-label="${aria}"` : ""}>${label}</button>`;
}

function keyboardHTML() {
  const del = keyButton("del", "⌫", "fn", "Borrar un carácter");
  if (kb.mode === "numeric") {
    const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
    return [0, 3, 6].map((i) => `<div class="kb-row">${digits.slice(i, i + 3).map((n) => keyButton(n, n)).join("")}</div>`).join("")
      + `<div class="kb-row">${keyButton("done", "Listo", "done")}${keyButton("0", "0")}${del}</div>`;
  }
  const letters = kb.layer === "letters";
  const show = (k) => (letters && kb.shift ? k.toUpperCase() : k);
  const row = (keys) => `<div class="kb-row">${keys.map((k) => keyButton(k, show(k))).join("")}</div>`;
  const rows = letters ? letterRows : symbolRows;
  const third = letters
    ? `<div class="kb-row">${keyButton("shift", "⇧", `fn${kb.shift ? " on" : ""}`, "Mayúsculas")}${rows[2].map((k) => keyButton(k, show(k))).join("")}${del}</div>`
    : `<div class="kb-row">${rows[2].map((k) => keyButton(k, k)).join("")}${del}</div>`;
  const bottom = letters
    ? `<div class="kb-row">${keyButton("layer", "?123", "fn", "Números y símbolos")}${kb.email ? keyButton("@", "@") : keyButton(",", ",")}${keyButton("space", "espacio", "wide", "Espacio")}${keyButton(".", ".")}${keyButton("done", "Listo", "done")}</div>`
    : `<div class="kb-row">${keyButton("layer", "ABC", "fn", "Letras")}${keyButton("space", "espacio", "wide", "Espacio")}${keyButton("done", "Listo", "done")}</div>`;
  return row(rows[0]) + row(rows[1]) + third + bottom;
}

function renderKeyboard() {
  if (!kb.host) return;
  kb.host.dataset.mode = kb.mode;
  kb.host.setAttribute("role", "group");
  kb.host.setAttribute("aria-label", kb.mode === "numeric" ? "Teclado numérico simulado" : "Teclado simulado");
  kb.host.innerHTML = keyboardHTML();
  const phone = document.querySelector(".phone");
  if (phone && !kb.host.closest("dialog")) phone.style.setProperty("--kb-h", `${kb.host.offsetHeight}px`);
}

function openKeyboard(input) {
  const mode = kbMode(input);
  if (!mode || !window.matchMedia("(pointer: fine)").matches) {
    closeKeyboard();
    return;
  }
  const dlg = input.closest("dialog");
  let host;
  if (dlg) {
    host = dlg.querySelector(".keypad");
    if (!host) {
      host = document.createElement("div");
      host.className = "keypad in-dialog";
      host.hidden = true;
      dlg.append(host);
    }
  } else {
    host = document.querySelector("#keypad");
  }
  if (!host) return;
  if (kb.host && kb.host !== host) kb.host.hidden = true;
  if (kb.input !== input) {
    kb.layer = "letters";
    kb.shift = false;
  }
  kb.input = input;
  kb.host = host;
  kb.mode = mode;
  kb.email = input.type === "email" || input.inputMode === "email";
  host.hidden = false;
  if (!dlg) document.querySelector(".phone")?.classList.add("kb-open");
  renderKeyboard();
  window.requestAnimationFrame(() => input.scrollIntoView({ block: "center", behavior: "smooth" }));
}

function closeKeyboard() {
  if (kb.host) kb.host.hidden = true;
  document.querySelector(".phone")?.classList.remove("kb-open");
  kb.input = null;
  kb.host = null;
}

function pressKey(key) {
  if (key === "done") {
    closeKeyboard();
    return;
  }
  if (key === "layer") {
    kb.layer = kb.layer === "letters" ? "symbols" : "letters";
    renderKeyboard();
    return;
  }
  if (key === "shift") {
    kb.shift = !kb.shift;
    renderKeyboard();
    return;
  }
  const input = kb.input;
  if (!input) return;
  let char = key === "space" ? " " : key;
  if (kb.shift && kb.layer === "letters" && /^[a-zñ]$/.test(char)) {
    char = char.toUpperCase();
    kb.shift = false;
    renderKeyboard();
  }
  input.value = key === "del" ? input.value.slice(0, -1) : input.value + char;
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

document.addEventListener("mousedown", (event) => {
  if (event.target instanceof Element && event.target.closest("[data-key]")) event.preventDefault();
});

document.addEventListener("focusin", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement) || target.closest(".keypad")) return;
  if (target instanceof HTMLInputElement || target instanceof HTMLSelectElement) openKeyboard(target);
});

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const keyEl = target.closest("[data-key]");
  if (keyEl) {
    pressKey(keyEl.dataset.key);
    return;
  }
  if (target instanceof HTMLInputElement) openKeyboard(target);
});

dialog.addEventListener("close", closeKeyboard);

app.addEventListener("click", (event) => {
  const submitter = event.target instanceof Element ? event.target.closest('button[type="submit"]') : null;
  if (submitter && !submitter.disabled && submitter.form && app.contains(submitter)) {
    event.preventDefault();
    handleForm(submitter.form);
    return;
  }
  const target = event.target instanceof Element ? event.target.closest("[data-screen], [data-action]") : null;
  if (!target || target.matches(":disabled")) return;
  if (target.dataset.screen) {
    event.preventDefault();
    if (target.dataset.screen === "record-detail") state.recordFrom = state.screen;
    navigate(target.dataset.screen);
    return;
  }

  const { action } = target.dataset;
  if (action === "open-drawer") openDrawer();
  if (action === "close-drawer") closeDrawer(true);
  if (action === "about") {
    closeDrawer(false);
    openAboutDialog();
  }
  if (action === "logout") {
    closeDrawer(false);
    openLogoutDialog();
  }
  if (action === "forgot-password") openForgotDialog();
  if (action === "toggle-password") {
    const input = document.querySelector("#login-password");
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    target.textContent = show ? "Ocultar" : "Mostrar";
    target.setAttribute("aria-pressed", String(show));
  }
  if (action === "cancel-registration") {
    closeDrawer(false);
    openCancelDialog();
  }
  if (action === "complete-registration") {
    target.disabled = true;
    target.textContent = "Procesando…";
    window.setTimeout(() => {
      navigate("home");
      notify("✓ Registro completado (demostración).");
    }, 900);
  }
  if (action === "add-study") openAddDialog("study");
  if (action === "add-course") openAddDialog("course");
  if (action === "add-experience") openAddDialog("experience");
  if (action === "print") window.print();
});

app.addEventListener("input", (event) => {
  const input = event.target;
  if (!(input instanceof HTMLInputElement)) return;
  if (dniIds.includes(input.id)) {
    input.value = input.value.replace(/\D/g, "").slice(0, 8);
  }
  if (input.id === "dni") {
    const status = document.querySelector("#dni-status");
    const verified = input.value === validDemoDni;
    state.verifiedDni = verified ? input.value : "";
    if (status) {
      status.classList.toggle("success", verified);
      status.textContent = verified
        ? "Datos de demostración cargados correctamente."
        : input.value.length === 8
          ? "El DNI no coincide con el registro de demostración."
          : "Escribe el DNI de ejemplo para continuar.";
    }
    app.querySelector("#personal-form [type='submit']").disabled = !verified;
    const found = document.querySelector("#found-data");
    if (found) found.hidden = !verified;
    const personalFields = {
      names: "names",
      "paternal-name": "paternal",
      "maternal-name": "maternal",
      email: "email",
      phone: "phone",
      address: "address",
      department: "department",
      province: "province",
      district: "district",
    };
    for (const [id, key] of Object.entries(personalFields)) {
      const fieldInput = document.getElementById(id);
      if (fieldInput) fieldInput.value = verified ? state.personal[key] : "";
    }
  }
  if (input.id === "declaration-dni") {
    const valid = input.value === validDemoDni;
    const status = document.querySelector("#eligibility-status");
    if (status) {
      status.classList.toggle("success", valid);
      status.textContent = valid
        ? "Validación simulada: puedes continuar."
        : "Ingresa tu DNI para validar tus requisitos.";
    }
    const fieldset = app.querySelector("#declaration-form fieldset");
    if (fieldset) {
      for (const checkbox of fieldset.querySelectorAll("input")) checkbox.disabled = !valid;
    }
    const submit = app.querySelector("#declaration-form [type='submit']");
    if (submit) submit.disabled = !valid || state.accepted.size !== declarations.length;
  }
});

app.addEventListener("change", (event) => {
  const input = event.target;
  if (!(input instanceof HTMLInputElement)) return;
  if (input.name === "declarations") {
    const index = Number(input.value);
    if (input.checked) state.accepted.add(index);
    else state.accepted.delete(index);
    const submit = app.querySelector("#declaration-form [type='submit']");
    if (submit) submit.disabled = state.accepted.size !== declarations.length || state.verifiedDni.length !== 8;
  }
});

function handleForm(form) {
  if (!(form instanceof HTMLFormElement)) return;

  if (form.id === "login-form") {
    const dniInput = form.querySelector("#login-dni");
    const passwordInput = form.querySelector("#login-password");
    const message = form.querySelector("#login-error");
    let error = "";
    let focusTarget = null;
    if (dniInput.value !== validDemoDni) {
      error = dniInput.value.length === 8 ? "El DNI no coincide con el de demostración (40374767)." : "Escribe tu DNI de 8 dígitos.";
      focusTarget = dniInput;
    } else if (passwordInput.value.length < 6) {
      error = "La contraseña debe tener al menos 6 caracteres.";
      focusTarget = passwordInput;
    }
    if (error) {
      message.textContent = error;
      message.hidden = false;
      focusTarget.focus();
      return;
    }
    message.hidden = true;
    const submit = form.querySelector('[type="submit"]');
    submit.disabled = true;
    submit.textContent = "Ingresando…";
    window.setTimeout(() => {
      navigate("home");
      notify("Bienvenido(a), Ciudadano de ejemplo.");
    }, 900);
    return;
  }

  if (form.id === "personal-form") {
    const dni = form.elements.namedItem("dni").value;
    if (dni !== validDemoDni) {
      notify("Ingresa el DNI de demostración válido para continuar.");
      return;
    }
    state.verifiedDni = dni;
    navigate("academic");
  }

  if (form.id === "declaration-form") {
    const dni = form.elements.namedItem("declaration-dni").value;
    if (dni !== validDemoDni || state.accepted.size !== declarations.length) {
      notify("Completa la validación y acepta todas las declaraciones para continuar.");
      return;
    }
    state.verifiedDni = dni;
    navigate("confirmation");
  }

  if (form.id === "tracking-form") {
    const dni = form.elements.namedItem("tracking-dni").value;
    if (dni.length !== 8) {
      form.elements.namedItem("tracking-dni").focus();
      return;
    }
    state.verifiedDni = dni;
    state.trackingSearched = true;
    render();
    document.querySelector("#record-result-title")?.focus();
    notify("Consulta simulada completada.");
  }
}

app.addEventListener("submit", (event) => {
  event.preventDefault();
  handleForm(event.target);
});

app.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" || !(event.target instanceof HTMLInputElement)) return;
  const form = event.target.form;
  if (form && form.id) {
    event.preventDefault();
    handleForm(form);
  }
});

dialog.addEventListener("click", (event) => {
  const action = event.target instanceof Element ? event.target.closest("[data-action]")?.dataset.action : undefined;
  if (action === "close-dialog") dialog.close();
  if (action === "confirm-logout") {
    dialog.close();
    navigate("login");
    notify("Cerraste tu sesión.");
  }
  if (action === "confirm-cancel") {
    state.registrationStatus = "Anulada";
    dialog.close();
    render();
    notify("Inscripción anulada.", {
      label: "Deshacer",
      run() {
        state.registrationStatus = "Vigente";
        render({ focus: false });
        notify("Se deshizo la anulación.");
      },
    });
  }
  if (event.target === dialog) dialog.close();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeDrawer(true);
});

document.addEventListener("click", (event) => {
  if (event.target instanceof Element && event.target.closest("button, a[href], .check-row") && navigator.vibrate) navigator.vibrate(12);
});

render({ focus: false });
window.setTimeout(() => {
  if (state.screen === "splash") navigate("login");
}, 900);
