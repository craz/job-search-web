const grid = document.querySelector("#vacancies");
const count = document.querySelector("#vacancy-count");
const notice = document.querySelector("#notice");
const dialog = document.querySelector("#vacancy-dialog");
const form = document.querySelector("#vacancy-form");
const formError = document.querySelector("#form-error");
const submitButton = document.querySelector("#submit-form");
const signal = document.querySelector("#core-connection");
const connectionLabel = document.querySelector("#connection-label");
const hhConnection = document.querySelector("#hh-connection");
const hhConnectionLabel = document.querySelector("#hh-connection-label");
const hhAccountLabel = document.querySelector("#hh-account-label");
const hhConnectionAction = document.querySelector("#hh-connection-action");
const hhResumes = document.querySelector("#hh-resumes");
const hhResumesStatus = document.querySelector("#hh-resumes-status");
const hhResumesList = document.querySelector("#hh-resumes-list");
const hhResumesActions = document.querySelector("#hh-resumes-actions");
const hhResumesOpen = document.querySelector("#hh-resumes-open");
const hhResumesConfirm = document.querySelector("#hh-resumes-confirm");
const applicationList = document.querySelector("#applications");
const applicationCount = document.querySelector("#application-count");
const applicationDialog = document.querySelector("#application-dialog");
const applicationForm = document.querySelector("#application-form");
const applicationFormError = document.querySelector("#application-form-error");
const applicationSubmitButton = document.querySelector("#submit-application-form");
const applicationVacancyTitle = document.querySelector("#application-vacancy-title");
const metricsDashboard = document.querySelector("#metrics");
const metricCount = document.querySelector("#metric-count");
const metricDialog = document.querySelector("#metric-dialog");
const metricForm = document.querySelector("#metric-form");
const metricFormError = document.querySelector("#metric-form-error");
const metricSubmitButton = document.querySelector("#submit-metric-form");
const peopleGrid = document.querySelector("#people");
const peopleCount = document.querySelector("#people-count");
const personDialog = document.querySelector("#person-dialog");
const personForm = document.querySelector("#person-form");
const personFormError = document.querySelector("#person-form-error");
const personSubmitButton = document.querySelector("#submit-person-form");
const hypothesisGrid = document.querySelector("#hypotheses");
const hypothesisCount = document.querySelector("#hypothesis-count");
const hypothesisDialog = document.querySelector("#hypothesis-dialog");
const hypothesisForm = document.querySelector("#hypothesis-form");
const hypothesisFormError = document.querySelector("#hypothesis-form-error");
const hypothesisCloseDialog = document.querySelector("#hypothesis-close-dialog");
const hypothesisCloseForm = document.querySelector("#hypothesis-close-form");
const hypothesisCloseError = document.querySelector("#hypothesis-close-error");
let knownVacancies = [];
let osintReports = [];
let mirrorReports = [];
let assessmentsByVacancyId = new Map();

const NAV_SECTIONS = [
  "vacancies",
  "journal",
  "metrics",
  "people",
  "hypotheses",
];
const NAV_DEFAULT_SECTION = "vacancies";
const NAV_LEGACY_HASH_ALIASES = { applications: "journal", assessments: "vacancies" };

