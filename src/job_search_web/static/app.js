const grid = document.querySelector("#vacancies");
const count = document.querySelector("#vacancy-count");
const notice = document.querySelector("#notice");
const dialog = document.querySelector("#vacancy-dialog");
const form = document.querySelector("#vacancy-form");
const formError = document.querySelector("#form-error");
const submitButton = document.querySelector("#submit-form");
const signal = document.querySelector(".signal");
const connectionLabel = document.querySelector("#connection-label");
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
const assessmentGrid = document.querySelector("#assessments");
const assessmentCount = document.querySelector("#assessment-count");
const assessmentDialog = document.querySelector("#assessment-dialog");
const assessmentForm = document.querySelector("#assessment-form");
const assessmentFormError = document.querySelector("#assessment-form-error");
let knownVacancies = [];
let osintReports = [];
let mirrorReports = [];

const NAV_SECTIONS = [
  "vacancies",
  "journal",
  "metrics",
  "people",
  "hypotheses",
  "assessments",
];
const NAV_DEFAULT_SECTION = "vacancies";
const NAV_LEGACY_HASH_ALIASES = { applications: "journal" };

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

function showNotice(message, variant = "success") {
  const labels = {
    success: "Успех",
    error: "Ошибка",
    info: "Инфо",
    warning: "Внимание",
  };
  const kind = labels[variant] ? variant : variant === true ? "error" : "success";
  notice.innerHTML = `<span class="notice__label">${escapeHtml(labels[kind] || labels.success)}</span><span class="notice__text">${escapeHtml(message)}</span>`;
  notice.className = `notice notice--${kind}`;
  notice.hidden = false;
  notice.setAttribute("role", kind === "error" ? "alert" : "status");
  window.setTimeout(() => { notice.hidden = true; }, 4500);
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
  const detailSummary = evidenceCount
    ? `Контакты и зеркала · ${evidenceCount}`
    : item.company.website_url
      ? "OSINT и зеркала"
      : "";
  const detailBlock = detailSummary
    ? `<details class="row-detail"${evidenceCount ? " open" : ""}>
        <summary class="row-detail__summary">${escapeHtml(detailSummary)}</summary>
        <div class="row-detail__body">
          ${researchButtons}
          <div class="row-detail__section">
            <p class="row-detail__label">Зеркала · не проверено</p>
            ${mirrorsHtml}
          </div>
          <div class="row-detail__section">
            <p class="row-detail__label">Контакты · ${people.some((person) => person.status === "proposed") ? "не проверено" : "подтверждено"}</p>
            ${peopleHtml}
          </div>
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

function assessmentRow(item) {
  const verdictLabels = { apply: "Откликаться", maybe: "Подумать", skip: "Пропустить" };
  const verdict = verdictLabels[item.verdict] || item.verdict;
  const detail = `<div class="row-detail__body row-detail__body--plain">
      <p class="assessment-detail__reason">${escapeHtml(item.reason)}</p>
      ${item.risk ? `<p class="assessment-detail__risk"><span class="assessment-detail__label">Риск</span> ${escapeHtml(item.risk)}</p>` : ""}
      <p class="assessment-detail__action"><span class="assessment-detail__label">Действие</span> ${escapeHtml(item.action)}</p>
    </div>`;
  return `<article class="list-row-group">
    <details class="assessment-details">
      <summary class="list-row">
        <div class="list-row__primary">
          <div class="list-row__identity">
            <h3 class="list-row__title">${escapeHtml(item.vacancy.title)}</h3>
          </div>
          <p class="list-row__meta">${escapeHtml(item.model)} · ${escapeHtml(item.prompt_version || "—")}</p>
        </div>
        <div class="list-row__trailing">
          ${renderBadge(verdict, assessmentVerdictBadge[item.verdict] || "neutral")}
          <span class="assessment-score" aria-label="Релевантность">${escapeHtml(item.relevance_score)}</span>
          <span class="assessment-details__toggle">Подробнее</span>
        </div>
      </summary>
      ${detail}
    </details>
  </article>`;
}

async function loadAssessments() {
  assessmentGrid.setAttribute("aria-busy", "true");
  renderLoadingState(assessmentGrid, "Загружаем оценки", "Web запрашивает нормализованные результаты у Core.");
  try { const response = await fetch("/api/v1/assessments"); const payload = await response.json();
    if (!response.ok) throw new Error(payload.message || "Не удалось получить оценки");
    setSectionCount(assessmentCount, payload.total);
    assessmentGrid.innerHTML = payload.total ? payload.items.map(assessmentRow).join("") : "";
    if (!payload.total) {
      renderEmptyState(assessmentGrid, "Оценок пока нет", "Сохраните первый нормализованный результат.", {
        buttonId: "open-assessment-form",
        label: "+ Записать оценку",
      });
    }
  } catch (error) {
    setSectionCount(assessmentCount, null);
    renderErrorState(assessmentGrid, "Не удалось загрузить оценки", error.message, loadAssessments);
  } finally { assessmentGrid.setAttribute("aria-busy", "false"); }
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
      const [osintResponse, mirrorResponse] = await Promise.all([
        fetch("/api/v1/osint/people-proposals"),
        fetch("/api/v1/osint/vacancy-mirrors"),
      ]);
      const osintPayload = await osintResponse.json();
      const mirrorPayload = await mirrorResponse.json();
      osintReports = osintResponse.ok ? osintPayload.items : [];
      mirrorReports = mirrorResponse.ok ? mirrorPayload.items : [];
    } catch (_error) {
      osintReports = [];
      mirrorReports = [];
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

document.querySelector("#open-assessment-form").addEventListener("click", () => {
  assessmentForm.reset(); assessmentForm.elements.source.value = "manual";
  assessmentForm.elements.model.value = "manual"; assessmentForm.elements.prompt_version.value = "manual-v1";
  assessmentForm.elements.vacancy_id.innerHTML = knownVacancies.map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.company.name)} — ${escapeHtml(item.title)}</option>`).join("");
  assessmentFormError.hidden = true; if (!knownVacancies.length) { showNotice("Сначала добавьте вакансию", "error"); return; }
  assessmentDialog.showModal();
});
document.querySelector("#close-assessment-form").addEventListener("click", () => assessmentDialog.close());
document.querySelector("#cancel-assessment-form").addEventListener("click", () => assessmentDialog.close());
assessmentForm.addEventListener("submit", async (event) => {
  event.preventDefault(); assessmentFormError.hidden = true; const values = Object.fromEntries(new FormData(assessmentForm));
  const identity = crypto.randomUUID(); values.external_id = identity; values.relevance_score = Number(values.relevance_score);
  values.assessed_at = new Date().toISOString(); if (!values.risk) delete values.risk;
  try { const response = await fetch("/api/v1/assessments", {method: "POST", headers: {"Content-Type": "application/json", "Idempotency-Key": identity}, body: JSON.stringify(values)});
    const payload = await response.json(); if (!response.ok) throw new Error(payload.message || "Оценка не сохранена");
    assessmentDialog.close(); showNotice("Нормализованная оценка сохранена"); await loadAssessments();
  } catch (error) { assessmentFormError.textContent = error.message; assessmentFormError.hidden = false; }
});

initNavigation();
loadVacancies();
loadApplications();
loadMetrics();
loadPeople();
loadHypotheses();
loadAssessments();
startLiveReload();
