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
const hhResumeContent = document.querySelector("#hh-resume-content");
const hhResumeWorking = document.querySelector("#hh-resume-working");
const hhResumeSyncState = document.querySelector("#hh-resume-sync-state");
const hhResumeSync = document.querySelector("#hh-resume-sync");
const hhResumesList = document.querySelector("#hh-resumes-list");
const hhResumesActions = document.querySelector("#hh-resumes-actions");
const hhResumesOpen = document.querySelector("#hh-resumes-open");
const hhResumesConfirm = document.querySelector("#hh-resumes-confirm");
const hhResumesClear = document.querySelector("#hh-resumes-clear");
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
  new: "accent",
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
  return `<article class="list-row-group list-row-group--vacancy" data-id="${escapeHtml(item.id)}" data-status="${escapeHtml(item.status)}">
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
        <p class="list-row__meta">Получена: ${escapeHtml(formatFirstSeen(item.first_seen_at))}</p>
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

function formatFirstSeen(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const time = new Intl.DateTimeFormat("ru-RU", { hour: "2-digit", minute: "2-digit" }).format(date);
  return `${day}.${month}.${year}, ${time}`;
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

/* --- Vacancy search (R2.2.5 corrected: resume_suitable primary) --- */

let vacancySearchRunning = false;
let vacancyListFilter = { text: "", status: "" };
let vacancyListSort = "first_seen_desc";

const SEARCH_RECOVERY = {
  browser_login_required: "Нужно войти в HeadHunter",
  browser_session_not_logged_in: "Нужно войти в HeadHunter",
  not_authorized: "Нужно войти в HeadHunter",
  browser_captcha_or_action_required: "HeadHunter требует действие в браузере",
  action_required: "HeadHunter требует действие в браузере",
  profile_locked: "Профиль браузера HeadHunter сейчас занят",
  transport_unavailable: "HeadHunter сейчас недоступен",
  browser_vacancy_read_failed: "HeadHunter сейчас недоступен",
  search_page_failed: "Не удалось получить результаты поиска",
  page_parse_failed: "Не удалось разобрать страницу поиска",
  vacancy_detail_failed: "Не удалось открыть часть вакансий",
  core_ingest_failed: "Не удалось сохранить часть вакансий",
  partial_pagination: "Проверка завершена не полностью",
  resume_search_page_mismatch: "Страница подходящих вакансий не подтверждена",
  active_resume_required: "Нужно выбрать рабочее резюме HeadHunter",
  hh_unavailable: "HeadHunter сейчас недоступен",
};

function humanRecovery(code) {
  if (!code) return "";
  return SEARCH_RECOVERY[code] || "Проверка завершилась с ошибкой";
}

function setSuitableStatus(message, { running = false, error = false } = {}) {
  const status = document.querySelector("#suitable-status");
  if (!status) return;
  status.textContent = message || "";
  status.classList.toggle("is-running", Boolean(running));
  status.classList.toggle("is-error", Boolean(error));
}

function setSuitableRunning(running) {
  vacancySearchRunning = running;
  const button = document.querySelector("#suitable-run");
  if (button) {
    button.disabled = running;
    button.textContent = running ? "Проверяем…" : "Проверить подходящие";
  }
}

function renderSuitableSummary(run, { sourceTotal, resumeTitle } = {}) {
  const last = document.querySelector("#suitable-last");
  const body = document.querySelector("#suitable-last-body");
  const totalLine = document.querySelector("#suitable-total-line");
  const resumeLine = document.querySelector("#suitable-resume-line");
  if (resumeLine && resumeTitle) {
    resumeLine.textContent = `Рабочее резюме: ${resumeTitle}`;
  }
  const total = sourceTotal ?? run?.source_total;
  if (totalLine) {
    if (total != null && total !== "") {
      totalLine.hidden = false;
      totalLine.textContent = `HH предлагает: ${Number(total).toLocaleString("ru-RU")}`;
    }
  }
  if (!last || !body || !run) return;
  const when = formatDate(run.finished_at || run.started_at);
  const status = String(run.status || "");
  const processed = Number(run.found_count || 0);
  const created = Number(run.created_count || 0);
  const updated = Number(run.updated_count || 0);
  const unchanged = Number(run.unchanged_count || 0);
  const recovery = humanRecovery(run.error_code);
  let headline = "Последняя проверка";
  if (status === "running") headline = "Проверяем подходящие вакансии…";
  else if (status === "success" && processed === 0) headline = "По вашему резюме подходящих вакансий в этой проверке нет";
  else if (status === "success") headline = "Проверка завершена";
  else if (status === "partial") headline = "Проверка завершена не полностью";
  else if (status === "failed") headline = recovery || "Проверка не удалась";
  const counts =
    status === "failed" && processed === 0
      ? ""
      : `Проверено: ${processed}. Новых: ${created}. Обновлено: ${updated}. Уже в базе: ${unchanged}.`;
  const extra = status === "partial" && recovery ? recovery : "";
  last.hidden = false;
  body.textContent = [headline, counts, extra, when].filter(Boolean).join(" · ");
}

function vacancyPassesFilter(item) {
  const status = vacancyListFilter.status;
  if (status && item.status !== status) return false;
  const text = (vacancyListFilter.text || "").trim().toLowerCase();
  if (!text) return true;
  const blob = [
    item.title,
    item.company?.name,
    item.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return blob.includes(text);
}

function compareVacanciesByFirstSeen(a, b, ascending) {
  const ta = Date.parse(a.first_seen_at || a.created_at || "");
  const tb = Date.parse(b.first_seen_at || b.created_at || "");
  const safeA = Number.isNaN(ta) ? 0 : ta;
  const safeB = Number.isNaN(tb) ? 0 : tb;
  return ascending ? safeA - safeB : safeB - safeA;
}

function sortVacancyItems(items) {
  const ascending = vacancyListSort === "first_seen_asc";
  return [...items].sort((a, b) => compareVacanciesByFirstSeen(a, b, ascending));
}

function renderVacancyList(items) {
  const filtered = items.filter(vacancyPassesFilter);
  const sorted = sortVacancyItems(filtered);
  setSectionCount(count, items.length);
  grid.innerHTML = sorted.length ? sorted.map(vacancyRow).join("") : "";
  if (!items.length) {
    renderEmptyState(grid, "Вакансий пока нет", "Проверьте подходящие вакансии по рабочему резюме или добавьте вручную.", {
      buttonId: "suitable-run",
      label: "Проверить подходящие",
    });
  } else if (!filtered.length) {
    renderEmptyState(grid, "Ничего не найдено в фильтре", "Сбросьте фильтр списка, чтобы снова увидеть все вакансии.");
  }
}

async function loadVacancies() {
  grid.setAttribute("aria-busy", "true");
  if (!vacancySearchRunning) {
    renderLoadingState(grid, "Загружаем вакансии", "Web запрашивает данные у Core API.");
  }
  try {
    const response = await fetch("/api/v1/vacancies");
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message || "Не удалось получить вакансии");
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
    renderVacancyList(knownVacancies);
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

async function loadActiveResumeLine() {
  const resumeLine = document.querySelector("#suitable-resume-line");
  if (!resumeLine) return null;
  try {
    const response = await fetch("/api/v1/hh/resumes");
    const payload = await response.json();
    const active = payload.active_resume;
    if (response.ok && active?.title) {
      resumeLine.textContent = `Рабочее резюме: ${active.title}`;
      return active;
    }
    if (response.ok && active?.external_id) {
      resumeLine.textContent = "Рабочее резюме: выбрано";
      return active;
    }
    resumeLine.textContent = "Рабочее резюме: не выбрано";
  } catch (_error) {
    resumeLine.textContent = "Рабочее резюме: недоступно";
  }
  return null;
}

async function loadLatestSuitableRun() {
  const response = await fetch("/api/v1/search-runs");
  const payload = await response.json();
  if (!response.ok || !payload.items?.length) return;
  const latest = payload.items.find((item) => item.acquisition_kind === "resume_suitable") || null;
  if (!latest) return;
  const title = latest.candidate_context_snapshot?.hh_resume_title;
  renderSuitableSummary(latest, { sourceTotal: latest.source_total, resumeTitle: title });
  if (latest.status === "running") {
    setSuitableRunning(true);
    setSuitableStatus("Проверяем подходящие вакансии…", { running: true });
  }
}

async function runSuitableSearch() {
  if (vacancySearchRunning) return;
  setSuitableRunning(true);
  setSuitableStatus("Проверяем подходящие вакансии… Это может занять несколько минут.", { running: true });
  try {
    const response = await fetch("/api/v1/hh/vacancies/suitable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        execution: { order: "publication_time", max_pages: 1 },
      }),
    });
    const payload = await response.json();
    const run = payload.search_run || null;
    const resumeTitle =
      payload.candidate_context?.hh_resume_title ||
      run?.candidate_context_snapshot?.hh_resume_title;
    if (run) {
      renderSuitableSummary(run, {
        sourceTotal: payload.source_total ?? run.source_total,
        resumeTitle,
      });
    }
    if (!response.ok && !run) {
      setSuitableStatus(humanRecovery(payload.code) || payload.message || "Проверка не удалась", {
        error: true,
      });
      return;
    }
    const status = String(run?.status || payload.status || "");
    if (status === "failed") {
      setSuitableStatus(humanRecovery(run?.error_code || payload.code) || "Проверка не удалась", {
        error: true,
      });
    } else if (status === "partial") {
      setSuitableStatus("Проверка завершена не полностью");
    } else if (status === "success" && Number(run?.found_count || 0) === 0) {
      setSuitableStatus("В этой проверке подходящих вакансий нет");
    } else {
      setSuitableStatus("Проверка завершена");
    }
    await loadVacancies();
  } catch (error) {
    setSuitableStatus(error.message || "Проверка не удалась", { error: true });
  } finally {
    setSuitableRunning(false);
  }
}

function initVacancySearchTabs() {
  document.querySelectorAll("[data-search-tab]").forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.searchTab;
      document.querySelectorAll("[data-search-tab]").forEach((node) => {
        const active = node.dataset.searchTab === target;
        node.classList.toggle("is-active", active);
        node.setAttribute("aria-selected", active ? "true" : "false");
      });
      document.querySelectorAll("[data-search-panel]").forEach((panel) => {
        panel.hidden = panel.dataset.searchPanel !== target;
      });
    });
  });
}

function initVacancyListFilter() {
  const text = document.querySelector("#vacancy-filter-text");
  const status = document.querySelector("#vacancy-filter-status");
  const sort = document.querySelector("#vacancy-list-sort");
  const apply = () => {
    vacancyListFilter = {
      text: text?.value || "",
      status: status?.value || "",
    };
    vacancyListSort = sort?.value || "first_seen_desc";
    if (knownVacancies?.length) renderVacancyList(knownVacancies);
  };
  text?.addEventListener("input", apply);
  status?.addEventListener("change", apply);
  sort?.addEventListener("change", apply);
}

function initVacancySearch() {
  initVacancySearchTabs();
  initVacancyListFilter();
  const button = document.querySelector("#suitable-run");
  if (button) {
    button.addEventListener("click", () => {
      void runSuitableSearch();
    });
  }
  void (async () => {
    await loadActiveResumeLine();
    try {
      await loadLatestSuitableRun();
    } catch (_error) {
      // latest run is optional on first visit
    }
  })();
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
  available: "Доступно",
  permission_blocked: "Ограничение HH",
};

const HH_ACTION_LABELS = {
  open_login: "Войти в HeadHunter",
  confirm_login: "Я вошёл — показать резюме",
  acquire_token: "Получить токен",
  reconnect: "Войти снова",
};

const HH_RECOVERY_ACCOUNT_LABELS = {
  reauth: "Аккаунт: нужна повторная авторизация",
  captcha_or_action_required: "Аккаунт: требуется действие на стороне HH",
  external_limitation: "Аккаунт: доступ ограничен HeadHunter",
  local_egress_unavailable: "Аккаунт: локальный сетевой выход недоступен",
  network_failure: "Аккаунт: временно недоступен",
};

function recoveryKind(payload) {
  return payload && payload.recovery && payload.recovery.kind
    ? String(payload.recovery.kind)
    : "none";
}

function clearHhAccountLabel() {
  hhAccountLabel.hidden = true;
  hhAccountLabel.textContent = "";
  hhAccountLabel.removeAttribute("title");
}

function renderHhAccount(payload) {
  clearHhAccountLabel();
  if (!payload) return;
  if (payload.status === "available" && payload.account) {
    const account = payload.account;
    const label = account.display_name || account.email || "";
    if (!label) return;
    hhAccountLabel.hidden = false;
    hhAccountLabel.textContent = label;
    if (account.email && account.display_name) {
      hhAccountLabel.title = account.email;
    }
    return;
  }
  const kind = recoveryKind(payload);
  const fallback =
    payload.status === "permission_blocked"
      ? HH_RECOVERY_ACCOUNT_LABELS.external_limitation
      : payload.status === "expired" || payload.status === "not_authorized"
        ? HH_RECOVERY_ACCOUNT_LABELS.reauth
        : payload.status === "action_required"
          ? HH_RECOVERY_ACCOUNT_LABELS.captcha_or_action_required
          : payload.status === "unavailable"
            ? kind === "local_egress_unavailable"
              ? HH_RECOVERY_ACCOUNT_LABELS.local_egress_unavailable
              : HH_RECOVERY_ACCOUNT_LABELS.network_failure
            : "";
  const text = HH_RECOVERY_ACCOUNT_LABELS[kind] || fallback;
  if (!text) return;
  hhAccountLabel.hidden = false;
  hhAccountLabel.textContent = text;
}

function renderHhConnection(payload) {
  const status = payload.status || "unavailable";
  hhConnection.dataset.status = status;
  hhConnectionLabel.textContent = HH_STATUS_LABELS[status] || status;
  const actionCode = payload.action && payload.action.code ? payload.action.code : "none";
  // Login / confirm for resumes lives in the «Резюме HH» strip — do not duplicate
  // the same CTA in the header. Token acquire + reconnect stay in the header.
  let headerAction = "none";
  if (actionCode === "acquire_token") {
    headerAction = "acquire_token";
  } else if (actionCode === "reconnect" || status === "expired") {
    headerAction = "reconnect";
  }
  if (!HH_ACTION_LABELS[headerAction]) {
    hhConnectionAction.hidden = true;
    hhConnectionAction.dataset.action = "";
    hhConnectionAction.dataset.novncUrl = "";
    return;
  }
  hhConnectionAction.hidden = false;
  hhConnectionAction.textContent = HH_ACTION_LABELS[headerAction];
  hhConnectionAction.dataset.action = headerAction;
  hhConnectionAction.dataset.novncUrl = (payload.action && payload.action.novnc_url) || "";
}

async function loadHhAccount() {
  clearHhAccountLabel();
  try {
    const response = await fetch("/api/v1/hh/account");
    const payload = await response.json();
    renderHhAccount(payload.status ? payload : { status: "unavailable" });
  } catch (_error) {
    clearHhAccountLabel();
  }
}

let hhResumesRenderToken = 0;
let hhResumesPollTimer = 0;

function stopHhResumesPoll() {
  if (hhResumesPollTimer) {
    window.clearInterval(hhResumesPollTimer);
    hhResumesPollTimer = 0;
  }
}

function startHhResumesPoll({ attempts = 15, intervalMs = 2000 } = {}) {
  stopHhResumesPoll();
  let left = attempts;
  hhResumesPollTimer = window.setInterval(() => {
    left -= 1;
    void loadHhResumes({ quiet: true }).then((ok) => {
      if (ok || left <= 0) stopHhResumesPoll();
    });
  }, intervalMs);
}

function setHhResumesActions({ open = false, confirm = false, novncUrl = "" } = {}) {
  if (!hhResumesActions) return;
  const showAny = Boolean(open || confirm);
  hhResumesActions.hidden = !showAny;
  const url = novncUrl || "http://127.0.0.1:6080/vnc.html?autoconnect=1&resize=scale";
  if (hhResumesOpen) {
    hhResumesOpen.hidden = !open;
    hhResumesOpen.dataset.novncUrl = url;
    hhResumesOpen.setAttribute("href", url);
  }
  if (hhResumesConfirm) {
    hhResumesConfirm.hidden = !confirm;
    hhResumesConfirm.dataset.novncUrl = url;
  }
}

function clearHhResumes() {
  if (!hhResumes) return;
  hhResumes.hidden = true;
  hhResumesStatus.textContent = "";
  clearHhResumeContent();
  hhResumesList.innerHTML = "";
  if (hhResumesClear) hhResumesClear.hidden = true;
  setHhResumesActions({ open: false, confirm: false, novncUrl: "" });
}

function clearHhResumeContent() {
  if (!hhResumeContent) return;
  hhResumeContent.hidden = true;
  if (hhResumeWorking) hhResumeWorking.textContent = "";
  if (hhResumeSyncState) {
    hhResumeSyncState.textContent = "";
    hhResumeSyncState.removeAttribute("data-tone");
  }
  if (hhResumeSync) {
    hhResumeSync.hidden = true;
    hhResumeSync.disabled = false;
    hhResumeSync.dataset.mode = "";
    hhResumeSync.textContent = "Синхронизировать";
  }
}

function formatResumeTimestamp(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return String(iso);
  try {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch (_error) {
    return String(iso);
  }
}

function renderHhResumeContent(payload, { hhCheckFailed = false } = {}) {
  if (!hhResumeContent) return;
  const link = payload && payload.hh_resume_link ? payload.hh_resume_link : null;
  const meta = payload && payload.resume_content ? payload.resume_content : null;
  const linkStatus = link && link.status ? String(link.status) : "";

  // Cleared / none: do not keep previous snapshot as if it were current.
  if (!link || linkStatus === "cleared" || (meta && meta.content_state === "none")) {
    clearHhResumeContent();
    return;
  }

  if (linkStatus === "stale") {
    hhResumeContent.hidden = false;
    if (hhResumeWorking) {
      hhResumeWorking.textContent = link.title
        ? `Рабочее резюме\n«${link.title}»`
        : "Рабочее резюме";
    }
    if (hhResumeSyncState) {
      hhResumeSyncState.dataset.tone = "warning";
      hhResumeSyncState.textContent =
        "Ранее выбранное резюме устарело — выберите актуальное из списка.";
    }
    if (hhResumeSync) hhResumeSync.hidden = true;
    return;
  }

  if (linkStatus !== "active") {
    clearHhResumeContent();
    return;
  }

  const title = link.title ? String(link.title) : "";
  const contentState = meta && meta.content_state ? String(meta.content_state) : "not_synced";
  const captured = meta && meta.captured_at ? formatResumeTimestamp(meta.captured_at) : "";

  hhResumeContent.hidden = false;
  if (hhResumeWorking) {
    hhResumeWorking.textContent = title
      ? `Рабочее резюме\n«${title}»`
      : "Рабочее резюме";
  }

  if (hhCheckFailed && contentState === "synced") {
    if (hhResumeSyncState) {
      hhResumeSyncState.dataset.tone = "warning";
      hhResumeSyncState.textContent = captured
        ? `Локальная копия сохранена\n${captured}\nНе удалось проверить HeadHunter`
        : "Локальная копия сохранена\nНе удалось проверить HeadHunter";
    }
    if (hhResumeSync) {
      hhResumeSync.hidden = false;
      hhResumeSync.disabled = false;
      hhResumeSync.dataset.mode = "retry";
      hhResumeSync.textContent = "Повторить";
    }
    return;
  }

  if (contentState === "synced") {
    if (hhResumeSyncState) {
      hhResumeSyncState.removeAttribute("data-tone");
      hhResumeSyncState.textContent = captured
        ? `Содержание синхронизировано\n${captured}`
        : "Содержание синхронизировано";
    }
    if (hhResumeSync) {
      hhResumeSync.hidden = false;
      hhResumeSync.disabled = false;
      hhResumeSync.dataset.mode = "refresh";
      hhResumeSync.textContent = "Обновить";
    }
    return;
  }

  // Active but never synced (or unknown).
  if (hhResumeSyncState) {
    hhResumeSyncState.removeAttribute("data-tone");
    hhResumeSyncState.textContent = "Содержание ещё не синхронизировано";
  }
  if (hhResumeSync) {
    hhResumeSync.hidden = false;
    hhResumeSync.disabled = false;
    hhResumeSync.dataset.mode = "sync";
    hhResumeSync.textContent = "Синхронизировать";
  }
}

async function loadHhResumeContent({ hhCheckFailed = false } = {}) {
  if (!hhResumeContent) return;
  try {
    const response = await fetch("/api/v1/candidate-context");
    const payload = await response.json();
    if (!response.ok) {
      if (hhCheckFailed) {
        // Keep strip honest: HH failed and Core context also unavailable.
        clearHhResumeContent();
      }
      return;
    }
    renderHhResumeContent(payload, { hhCheckFailed });
  } catch (_error) {
    if (!hhCheckFailed) clearHhResumeContent();
  }
}

async function syncHhResumeContent() {
  if (!hhResumeSync) return;
  const mode = hhResumeSync.dataset.mode || "sync";
  if (mode === "retry") {
    showNotice("Повторная проверка HeadHunter…");
    await loadHhResumes();
    return;
  }
  hhResumeSync.disabled = true;
  const previousLabel = hhResumeSync.textContent;
  hhResumeSync.textContent = "Синхронизация…";
  try {
    const response = await fetch("/api/v1/hh/resumes/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const payload = await response.json();
    if (!response.ok || !payload.ok) {
      const message =
        (payload && (payload.message || payload.code)) ||
        "Не удалось синхронизировать содержание резюме";
      showNotice(String(message), "error");
      if (payload && payload.candidate_context) {
        renderHhResumeContent(payload.candidate_context);
      } else {
        await loadHhResumeContent();
      }
      // Recovery actions already live in the resumes strip when HH needs login.
      if (payload && payload.status && payload.status !== "available") {
        await loadHhResumes({ quiet: true });
      }
      return;
    }
    if (payload.candidate_context) {
      renderHhResumeContent(payload.candidate_context);
    } else {
      await loadHhResumeContent();
    }
    if (payload.code === "unchanged") {
      showNotice("Локальная копия уже актуальна.");
    } else {
      showNotice("Содержание резюме синхронизировано.");
    }
  } catch (_error) {
    showNotice("Не удалось синхронизировать содержание резюме", "error");
    await loadHhResumeContent();
  } finally {
    if (hhResumeSync) {
      hhResumeSync.disabled = false;
      if (hhResumeSync.hidden === false && hhResumeSync.textContent === "Синхронизация…") {
        hhResumeSync.textContent = previousLabel || "Обновить";
      }
    }
  }
}

function renderHhResumes(payload) {
  if (!hhResumes) return;
  hhResumesRenderToken += 1;
  clearHhResumes();
  hhResumes.hidden = false;
  const status = payload && payload.status ? payload.status : "unavailable";
  const actionCode = payload && payload.action && payload.action.code ? payload.action.code : "none";
  const novncUrl = payload && payload.action ? payload.action.novnc_url || "" : "";
  const code = payload && payload.code ? String(payload.code) : "";
  const kind = recoveryKind(payload);
  const selection = payload && payload.selection ? payload.selection : null;
  const selectionStatus = selection && selection.status ? String(selection.status) : "";

  if (status === "available") {
    stopHhResumesPoll();
    const items = Array.isArray(payload.items) ? payload.items : [];
    setHhResumesActions({ open: false, confirm: false, novncUrl: "" });
    if (!items.length) {
      hhResumesStatus.textContent =
        selectionStatus === "stale"
          ? "Пока нет резюме в аккаунте. Ранее выбранное резюме больше недоступно — выберите снова, когда список появится."
          : "Пока нет резюме в аккаунте";
      if (hhResumesClear) hhResumesClear.hidden = selectionStatus !== "stale" && selectionStatus !== "active";
      return true;
    }
    if (selectionStatus === "stale") {
      hhResumesStatus.textContent =
        "Ранее выбранное резюме больше недоступно. Выберите актуальное резюме.";
    } else if (selectionStatus === "none") {
      hhResumesStatus.textContent = "Выберите активное резюме для текущего поиска.";
    } else {
      hhResumesStatus.textContent = "";
    }
    for (const item of items) {
      if (!item || !item.title || !item.external_id) continue;
      const li = document.createElement("li");
      li.textContent = item.title;
      li.dataset.externalId = String(item.external_id);
      li.setAttribute("role", "option");
      li.tabIndex = 0;
      const isActive = Boolean(item.active);
      li.classList.toggle("is-active", isActive);
      li.setAttribute("aria-selected", isActive ? "true" : "false");
      li.title = isActive ? "Активное резюме" : "Сделать активным";
      li.addEventListener("click", () => {
        void selectHhActiveResume(String(item.external_id));
      });
      li.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          void selectHhActiveResume(String(item.external_id));
        }
      });
      hhResumesList.appendChild(li);
    }
    if (hhResumesClear) {
      hhResumesClear.hidden = !(selectionStatus === "active" || selectionStatus === "stale");
    }
    void loadHhResumeContent();
    return true;
  }

  if (hhResumesClear) hhResumesClear.hidden = true;

  if (status === "permission_blocked" || kind === "external_limitation") {
    stopHhResumesPoll();
    setHhResumesActions({ open: false, confirm: false, novncUrl: "" });
    hhResumesStatus.textContent =
      "HeadHunter ограничил доступ к списку резюме (внешнее ограничение). Это не пустой список.";
    void loadHhResumeContent({ hhCheckFailed: true });
    return false;
  }

  if (kind === "captcha_or_action_required" || code === "browser_captcha_or_action_required") {
    stopHhResumesPoll();
    hhResumesList.innerHTML = "";
    hhResumesStatus.textContent =
      "HeadHunter требует проверку (CAPTCHA или доп. действие). Пройдите её во вкладке входа — обход не поддерживается.";
    setHhResumesActions({ open: true, confirm: true, novncUrl });
    void loadHhResumeContent({ hhCheckFailed: true });
    return false;
  }

  if (kind === "local_egress_unavailable" || code === "browser_proxy_unavailable") {
    stopHhResumesPoll();
    setHhResumesActions({ open: false, confirm: false, novncUrl: "" });
    hhResumesStatus.textContent =
      "Не работает локальный сетевой выход HeadHunter. Перезапустите Job Search штатной командой make up.";
    void loadHhResumeContent({ hhCheckFailed: true });
    return false;
  }

  if (kind === "network_failure" || code === "browser_resume_read_failed") {
    stopHhResumesPoll();
    setHhResumesActions({ open: false, confirm: false, novncUrl: "" });
    hhResumesStatus.textContent =
      "Не удалось получить список резюме (сеть или временный сбой). Повторите позже вручную — автоповтор не крутится.";
    void loadHhResumeContent({ hhCheckFailed: true });
    return false;
  }

  // Profile briefly locked by the login browser — not a fresh login request.
  if (code === "profile_locked") {
    hhResumesList.innerHTML = "";
    hhResumesStatus.textContent = "Список резюме обновляется… Подождите пару секунд.";
    setHhResumesActions({ open: false, confirm: false, novncUrl: "" });
    if (!hhResumesPollTimer) startHhResumesPoll({ attempts: 10, intervalMs: 1500 });
    return false;
  }

  if (
    status === "not_authorized" ||
    status === "expired" ||
    status === "action_required" ||
    kind === "reauth" ||
    actionCode === "open_login" ||
    actionCode === "confirm_login" ||
    actionCode === "reconnect" ||
    code === "browser_session_not_logged_in" ||
    code === "browser_login_required"
  ) {
    hhResumesList.innerHTML = "";
    const waitingConfirm = actionCode === "confirm_login";
    if (waitingConfirm) {
      hhResumesStatus.textContent =
        "Войдите в HeadHunter во вкладке входа. Список обновится сам — или нажмите «Я вошёл — показать резюме».";
      setHhResumesActions({ open: true, confirm: true, novncUrl });
      if (!hhResumesPollTimer) startHhResumesPoll({ attempts: 20, intervalMs: 2500 });
      void loadHhResumeContent({ hhCheckFailed: true });
      return false;
    }
    const expiredHint = status === "expired" || kind === "reauth";
    hhResumesStatus.textContent = expiredHint
      ? "Сессия HeadHunter истекла или нужна повторная авторизация. Войдите снова."
      : "Чтобы показать ваши резюме, войдите в HeadHunter. Нажмите кнопку ниже.";
    setHhResumesActions({ open: true, confirm: false, novncUrl });
    void loadHhResumeContent({ hhCheckFailed: true });
    return false;
  }

  setHhResumesActions({ open: false, confirm: false, novncUrl: "" });
  hhResumesStatus.textContent = "Список резюме сейчас недоступен.";
  void loadHhResumeContent({ hhCheckFailed: true });
  return false;
}

async function selectHhActiveResume(externalId) {
  try {
    const response = await fetch("/api/v1/hh/resumes/active", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ external_id: externalId }),
    });
    const payload = await response.json();
    if (!response.ok) {
      const message =
        (payload && (payload.message || payload.code)) || "Не удалось выбрать резюме";
      showNotice(message);
      if (payload && payload.resumes) renderHhResumes(payload.resumes);
      else await loadHhResumes();
      return;
    }
    renderHhResumes(payload.status ? payload : { status: "unavailable", items: [] });
    if (payload.core_linkage && payload.core_linkage.candidate_context) {
      renderHhResumeContent(payload.core_linkage.candidate_context);
    } else {
      await loadHhResumeContent();
    }
    showNotice("Активное резюме обновлено.");
  } catch (_error) {
    showNotice("Не удалось выбрать резюме");
  }
}

async function clearHhActiveResume() {
  try {
    const response = await fetch("/api/v1/hh/resumes/active", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ external_id: null }),
    });
    const payload = await response.json();
    if (!response.ok) {
      showNotice((payload && (payload.message || payload.code)) || "Не удалось сбросить выбор");
      return;
    }
    renderHhResumes(payload.status ? payload : { status: "unavailable", items: [] });
    if (payload.core_linkage && payload.core_linkage.candidate_context) {
      renderHhResumeContent(payload.core_linkage.candidate_context);
    } else {
      await loadHhResumeContent();
    }
    showNotice("Выбор резюме сброшен.");
  } catch (_error) {
    showNotice("Не удалось сбросить выбор резюме");
  }
}

async function loadHhResumes({ quiet = false } = {}) {
  if (!quiet) clearHhResumes();
  try {
    const response = await fetch("/api/v1/hh/resumes");
    const payload = await response.json();
    return Boolean(
      renderHhResumes(payload.status ? payload : { status: "unavailable", items: [] })
    );
  } catch (_error) {
    if (!quiet) renderHhResumes({ status: "unavailable", items: [] });
    return false;
  }
}

async function loadHhConnection() {
  stopHhResumesPoll();
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
    // Account surface shows distinct recovery even when connection is not "connected".
    if (
      payload.status === "connected" ||
      payload.status === "expired" ||
      payload.status === "action_required" ||
      payload.status === "not_authorized"
    ) {
      await loadHhAccount();
    }
    await loadHhResumes();
  } catch (error) {
    renderHhConnection({ status: "unavailable", action: { code: "none" } });
  }
}

async function runHhLoginAction(action, novncUrl, button, { deferWindowOpen = false } = {}) {
  if (button && "disabled" in button) button.disabled = true;
  try {
    if (action === "open_login" || action === "reconnect") {
      // Keep the click gesture: open a tab immediately, then point it at noVNC
      // after the HH login browser is started. Async window.open() is blocked.
      const knownUrl = novncUrl || "http://127.0.0.1:6080/vnc.html?autoconnect=1&resize=scale";
      const tokenAtStart = hhResumesRenderToken;
      let loginWindow = null;
      if (!deferWindowOpen) {
        loginWindow = window.open("about:blank", "job-search-hh-login");
      }
      const response = await fetch("/api/v1/hh/connection/open-login", { method: "POST" });
      const payload = await response.json();
      if (!response.ok) {
        if (loginWindow && !loginWindow.closed) loginWindow.close();
        throw new Error(payload.message || payload.code || "Не удалось открыть вход");
      }
      const url = payload.novnc_url || knownUrl;
      if (loginWindow && !loginWindow.closed) {
        loginWindow.location.href = url;
      }
      // A newer server render (e.g. after confirm) already owns the strip.
      if (tokenAtStart !== hhResumesRenderToken) return;
      if (hhResumes) {
        hhResumes.hidden = false;
        hhResumesList.innerHTML = "";
        const opened = Boolean(loginWindow && !loginWindow.closed) || deferWindowOpen;
        if (!opened) {
          hhResumesStatus.textContent =
            "Вкладка входа не открылась автоматически. Нажмите ещё раз «Войти в HeadHunter» — это ссылка на окно входа.";
          setHhResumesActions({ open: true, confirm: true, novncUrl: url });
          showNotice("Нажмите «Войти в HeadHunter» ещё раз, чтобы открыть окно входа.");
        } else {
          hhResumesStatus.textContent =
            "Войдите в HeadHunter во вкладке входа. Список обновится сам, когда вход сохранится.";
          setHhResumesActions({ open: true, confirm: true, novncUrl: url });
          showNotice("Войдите в HeadHunter во вкладке входа — список резюме обновится автоматически.");
        }
        startHhResumesPoll({ attempts: 24, intervalMs: 2500 });
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
    if (button && "disabled" in button) button.disabled = false;
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
  // Real <a target=_blank>: browser opens the tab from the user gesture.
  // We still start the HH login session in parallel (do not preventDefault).
  hhResumesOpen.addEventListener("click", () => {
    const url = hhResumesOpen.getAttribute("href") || hhResumesOpen.dataset.novncUrl || "";
    void runHhLoginAction("open_login", url, hhResumesOpen, { deferWindowOpen: true });
  });
}
if (hhResumesConfirm) {
  hhResumesConfirm.addEventListener("click", async () => {
    await runHhLoginAction("confirm_login", hhResumesConfirm.dataset.novncUrl, hhResumesConfirm);
  });
}
if (hhResumesClear) {
  hhResumesClear.addEventListener("click", () => {
    void clearHhActiveResume();
  });
}
if (hhResumeSync) {
  hhResumeSync.addEventListener("click", () => {
    void syncHhResumeContent();
  });
}

clearNotice();
initNavigation();
loadHhConnection();
initVacancySearch();
loadVacancies();
loadApplications();
loadMetrics();
loadPeople();
loadHypotheses();
startLiveReload();