function resolveSectionFromHash(rawHash = window.location.hash) {
  const hash = String(rawHash || "").replace(/^#/, "");
  if (!hash) return NAV_DEFAULT_SECTION;
  if (NAV_LEGACY_HASH_ALIASES[hash]) return NAV_LEGACY_HASH_ALIASES[hash];
  if (NAV_SECTIONS.includes(hash)) return hash;
  return NAV_DEFAULT_SECTION;
}

function activateSection(sectionId) {
  const activeId = NAV_SECTIONS.includes(sectionId) ? sectionId : NAV_DEFAULT_SECTION;
  document.querySelectorAll(".section-view[data-section]").forEach((view) => {
    view.hidden = view.dataset.section !== activeId;
  });
  document.querySelectorAll(".app-nav__link[data-nav]").forEach((link) => {
    if (link.dataset.nav === activeId) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function syncNavigationFromHash() {
  activateSection(resolveSectionFromHash());
}

function initNavigation() {
  const rawHash = window.location.hash.replace(/^#/, "");
  const sectionId = resolveSectionFromHash();
  activateSection(sectionId);

  if (!rawHash || sectionId !== rawHash) {
    history.replaceState(null, "", `#${sectionId}`);
  }

  window.addEventListener("hashchange", syncNavigationFromHash);
}

const statusLabels = {
  new: "Новая",
  reviewing: "Изучаю",
  shortlisted: "В шорт-листе",
  rejected: "Не подходит",
};
const personStatusLabels = { new: "Новый", researching: "Изучаю", contacted: "Связался", replied: "Ответил", dropped: "Закрыт" };
const personRoleLabels = { hiring_manager: "Нанимающий менеджер", recruiter: "Рекрутер", referral: "Referral", peer: "Коллега" };

const vacancyStatusBadge = {
  new: "neutral",
  reviewing: "info",
  shortlisted: "success",
  rejected: "danger",
};

const personStatusBadge = {
  new: "neutral",
  researching: "info",
  contacted: "info",
  replied: "success",
  dropped: "neutral",
};

const hypothesisStatusBadge = {
  active: "info",
  done: "neutral",
};

const assessmentVerdictBadge = {
  apply: "success",
  maybe: "warning",
  skip: "danger",
};

const assessmentVerdictLabels = {
  apply: "Откликаться",
  maybe: "Подумать",
  skip: "Пропустить",
};

function indexAssessmentsByVacancy(items) {
  const byVacancy = new Map();
  for (const item of items || []) {
    const vacancyId = item.vacancy?.id;
    if (!vacancyId) continue;
    const current = byVacancy.get(vacancyId);
    if (!current || String(item.assessed_at || "") > String(current.assessed_at || "")) {
      byVacancy.set(vacancyId, item);
    }
  }
  return byVacancy;
}

function assessmentVerdictLabel(verdict) {
  return assessmentVerdictLabels[verdict] || verdict;
}

function renderVacancyAssessmentSummary(assessment) {
  if (!assessment) return "";
  const verdict = assessmentVerdictLabel(assessment.verdict);
  return `<div class="vacancy-assessment-summary">
    ${renderBadge(verdict, assessmentVerdictBadge[assessment.verdict] || "neutral")}
    <span class="assessment-score" aria-label="Релевантность">${escapeHtml(assessment.relevance_score)}</span>
  </div>`;
}

function renderVacancyAssessmentDetail(assessment) {
  if (!assessment) return "";
  return `<div class="row-detail__section vacancy-assessment-detail">
    <p class="row-detail__label">Оценка · ${escapeHtml(assessment.model)} · ${escapeHtml(assessment.prompt_version || "—")}</p>
    <p class="assessment-detail__reason">${escapeHtml(assessment.reason)}</p>
    ${assessment.risk ? `<p class="assessment-detail__risk"><span class="assessment-detail__label">Риск</span> ${escapeHtml(assessment.risk)}</p>` : ""}
    <p class="assessment-detail__action"><span class="assessment-detail__label">Действие</span> ${escapeHtml(assessment.action)}</p>
  </div>`;
}

function renderBadge(label, variant = "neutral") {
  return `<span class="badge badge--${variant}"><span class="badge__dot" aria-hidden="true"></span>${escapeHtml(label)}</span>`;
}

function setSectionCount(element, total) {
  element.textContent = total == null ? "—" : String(total);
}

function excerpt(text, maxLength = 120) {
  const value = String(text || "").trim();
  if (!value) return "Описание пока не добавлено.";
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trim()}…`;
}

async function startLiveReload() {
  let initialRevision;
  async function check() {
    try {
      const response = await fetch("/dev/revision", { cache: "no-store" });
      const payload = await response.json();
      if (!payload.enabled) return;
      if (initialRevision && payload.revision !== initialRevision) {
        window.location.reload();
        return;
      }
      initialRevision = payload.revision;
      window.setTimeout(check, 1000);
    } catch (_error) {
      window.setTimeout(check, 2000);
    }
  }
  await check();
}

function escapeHtml(value) {
  const node = document.createElement("span");
  node.textContent = value ?? "";
  return node.innerHTML;
}

let noticeDismissTimer;

function clearNotice() {
  if (noticeDismissTimer) {
    window.clearTimeout(noticeDismissTimer);
    noticeDismissTimer = undefined;
  }
  notice.hidden = true;
  notice.innerHTML = "";
  notice.className = "notice";
  notice.setAttribute("role", "status");
}

function showNotice(message, variant = "success") {
  const text = String(message ?? "").trim();
  if (!text) {
    clearNotice();
    return;
  }
  const labels = {
    success: "Успех",
    error: "Ошибка",
    info: "Инфо",
    warning: "Внимание",
  };
  const kind = labels[variant] ? variant : variant === true ? "error" : "success";
  clearNotice();
  notice.innerHTML = `<span class="notice__label">${escapeHtml(labels[kind] || labels.success)}</span><span class="notice__text">${escapeHtml(text)}</span>`;
  notice.className = `notice notice--${kind}`;
  notice.hidden = false;
  notice.setAttribute("role", kind === "error" ? "alert" : "status");
  noticeDismissTimer = window.setTimeout(clearNotice, 4500);
}

function renderState(target, { variant, title, detail, retryLabel, onRetry, actionButtonId, actionLabel }) {
  const loader = variant === "loading"
    ? `<span class="loader state__loader" aria-hidden="true"></span>`
    : "";
  const retry = retryLabel && onRetry
    ? `<div class="state__actions"><button class="btn btn--secondary btn--sm" type="button" data-state-retry>${escapeHtml(retryLabel)}</button></div>`
    : "";
  const action = actionButtonId && actionLabel
    ? `<div class="state__actions"><button class="btn btn--primary btn--sm" type="button" data-state-action="${escapeHtml(actionButtonId)}">${escapeHtml(actionLabel)}</button></div>`
    : "";
  const role = variant === "error" ? ' role="alert"' : "";
  const busy = variant === "loading" ? ' aria-busy="true"' : "";
  target.innerHTML = `<article class="state state--${variant}"${role}${busy}>
    ${loader}
    <div class="state__content">
      <h3 class="state__title">${escapeHtml(title)}</h3>
      ${detail ? `<p class="state__detail">${escapeHtml(detail)}</p>` : ""}
      ${retry}
      ${action}
    </div>
  </article>`;
  target.querySelector("[data-state-retry]")?.addEventListener("click", onRetry, { once: true });
  target.querySelector("[data-state-action]")?.addEventListener("click", () => {
    document.querySelector(`#${actionButtonId}`)?.click();
  });
}

function renderLoadingState(target, title, detail) {
  renderState(target, { variant: "loading", title, detail });
}

function renderEmptyState(target, title, detail, action) {
  renderState(target, {
    variant: "empty",
    title,
    detail,
    actionButtonId: action?.buttonId,
    actionLabel: action?.label,
  });
}

function renderErrorState(target, title, detail, onRetry) {
  renderState(target, {
    variant: "error",
    title,
    detail,
    retryLabel: onRetry ? "Повторить" : null,
    onRetry,
  });
}

function setButtonProcessing(button, active, busyLabel, idleLabel) {
  if (!button) return;
  button.disabled = active;
  button.classList.toggle("is-processing", active);
  if (busyLabel && idleLabel) button.textContent = active ? busyLabel : idleLabel;
}

function inlineState(message, variant = "empty") {
  return `<p class="inline-state inline-state--${variant}">${escapeHtml(message)}</p>`;
}

function renderEvidencePerson(person, report) {
  const proposed = person.status === "proposed" && person.id && report?.report_id;
  const confirmControl = proposed
    ? `<button class="btn btn--secondary btn--sm" type="button" data-confirm data-report-id="${escapeHtml(report.report_id)}" data-person-id="${escapeHtml(person.id)}">Подтвердить в Core</button>`
    : person.status === "confirmed"
      ? renderBadge("В Core", "success")
      : "";
  return `<div class="evidence-item">
    <div class="evidence-item__head">
      <strong>${escapeHtml(person.full_name)}</strong>
      <span>${escapeHtml(person.title || "Роль не определена")}</span>
    </div>
    <p class="evidence-item__excerpt">${escapeHtml(person.evidence_excerpt || "Фрагмент источника недоступен")}</p>
    <div class="evidence-item__foot">
      <a class="inline-link" href="${escapeHtml(person.source_url)}" target="_blank" rel="noreferrer">${escapeHtml(person.source)} · ${escapeHtml(formatDate(person.observed_at))} ↗</a>
      ${confirmControl}
    </div>
  </div>`;
}

function renderMirrorItem(mirror, item) {
  return `<div class="evidence-item">
    <div class="evidence-item__head">
      <strong>${escapeHtml(mirror.title || item.title)}</strong>
      <span>score ${escapeHtml(String(mirror.score ?? "—"))}</span>
    </div>
    <p class="evidence-item__excerpt">${escapeHtml((mirror.reasons || []).join(", ") || "Совпадение по названию на career-странице")}</p>
    <a class="inline-link" href="${escapeHtml(mirror.url)}" target="_blank" rel="noreferrer">Открыть зеркало · ${escapeHtml(formatDate(mirror.observed_at))} ↗</a>
  </div>`;
}

function vacancyRow(item) {
  const options = Object.entries(statusLabels)
    .map(([value, label]) => `<option value="${value}" ${value === item.status ? "selected" : ""}>${label}</option>`)
    .join("");
  const report = osintReports.find((candidate) => candidate.vacancy_id === item.id);
  const people = report?.people || [];
  const mirrorReport = mirrorReports.find((candidate) => candidate.vacancy_id === item.id);
  const mirrors = mirrorReport?.mirrors || [];
  const peopleHtml = people.length
    ? people.slice(0, 3).map((person) => renderEvidencePerson(person, report)).join("")
    : inlineState("Непроверенные контакты ещё не найдены.");
  const mirrorsHtml = mirrors.length
    ? mirrors.slice(0, 3).map((mirror) => renderMirrorItem(mirror, item)).join("")
    : inlineState("Зеркала вакансии ещё не найдены.");
  const researchButtons = item.company.website_url
    ? `<div class="row-detail__actions">
        <button class="btn btn--ghost btn--sm" data-research type="button">${report ? "Обновить контакты" : "Найти контакты"}</button>
        <button class="btn btn--ghost btn--sm" data-mirrors type="button">${mirrorReport ? "Обновить зеркала" : "Найти зеркала"}</button>
      </div>`
    : inlineState("Для поиска контактов и зеркал сначала нужен сайт компании.");
  const evidenceCount = people.length + mirrors.length;
  const assessment = assessmentsByVacancyId.get(item.id);
  const assessmentSummary = renderVacancyAssessmentSummary(assessment);
  const assessmentDetail = renderVacancyAssessmentDetail(assessment);
  const detailParts = [];
  if (evidenceCount) detailParts.push(`Контакты и зеркала · ${evidenceCount}`);
  else if (item.company.website_url) detailParts.push("OSINT и зеркала");
  if (assessment) detailParts.push("Оценка");
  const detailSummary = detailParts.join(" · ");
  const detailSections = [];
  if (item.company.website_url || evidenceCount) {
    detailSections.push(
      researchButtons,
      `<div class="row-detail__section">
        <p class="row-detail__label">Зеркала · не проверено</p>
        ${mirrorsHtml}
      </div>`,
      `<div class="row-detail__section">
        <p class="row-detail__label">Контакты · ${people.some((person) => person.status === "proposed") ? "не проверено" : "подтверждено"}</p>
        ${peopleHtml}
      </div>`,
    );
  }
  if (assessmentDetail) detailSections.push(assessmentDetail);
  const detailBlock = detailSummary
    ? `<details class="row-detail"${evidenceCount || assessment ? " open" : ""}>
        <summary class="row-detail__summary">${escapeHtml(detailSummary)}</summary>
        <div class="row-detail__body">
          ${detailSections.join("")}
        </div>
      </details>`
    : "";
  return `<article class="list-row-group" data-id="${escapeHtml(item.id)}">
    <div class="list-row">
      <div class="list-row__primary">
        <div class="list-row__identity">
          <h3 class="list-row__title">${escapeHtml(item.title)}</h3>
          <div class="list-row__badges">
            ${renderBadge(statusLabels[item.status] || item.status, vacancyStatusBadge[item.status] || "neutral")}
            ${renderBadge(item.source, "neutral")}
          </div>
        </div>
        <p class="list-row__secondary">${escapeHtml(item.company.name)} · ${escapeHtml(excerpt(item.description))}</p>
      </div>
      <div class="list-row__trailing">
        ${assessmentSummary}
        <div class="list-row__actions">
          <a class="btn btn--ghost btn--sm" href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">Открыть ↗</a>
          <label class="list-row__control"><span class="sr-only">Статус</span><select class="control control--select" data-status>${options}</select></label>
          <button class="btn btn--secondary btn--sm" data-apply type="button">Записать отклик</button>
        </div>
      </div>
    </div>
    ${detailBlock}
  </article>`;
}

function formatDate(value) {
  if (!value) return "Дата не указана";
  return new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function formatJournalDate(value) {
  if (!value) return { day: "—", time: "" };
  const date = new Date(value);
  return {
    day: new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" }).format(date).replace(/\.$/, ""),
    time: new Intl.DateTimeFormat("ru-RU", { hour: "2-digit", minute: "2-digit" }).format(date),
  };
}

function applicationRow(item) {
  const when = formatJournalDate(item.applied_at);
  return `<article class="list-row list-row--with-leading">
    <div class="list-row__leading">
      <time datetime="${escapeHtml(item.applied_at || "")}"><span class="journal-date__day">${escapeHtml(when.day)}</span><span class="journal-date__time">${escapeHtml(when.time)}</span></time>
    </div>
    <div class="list-row__primary">
      <div class="list-row__identity">
        <h3 class="list-row__title">${escapeHtml(item.vacancy.title)}</h3>
        ${renderBadge(item.source, "neutral")}
      </div>
      <p class="list-row__secondary">${escapeHtml(item.next_action || "Следующий шаг пока не указан.")}</p>
    </div>
    <div class="list-row__trailing">
      ${renderBadge("Отклик записан", "success")}
      <p class="list-row__meta">Резюме · <strong>${escapeHtml(item.resume_version || "—")}</strong></p>
    </div>
  </article>`;
}

const metricLabels = {
  views_new: "Новые просмотры",
  applications: "Отклики",
  replies: "Ответы",
  invitations: "Приглашения",
  rejections: "Отказы",
};

function metricValue(value) {
  return value ?? "—";
}

function metricsView(items) {
  const latest = items[0];
  const summary = Object.entries(metricLabels).map(([field, label]) => `
    <div class="metric-cell">
      <span class="metric-cell__label">${escapeHtml(label)}</span>
      <strong class="metric-cell__value">${escapeHtml(metricValue(latest[field]))}</strong>
    </div>`).join("");
  const maxApplications = Math.max(1, ...items.map((item) => item.applications || 0));
  const history = items.map((item) => {
    const width = Math.round(((item.applications || 0) / maxApplications) * 100);
    return `<article class="metric-history-row">
      <time datetime="${escapeHtml(item.metric_date)}">${escapeHtml(item.metric_date)}</time>
      <div class="metric-bar-track" aria-label="Откликов: ${escapeHtml(metricValue(item.applications))}">
        <span class="metric-bar" style="width:${width}%"></span>
      </div>
      <strong>${escapeHtml(metricValue(item.applications))}</strong>
      <span class="metric-row-detail">ответы ${escapeHtml(metricValue(item.replies))} · отказы ${escapeHtml(metricValue(item.rejections))}</span>
    </article>`;
  }).join("");
  return `<div class="surface surface--panel metric-latest">
      <div class="metric-latest-head"><div><p class="panel-eyebrow">Последний снимок</p><h3>${escapeHtml(latest.metric_date)}</h3></div><span>${escapeHtml(latest.notes || "Без заметки")}</span></div>
      <div class="metric-summary-grid">${summary}</div>
    </div>
    <div class="surface surface--panel metric-history"><h3 class="metric-panel__title">Отклики по дням</h3>${history}</div>`;
}

function personRow(item) {
  const options = Object.entries(personStatusLabels).map(([value, label]) => `<option value="${value}" ${value === item.status ? "selected" : ""}>${label}</option>`).join("");
  const profileLink = item.url ? `<a class="btn btn--ghost btn--sm" href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">Профиль ↗</a>` : "";
  const roleLabel = personRoleLabels[item.role] || item.role;
  return `<article class="list-row" data-person-id="${escapeHtml(item.id)}">
    <div class="list-row__primary">
      <div class="list-row__identity">
        <h3 class="list-row__title">${escapeHtml(item.full_name)}</h3>
        <div class="list-row__badges">
          ${renderBadge(roleLabel, "neutral")}
          ${renderBadge(personStatusLabels[item.status] || item.status, personStatusBadge[item.status] || "neutral")}
        </div>
      </div>
      <p class="list-row__secondary">${escapeHtml(item.company.name)} · ${escapeHtml(item.title || item.vacancy?.title || "Должность не указана")}${item.notes ? ` · ${escapeHtml(item.notes)}` : ""}</p>
    </div>
    <div class="list-row__trailing">
      <div class="list-row__actions">
        ${profileLink}
        <label class="list-row__control"><span class="sr-only">Статус контакта</span><select class="control control--select" data-person-status>${options}</select></label>
      </div>
      <p class="list-row__meta">${escapeHtml(item.source)}</p>
    </div>
  </article>`;
}

async function loadPeople() {
  peopleGrid.setAttribute("aria-busy", "true");
  renderLoadingState(peopleGrid, "Загружаем контакты", "Web запрашивает подтверждённые карточки у Core API.");
  try {
    const response = await fetch("/api/v1/people");
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message || "Не удалось получить контакты");
    setSectionCount(peopleCount, payload.total);
    peopleGrid.innerHTML = payload.total ? payload.items.map(personRow).join("") : "";
    if (!payload.total) {
      renderEmptyState(peopleGrid, "Контактов пока нет", "Добавьте подтверждённого человека к вакансии.", {
        buttonId: "open-person-form",
        label: "+ Добавить контакт",
      });
    }
  } catch (error) {
    setSectionCount(peopleCount, null);
    renderErrorState(peopleGrid, "Не удалось загрузить контакты", error.message, loadPeople);
  } finally { peopleGrid.setAttribute("aria-busy", "false"); }
}

function hypothesisRow(item) {
  const detail = [item.test_size ? `выборка ${item.test_size}` : null, item.metric].filter(Boolean).join(" · ");
  const isActive = item.status === "active";
  const statusLabel = isActive ? "Активна" : "Завершена";
  const secondary = [detail || "Метрика не указана", item.result || item.description].filter(Boolean).join(" · ");
  const action = isActive
    ? `<button class="btn btn--ghost btn--sm" data-close-hypothesis type="button">Зафиксировать результат</button>`
    : "";
  return `<article class="list-row" data-hypothesis-id="${escapeHtml(item.id)}">
    <div class="list-row__primary">
      <div class="list-row__identity">
        <h3 class="list-row__title">${escapeHtml(item.title)}</h3>
        <div class="list-row__badges">
          ${renderBadge(statusLabel, hypothesisStatusBadge[item.status] || "neutral")}
          ${renderBadge(item.source, "neutral")}
        </div>
      </div>
      <p class="list-row__secondary">${escapeHtml(secondary)}</p>
    </div>
    <div class="list-row__trailing">
      <div class="list-row__actions">${action}</div>
    </div>
  </article>`;
}

async function loadHypotheses() {
  hypothesisGrid.setAttribute("aria-busy", "true");
  renderLoadingState(hypothesisGrid, "Загружаем эксперименты", "Web запрашивает гипотезы у Core API.");
  try {
    const response = await fetch("/api/v1/hypotheses"); const payload = await response.json();
    if (!response.ok) throw new Error(payload.message || "Не удалось получить гипотезы");
    setSectionCount(hypothesisCount, payload.total);
    hypothesisGrid.innerHTML = payload.total ? payload.items.map(hypothesisRow).join("") : "";
    if (!payload.total) {
      renderEmptyState(hypothesisGrid, "Гипотез пока нет", "Сформулируйте первый измеримый эксперимент.", {
        buttonId: "open-hypothesis-form",
        label: "+ Новая гипотеза",
      });
    }
  } catch (error) {
    setSectionCount(hypothesisCount, null);
    renderErrorState(hypothesisGrid, "Не удалось загрузить гипотезы", error.message, loadHypotheses);
  } finally { hypothesisGrid.setAttribute("aria-busy", "false"); }
}

async function loadMetrics() {
  metricsDashboard.setAttribute("aria-busy", "true");
  renderLoadingState(metricsDashboard, "Загружаем показатели", "Web запрашивает историю у Core API.");
  try {
    const response = await fetch("/api/v1/metrics");
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message || "Не удалось получить метрики");
    setSectionCount(metricCount, payload.total);
    metricsDashboard.innerHTML = payload.total ? metricsView(payload.items) : "";
    if (!payload.total) {
      renderEmptyState(metricsDashboard, "Метрик пока нет", "Запишите первый дневной снимок.", {
        buttonId: "open-metric-form",
        label: "+ Записать день",
      });
    }
  } catch (error) {
    setSectionCount(metricCount, null);
    renderErrorState(metricsDashboard, "Не удалось загрузить метрики", error.message, loadMetrics);
  } finally {
    metricsDashboard.setAttribute("aria-busy", "false");
  }
}

async function loadApplications() {
  applicationList.setAttribute("aria-busy", "true");
  renderLoadingState(applicationList, "Загружаем отклики", "Web запрашивает журнал у Core API.");
  try {
    const response = await fetch("/api/v1/applications");
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message || "Не удалось получить отклики");
    setSectionCount(applicationCount, payload.total);
    if (payload.total) {
      applicationList.innerHTML = payload.items.map(applicationRow).join("");
    } else {
      applicationList.innerHTML = "";
      renderEmptyState(applicationList, "Откликов пока нет", "Запишите первый факт отклика из карточки вакансии.");
    }
  } catch (error) {
    setSectionCount(applicationCount, null);
    renderErrorState(applicationList, "Не удалось загрузить отклики", error.message, loadApplications);
  } finally {
    applicationList.setAttribute("aria-busy", "false");
  }
}

