const storage = {
  sessionToken: "polla-mundialista-2026-session-token",
  role: "polla-mundialista-2026-role",
  language: "polla-mundialista-2026-language",
};

const i18n = {
  es: {
    appTitle: "Polla Mundialista 2026",
    tagline: "Predicciones familiares del Mundial, pagos claros y premios transparentes.",
    login: "Iniciar sesión",
    signup: "Registrarse",
    logout: "Cerrar sesión",
    adminLogin: "Administrador",
    adminPin: "PIN de administrador",
    name: "Nombre",
    phone: "Teléfono",
    loginId: "Nombre y telefono",
    editPrediction: "Editar predicción",
    save: "Guardar",
    authHelp: "Usa tu nombre y telefono para entrar. Si tus datos no coinciden, contacta al administrador.",
    enter: "Entrar",
    language: "Idioma",
    participants: "Participantes",
    predictions: "Predicciones",
    score: "Marcador",
    upcomingMatches: "Próximos partidos",
    next3: "Próximos 4 partidos",
    noUpcomingMatches: "No hay próximos partidos disponibles.",
    matches: "Partidos",
    results: "Resultados",
    standings: "Tabla de posiciones",
    prizes: "Premios",
    settings: "Configuración",
    summary: "Resumen",
    winners: "Ganadores",
    admin: "Administrador",
    myAccount: "Mi cuenta",
    myPredictions: "Mis predicciones",
    predictionClosed: "Predicción cerrada",
    predictionAvailable: "Predicción disponible",
    addEdit: "Agregar / editar",
    viewPredictions: "Ver predicciones",
    savePrediction: "Guardar predicción",
    homeScore: "Goles local",
    awayScore: "Goles visitante",
    payment: "Pago",
    paid: "Pagado",
    unpaid: "No pagado",
    pendingVerification: "Pendiente de verificación",
    verifiedByAdmin: "Verificado por admin",
    currency: "Moneda",
    method: "Método",
    comment: "Comentario",
    paymentComment: "Comentario de pago",
    entryCurrency: "Moneda de participacion",
    chooseCurrency: "Elegir moneda",
    manualPaymentNotice: "Los pagos son manuales y deben ser confirmados por el administrador.",
    usdEstimate: "Valor estimado de 1 USD",
    exchangeRate: "Tasa USD/COP",
    syncExchangeRate: "Actualizar tasa",
    actualCopReceived: "COP recibidos",
    rateLocked: "Tasa bloqueada",
    filters: "Filtros",
    allMatches: "Todos los partidos",
    allUsers: "Todos los usuarios",
    allPayments: "Todos los pagos",
    allLocks: "Abiertos y cerrados",
    allResults: "Todos los resultados",
    emergencyCorrection: "Correccion de emergencia",
    correctionReason: "Motivo de la correccion",
    correctionLocked: "Correccion bloqueada",
    useMatchCard: "Usa la tarjeta del partido",
    notes: "Notas",
    markVerified: "Verificar",
    markPending: "Marcar pendiente",
    reject: "Rechazar",
    basePot: "Pozo base",
    usdExcess: "Exceso por tasa de cambio USD",
    mostCorrectPrize: "Premio por más predicciones acertadas",
    totalCollected: "Total recaudado",
    totalPending: "Total pendiente",
    totalVerified: "Total verificado",
    submitted: "Enviadas",
    missing: "Faltantes",
    currentLeader: "Líder actual",
    lastWinner: "Último ganador",
    predictionTime: "Hora de predicción",
    points: "Puntos",
    status: "Estado",
    action: "Accion",
    locked: "Cerrado",
    open: "Abierto",
    syncStatus: "Estado de sincronizacion",
    pendingSync: "Sincronizacion pendiente",
    apiVerification: "Verificacion API",
    keysConfigured: "Llaves configuradas",
    fixturesPulled: "Partidos sincronizados",
    upcomingFixtures: "Partidos proximos",
    completedFixtures: "Partidos completados",
    competition: "Competicion",
    season: "Temporada",
    warnings: "Alertas",
    users: "Usuarios",
    duplicates: "Duplicados",
    updatePayment: "Actualizar pago",
    allPredictions: "Todas las predicciones",
    syncResult: "Sincronizar resultado API",
    syncRealMatches: "Sincronizar partidos reales",
    apiProvider: "Proveedor API",
    source: "Fuente",
    lastSync: "Última sincronización",
    whatsapp: "WhatsApp",
    copyWhatsapp: "Copiar mensaje para WhatsApp",
    openWhatsapp: "Abrir WhatsApp",
    inviteMessage: "Mensaje de invitación",
    winnerMessage: "Mensaje de ganador",
    rules: "Reglas",
    rulesBody: "Cada entrada verificada aporta 2,000 COP al pozo base. Si alguien paga 1 USD y se reciben más de 2,000 COP, el exceso va a un premio separado para quien tenga más marcadores exactos al final del Mundial.",
    rulesPage: "Reglas completas",
    matchDay: "Dia de partido",
    auditLog: "Auditoria",
    exports: "Exportaciones",
    payouts: "Premios por pagar",
    exportBackup: "Exportar respaldo",
    exportUsers: "Exportar usuarios",
    exportPredictions: "Exportar predicciones",
    exportPayments: "Exportar pagos",
    exportStandings: "Exportar tabla de posiciones",
    payoutNotice: "Los pagos de premios son manuales. La app calcula los montos, pero el administrador realiza el pago.",
    approve: "Aprobar",
    markPaidPayout: "Marcar pagado",
    invalidRate: "Tasa invalida rechazada",
    rateUnavailable: "La tasa USD/COP no esta disponible. El administrador confirmara el valor recibido.",
    exchangeBonus: "Bono por tasa de cambio",
    actualUsdCop: "COP reales recibidos de USD",
    missingPredictions: "Faltan predicciones",
    unpaidUsers: "Usuarios sin pago verificado",
    storageMode: "Almacenamiento",
    jsonStorageWarning: "Advertencia: el almacenamiento local JSON no es recomendado para producción.",
    loginRequired: "Debes iniciar sesión para predecir.",
    adminOnly: "Los controles de administrador están ocultos para usuarios regulares.",
    noPredictions: "Aún no hay predicciones.",
    copied: "Mensaje copiado.",
  },
  en: {
    appTitle: "Polla Mundialista 2026",
    tagline: "Family World Cup predictions with clear payments and transparent prizes.",
    login: "Login",
    signup: "Sign up",
    logout: "Logout",
    adminLogin: "Admin",
    adminPin: "Admin PIN",
    name: "Name",
    phone: "Phone",
    loginId: "Name and phone",
    editPrediction: "Edit prediction",
    save: "Save",
    authHelp: "Use your name and phone to enter. If the details do not match, contact the admin.",
    enter: "Enter",
    language: "Language",
    participants: "Participants",
    predictions: "Predictions",
    score: "Score",
    upcomingMatches: "Upcoming matches",
    next3: "Next 4 matches",
    noUpcomingMatches: "No upcoming matches available.",
    matches: "Matches",
    results: "Results",
    standings: "Standings",
    prizes: "Prizes",
    settings: "Settings",
    summary: "Summary",
    winners: "Winners",
    admin: "Admin",
    myAccount: "My account",
    myPredictions: "My predictions",
    predictionClosed: "Prediction closed",
    predictionAvailable: "Prediction available",
    addEdit: "Add / edit",
    viewPredictions: "View predictions",
    savePrediction: "Save prediction",
    homeScore: "Home goals",
    awayScore: "Away goals",
    payment: "Payment",
    paid: "Paid",
    unpaid: "Unpaid",
    pendingVerification: "Pending verification",
    verifiedByAdmin: "Verified by admin",
    currency: "Currency",
    method: "Method",
    comment: "Comment",
    paymentComment: "Payment comment",
    entryCurrency: "Entry currency",
    chooseCurrency: "Choose currency",
    manualPaymentNotice: "Payments are manual and must be confirmed by the admin.",
    usdEstimate: "Estimated value of 1 USD",
    exchangeRate: "USD/COP rate",
    syncExchangeRate: "Update rate",
    actualCopReceived: "COP received",
    rateLocked: "Rate locked",
    filters: "Filters",
    allMatches: "All matches",
    allUsers: "All users",
    allPayments: "All payments",
    allLocks: "Open and closed",
    allResults: "All results",
    emergencyCorrection: "Emergency correction",
    correctionReason: "Correction reason",
    correctionLocked: "Correction locked",
    useMatchCard: "Use the match card",
    notes: "Notes",
    markVerified: "Verify",
    markPending: "Mark pending",
    reject: "Reject",
    basePot: "Base pot",
    usdExcess: "USD exchange rate excess",
    mostCorrectPrize: "Most correct predictions prize",
    totalCollected: "Total collected",
    totalPending: "Total pending",
    totalVerified: "Total verified",
    submitted: "Submitted",
    missing: "Missing",
    currentLeader: "Current leader",
    lastWinner: "Last winner",
    predictionTime: "Prediction time",
    points: "Points",
    status: "Status",
    action: "Action",
    locked: "Closed",
    open: "Open",
    syncStatus: "Sync status",
    pendingSync: "Pending sync",
    apiVerification: "API Verification",
    keysConfigured: "Keys configured",
    fixturesPulled: "Fixtures pulled",
    upcomingFixtures: "Upcoming fixtures",
    completedFixtures: "Completed fixtures",
    competition: "Competition",
    season: "Season",
    warnings: "Warnings",
    users: "Users",
    duplicates: "Duplicates",
    updatePayment: "Update payment",
    allPredictions: "All predictions",
    syncResult: "Sync API result",
    syncRealMatches: "Sync real matches",
    apiProvider: "API provider",
    source: "Source",
    lastSync: "Last sync",
    whatsapp: "WhatsApp",
    copyWhatsapp: "Copy WhatsApp message",
    openWhatsapp: "Open WhatsApp",
    inviteMessage: "Invite message",
    winnerMessage: "Winner message",
    rules: "Rules",
    rulesBody: "Each verified entry contributes 2,000 COP to the base pot. If someone pays 1 USD and more than 2,000 COP is received, the excess goes to a separate end-of-World-Cup prize for the person with the most exact scores.",
    rulesPage: "Full rules",
    matchDay: "Match day",
    auditLog: "Audit log",
    exports: "Exports",
    payouts: "Payouts",
    exportBackup: "Export backup",
    exportUsers: "Export users",
    exportPredictions: "Export predictions",
    exportPayments: "Export payments",
    exportStandings: "Export standings",
    payoutNotice: "Prize payouts are manual. The app calculates amounts, but the admin sends the payment.",
    approve: "Approve",
    markPaidPayout: "Mark paid",
    invalidRate: "Invalid rate rejected",
    rateUnavailable: "USD/COP rate is unavailable. The admin will confirm the received value.",
    exchangeBonus: "Exchange-rate bonus",
    actualUsdCop: "Actual COP received from USD",
    missingPredictions: "Missing predictions",
    unpaidUsers: "Users without verified payment",
    storageMode: "Storage",
    jsonStorageWarning: "Warning: local JSON storage is not recommended for production.",
    loginRequired: "You must log in to predict.",
    adminOnly: "Admin controls are hidden from regular users.",
    noPredictions: "No predictions yet.",
    copied: "Message copied.",
  },
};