async function loadVacancies() {
  grid.setAttribute("aria-busy", "true");
  renderLoadingState(grid, "Загружаем вакансии", "Web запрашивает данные у Core API.");
  try {
    const response = await fetch("/api/v1/vacancies");
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message || "Не удалось получить вакансии");
    setSectionCount(count, payload.total);
    signal.classList.add("online");
    signal.classList.remove("offline");
    connectionLabel.textContent = "Core доступен";
    knownVacancies = payload.items;
    try {
      const [osintResponse, mirrorResponse, assessmentsResponse] = await Promise.all([
        fetch("/api/v1/osint/people-proposals"),
        fetch("/api/v1/osint/vacancy-mirrors"),
        fetch("/api/v1/assessments"),
      ]);
      const osintPayload = await osintResponse.json();
      const mirrorPayload = await mirrorResponse.json();
      osintReports = osintResponse.ok ? osintPayload.items : [];
      mirrorReports = mirrorResponse.ok ? mirrorPayload.items : [];
      if (assessmentsResponse.ok) {
        const assessmentsPayload = await assessmentsResponse.json();
        assessmentsByVacancyId = indexAssessmentsByVacancy(assessmentsPayload.items);
      } else {
        assessmentsByVacancyId = new Map();
      }
    } catch (_error) {
      osintReports = [];
      mirrorReports = [];
      assessmentsByVacancyId = new Map();
    }
    grid.innerHTML = payload.total
      ? payload.items.map(vacancyRow).join("")
      : "";
    if (!payload.total) {
      renderEmptyState(grid, "Вакансий пока нет", "Добавьте первую вакансию — она сохранится в Core.", {
        buttonId: "open-form",
        label: "+ Добавить вакансию",
      });
    }
  } catch (error) {
    setSectionCount(count, null);
    signal.classList.add("offline");
    signal.classList.remove("online");
    connectionLabel.textContent = "Core недоступен";
    assessmentsByVacancyId = new Map();
    renderErrorState(grid, "Не удалось загрузить вакансии", error.message, loadVacancies);
  } finally {
    grid.setAttribute("aria-busy", "false");
  }
}

document.querySelector("#open-form").addEventListener("click", () => dialog.showModal());
document.querySelector("#close-form").addEventListener("click", () => dialog.close());
document.querySelector("#cancel-form").addEventListener("click", () => dialog.close());

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  formError.hidden = true;
  setButtonProcessing(submitButton, true, "Сохраняем…", "Сохранить");
  const values = Object.fromEntries(new FormData(form));
  const identity = crypto.randomUUID();
  values.company_external_id = `${values.source}-${values.company_name.toLowerCase().replace(/[^a-z0-9а-я]+/giu, "-")}`;
  values.external_id = identity;
  try {
    const response = await fetch("/api/v1/vacancies", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Idempotency-Key": identity },
      body: JSON.stringify(values),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message || "Вакансия не сохранена");
    dialog.close();
    form.reset();
    form.elements.source.value = "manual";
    showNotice("Вакансия сохранена в Core");
    await loadVacancies();
  } catch (error) {
    formError.textContent = error.message;
    formError.hidden = false;
  } finally {
    setButtonProcessing(submitButton, false, "Сохраняем…", "Сохранить");
  }
});

grid.addEventListener("change", async (event) => {
  const select = event.target.closest("[data-status]");
  if (!select) return;
  const card = select.closest("[data-id]");
  select.disabled = true;
  try {
    const response = await fetch(`/api/v1/vacancies/${card.dataset.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: select.value }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message || "Статус не изменён");
    showNotice(`Статус: ${statusLabels[payload.status]}`);
    await loadVacancies();
  } catch (error) {
    showNotice(error.message, "error");
    await loadVacancies();
  } finally {
    select.disabled = false;
  }
});

grid.addEventListener("click", async (event) => {
  const confirmButton = event.target.closest("[data-confirm]");
  if (confirmButton) {
    confirmButton.disabled = true;
    confirmButton.textContent = "Подтверждаем…";
    try {
      const response = await fetch("/api/v1/osint/people-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          report_id: confirmButton.dataset.reportId,
          person_id: confirmButton.dataset.personId,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "Подтверждение не выполнено");
      const name = payload.person?.full_name || payload.core_person?.full_name || "контакт";
      showNotice(`В Core: ${name}`);
      await Promise.all([loadVacancies(), loadPeople()]);
    } catch (error) {
      showNotice(error.message, "error");
      confirmButton.disabled = false;
      confirmButton.textContent = "Подтвердить в Core";
    }
    return;
  }
  const researchButton = event.target.closest("[data-research]");
  if (researchButton) {
    const card = researchButton.closest("[data-id]");
    const vacancy = knownVacancies.find((item) => item.id === card.dataset.id);
    researchButton.disabled = true;
    researchButton.classList.add("is-processing");
    researchButton.textContent = "Ищем…";
    try {
      const response = await fetch("/api/v1/osint/people-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: vacancy.company.id,
          vacancy_id: vacancy.id,
          company_name: vacancy.company.name,
          website_url: vacancy.company.website_url,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "Поиск контактов не выполнен");
      showNotice(`Поиск завершён: ${payload.people.length} контактов`);
      await loadVacancies();
    } catch (error) {
      showNotice(error.message, "error");
      researchButton.disabled = false;
      researchButton.classList.remove("is-processing");
      researchButton.textContent = "Повторить поиск";
    }
    return;
  }
  const mirrorButton = event.target.closest("[data-mirrors]");
  if (mirrorButton) {
    const card = mirrorButton.closest("[data-id]");
    const vacancy = knownVacancies.find((item) => item.id === card.dataset.id);
    mirrorButton.disabled = true;
    mirrorButton.classList.add("is-processing");
    mirrorButton.textContent = "Ищем…";
    try {
      const response = await fetch("/api/v1/osint/vacancy-mirrors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: vacancy.company.id,
          vacancy_id: vacancy.id,
          company_name: vacancy.company.name,
          website_url: vacancy.company.website_url,
          vacancy_title: vacancy.title,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "Поиск зеркал не выполнен");
      showNotice(`Зеркала: ${(payload.mirrors || []).length} найдено`);
      await loadVacancies();
    } catch (error) {
      showNotice(error.message, "error");
      mirrorButton.disabled = false;
      mirrorButton.classList.remove("is-processing");
      mirrorButton.textContent = "Повторить зеркала";
    }
    return;
  }
  const button = event.target.closest("[data-apply]");
  if (!button) return;
  const card = button.closest("[data-id]");
  applicationForm.reset();
  applicationForm.elements.source.value = "manual";
  applicationForm.elements.vacancy_id.value = card.dataset.id;
  applicationVacancyTitle.textContent = card.querySelector("h3").textContent;
  applicationFormError.hidden = true;
  applicationDialog.showModal();
});

document.querySelector("#close-application-form").addEventListener("click", () => applicationDialog.close());
document.querySelector("#cancel-application-form").addEventListener("click", () => applicationDialog.close());

applicationForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  applicationFormError.hidden = true;
  setButtonProcessing(applicationSubmitButton, true, "Сохраняем…", "Записать факт");
  const values = Object.fromEntries(new FormData(applicationForm));
  const identity = crypto.randomUUID();
  values.external_id = identity;
  for (const field of ["applied_at", "next_action_at"]) {
    if (values[field]) values[field] = new Date(values[field]).toISOString();
    else delete values[field];
  }
  for (const field of ["resume_version", "next_action", "cover_letter_text"]) {
    if (!values[field]) delete values[field];
  }
  try {
    const response = await fetch("/api/v1/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Idempotency-Key": identity },
      body: JSON.stringify(values),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message || "Отклик не записан");
    applicationDialog.close();
    showNotice("Факт отклика сохранён в Core");
    await loadApplications();
  } catch (error) {
    applicationFormError.textContent = error.message;
    applicationFormError.hidden = false;
  } finally {
    setButtonProcessing(applicationSubmitButton, false, "Сохраняем…", "Записать факт");
  }
});

document.querySelector("#open-metric-form").addEventListener("click", () => {
  metricForm.reset();
  metricForm.elements.metric_date.value = new Date().toISOString().slice(0, 10);
  metricFormError.hidden = true;
  metricDialog.showModal();
});
document.querySelector("#close-metric-form").addEventListener("click", () => metricDialog.close());
document.querySelector("#cancel-metric-form").addEventListener("click", () => metricDialog.close());

metricForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  metricFormError.hidden = true;
  setButtonProcessing(metricSubmitButton, true, "Сохраняем…", "Сохранить снимок");
  const values = Object.fromEntries(new FormData(metricForm));
  const metricDate = values.metric_date;
  for (const field of ["views_total", "views_new", "applications", "replies", "invitations", "rejections"]) {
    if (values[field] === "") delete values[field];
    else values[field] = Number(values[field]);
  }
  if (!values.notes) delete values.notes;
  if (Object.keys(values).length === 1) {
    metricFormError.textContent = "Укажите хотя бы один показатель или заметку";
    metricFormError.hidden = false;
    setButtonProcessing(metricSubmitButton, false, "Сохраняем…", "Сохранить снимок");
    return;
  }
  const identity = crypto.randomUUID();
  try {
    const response = await fetch(`/api/v1/metrics/${metricDate}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Idempotency-Key": identity },
      body: JSON.stringify(values),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message || "Метрики не сохранены");
    metricDialog.close();
    showNotice(`Метрики за ${payload.metric_date} сохранены`);
    await loadMetrics();
  } catch (error) {
    metricFormError.textContent = error.message;
    metricFormError.hidden = false;
  } finally {
    setButtonProcessing(metricSubmitButton, false, "Сохраняем…", "Сохранить снимок");
  }
});