let lang = localStorage.getItem(storage.language) || "es";
let state = null;
let selectedMatchId = null;
let selectedMessage = "";
let adminPredictionFilters = { matchId: "", userId: "", paymentStatus: "", lockStatus: "", resultStatus: "" };
let activeUserTab = "home";
let activeAdminTab = "matchday";

const app = document.getElementById("app");
const t = (key) => i18n[lang][key] || i18n.en[key] || key;
const money = (value) => `${Number(value || 0).toLocaleString(lang === "es" ? "es-CO" : "en-US")} COP`;
const fmtDate = (value) =>
  new Date(value).toLocaleString(lang === "es" ? "es-CO" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

function headers() {
  const sessionToken = localStorage.getItem(storage.sessionToken);
  return sessionToken
    ? { "Content-Type": "application/json", Authorization: `Bearer ${sessionToken}` }
    : { "Content-Type": "application/json" };
}

function safeJsonParse(text, fallback = null) {
  try {
    const source = String(text ?? "");
    if (!source.trim()) return { ok: false, value: fallback, error: new Error("Empty JSON response") };
    return { ok: true, value: JSON.parse(source), error: null };
  } catch (error) {
    return { ok: false, value: fallback, error };
  }
}

async function api(path, options = {}) {
  const response = await fetch(path, { headers: headers(), ...options });
  const text = await response.text();
  const parsed = safeJsonParse(text, { ok: false, error: "Invalid server response", message: text || "No response body" });
  const payload = parsed.value;
  if (!response.ok || payload?.ok === false) {
    const message = payload?.message || payload?.error || response.statusText || "Request failed";
    throw Object.assign(new Error(message), { payload, status: response.status });
  }
  if (!parsed.ok) throw new Error("Invalid server response");
  return payload;
}

async function loadState() {
  try {
    state = await api("/api/state");
    selectedMatchId ||= state.nextMatches[0]?.id || state.matches[0]?.id;
    render();
  } catch (error) {
    renderAppError(error);
  }
}

function currentUser() {
  return state?.currentUser || null;
}

function isAdmin() {
  return currentUser()?.role === "ADMIN" || localStorage.getItem(storage.role) === "ADMIN";
}

function selectedMatch() {
  return state.matches.find((match) => match.id === selectedMatchId) || state.nextMatches[0] || state.matches[0];
}

function lockInfo(match) {
  const lockAt = new Date(new Date(match.kickoffAt).getTime() - 15 * 60 * 1000);
  return {
    locked: new Date() >= lockAt,
    lockAt,
  };
}

function predictionFor(matchId, userId = currentUser()?.id) {
  return state.predictions.find((prediction) => prediction.matchId === matchId && prediction.userId === userId);
}

function paymentForPrediction(predictionId) {
  return state.payments.find((payment) => payment.predictionId === predictionId);
}

function canEditPredictionRow(prediction) {
  const user = currentUser();
  if (!user || user.role !== "USER") return false;
  if (prediction.userId !== user.id) return false;
  const match = state.matches.find((item) => item.id === prediction.matchId);
  return match ? !lockInfo(match).locked : false;
}

function renderAppError(error) {
  document.documentElement.lang = lang;
  const payload = error.payload || {};
  const title = lang === "es" ? "No pudimos cargar la polla" : "We could not load the pool";
  const retry = lang === "es" ? "Intentar de nuevo" : "Try again";
  const detail = lang === "es"
    ? "No pudimos cargar la informacion de la app. Intenta actualizar la pagina o contacta al administrador."
    : "We could not load the app data. Try refreshing the page or contact the admin.";
  app.innerHTML = `
    <header class="shell-header">
      <div>
        <p class="eyebrow">Melaza USA · polla.melazausa.com</p>
        <h1>${t("appTitle")}</h1>
      </div>
      <div class="header-actions">
        <select id="languageSelect" aria-label="${t("language")}">
          <option value="es"${lang === "es" ? " selected" : ""}>Español</option>
          <option value="en"${lang === "en" ? " selected" : ""}>English</option>
        </select>
      </div>
    </header>
    <main class="shell">
      <section class="panel empty-state">
        <h2>${title}</h2>
        <p>${escapeHtml(detail)}</p>
        ${payload.storage ? `<p class="muted">Storage: ${escapeHtml(payload.storage)}</p>` : ""}
        <button id="retryLoadState" type="button">${retry}</button>
      </section>
    </main>
  `;
  document.getElementById("languageSelect")?.addEventListener("change", (event) => {
    lang = event.target.value;
    localStorage.setItem(storage.language, lang);
    renderAppError(error);
  });
  document.getElementById("retryLoadState")?.addEventListener("click", () => loadState());
}

function navItems(kind) {
  if (kind === "admin") {
    return [
      { id: "matchday", es: "Dia de partido", en: "Match Day" },
      { id: "predictions", es: "Predicciones", en: "Predictions" },
      { id: "payments", es: "Pagos", en: "Payments" },
      { id: "results", es: "Resultados", en: "Results" },
      { id: "prizes", es: "Premios", en: "Prizes" },
      { id: "rules", es: "Reglas", en: "Rules" },
      { id: "tools", es: "Herramientas", en: "Tools" },
    ];
  }
  return [
    { id: "home", es: "Inicio", en: "Home" },
    { id: "matches", es: "Partidos", en: "Matches" },
    { id: "predictions", es: "Predicciones", en: "Predictions" },
    { id: "standings", es: "Tabla", en: "Standings" },
    { id: "rules", es: "Reglas", en: "Rules" },
  ];
}

function itemLabel(item) {
  return lang === "en" ? item.en : item.es;
}

function renderTabs(kind, activeId) {
  const attr = kind === "admin" ? "data-admin-tab" : "data-user-tab";
  return `
    <nav class="app-tabs ${kind === "user" ? "user-bottom-nav" : "admin-tabs"}" aria-label="${kind === "admin" ? t("admin") : t("myAccount")}">
      ${navItems(kind)
        .map((item) => `<button type="button" class="tab-button${activeId === item.id ? " active" : ""}" ${attr}="${item.id}">${itemLabel(item)}</button>`)
        .join("")}
    </nav>
  `;
}

function userPayments() {
  const user = currentUser();
  return state.payments.filter((payment) => payment.userId === user?.id);
}

function userPaymentSummary() {
  const payments = userPayments();
  const verified = payments.filter((payment) => payment.verificationStatus === "VERIFIED").length;
  const pending = payments.filter((payment) => payment.verificationStatus !== "VERIFIED" && payment.verificationStatus !== "REJECTED").length;
  const rejected = payments.filter((payment) => payment.verificationStatus === "REJECTED").length;
  return { payments, verified, pending, rejected };
}

function upcomingPredictionCount() {
  const user = currentUser();
  return state.nextMatches.filter((match) => predictionFor(match.id, user?.id)).length;
}

function currentUserStanding() {
  const user = currentUser();
  return state.standings.find((row) => row.userId === user?.id || row.name === user?.name) || null;
}

function renderCompactMatch(match) {
  const info = lockInfo(match);
  const prediction = predictionFor(match.id);
  const payment = prediction ? paymentForPrediction(prediction.id) : null;
  return `
    <article class="summary-card" data-select-match="${match.id}">
      <div>
        <strong>${escapeHtml(match.homeTeam)} vs ${escapeHtml(match.awayTeam)}</strong>
        <p>${fmtDate(match.kickoffAt)}</p>
      </div>
      <span class="badge ${info.locked ? "danger" : "success"}">${matchResultText(match) || (info.locked ? t("locked") : t("open"))}</span>
      <p>${prediction ? `${t("myPredictions")}: ${prediction.homeScore}-${prediction.awayScore}` : t("noPredictions")}</p>
      <p>${t("payment")}: ${paymentStatus(payment)}</p>
    </article>
  `;
}

function renderUserHome() {
  const user = currentUser();
  const payment = userPaymentSummary();
  const predicted = upcomingPredictionCount();
  const standing = currentUserStanding();
  return `
    <section class="hero-panel panel">
      <p class="eyebrow">${t("myAccount")}</p>
      <h2>${lang === "en" ? "Welcome" : "Bienvenido"}, ${escapeHtml(user.name)}</h2>
      <p>${lang === "en" ? "Predict the next matches, check payment status, and see the family table quickly." : "Predice los proximos partidos, revisa pagos y mira la tabla familiar rapido."}</p>
      <div class="button-row">
        <button class="primary" data-user-tab="matches">${lang === "en" ? "Make prediction" : "Hacer prediccion"}</button>
        <button class="ghost" data-user-tab="rules">${t("rulesPage")}</button>
      </div>
    </section>
    <section class="dashboard-grid compact-dashboard">
      ${statCard(t("submitted"), `${predicted} / ${state.nextMatches.length || 4}`)}
      ${statCard(t("payment"), `${payment.verified} ${t("verifiedByAdmin")}`)}
      ${statCard(t("pendingVerification"), payment.pending)}
      ${statCard(t("standings"), standing ? `#${standing.rank} � ${standing.points} pts` : "�")}
    </section>
    <section class="panel">
      <div class="panel-heading"><h2>${t("next3")}</h2><button class="ghost small" data-user-tab="matches">${t("matches")}</button></div>
      <div class="match-list compact-list">${state.nextMatches.length ? state.nextMatches.map(renderCompactMatch).join("") : `<p class="hint empty-state">${t("noUpcomingMatches")}</p>`}</div>
    </section>
    <section class="panel">
      <div class="panel-heading"><h2>${t("standings")}</h2><button class="ghost small" data-user-tab="standings">${lang === "en" ? "View table" : "Ver tabla"}</button></div>
      ${renderStandingsPreview()}
    </section>
  `;
}

function renderUserMatches() {
  return `
    <section class="panel page-intro"><h2>${t("matches")}</h2><p>${lang === "en" ? "Pick exact scores for the next 4 matches." : "Elige marcadores exactos para los proximos 4 partidos."}</p></section>
    <section class="match-list">${state.nextMatches.length ? state.nextMatches.map(renderMatchCard).join("") : `<p class="hint empty-state">${t("noUpcomingMatches")}</p>`}</section>
  `;
}

function renderUserPredictions() {
  const matches = state.matches.filter((match) => state.predictions.some((prediction) => prediction.matchId === match.id) || state.nextMatches.some((next) => next.id === match.id));
  return `
    <section class="panel page-intro"><h2>${t("allPredictions")}</h2><p>${lang === "en" ? "Everyone can see predictions by match. You can edit only your own before lock." : "Todos pueden ver las predicciones por partido. Solo puedes editar la tuya antes del cierre."}</p></section>
    <section class="accordion-list">
      ${matches.length ? matches.map((match, index) => `
        <details class="panel compact-details"${index === 0 ? " open" : ""}>
          <summary>${escapeHtml(match.homeTeam)} vs ${escapeHtml(match.awayTeam)} <span>${matchResultText(match) || fmtDate(match.kickoffAt)}</span></summary>
          ${renderPredictionTable(match)}
        </details>
      `).join("") : `<p class="hint empty-state">${t("noPredictions")}</p>`}
    </section>
  `;
}

function renderUserStandings() {
  return `
    <section class="panel page-intro"><h2>${t("standings")}</h2><p>${lang === "en" ? "Ranking updates after official results sync." : "La tabla se actualiza despues de sincronizar resultados oficiales."}</p></section>
    <section class="panel">${renderStandings()}</section>
  `;
}

function renderUserRules() {
  return `
    <section class="panel page-intro"><h2>${t("rulesPage")}</h2><p>${t("rulesBody")}</p></section>
    <section class="accordion-list">${renderRulesPage()}</section>
  `;
}

function renderUserView() {
  const screens = { home: renderUserHome, matches: renderUserMatches, predictions: renderUserPredictions, standings: renderUserStandings, rules: renderUserRules };
  return (screens[activeUserTab] || screens.home)();
}

function renderAdminView() {
  const screens = {
    matchday: () => `<section class="panel admin-wide"><h2>${t("matchDay")}</h2>${renderMatchDay()}</section>`,
    predictions: () => `<section class="panel admin-wide"><h2>${t("allPredictions")}</h2>${renderAdminPredictions()}</section>`,
    payments: () => `<section class="panel admin-wide"><h2>${t("payment")}</h2>${renderPaymentSummary()}${renderAdminPayments()}</section>`,
    results: () => `<section class="panel"><h2>${t("results")}</h2>${renderResultsControls()}</section><section class="panel admin-wide" id="results-page"><h2>${t("allResults")}</h2>${renderResultsPage()}</section>`,
    prizes: () => `<section class="panel admin-wide"><h2>${t("prizes")}</h2>${renderPrizes()}<details class="compact-details" open><summary>${t("payouts")}</summary>${renderPayouts()}</details></section>`,
    rules: () => `<section class="panel admin-wide"><h2>${t("rulesPage")}</h2>${renderRulesPage()}</section>`,
    tools: () => renderAdminTools(),
  };
  return `<section class="admin-layout">${(screens[activeAdminTab] || screens.matchday)()}</section>`;
}

function renderResultsControls() {
  return `
    <div class="provider-box">
      <strong>${t("apiProvider")}: ${escapeHtml(state.settings.footballApiProvider || state.settings.resultsProvider)}</strong>
      <p>${t("syncStatus")}: ${escapeHtml(state.sportsSync?.status || "PENDING")}</p>
      <p>${t("lastSync")}: ${state.sportsSync?.lastSyncedAt ? fmtDate(state.sportsSync.lastSyncedAt) : "�"}</p>
      <div class="button-row"><button class="ghost small" id="syncRealMatchesBtn">${t("syncRealMatches")}</button><button class="ghost small" id="syncRecentResultsBtn">${t("syncResult")}</button></div>
    </div>
  `;
}

function renderPaymentSummary() {
  return `<div class="dashboard-grid compact-dashboard">${statCard(t("totalVerified"), state.prizeSummary.verifiedEntries)}${statCard(t("basePot"), money(state.prizeSummary.basePotCop))}${statCard(t("usdExcess"), money(state.prizeSummary.usdExchangeExcessCop))}${statCard(t("totalPending"), money(state.prizeSummary.totalPendingCop))}</div>`;
}

function renderAdminTools() {
  return `
    <section class="panel"><h2>${t("exchangeRate")}</h2><div class="provider-box">${renderExchangeRateSummary()}<button class="ghost small" id="syncExchangeRateBtn">${t("syncExchangeRate")}</button></div></section>
    <section class="panel"><h2>${t("apiVerification")}</h2>${renderApiVerification()}</section>
    <section class="panel"><h2>${t("storageMode")}</h2><div class="provider-box"><strong>${escapeHtml(state.storage?.label || state.storage?.driver || "json")}</strong>${state.storage?.warning ? `<p class="warning">${t("jsonStorageWarning")}</p>` : ""}</div></section>
    <section class="panel"><h2>${t("users")}</h2>${renderAdminUsers()}</section>
    <section class="panel admin-wide"><details class="compact-details"><summary>${t("exports")}</summary>${renderExports()}</details></section>
    <section class="panel admin-wide"><details class="compact-details"><summary>${t("auditLog")}</summary>${renderAuditLog()}</details></section>
  `;
}

function renderStandingsPreview() {
  if (!state.standings.length) return `<p class="hint empty-state">�</p>`;
  return `<div class="mini-list">${state.standings.slice(0, 5).map((row) => `<div><strong>#${row.rank} ${escapeHtml(row.name)}</strong><span>${row.points} pts</span></div>`).join("")}</div>`;
}

function render() {
  if (!state) return;
  document.documentElement.lang = lang;
  const user = currentUser();
  if (!user) {
    app.innerHTML = `
      <header class="shell-header">
        <div><p class="eyebrow">Melaza USA � polla.melazausa.com</p><h1>${t("appTitle")}</h1><p>${t("tagline")}</p></div>
        <div class="header-actions"><select id="languageSelect" aria-label="${t("language")}"><option value="es"${lang === "es" ? " selected" : ""}>Espa�ol</option><option value="en"${lang === "en" ? " selected" : ""}>English</option></select></div>
      </header>
      <main class="shell landing-shell"><section class="panel landing-panel"><h2>${t("login")} / ${t("signup")}</h2><p>${t("tagline")}</p><a class="link-button ghost" href="#rules">${t("rulesPage")}</a></section>${renderLogin()}</main>
    `;
    bindEvents();
    return;
  }

  const admin = isAdmin();
  app.innerHTML = `
    <header class="shell-header">
      <div><p class="eyebrow">Melaza USA � polla.melazausa.com</p><h1>${t("appTitle")}</h1><p>${admin ? t("matchDay") : t("tagline")}</p></div>
      <div class="header-actions"><select id="languageSelect" aria-label="${t("language")}"><option value="es"${lang === "es" ? " selected" : ""}>Espa�ol</option><option value="en"${lang === "en" ? " selected" : ""}>English</option></select><span class="user-chip">${escapeHtml(user.name)} � ${user.role}</span><button id="logoutBtn" class="ghost">${t("logout")}</button></div>
    </header>
    ${admin ? renderTabs("admin", activeAdminTab) : renderTabs("user", activeUserTab)}
    <main class="shell ${admin ? "admin-shell" : "user-shell"}">${admin ? renderAdminView() : renderUserView()}</main>
  `;

  bindEvents();
}
function renderLogin() {
  return `
    <section class="login-grid">
      <form id="loginForm" class="panel login-card">
        <h2>${t("signup")}</h2>
        <label>${t("name")}<input name="name" required /></label>
        <label>${t("phone")}<input name="phone" required /></label>
        <p class="hint">${t("authHelp")}</p>
        <button class="primary">${t("enter")}</button>
      </form>
      <form id="existingLoginForm" class="panel login-card">
        <h2>${t("login")}</h2>
        <label>${t("name")}<input name="name" required /></label>
        <label>${t("phone")}<input name="phone" required /></label>
        <button class="primary">${t("enter")}</button>
      </form>
      <form id="adminLoginForm" class="panel login-card admin-login">
        <h2>${t("adminLogin")}</h2>
        <label>${t("adminPin")}<input name="pin" type="password" required /></label>
        <button class="gold">${t("enter")}</button>
      </form>
    </section>
  `;
}

function renderMatchCard(match) {
  const info = lockInfo(match);
  const userPrediction = predictionFor(match.id);
  const selected = selectedMatchId === match.id ? " selected" : "";
  const result = matchResultText(match);
  return `
    <article class="match-card${selected}" data-select-match="${match.id}">
      <div class="match-top">
        <span class="badge ${info.locked ? "danger" : "success"}">${info.locked ? t("predictionClosed") : t("predictionAvailable")}</span>
        <span>${fmtDate(match.kickoffAt)}</span>
      </div>
      <h3>${escapeHtml(match.homeTeam)} vs ${escapeHtml(match.awayTeam)}</h3>
      ${result ? `<p class="match-result">${escapeHtml(result)}</p>` : ""}
      ${match.stage || match.group ? `<p>${escapeHtml(match.stage || match.group)}</p>` : ""}
      <p>${escapeHtml(match.venue)}</p>
      <p>${info.locked ? t("locked") : t("open")} · ${fmtDate(info.lockAt)}</p>
      ${userPrediction ? `<strong>${t("myPredictions")}: ${userPrediction.homeScore}-${userPrediction.awayScore}</strong>` : ""}
      ${userPrediction ? `<p>${t("payment")}: ${paymentStatus(paymentForPrediction(userPrediction.id))}</p>` : ""}
      ${renderPredictionForm(match, userPrediction, info.locked)}
      <details class="compact-details predictions-details">
        <summary>${t("viewPredictions")}</summary>
        ${renderPredictionTable(match)}
      </details>
    </article>
  `;
}

function matchResultText(match) {
  if (match.result) return `${match.result.homeScore}-${match.result.awayScore}`;
  if (match.apiResult) return `${match.apiResult.homeScore}-${match.apiResult.awayScore}`;
  return "";
}

function renderPredictionForm(match, prediction, locked) {
  const user = currentUser();
  if (!user || user.role !== "USER") return `<p class="hint">${t("loginRequired")}</p>`;
  if (locked) return `<p class="hint">${t("predictionClosed")}</p>`;
  const payment = prediction ? paymentForPrediction(prediction.id) : null;
  const usdRate = Number(state.exchangeRate?.rate || 0);
  const usdBonus = Math.max(usdRate - 2000, 0);
  return `
    <form class="prediction-form" data-predict-match="${match.id}">
      <label>${t("homeScore")}<input name="homeScore" type="number" min="0" inputmode="numeric" value="${prediction?.homeScore ?? 1}" aria-label="${t("homeScore")}" /></label>
      <span>-</span>
      <label>${t("awayScore")}<input name="awayScore" type="number" min="0" inputmode="numeric" value="${prediction?.awayScore ?? 0}" aria-label="${t("awayScore")}" /></label>
      <label>${t("entryCurrency")}<select name="currency">
        <option value="COP"${payment?.currency !== "USD" ? " selected" : ""}>2,000 COP · ${t("exchangeBonus")}: 0 COP</option>
        <option value="USD"${payment?.currency === "USD" ? " selected" : ""}>1 USD${usdRate ? ` · ${t("exchangeBonus")}: ${money(usdBonus)}` : ""}</option>
      </select></label>
      <input name="userComment" placeholder="${t("paymentComment")}" value="${escapeHtml(payment?.userComment || "")}" />
      <button class="primary">${t("savePrediction")}</button>
      <p class="hint form-note">${t("manualPaymentNotice")} ${
        usdRate ? `${t("usdEstimate")}: ${money(usdRate)} · ${t("exchangeBonus")}: ${money(usdBonus)}` : t("rateUnavailable")
      }</p>
    </form>
  `;
}

function renderPredictionTable(match) {
  const rows = state.predictions.filter((prediction) => prediction.matchId === match.id);
  if (!rows.length) return `<p class="hint empty-state">${t("noPredictions")}</p>`;
  return `
    <div class="table-wrap card-table">
      <table>
        <thead><tr><th>${t("participants")}</th><th>${t("score")}</th><th>${t("predictionTime")}</th><th>${t("payment")}</th><th>${t("status")}</th><th>${t("points")}</th><th>${t("action")}</th></tr></thead>
        <tbody>
          ${rows
            .map((prediction) => {
              const payment = prediction.payment;
              return `<tr>
                <td data-label="${t("participants")}">${escapeHtml(prediction.userName)}</td>
                <td data-label="${t("score")}">${prediction.homeScore}-${prediction.awayScore}</td>
                <td data-label="${t("predictionTime")}">${fmtDate(prediction.updatedAt)}</td>
                <td data-label="${t("payment")}">${paymentStatus(payment)}</td>
                <td data-label="${t("status")}">${prediction.locked ? t("locked") : t("open")}</td>
                <td data-label="${t("points")}">${prediction.points ?? "-"}</td>
                <td data-label="${t("action")}">${canEditPredictionRow(prediction) ? t("useMatchCard") : "-"}</td>
              </tr>`;
            })
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}
function renderStandings() {
  if (!state.standings.length) return `<p class="hint">—</p>`;
  return `
    <div class="table-wrap">
      <table>
        <thead><tr><th>#</th><th>${t("participants")}</th><th>${t("points")}</th><th>${t("submitted")}</th><th>${t("winners")}</th></tr></thead>
        <tbody>${state.standings
          .map((row) => `<tr><td>${row.rank}</td><td>${escapeHtml(row.name)}</td><td>${row.points}</td><td>${row.predictionsSubmitted}</td><td>${row.correctPredictions}</td></tr>`)
          .join("")}</tbody>
      </table>
    </div>
  `;
}

function renderPrizes() {
  const bonus = state.tournamentBonus;
  return `
    <div class="prize-grid">
      ${statCard(t("basePot"), money(state.prizeSummary.basePotCop))}
      ${statCard(t("usdExcess"), money(state.prizeSummary.usdExchangeExcessCop))}
      ${statCard(t("mostCorrectPrize"), bonus.winners.map((winner) => `${escapeHtml(winner.name)} (${money(winner.bonusPayoutCop)})`).join(", ") || "—")}
      ${statCard(t("totalPending"), money(state.prizeSummary.totalPendingCop))}
    </div>
  `;
}

function renderRulesPage() {
  const groups =
    lang === "en"
      ? [
          ["Entry", ["Family exact-score pool for one match at a time.", "Sign up and log in with name and phone only.", "Payments are manual: 2,000 COP or 1 USD per entry."]],
          ["Predictions", ["Users can edit only their own prediction until 15 minutes before kickoff.", "Everyone can see submitted predictions.", "Exact score earns 5 points. Correct result earns 2 points. Otherwise 0 points."]],
          ["Payments and Prizes", ["Every verified entry contributes exactly 2,000 COP to the base pot.", "USD excess over 2,000 COP goes to the separate World Cup bonus pot.", "Prize payouts are manual and confirmed by the admin."]],
          ["Results", ["Official API results are the settlement source.", "If sync is delayed, results show pending sync.", "For help, contact the family admin."]],
        ]
      : [
          ["Participacion", ["Polla familiar de marcador exacto, un partido a la vez.", "Registrate e inicia sesion solo con nombre y telefono.", "Los pagos son manuales: 2,000 COP o 1 USD por entrada."]],
          ["Predicciones", ["Puedes editar solo tu prediccion hasta 15 minutos antes del inicio.", "Todos pueden ver las predicciones enviadas.", "Marcador exacto da 5 puntos. Resultado correcto da 2 puntos. Si no, 0 puntos."]],
          ["Pagos y premios", ["Cada entrada verificada aporta exactamente 2,000 COP al pozo base.", "El exceso de USD sobre 2,000 COP va al bono separado del Mundial.", "Los pagos de premios son manuales y confirmados por el administrador."]],
          ["Resultados", ["Los resultados oficiales de la API son la fuente para liquidar.", "Si se demora la sincronizacion, queda pendiente.", "Si necesitas ayuda, contacta al administrador familiar."]],
        ];
  return groups
    .map(
      ([title, lines], index) => `<details class="compact-details rules-group"${index === 0 ? " open" : ""}><summary>${escapeHtml(title)}</summary><ul class="rules-list">${lines
        .map((line) => `<li>${escapeHtml(line)}</li>`)
        .join("")}</ul></details>`,
    )
    .join("");
}
function renderExchangeRateSummary() {
  const rate = state.exchangeRate;
  if (!rate?.rate) {
    return `
      <p class="warning">${t("rateUnavailable")}</p>
      ${rate?.invalidRejected ? `<p class="warning">${t("invalidRate")}: ${escapeHtml(rate.invalidRejected.rawValue || rate.invalidRejected.rate)}</p>` : ""}
    `;
  }
  return `
    <div class="rate-summary">
      <span>${t("exchangeRate")}: <strong>${money(rate.rate)}</strong></span>
      <span>${t("source")}: ${escapeHtml(rate.source || "default-estimate")}</span>
      <span>${t("lastSync")}: ${rate.fetchedAt ? fmtDate(rate.fetchedAt) : "-"}</span>
      <span>${t("status")}: ${escapeHtml(rate.cached ? "cache" : rate.status || "live")}</span>
      ${rate.invalidRejected ? `<span class="warning">${t("invalidRate")}: ${escapeHtml(rate.invalidRejected.rawValue || rate.invalidRejected.rate)}</span>` : ""}
    </div>
  `;
}

function renderMatchDay() {
  const summary = state.matchDay || {};
  const missing = summary.missingPredictions || [];
  return `
    <div class="dashboard-grid">
      ${statCard(t("upcomingMatches"), summary.nextMatches?.length || 0)}
      ${statCard("Live", summary.liveMatches?.length || 0)}
      ${statCard(t("completedFixtures"), summary.lastCompleted?.length || 0)}
      ${statCard(t("unpaidUsers"), summary.unpaidUsers?.length || 0)}
      ${statCard(t("syncStatus"), escapeHtml(summary.sportsSync?.status || "PENDING"))}
    </div>
    <div class="button-row matchday-actions">
      <button class="primary small" id="syncRecentResultsBtn">${t("syncResult")}</button>
      <button class="ghost small" id="syncRealMatchesBtn">${t("syncRealMatches")}</button>
      <button class="ghost small" id="syncExchangeRateBtn">${t("syncExchangeRate")}</button>
      <button class="ghost small" data-message-type="prediction_reminder">${t("missingPredictions")}</button>
      <button class="ghost small" data-message-type="winner">${t("winnerMessage")}</button>
    </div>
    <div class="two-column compact-stack">
      <div>
        <h3>${t("missingPredictions")}</h3>
        ${missing
          .map((item) => `<p><strong>${escapeHtml(item.matchName)}</strong>: ${item.users.map((user) => escapeHtml(user.name)).join(", ") || "-"}</p>`)
          .join("") || `<p class="hint">-</p>`}
      </div>
      <div>
        <h3>${t("unpaidUsers")}</h3>
        <p>${(summary.unpaidUsers || []).map((user) => escapeHtml(user.name)).join(", ") || "-"}</p>
      </div>
    </div>
    <details class="compact-details whatsapp-panel">
      <summary>${t("whatsapp")}</summary>
      <textarea id="whatsappText" readonly>${escapeHtml(selectedMessage)}</textarea>
      <div class="button-row"><button id="copyWhatsappBtn" class="primary small">${t("copyWhatsapp")}</button><a id="whatsappLink" class="gold link-button small" href="#" target="_blank" rel="noreferrer">${t("openWhatsapp")}</a></div>
    </details>
  `;
}

function renderPayouts() {
  const rows = state.payouts || [];
  if (!rows.length) return `<p class="hint empty-state">${t("payoutNotice")}</p>`;
  const userById = new Map(state.users.map((user) => [user.id, user]));
  return `
    <p class="hint">${t("payoutNotice")}</p>
    <div class="table-wrap card-table">
      <table>
        <thead><tr><th>${t("participants")}</th><th>${t("prizes")}</th><th>${t("basePot")}</th><th>${t("status")}</th><th>${t("action")}</th></tr></thead>
        <tbody>${rows
          .map(
            (payout) => `<tr>
              <td data-label="${t("participants")}">${escapeHtml(userById.get(payout.userId)?.name || payout.userId)}</td>
              <td data-label="${t("prizes")}">${escapeHtml(payout.prizeType)}</td>
              <td data-label="${t("basePot")}">${money(payout.amountCop)}</td>
              <td data-label="${t("status")}">${escapeHtml(payout.status)}</td>
              <td data-label="${t("action")}">
                ${isAdmin() ? `<button class="ghost small" data-payout-status="approved" data-payout-id="${payout.id}">${t("approve")}</button>
                <button class="ghost small" data-payout-status="paid" data-payout-id="${payout.id}">${t("markPaidPayout")}</button>` : ""}
              </td>
            </tr>`,
          )
          .join("")}</tbody>
      </table>
    </div>
  `;
}

function renderExports() {
  const exports = [
    ["backup", t("exportBackup")],
    ["users", t("exportUsers")],
    ["predictions", t("exportPredictions")],
    ["payments", t("exportPayments")],
    ["standings", t("exportStandings")],
    ["payouts", t("payouts")],
    ["audit", t("auditLog")],
  ];
  return `<div class="button-row">${exports
    .map(([type, label]) => `<button class="ghost" data-export-type="${type}">${label}</button>`)
    .join("")}</div>`;
}

function renderAuditLog() {
  const rows = state.auditLogs || [];
  if (!rows.length) return `<p class="hint empty-state">-</p>`;
  return `
    <div class="table-wrap card-table">
      <table>
        <thead><tr><th>${t("lastSync")}</th><th>${t("admin")}</th><th>${t("action")}</th><th>${t("source")}</th><th>${t("notes")}</th></tr></thead>
        <tbody>${rows
          .slice(0, 50)
          .map(
            (row) => `<tr>
              <td data-label="${t("lastSync")}">${fmtDate(row.createdAt)}</td>
              <td data-label="${t("admin")}">${escapeHtml(row.actorRole)}</td>
              <td data-label="${t("action")}">${escapeHtml(row.action)}</td>
              <td data-label="${t("source")}">${escapeHtml(row.entityType)}:${escapeHtml(row.entityId)}</td>
              <td data-label="${t("notes")}">${escapeHtml(row.reason || "")}</td>
            </tr>`,
          )
          .join("")}</tbody>
      </table>
    </div>
  `;
}

function renderAdminPredictions() {
  const rows = (state.adminPredictions || []).filter((row) => {
    if (adminPredictionFilters.matchId && row.matchId !== adminPredictionFilters.matchId) return false;
    if (adminPredictionFilters.userId && row.userId !== adminPredictionFilters.userId) return false;
    if (adminPredictionFilters.paymentStatus && row.paymentStatus !== adminPredictionFilters.paymentStatus) return false;
    if (adminPredictionFilters.lockStatus === "locked" && !row.matchLocked) return false;
    if (adminPredictionFilters.lockStatus === "open" && row.matchLocked) return false;
    if (adminPredictionFilters.resultStatus && row.resultStatus !== adminPredictionFilters.resultStatus) return false;
    return true;
  });
  const allRows = state.adminPredictions || [];
  const paymentStatuses = [...new Set(allRows.map((row) => row.paymentStatus).filter(Boolean))];
  const resultStatuses = [...new Set(allRows.map((row) => row.resultStatus).filter(Boolean))];
  return `
    <form id="adminPredictionFilters" class="filter-grid">
      <label>${t("matches")}<select name="matchId"><option value="">${t("allMatches")}</option>${state.matches.map((match) => `<option value="${match.id}"${adminPredictionFilters.matchId === match.id ? " selected" : ""}>${escapeHtml(match.homeTeam)} vs ${escapeHtml(match.awayTeam)}</option>`).join("")}</select></label>
      <label>${t("users")}<select name="userId"><option value="">${t("allUsers")}</option>${state.users.filter((user) => user.role === "USER").map((user) => `<option value="${user.id}"${adminPredictionFilters.userId === user.id ? " selected" : ""}>${escapeHtml(user.name)}</option>`).join("")}</select></label>
      <label>${t("payment")}<select name="paymentStatus"><option value="">${t("allPayments")}</option>${paymentStatuses.map((status) => `<option value="${status}"${adminPredictionFilters.paymentStatus === status ? " selected" : ""}>${escapeHtml(status)}</option>`).join("")}</select></label>
      <label>${t("status")}<select name="lockStatus"><option value="">${t("allLocks")}</option><option value="open"${adminPredictionFilters.lockStatus === "open" ? " selected" : ""}>${t("open")}</option><option value="locked"${adminPredictionFilters.lockStatus === "locked" ? " selected" : ""}>${t("locked")}</option></select></label>
      <label>${t("results")}<select name="resultStatus"><option value="">${t("allResults")}</option>${resultStatuses.map((status) => `<option value="${status}"${adminPredictionFilters.resultStatus === status ? " selected" : ""}>${escapeHtml(status)}</option>`).join("")}</select></label>
    </form>
    ${rows.length ? `
    <div class="table-wrap card-table">
      <table>
        <thead><tr><th>${t("participants")}</th><th>${t("phone")}</th><th>${t("currency")}</th><th>${t("payment")}</th><th>${t("matches")}</th><th>${t("score")}</th><th>${t("predictionTime")}</th><th>${t("status")}</th><th>${t("results")}</th><th>${t("points")}</th><th>${t("action")}</th></tr></thead>
        <tbody>${rows
          .map((row) => `<tr>
              <td data-label="${t("participants")}">${escapeHtml(row.userName)}</td>
              <td data-label="${t("phone")}">${escapeHtml(row.userPhone)}</td>
              <td data-label="${t("currency")}">${escapeHtml(row.currency)}</td>
              <td data-label="${t("payment")}">${escapeHtml(row.paymentStatus)}</td>
              <td data-label="${t("matches")}">${escapeHtml(row.matchName)}</td>
              <td data-label="${t("score")}">${escapeHtml(row.predictedScore)}</td>
              <td data-label="${t("predictionTime")}">${fmtDate(row.updatedAt)}</td>
              <td data-label="${t("status")}">${row.matchLocked ? t("locked") : t("open")}</td>
              <td data-label="${t("results")}">${escapeHtml(row.resultStatus)}</td>
              <td data-label="${t("points")}">${row.points ?? "-"}</td>
              <td data-label="${t("action")}">${renderAdminCorrectionForm(row)}</td>
            </tr>`)
          .join("")}</tbody>
      </table>
    </div>` : `<p class="hint empty-state">${t("noPredictions")}</p>`}
  `;
}

function renderAdminCorrectionForm(row) {
  if (row.adminCorrectionLocked) return `<span class="badge danger">${t("correctionLocked")}</span>`;
  return `
    <details class="inline-editor">
      <summary>${t("emergencyCorrection")}</summary>
      <form class="admin-correction-form" data-correct-prediction="${row.id}">
        <label>${t("homeScore")}<input name="homeScore" type="number" min="0" inputmode="numeric" value="${row.homeScore}" /></label>
        <label>${t("awayScore")}<input name="awayScore" type="number" min="0" inputmode="numeric" value="${row.awayScore}" /></label>
        <label>${t("correctionReason")}<input name="reason" required /></label>
        <button class="ghost small">${t("save")}</button>
      </form>
    </details>
  `;
}
function renderApiVerification() {
  const verification = state.sportsVerification || {};
  const keys = verification.apiKeysConfigured || {};
  const samples = verification.sampleNextGames || [];
  return `
    <div class="provider-box verification-box">
      <strong>${t("apiVerification")}</strong>
      <p>${t("apiProvider")}: ${escapeHtml(verification.activeProvider || "not-configured")}</p>
      <p>${t("keysConfigured")}: API-Football ${keys.apiFootball ? "OK" : "—"} · football-data ${keys.footballData ? "OK" : "—"}</p>
      <p>${t("fixturesPulled")}: ${verification.fixturesPulled || 0}</p>
      <p>${t("upcomingFixtures")}: ${verification.upcomingFixtures || 0} · ${t("completedFixtures")}: ${verification.completedFixtures || 0}</p>
      <p>${t("competition")}: ${escapeHtml(verification.competitionName || "—")} · ${t("season")}: ${escapeHtml(verification.season || "—")}</p>
      ${
        verification.warnings?.length
          ? `<p class="warning">${t("warnings")}: ${verification.warnings.map(escapeHtml).join(" | ")}</p>`
          : ""
      }
      ${
        samples.length
          ? `<div class="sample-list">${samples
              .map(
                (match) =>
                  `<span>${escapeHtml(match.homeTeam)} vs ${escapeHtml(match.awayTeam)} · ${fmtDate(match.kickoffAt)}${match.stage ? ` · ${escapeHtml(match.stage)}` : ""}</span>`,
              )
              .join("")}</div>`
          : `<p class="hint">${t("pendingSync")}</p>`
      }
    </div>
  `;
}

function renderAdminPayments() {
  if (!state.payments.length) return `<p class="hint empty-state">${lang === "en" ? "No pending payments." : "No hay pagos pendientes."}</p>`;
  const orderedPayments = [...state.payments].sort((a, b) => {
    const rank = { PENDING: 0, VERIFIED: 2, REJECTED: 3 };
    return (rank[a.verificationStatus] ?? 1) - (rank[b.verificationStatus] ?? 1);
  });
  return `
    <div class="table-wrap card-table">
      <table>
        <thead><tr><th>${t("participants")}</th><th>${t("matches")}</th><th>${t("currency")}</th><th>${t("basePot")}</th><th>${t("exchangeBonus")}</th><th>${t("payment")}</th><th></th></tr></thead>
        <tbody>${orderedPayments
          .map((payment) => {
            const prediction = state.predictions.find((item) => item.id === payment.predictionId);
            const action = payment.verificationStatus === "VERIFIED" ? t("markPending") : t("markVerified");
            return `<tr>
              <td data-label="${t("participants")}">${escapeHtml(prediction?.userName || "")}</td>
              <td data-label="${t("matches")}">${escapeHtml(prediction?.match?.homeTeam || "")} vs ${escapeHtml(prediction?.match?.awayTeam || "")}</td>
              <td data-label="${t("currency")}">${payment.currency} · ${money(payment.actualCopReceived || payment.copEquivalent)}</td>
              <td data-label="${t("basePot")}">${money(payment.basePotContributionCop || payment.baseContributionCop || 0)}</td>
              <td data-label="${t("exchangeBonus")}">${money(payment.exchangeExcess || payment.excessContributionCop || 0)}</td>
              <td data-label="${t("payment")}">${paymentStatus(payment)}${payment.rateLockedAt ? ` · ${t("rateLocked")}: ${fmtDate(payment.rateLockedAt)}` : ""}</td>
              <td>
                <details class="inline-editor">
                  <summary>${action}</summary>
                  <form class="payment-admin-form" data-admin-payment="${payment.id}">
                    <select name="verificationStatus">
                      <option value="PENDING"${payment.verificationStatus === "PENDING" ? " selected" : ""}>${t("markPending")}</option>
                      <option value="VERIFIED"${payment.verificationStatus === "VERIFIED" ? " selected" : ""}>${t("markVerified")}</option>
                      <option value="REJECTED"${payment.verificationStatus === "REJECTED" ? " selected" : ""}>${t("reject")}</option>
                    </select>
                    <input name="copReceived" type="number" min="0" value="${payment.copEquivalent || ""}" placeholder="COP" />
                    <input name="userComment" value="${escapeHtml(payment.userComment || "")}" placeholder="${t("paymentComment")}" />
                    <input name="adminNotes" value="${escapeHtml(payment.adminNotes || payment.notes || "")}" placeholder="${t("notes")}" />
                    <button class="ghost small">${t("updatePayment")}</button>
                  </form>
                </details>
              </td>
            </tr>`;
          })
          .join("")}</tbody>
      </table>
    </div>
  `;
}

function renderAdminUsers() {
  const users = state.users.filter((user) => user.role === "USER");
  const duplicateNames = duplicateValues(users.map((user) => String(user.name || "").trim().toLowerCase()).filter(Boolean));
  const duplicatePhones = duplicateValues(users.map((user) => String(user.phone || "").replace(/[^\d]/g, "")).filter(Boolean));
  return `
    ${
      duplicateNames.length || duplicatePhones.length
        ? `<p class="warning">${t("duplicates")}: ${[...duplicateNames, ...duplicatePhones].map(escapeHtml).join(", ")}</p>`
        : `<p class="hint">${t("duplicates")}: -</p>`
    }
    <div class="table-wrap card-table">
      <table>
        <thead><tr><th>${t("name")}</th><th>${t("phone")}</th><th>${t("payment")}</th></tr></thead>
        <tbody>${users
          .map(
            (user) => `<tr>
              <td data-label="${t("name")}">${escapeHtml(user.name)}</td>
              <td data-label="${t("phone")}">${escapeHtml(user.phone || "")}</td>
              <td data-label="${t("payment")}">${escapeHtml(user.paidStatus || "UNPAID")}</td>
            </tr>`,
          )
          .join("")}</tbody>
      </table>
    </div>
  `;
}

function renderResultsPage() {
  const rows = state.matches
    .filter((match) => match.result || match.apiResult || match.resultSync?.status !== "PENDING")
    .sort((a, b) => new Date(b.kickoffAt) - new Date(a.kickoffAt));
  if (!rows.length) return `<p class="hint empty-state">${t("pendingSync")}</p>`;
  return `
    <div class="results-grid">
      ${rows.map(renderAdminMatch).join("")}
    </div>
  `;
}

function renderAdminMatch(match) {
  const result = matchResultText(match) || escapeHtml(match.resultSync?.message || t("pendingSync"));
  return `
    <div class="admin-match">
      <strong>${escapeHtml(match.homeTeam)} vs ${escapeHtml(match.awayTeam)}</strong>
      <span class="match-result">${result}</span>
      <button class="ghost small" data-sync-result="${match.id}">${t("syncResult")}</button>
    </div>
  `;
}

function statCard(label, value) {
  return `<article class="stat-card"><span>${label}</span><strong>${value}</strong></article>`;
}

function paymentStatus(payment) {
  if (!payment) return t("unpaid");
  if (payment.verificationStatus === "REJECTED") return t("reject");
  if (payment.verificationStatus === "VERIFIED") return t("verifiedByAdmin");
  if (payment.paidStatus === "PAID") return t("pendingVerification");
  return t("unpaid");
}

function bindEvents() {
  document.getElementById("languageSelect")?.addEventListener("change", (event) => {
    lang = event.target.value;
    localStorage.setItem(storage.language, lang);
    render();
  });

  document.querySelectorAll("[data-user-tab]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      activeUserTab = button.dataset.userTab;
      render();
    });
  });

  document.querySelectorAll("[data-admin-tab]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      activeAdminTab = button.dataset.adminTab;
      render();
    });
  });
  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem(storage.sessionToken);
    localStorage.removeItem(storage.role);
    loadState();
  });

  document.getElementById("loginForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = await api("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ ...Object.fromEntries(form), language: lang }),
    });
    localStorage.setItem(storage.sessionToken, payload.sessionToken);
    localStorage.setItem(storage.role, payload.user.role);
    state = payload.state;
    render();
  });

  document.getElementById("existingLoginForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ ...Object.fromEntries(form), language: lang }),
    });
    localStorage.setItem(storage.sessionToken, payload.sessionToken);
    localStorage.setItem(storage.role, payload.user.role);
    state = payload.state;
    render();
  });

  document.getElementById("adminLoginForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = await api("/api/auth/admin", {
      method: "POST",
      body: JSON.stringify({ pin: form.get("pin") }),
    });
    localStorage.setItem(storage.sessionToken, payload.sessionToken);
    localStorage.setItem(storage.role, payload.user.role);
    state = payload.state;
    render();
  });

  document.querySelectorAll("[data-select-match]").forEach((node) => {
    node.addEventListener("click", () => {
      selectedMatchId = node.dataset.selectMatch;
      render();
    });
  });

  document.querySelectorAll(".prediction-form").forEach((form) => {
    form.addEventListener("click", (event) => {
      event.stopPropagation();
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      event.stopPropagation();
      const data = Object.fromEntries(new FormData(event.currentTarget));
      state = await api("/api/predictions", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          matchId: event.currentTarget.dataset.predictMatch,
          homeScore: Number(data.homeScore),
          awayScore: Number(data.awayScore),
        }),
      });
      render();
    });
  });

  document.querySelectorAll(".payment-admin-form").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(event.currentTarget));
      state = await api(`/api/admin/payments/${event.currentTarget.dataset.adminPayment}`, {
        method: "PATCH",
        headers: headers(),
        body: JSON.stringify({
          ...data,
          copReceived: Number(data.copReceived || 0),
        }),
      });
      render();
    });
  });

  document.getElementById("adminPredictionFilters")?.addEventListener("change", (event) => {
    adminPredictionFilters = Object.fromEntries(new FormData(event.currentTarget));
    render();
  });

  document.querySelectorAll(".admin-correction-form").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(event.currentTarget));
      state = await api(`/api/admin/predictions/${event.currentTarget.dataset.correctPrediction}/correction`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          ...data,
          homeScore: Number(data.homeScore),
          awayScore: Number(data.awayScore),
        }),
      });
      render();
    });
  });

  document.querySelectorAll("[data-sync-result]").forEach((button) => {
    button.addEventListener("click", async () => {
      state = await api("/api/admin/results/sync", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ matchId: button.dataset.syncResult }),
      });
      render();
    });
  });

  document.getElementById("syncRealMatchesBtn")?.addEventListener("click", async () => {
    state = await api("/api/admin/matches/sync", {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({}),
    });
    render();
  });

  document.getElementById("syncRecentResultsBtn")?.addEventListener("click", async () => {
    state = await api("/api/admin/results/sync", {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({}),
    });
    render();
  });

  document.getElementById("syncExchangeRateBtn")?.addEventListener("click", async () => {
    const rate = await api("/api/exchange-rate/usd-cop");
    state.exchangeRate = rate;
    render();
  });

  document.querySelectorAll("[data-export-type]").forEach((button) => {
    button.addEventListener("click", async () => {
      const type = button.dataset.exportType;
      const response = await fetch(`/api/admin/export/${type}`, { headers: headers() });
      if (!response.ok) {
        const parsed = safeJsonParse(await response.text(), { error: "Export failed" });
        const payload = parsed.value;
        throw new Error(payload.error || "Export failed");
      }
      const text = await response.text();
      const blob = new Blob([text], { type: type === "backup" ? "application/json" : "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `polla-${type}-${new Date().toISOString().slice(0, 10)}.${type === "backup" ? "json" : "csv"}`;
      link.click();
      URL.revokeObjectURL(url);
    });
  });

  document.querySelectorAll("[data-payout-id]").forEach((button) => {
    button.addEventListener("click", async () => {
      state = await api(`/api/admin/payouts/${button.dataset.payoutId}`, {
        method: "PATCH",
        headers: headers(),
        body: JSON.stringify({ status: button.dataset.payoutStatus }),
      });
      render();
    });
  });

  document.querySelectorAll("[data-message-type]").forEach((button) => {
    button.addEventListener("click", async () => {
      const payload = await api("/api/admin/whatsapp", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ type: button.dataset.messageType, language: lang, matchId: selectedMatch()?.id }),
      });
      selectedMessage = payload.message;
      render();
      document.getElementById("whatsappText").value = payload.message;
      document.getElementById("whatsappLink").href = payload.shareUrl;
    });
  });

  document.getElementById("copyWhatsappBtn")?.addEventListener("click", async () => {
    const text = document.getElementById("whatsappText")?.value || "";
    await navigator.clipboard.writeText(text);
    alert(t("copied"));
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function duplicateValues(values) {
  const seen = new Set();
  const duplicates = new Set();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates];
}

loadState();