document.querySelector("#open-person-form").addEventListener("click", () => {
  personForm.reset();
  personForm.elements.source.value = "manual";
  personForm.elements.vacancy_id.innerHTML = knownVacancies.map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.company.name)} — ${escapeHtml(item.title)}</option>`).join("");
  personFormError.hidden = true;
  if (!knownVacancies.length) { showNotice("Сначала добавьте вакансию с компанией", "error"); return; }
  personDialog.showModal();
});
document.querySelector("#close-person-form").addEventListener("click", () => personDialog.close());
document.querySelector("#cancel-person-form").addEventListener("click", () => personDialog.close());

personForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  personFormError.hidden = true;
  setButtonProcessing(personSubmitButton, true, "Сохраняем…", "Сохранить контакт");
  const values = Object.fromEntries(new FormData(personForm));
  const vacancy = knownVacancies.find((item) => item.id === values.vacancy_id);
  const identity = crypto.randomUUID();
  values.company_id = vacancy.company.id;
  values.external_id = identity;
  if (values.confidence === "") delete values.confidence;
  else values.confidence = Number(values.confidence);
  for (const field of ["title", "url", "notes"]) if (!values[field]) delete values[field];
  try {
    const response = await fetch("/api/v1/people", { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": identity }, body: JSON.stringify(values) });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message || "Контакт не сохранён");
    personDialog.close();
    showNotice("Подтверждённый контакт сохранён в Core");
    await loadPeople();
  } catch (error) {
    personFormError.textContent = error.message;
    personFormError.hidden = false;
  } finally {
    setButtonProcessing(personSubmitButton, false, "Сохраняем…", "Сохранить контакт");
  }
});

peopleGrid.addEventListener("change", async (event) => {
  const select = event.target.closest("[data-person-status]");
  if (!select) return;
  const card = select.closest("[data-person-id]");
  select.disabled = true;
  try {
    const response = await fetch(`/api/v1/people/${card.dataset.personId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: select.value }) });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message || "Статус контакта не изменён");
    showNotice(`Локальный статус: ${personStatusLabels[payload.status]}`);
    await loadPeople();
  } catch (error) {
    showNotice(error.message, "error");
    await loadPeople();
  } finally { select.disabled = false; }
});

document.querySelector("#open-hypothesis-form").addEventListener("click", () => {
  hypothesisForm.reset(); hypothesisForm.elements.source.value = "manual";
  hypothesisFormError.hidden = true; hypothesisDialog.showModal();
});
document.querySelector("#close-hypothesis-form").addEventListener("click", () => hypothesisDialog.close());
document.querySelector("#cancel-hypothesis-form").addEventListener("click", () => hypothesisDialog.close());
hypothesisForm.addEventListener("submit", async (event) => {
  event.preventDefault(); hypothesisFormError.hidden = true;
  const values = Object.fromEntries(new FormData(hypothesisForm)); const identity = crypto.randomUUID();
  values.external_id = identity; if (values.test_size) values.test_size = Number(values.test_size); else delete values.test_size;
  for (const field of ["description", "metric"]) if (!values[field]) delete values[field];
  try { const response = await fetch("/api/v1/hypotheses", {method: "POST", headers: {"Content-Type": "application/json", "Idempotency-Key": identity}, body: JSON.stringify(values)});
    const payload = await response.json(); if (!response.ok) throw new Error(payload.message || "Гипотеза не сохранена");
    hypothesisDialog.close(); showNotice("Эксперимент сохранён в Core"); await loadHypotheses();
  } catch (error) { hypothesisFormError.textContent = error.message; hypothesisFormError.hidden = false; }
});
hypothesisGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-close-hypothesis]"); if (!button) return;
  const card = button.closest("[data-hypothesis-id]"); hypothesisCloseForm.reset();
  hypothesisCloseForm.elements.hypothesis_id.value = card.dataset.hypothesisId;
  document.querySelector("#hypothesis-close-context").textContent = card.querySelector("h3").textContent;
  hypothesisCloseError.hidden = true; hypothesisCloseDialog.showModal();
});
document.querySelector("#close-hypothesis-close").addEventListener("click", () => hypothesisCloseDialog.close());
document.querySelector("#cancel-hypothesis-close").addEventListener("click", () => hypothesisCloseDialog.close());
hypothesisCloseForm.addEventListener("submit", async (event) => {
  event.preventDefault(); hypothesisCloseError.hidden = true; const values = Object.fromEntries(new FormData(hypothesisCloseForm));
  try { const response = await fetch(`/api/v1/hypotheses/${values.hypothesis_id}/close`, {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({result: values.result})});
    const payload = await response.json(); if (!response.ok) throw new Error(payload.message || "Результат не сохранён");
    hypothesisCloseDialog.close(); showNotice("Результат эксперимента зафиксирован"); await loadHypotheses();
  } catch (error) { hypothesisCloseError.textContent = error.message; hypothesisCloseError.hidden = false; }
});

const HH_STATUS_LABELS = {
  connected: "Подключено",
  not_authorized: "Нужна авторизация",
  expired: "Сессия истекла",
  action_required: "Требуется действие",
  unavailable: "Недоступно",
};

const HH_ACTION_LABELS = {
  open_login: "Войти в HeadHunter",
  confirm_login: "Я вошёл — показать резюме",
  acquire_token: "Получить токен",
  reconnect: "Войти снова",
};

function clearHhAccountLabel() {
  hhAccountLabel.hidden = true;
  hhAccountLabel.textContent = "";
  hhAccountLabel.removeAttribute("title");
}

function renderHhAccount(payload) {
  clearHhAccountLabel();
  if (!payload || payload.status !== "available" || !payload.account) return;
  const account = payload.account;
  const label = account.display_name || account.email || "";
  if (!label) return;
  hhAccountLabel.hidden = false;
  hhAccountLabel.textContent = label;
  if (account.email && account.display_name) {
    hhAccountLabel.title = account.email;
  }
}

function renderHhConnection(payload) {
  const status = payload.status || "unavailable";
  hhConnection.dataset.status = status;
  hhConnectionLabel.textContent = HH_STATUS_LABELS[status] || status;
  const actionCode = payload.action && payload.action.code ? payload.action.code : "none";
  if (actionCode === "none" || !HH_ACTION_LABELS[actionCode]) {
    hhConnectionAction.hidden = true;
    hhConnectionAction.dataset.action = "";
    hhConnectionAction.dataset.novncUrl = "";
  } else {
    hhConnectionAction.hidden = false;
    hhConnectionAction.textContent = HH_ACTION_LABELS[actionCode];
    hhConnectionAction.dataset.action = actionCode;
    hhConnectionAction.dataset.novncUrl = (payload.action && payload.action.novnc_url) || "";
  }
}

async function loadHhAccount() {
  clearHhAccountLabel();
  try {
    const response = await fetch("/api/v1/hh/account");
    const payload = await response.json();
    if (!response.ok && payload.status !== "unavailable" && payload.status !== "not_authorized") {
      return;
    }
    renderHhAccount(payload);
  } catch (_error) {
    clearHhAccountLabel();
  }
}

function setHhResumesActions({ open = false, confirm = false, novncUrl = "" } = {}) {
  if (!hhResumesActions) return;
  const showAny = Boolean(open || confirm);
  hhResumesActions.hidden = !showAny;
  if (hhResumesOpen) {
    hhResumesOpen.hidden = !open;
    hhResumesOpen.dataset.novncUrl = novncUrl || "";
  }
  if (hhResumesConfirm) {
    hhResumesConfirm.hidden = !confirm;
    hhResumesConfirm.dataset.novncUrl = novncUrl || "";
  }
}

function clearHhResumes() {
  if (!hhResumes) return;
  hhResumes.hidden = true;
  hhResumesStatus.textContent = "";
  hhResumesList.innerHTML = "";
  setHhResumesActions({ open: false, confirm: false, novncUrl: "" });
}

function renderHhResumes(payload) {
  if (!hhResumes) return;
  clearHhResumes();
  hhResumes.hidden = false;
  const status = payload && payload.status ? payload.status : "unavailable";
  const actionCode = payload && payload.action && payload.action.code ? payload.action.code : "none";
  const novncUrl = payload && payload.action ? payload.action.novnc_url || "" : "";
  const code = payload && payload.code ? String(payload.code) : "";

  if (status === "available") {
    const items = Array.isArray(payload.items) ? payload.items : [];
    if (!items.length) {
      hhResumesStatus.textContent = "Пока нет резюме в аккаунте";
      return;
    }
    hhResumesStatus.textContent = "";
    for (const item of items) {
      if (!item || !item.title) continue;
      const li = document.createElement("li");
      li.textContent = item.title;
      hhResumesList.appendChild(li);
    }
    return;
  }

  if (status === "permission_blocked") {
    hhResumesStatus.textContent = "HeadHunter не дал доступ к списку резюме.";
    return;
  }

  if (
    status === "not_authorized" ||
    status === "action_required" ||
    actionCode === "open_login" ||
    actionCode === "confirm_login" ||
    code === "profile_locked" ||
    code === "browser_session_not_logged_in" ||
    code === "browser_login_required"
  ) {
    const waitingConfirm = actionCode === "confirm_login" || code === "profile_locked";
    if (waitingConfirm) {
      hhResumesStatus.textContent =
        "Нужен вход в HeadHunter. Если окно входа не видно — нажмите «Войти в HeadHunter». После входа нажмите «Я вошёл — показать резюме».";
      setHhResumesActions({ open: true, confirm: true, novncUrl });
      return;
    }
    hhResumesStatus.textContent =
      "Чтобы показать ваши резюме, войдите в HeadHunter. Нажмите кнопку ниже.";
    setHhResumesActions({ open: true, confirm: false, novncUrl });
    return;
  }

  hhResumesStatus.textContent = "Список резюме сейчас недоступен.";
}

async function loadHhResumes() {
  clearHhResumes();
  try {
    const response = await fetch("/api/v1/hh/resumes");
    const payload = await response.json();
    renderHhResumes(payload.status ? payload : { status: "unavailable", items: [] });
  } catch (_error) {
    renderHhResumes({ status: "unavailable", items: [] });
  }
}

async function loadHhConnection() {
  hhConnection.dataset.status = "unknown";
  hhConnectionLabel.textContent = "Проверяем";
  hhConnectionAction.hidden = true;
  clearHhAccountLabel();
  clearHhResumes();
  try {
    const response = await fetch("/api/v1/hh/connection");
    const payload = await response.json();
    if (!response.ok && payload.status !== "unavailable") {
      throw new Error(payload.message || "Не удалось получить статус HH");
    }
    renderHhConnection(payload.status ? payload : { status: "unavailable", action: { code: "none" } });
    if (payload.status === "connected") {
      await loadHhAccount();
    }
    await loadHhResumes();
  } catch (error) {
    renderHhConnection({ status: "unavailable", action: { code: "none" } });
  }
}

async function runHhLoginAction(action, novncUrl, button) {
  if (button) button.disabled = true;
  try {
    if (action === "open_login" || action === "reconnect") {
      const response = await fetch("/api/v1/hh/connection/open-login", { method: "POST" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || payload.code || "Не удалось открыть вход");
      const url = novncUrl || payload.novnc_url || "http://127.0.0.1:6080/";
      const opened = window.open(url, "_blank", "noopener");
      if (hhResumes) {
        hhResumes.hidden = false;
        if (!opened) {
          hhResumesStatus.textContent =
            "Браузер заблокировал всплывающее окно. Разрешите всплывающие окна для Job Search и снова нажмите «Войти в HeadHunter».";
          setHhResumesActions({ open: true, confirm: true, novncUrl: url });
          showNotice("Разрешите всплывающие окна, затем снова нажмите «Войти в HeadHunter».");
        } else {
          hhResumesStatus.textContent =
            "Откройте вкладку входа HeadHunter, войдите в аккаунт, затем вернитесь сюда и нажмите «Я вошёл — показать резюме».";
          setHhResumesActions({ open: true, confirm: true, novncUrl: url });
          showNotice("Войдите в HeadHunter во вкладке входа, затем нажмите «Я вошёл — показать резюме».");
        }
      }
      return;
    }
    if (action === "confirm_login") {
      const response = await fetch("/api/v1/hh/connection/confirm", { method: "POST" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || payload.code || "Не удалось подтвердить вход");
      showNotice("Вход сохранён. Обновляем список резюме…");
      await loadHhConnection();
      return;
    }
    if (action === "acquire_token") {
      showNotice("Для этого шага нужна помощь разработчика (OAuth-токен).");
    }
    await loadHhConnection();
  } catch (error) {
    showNotice(error.message || "Действие HeadHunter не выполнено");
    await loadHhConnection();
  } finally {
    if (button) button.disabled = false;
  }
}

hhConnectionAction.addEventListener("click", async () => {
  await runHhLoginAction(
    hhConnectionAction.dataset.action,
    hhConnectionAction.dataset.novncUrl,
    hhConnectionAction
  );
});

if (hhResumesOpen) {
  hhResumesOpen.addEventListener("click", async () => {
    await runHhLoginAction("open_login", hhResumesOpen.dataset.novncUrl, hhResumesOpen);
  });
}
if (hhResumesConfirm) {
  hhResumesConfirm.addEventListener("click", async () => {
    await runHhLoginAction("confirm_login", hhResumesConfirm.dataset.novncUrl, hhResumesConfirm);
  });
}

clearNotice();
initNavigation();
loadHhConnection();
loadVacancies();
loadApplications();
loadMetrics();
loadPeople();
loadHypotheses();
startLiveReload();
