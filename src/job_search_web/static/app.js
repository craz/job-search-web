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
const hhResumeFile = document.querySelector("#hh-resume-file");
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
const outreachDialog = document.querySelector("#outreach-dialog");
const outreachForm = document.querySelector("#outreach-form");
const outreachFormError = document.querySelector("#outreach-form-error");
const outreachSubmitButton = document.querySelector("#submit-outreach-form");
const outreachVacancyTitle = document.querySelector("#outreach-vacancy-title");
const responseDialog = document.querySelector("#response-dialog");
const responseForm = document.querySelector("#response-form");
const responseFormError = document.querySelector("#response-form-error");
const responseSubmitButton = document.querySelector("#submit-response-form");
const responseVacancyTitle = document.querySelector("#response-vacancy-title");
const hiringList = document.querySelector("#hiring-processes");
const hiringCount = document.querySelector("#hiring-count");
const offersList = document.querySelector("#offers-list");
const offersCount = document.querySelector("#offers-count");
const offerDialog = document.querySelector("#offer-dialog");
const offerForm = document.querySelector("#offer-form");
const offerFormError = document.querySelector("#offer-form-error");
const offerSubmitButton = document.querySelector("#submit-offer-form");
const offerVacancyTitle = document.querySelector("#offer-vacancy-title");
const offerDecisionDialog = document.querySelector("#offer-decision-dialog");
const offerDecisionForm = document.querySelector("#offer-decision-form");
const offerDecisionFormError = document.querySelector("#offer-decision-form-error");
const offerDecisionSubmitButton = document.querySelector("#submit-offer-decision-form");
const offerDecisionContext = document.querySelector("#offer-decision-context");
const offerDecisionSummary = document.querySelector("#offer-decision-summary");
const compareOffersButton = document.querySelector("#compare-offers");
const offerComparePanel = document.querySelector("#offer-compare-panel");
const offerCompareTable = document.querySelector("#offer-compare-table");
const offerCompareDisclaimer = document.querySelector("#offer-compare-disclaimer");
const closeOfferCompareButton = document.querySelector("#close-offer-compare");
const searchCycleBanner = document.querySelector("#search-cycle-banner");
const searchCycleCloseDialog = document.querySelector("#search-cycle-close-dialog");
const searchCycleCloseForm = document.querySelector("#search-cycle-close-form");
const searchCycleCloseFormError = document.querySelector("#search-cycle-close-form-error");
const searchCycleCloseSubmitButton = document.querySelector("#submit-search-cycle-close-form");
const searchCycleCloseSummary = document.querySelector("#search-cycle-close-summary");
const hiringStartDialog = document.querySelector("#hiring-start-dialog");
const hiringStartForm = document.querySelector("#hiring-start-form");
const hiringStartFormError = document.querySelector("#hiring-start-form-error");
const hiringStartSubmitButton = document.querySelector("#submit-hiring-start-form");
const hiringStartVacancyTitle = document.querySelector("#hiring-start-vacancy-title");
const hiringStageDialog = document.querySelector("#hiring-stage-dialog");
const hiringStageForm = document.querySelector("#hiring-stage-form");
const hiringStageFormError = document.querySelector("#hiring-stage-form-error");
const hiringStageSubmitButton = document.querySelector("#submit-hiring-stage-form");
const hiringStageVacancyTitle = document.querySelector("#hiring-stage-vacancy-title");
const hiringActivityDialog = document.querySelector("#hiring-activity-dialog");
const hiringActivityForm = document.querySelector("#hiring-activity-form");
const hiringActivityFormError = document.querySelector("#hiring-activity-form-error");
const hiringActivitySubmitButton = document.querySelector("#submit-hiring-activity-form");
const hiringActivityVacancyTitle = document.querySelector("#hiring-activity-vacancy-title");
const hiringActivityCompleteDialog = document.querySelector("#hiring-activity-complete-dialog");
const hiringActivityCompleteForm = document.querySelector("#hiring-activity-complete-form");
const hiringActivityCompleteFormError = document.querySelector("#hiring-activity-complete-form-error");
const hiringActivityCompleteSubmitButton = document.querySelector("#submit-hiring-activity-complete-form");
const hiringActivityCompleteContext = document.querySelector("#hiring-activity-complete-context");
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
let peopleByVacancyId = new Map();
let outreachesByVacancyId = new Map();
let employerResponsesByVacancyId = new Map();
let hiringProcessByVacancyId = new Map();
let activeHiringProcesses = [];
let offersByVacancyId = new Map();
let knownOffers = [];
let selectedOfferIds = new Set();
let currentSearchCycle = null;
let osintUnavailable = false;
let assessmentsByVacancyId = new Map();
let semanticFailuresByVacancyId = new Map();

const NAV_SECTIONS = [
  "vacancies",
  "hiring",
  "offers",
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
  apply: "APPLY",
  maybe: "MAYBE",
  skip: "SKIP",
};

const ownerDecisionLabels = {
  unreviewed: "Не разобрано",
  interested: "Интересно",
  deferred: "Отложено",
  skipped: "Пропущено",
  applied: "Откликнулся",
};

const ownerDecisionBadge = {
  unreviewed: "neutral",
  interested: "success",
  deferred: "warning",
  skipped: "danger",
  applied: "info",
};

const actionChannelLabels = {
  hh: "HH",
  direct: "Напрямую",
  both: "Оба",
};

const actionChannelDefaults = {
  hh: "Откликнуться на HH",
  direct: "Найти контакт",
  both: "Откликнуться на HH и найти контакт",
};

const outreachMethodLabels = {
  email: "Email",
  linkedin: "LinkedIn",
  telegram: "Telegram",
  phone: "Телефон",
  other: "Другое",
};

const employerResponseTypeLabels = {
  replied: "Ответили",
  invitation: "Приглашение",
  rejection: "Отказ",
  question: "Вопрос",
  interview_request: "Запрос собеседования",
  test_task: "Тестовое",
  no_response: "Нет ответа",
  other: "Другое",
};

const employerResponseSourceLabels = {
  hh: "HH",
  direct: "Прямой",
};

const suggestedNextActionByResponseType = {
  invitation: "Согласовать время созвона",
  question: "Ответить работодателю",
  test_task: "Сделать тестовое",
  rejection: "Закрыть вакансию",
  no_response: "Напомнить / написать повторно",
  replied: "Продолжить переписку",
  interview_request: "Согласовать время созвона",
  other: "",
};

const hiringStageLabels = {
  screening: "Скрининг",
  interview: "Интервью",
  test_task: "Тестовое",
  final_interview: "Финальное интервью",
  other: "Другое",
};

const suggestedNextActionByHiringStage = {
  screening: "Подготовиться к скринингу",
  interview: "Подготовиться к интервью",
  test_task: "Выполнить тестовое",
  final_interview: "Подготовиться к финальному интервью",
  other: "Уточнить следующий шаг найма",
};

let applicationsByVacancyId = new Map();

function normalizeVerdict(verdict) {
  return String(verdict || "").trim().toLowerCase();
}

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

function indexSemanticFailuresByVacancy(items) {
  const byVacancy = new Map();
  for (const item of items || []) {
    const vacancyId = item?.vacancy_id;
    if (!vacancyId) continue;
    if (item.terminal_for_auto === false) continue;
    byVacancy.set(vacancyId, item);
  }
  return byVacancy;
}

function assessmentVerdictLabel(verdict) {
  const key = normalizeVerdict(verdict);
  return assessmentVerdictLabels[key] || verdict;
}

function vacancyScoringState(item, assessment, failure) {
  if (assessment) return "current";
  if (failure) return "failed";
  return "unscored";
}

function vacancyOwnerDecision(item) {
  const value = String(item?.owner_decision || "unreviewed").trim().toLowerCase();
  return ownerDecisionLabels[value] ? value : "unreviewed";
}

function vacancyActionChannel(item) {
  const value = String(item?.action_channel || "").trim().toLowerCase();
  return actionChannelLabels[value] ? value : "";
}

function vacancyActionQueueLabel(item) {
  const decision = vacancyOwnerDecision(item);
  if (decision === "applied") return "";
  if (decision !== "interested") return "";
  const channel = vacancyActionChannel(item);
  const nextAction = String(item?.next_action || "").trim();
  const done = Boolean(item?.next_action_done);
  if (!channel && !nextAction) return "нужен шаг";
  if (done) return "шаг закрыт";
  return "план";
}

function vacancyFactsLine(item) {
  const parts = [
    item.salary_text,
    item.area_text,
    item.work_format_text || item.schedule_text,
  ].filter(Boolean);
  return parts.join(" · ");
}

function renderVacancyAssessmentSummary(assessment, failure) {
  if (assessment) {
    const key = normalizeVerdict(assessment.verdict);
    const verdict = assessmentVerdictLabel(assessment.verdict);
    return `<div class="vacancy-assessment-summary">
      ${renderBadge(verdict, assessmentVerdictBadge[key] || "neutral")}
      <span class="assessment-score" aria-label="Релевантность">${escapeHtml(assessment.relevance_score)}</span>
    </div>`;
  }
  if (failure) {
    const code = failure.error_code || failure.failure_kind || "semantic_error";
    return `<div class="vacancy-assessment-summary">
      ${renderBadge("Ошибка оценки", "danger")}
      <span class="assessment-score assessment-score--muted" title="${escapeHtml(code)}">${escapeHtml(code)}</span>
    </div>`;
  }
  return `<div class="vacancy-assessment-summary">${renderBadge("Без оценки", "neutral")}</div>`;
}

function renderAssessmentStoredBits(assessment) {
  const detail = assessment?.detail || {};
  const chunks = [];
  const strengths = Array.isArray(detail.strengths) ? detail.strengths.filter(Boolean) : [];
  const gaps = Array.isArray(detail.gaps) ? detail.gaps.filter(Boolean) : [];
  if (strengths.length) {
    chunks.push(`<p class="assessment-detail__bits"><span class="assessment-detail__label">Сильные стороны</span> ${escapeHtml(strengths.slice(0, 3).join("; "))}</p>`);
  }
  if (gaps.length) {
    chunks.push(`<p class="assessment-detail__bits"><span class="assessment-detail__label">Пробелы</span> ${escapeHtml(gaps.slice(0, 3).join("; "))}</p>`);
  }
  return chunks.join("");
}

function renderVacancyAssessmentDetail(assessment, failure) {
  if (assessment) {
    const key = normalizeVerdict(assessment.verdict);
    return `<div class="row-detail__section vacancy-assessment-detail">
      <p class="row-detail__label">AI-оценка · ${escapeHtml(assessmentVerdictLabel(assessment.verdict))} · ${escapeHtml(formatDate(assessment.assessed_at))}</p>
      <p class="assessment-detail__reason">${escapeHtml(assessment.reason || "Пояснение не сохранено.")}</p>
      ${assessment.risk ? `<p class="assessment-detail__risk"><span class="assessment-detail__label">Риск</span> ${escapeHtml(assessment.risk)}</p>` : ""}
      ${assessment.action ? `<p class="assessment-detail__action"><span class="assessment-detail__label">Действие</span> ${escapeHtml(assessment.action)}</p>` : ""}
      ${renderAssessmentStoredBits(assessment)}
      <p class="assessment-detail__meta">Модель: ${escapeHtml(assessment.model)} · ${escapeHtml(assessment.prompt_version || "—")} · вердикт ${escapeHtml(key.toUpperCase())}</p>
    </div>`;
  }
  if (failure) {
    const code = failure.error_code || failure.failure_kind || "semantic_error";
    const when = failure.last_failed_at ? formatDate(failure.last_failed_at) : "—";
    return `<div class="row-detail__section vacancy-assessment-detail">
      <p class="row-detail__label">Ошибка оценки</p>
      <p class="assessment-detail__reason">Семантическая оценка не завершилась. Техническое состояние: ${escapeHtml(code)} · ${escapeHtml(when)}</p>
    </div>`;
  }
  return `<div class="row-detail__section vacancy-assessment-detail">
    <p class="row-detail__label">Оценка</p>
    <p class="assessment-detail__reason">Вакансия ещё не оценена. Можно запустить ручную оценку.</p>
  </div>`;
}

function renderOwnerDecisionControls(item) {
  const current = vacancyOwnerDecision(item);
  const decisions = [
    ["interested", "Интересно"],
    ["deferred", "Отложить"],
    ["skipped", "Пропустить"],
    ["applied", "Откликнулся"],
  ];
  const buttons = decisions
    .map(([value, label]) => {
      const active = current === value ? " is-active" : "";
      return `<button class="btn btn--ghost btn--sm owner-decision-btn${active}" type="button" data-owner-decision="${value}" ${current === value ? "aria-pressed=\"true\"" : "aria-pressed=\"false\""}>${label}</button>`;
    })
    .join("");
  const reset =
    current !== "unreviewed"
      ? `<button class="btn btn--ghost btn--sm" type="button" data-owner-decision="unreviewed">Сбросить</button>`
      : "";
  return `<div class="owner-decision" data-owner-current="${escapeHtml(current)}">
    <p class="owner-decision__label">Моё решение · ${escapeHtml(ownerDecisionLabels[current])}</p>
    <div class="owner-decision__actions">${buttons}${reset}</div>
  </div>`;
}

function toDatetimeLocalValue(raw) {
  if (!raw) return "";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function deadlineStateFromStamp(raw) {
  if (!raw) return "";
  const when = Date.parse(raw);
  if (Number.isNaN(when)) return "";
  return when <= Date.now() ? "overdue" : "upcoming";
}

function nextActionAttentionAt(source) {
  const vacancy = source?.vacancy || source;
  if (!vacancy?.next_action || vacancy.next_action_done) return null;
  return vacancy.next_action_at || null;
}

function processAttentionStamp(process) {
  const stamps = [];
  for (const activity of process?.activities || []) {
    const stamp = activityAttentionAt(activity);
    if (stamp) stamps.push(Date.parse(stamp));
  }
  const nextAt = nextActionAttentionAt(process);
  if (nextAt) stamps.push(Date.parse(nextAt));
  const valid = stamps.filter((value) => !Number.isNaN(value));
  if (!valid.length) return null;
  return new Date(Math.min(...valid)).toISOString();
}

function processAttentionState(process) {
  const stamp = processAttentionStamp(process);
  if (stamp) return deadlineStateFromStamp(stamp);
  if (process?.vacancy?.next_action && !process.vacancy.next_action_done) return "undated";
  return "none";
}

function renderActionPlanControls(item) {
  const decision = vacancyOwnerDecision(item);
  if (decision !== "interested" && decision !== "applied") return "";
  const channel = vacancyActionChannel(item);
  const channels = [
    ["hh", "HH"],
    ["direct", "Напрямую"],
    ["both", "Оба"],
  ];
  const channelButtons = channels
    .map(([value, label]) => {
      const active = channel === value ? " is-active" : "";
      return `<button class="btn btn--ghost btn--sm action-channel-btn${active}" type="button" data-action-channel="${value}" ${channel === value ? "aria-pressed=\"true\"" : "aria-pressed=\"false\""}>${label}</button>`;
    })
    .join("");
  const clearChannel = channel
    ? `<button class="btn btn--ghost btn--sm" type="button" data-clear-action-channel>Сбросить канал</button>`
    : "";
  const nextAction = String(item?.next_action || "");
  const nextDone = Boolean(item?.next_action_done);
  const nextDue = item?.next_action_at || "";
  const dueState = nextAction && !nextDone ? deadlineStateFromStamp(nextDue) : "";
  const dueHint = nextDue
    ? `${dueState === "overdue" ? "Просрочено" : "Срок"} · ${formatDate(nextDue)}`
    : nextAction && !nextDone
      ? "Срок не указан"
      : "";
  const hhOpen =
    channel === "hh" || channel === "both"
      ? `<a class="btn btn--secondary btn--sm" href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">Открыть вакансию на HH ↗</a>`
      : "";
  const directHint =
    channel === "direct" || channel === "both"
      ? item.company?.website_url
        ? `<button class="btn btn--secondary btn--sm" data-research type="button">${osintReports.some((r) => r.vacancy_id === item.id) ? "Повторить поиск" : "Найти контакт"}</button>`
        : `<p class="list-row__meta">Прямой путь: сначала нужен сайт компании, затем поиск контакта.</p>`
      : "";
  const apps = applicationsByVacancyId.get(item.id) || [];
  const appHistory = apps.length
    ? `<p class="list-row__meta">В журнале откликов: ${escapeHtml(String(apps.length))} · ${escapeHtml(formatDate(apps[0].applied_at))}</p>`
    : `<p class="list-row__meta">Факт отклика ещё не записан в журнал.</p>`;
  return `<div class="action-plan" data-action-channel="${escapeHtml(channel)}">
    <p class="owner-decision__label">Следующий шаг</p>
    <p class="list-row__meta">Канал · ${escapeHtml(channel ? actionChannelLabels[channel] : "не выбран")}${nextDone ? " · шаг закрыт" : ""}</p>
    <div class="owner-decision__actions">${channelButtons}${clearChannel}</div>
    <div class="action-plan__next">
      <label class="list-row__control action-plan__field">
        <span class="sr-only">Следующее действие</span>
        <input class="control" type="text" data-next-action-input maxlength="500" value="${escapeHtml(nextAction)}" placeholder="Например: Отправить тестовое">
      </label>
      <label class="list-row__control action-plan__field">
        <span class="list-row__meta">Срок</span>
        <input class="control" type="datetime-local" data-next-action-due-input value="${escapeHtml(toDatetimeLocalValue(nextDue))}">
      </label>
      <button class="btn btn--ghost btn--sm" type="button" data-save-next-action>Сохранить шаг</button>
      <button class="btn btn--ghost btn--sm" type="button" data-toggle-next-done>${nextDone ? "Открыть снова" : "Закрыть шаг"}</button>
    </div>
    ${dueHint ? `<p class="list-row__meta">${escapeHtml(dueHint)}</p>` : ""}
    <div class="action-plan__links">${hhOpen}${directHint}</div>
    ${appHistory}
  </div>`;
}

function formatConfidence(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "неизвестно";
  return `${Math.round(number * 100)}%`;
}

function renderEvidencePerson(person, report, { selectLabel = "Выбрать контакт" } = {}) {
  const proposed = person.status === "proposed" && person.id && report?.report_id;
  const confirmControl = proposed
    ? `<button class="btn btn--secondary btn--sm" type="button" data-confirm data-report-id="${escapeHtml(report.report_id)}" data-person-id="${escapeHtml(person.id)}">${escapeHtml(selectLabel)}</button>`
    : person.status === "confirmed"
      ? renderBadge("Выбран", "success")
      : "";
  const confidence = formatConfidence(person.confidence);
  return `<div class="evidence-item">
    <div class="evidence-item__head">
      <strong>${escapeHtml(person.full_name)}</strong>
      <span>${escapeHtml(person.title || "Роль не определена")} · уверенность ${escapeHtml(confidence)}</span>
    </div>
    <p class="evidence-item__excerpt">${escapeHtml(person.evidence_excerpt || "Фрагмент источника недоступен")}</p>
    <div class="evidence-item__foot">
      <a class="inline-link" href="${escapeHtml(person.source_url)}" target="_blank" rel="noreferrer">${escapeHtml(person.source)} · ${escapeHtml(formatDate(person.observed_at))} ↗</a>
      ${confirmControl}
    </div>
  </div>`;
}

function renderConfirmedPerson(person) {
  const profile = person.url
    ? `<a class="inline-link" href="${escapeHtml(person.url)}" target="_blank" rel="noreferrer">Профиль / источник ↗</a>`
    : `<span class="list-row__meta">Ссылка на профиль недоступна</span>`;
  const confidence = person.confidence == null ? "" : ` · уверенность ${escapeHtml(formatConfidence(person.confidence))}`;
  const roleLabel = personRoleLabels[person.role] || person.role || "контакт";
  return `<div class="evidence-item evidence-item--selected">
    <div class="evidence-item__head">
      <strong>${escapeHtml(person.full_name)}</strong>
      <span>${escapeHtml(roleLabel)}${person.title ? ` · ${escapeHtml(person.title)}` : ""}${confidence}</span>
    </div>
    <p class="evidence-item__excerpt">${escapeHtml(person.notes || "Подтверждённый контакт для этой вакансии")}</p>
    <div class="evidence-item__foot">
      ${profile}
      <button class="btn btn--ghost btn--sm" type="button" data-suggest-next-action="${escapeHtml(person.full_name)}">Поставить шаг: Написать ${escapeHtml(person.full_name)}</button>
    </div>
  </div>`;
}

function renderOutreachHistoryItem(item) {
  const method = outreachMethodLabels[item.method] || item.method;
  const profile = item.url
    ? `<a class="inline-link" href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">Источник ↗</a>`
    : "";
  return `<div class="evidence-item">
    <div class="evidence-item__head">
      <strong>${escapeHtml(item.person?.full_name || "Контакт")}</strong>
      <span>${escapeHtml(method)} · ${escapeHtml(formatDate(item.occurred_at))}</span>
    </div>
    <p class="evidence-item__excerpt">${escapeHtml(item.note || "Заметка не указана")}</p>
    <div class="evidence-item__foot">${profile}</div>
  </div>`;
}

function renderDirectOsintSection(item) {
  const channel = vacancyActionChannel(item);
  if (channel !== "direct" && channel !== "both") return "";
  const report = osintReports.find((candidate) => candidate.vacancy_id === item.id);
  const candidates = report?.people || [];
  const selected = peopleByVacancyId.get(item.id) || [];
  const outreaches = outreachesByVacancyId.get(item.id) || [];
  const hasWebsite = Boolean(item.company?.website_url);
  let statusLine = "Поиск ещё не запускался";
  if (osintUnavailable) statusLine = "OSINT недоступен — план вакансии сохранён, повторите позже";
  else if (!hasWebsite) statusLine = "Нужен сайт компании";
  else if (report) {
    const errors = Array.isArray(report.errors) ? report.errors : [];
    statusLine = `Поиск ${formatDate(report.observed_at)} · кандидатов ${candidates.length}`;
    if (errors.length) statusLine += ` · замечания: ${errors.length}`;
  }
  const researchControl = hasWebsite
    ? `<button class="btn btn--ghost btn--sm" data-research type="button">${report ? "Повторить поиск" : "Найти контакт"}</button>`
    : "";
  const recordControl = selected.length
    ? `<button class="btn btn--secondary btn--sm" data-record-outreach type="button">Записать контакт</button>`
    : "";
  let candidatesHtml;
  if (osintUnavailable && !report) {
    candidatesHtml = inlineState("Сервис поиска контактов сейчас недоступен.", "error");
  } else if (!report) {
    candidatesHtml = inlineState("Кандидаты появятся после поиска.");
  } else if (!candidates.length) {
    candidatesHtml = inlineState("Подходящие контакты не найдены");
  } else {
    candidatesHtml = candidates
      .slice(0, 5)
      .map((person) => renderEvidencePerson(person, report))
      .join("");
  }
  const selectedHtml = selected.length
    ? selected.map(renderConfirmedPerson).join("")
    : inlineState("Выбранных контактов пока нет.");
  const outreachHtml = outreaches.length
    ? outreaches.map(renderOutreachHistoryItem).join("")
    : inlineState("Записей о контакте пока нет.");
  return `<div class="direct-osint" data-direct-vacancy="${escapeHtml(item.id)}">
    <p class="owner-decision__label">Прямой контакт</p>
    <p class="list-row__meta">${escapeHtml(statusLine)}</p>
    <div class="action-plan__links">${researchControl}${recordControl}</div>
    <div class="row-detail__section">
      <p class="row-detail__label">Кандидаты · не проверено</p>
      ${candidatesHtml}
    </div>
    <div class="row-detail__section">
      <p class="row-detail__label">Выбранные контакты</p>
      ${selectedHtml}
    </div>
    <div class="row-detail__section">
      <p class="row-detail__label">История контактов · факт владельца</p>
      ${outreachHtml}
    </div>
  </div>`;
}

function renderEmployerResponseItem(item) {
  const typeLabel = employerResponseTypeLabels[item.response_type] || item.response_type;
  const sourceLabel = employerResponseSourceLabels[item.source] || item.source;
  const related = item.application
    ? `отклик ${formatDate(item.application.applied_at)}`
    : item.direct_outreach
      ? `контакт ${outreachMethodLabels[item.direct_outreach.method] || item.direct_outreach.method}`
      : item.person?.full_name
        ? item.person.full_name
        : "без привязки";
  return `<div class="evidence-item">
    <div class="evidence-item__head">
      <strong>${escapeHtml(typeLabel)}</strong>
      <span>${escapeHtml(sourceLabel)} · ${escapeHtml(formatDate(item.occurred_at))}</span>
    </div>
    <p class="evidence-item__excerpt">${escapeHtml(item.note || "Заметка не указана")}</p>
    <div class="evidence-item__foot">${escapeHtml(related)}</div>
  </div>`;
}

function renderEmployerResponseSection(item) {
  const responses = employerResponsesByVacancyId.get(item.id) || [];
  const responseHtml = responses.length
    ? responses.map(renderEmployerResponseItem).join("")
    : inlineState("Ответов работодателя пока нет.");
  const suggestHiring = responses.some((response) =>
    ["invitation", "interview_request"].includes(response.response_type),
  );
  const activeHiring = hiringProcessByVacancyId.get(item.id);
  const suggestControl =
    suggestHiring && !activeHiring
      ? `<button class="btn btn--ghost btn--sm" data-start-hiring type="button">Начать процесс найма</button>`
      : "";
  return `<div class="employer-responses" data-response-vacancy="${escapeHtml(item.id)}">
    <p class="owner-decision__label">Ответы работодателя</p>
    <div class="action-plan__links">
      <button class="btn btn--secondary btn--sm" data-record-response type="button">Записать ответ</button>
      ${suggestControl}
    </div>
    <div class="row-detail__section">
      <p class="row-detail__label">История ответов · факт владельца</p>
      ${responseHtml}
    </div>
  </div>`;
}

function renderHiringStageHistory(events) {
  if (!events?.length) return inlineState("Истории этапов пока нет.");
  return events
    .map((event) => {
      const label = hiringStageLabels[event.stage] || event.stage;
      return `<div class="evidence-item">
        <div class="evidence-item__head">
          <strong>${escapeHtml(label)}</strong>
          <span>${escapeHtml(formatDate(event.occurred_at))}</span>
        </div>
        <p class="evidence-item__excerpt">${escapeHtml(event.note || "Заметка не указана")}</p>
      </div>`;
    })
    .join("");
}

const hiringActivityTypeLabels = {
  screening: "Скрининг",
  interview: "Интервью",
  test_task: "Тестовое",
  other: "Другое",
};

const hiringActivityStatusLabels = {
  planned: "Запланировано",
  completed: "Завершено",
  cancelled: "Отменено",
};

const suggestedNextActionByActivityType = {
  screening: "Ждать обратную связь",
  interview: "Отправить материалы",
  test_task: "Отправлено, ждать результат",
  other: "Уточнить следующий шаг",
};

function activityAttentionAt(activity) {
  if (!activity || activity.status !== "planned") return null;
  return activity.scheduled_at || activity.due_at || null;
}

function activityDeadlineState(activity) {
  const stamp = activityAttentionAt(activity);
  if (!stamp) return "";
  const when = Date.parse(stamp);
  if (Number.isNaN(when)) return "";
  return when <= Date.now() ? "overdue" : "upcoming";
}

function sortHiringActivities(activities) {
  const items = [...(activities || [])];
  const rank = { planned: 0, completed: 1, cancelled: 2 };
  items.sort((left, right) => {
    const leftRank = rank[left.status] ?? 9;
    const rightRank = rank[right.status] ?? 9;
    if (leftRank !== rightRank) return leftRank - rightRank;
    const leftAt = Date.parse(activityAttentionAt(left) || left.created_at || 0);
    const rightAt = Date.parse(activityAttentionAt(right) || right.created_at || 0);
    return leftAt - rightAt;
  });
  return items;
}

function nearestPlannedActivity(process) {
  const planned = (process?.activities || []).filter((item) => activityAttentionAt(item));
  if (!planned.length) return null;
  return planned.reduce((best, item) => {
    const bestAt = Date.parse(activityAttentionAt(best));
    const itemAt = Date.parse(activityAttentionAt(item));
    return itemAt < bestAt ? item : best;
  });
}

function renderHiringActivities(process) {
  const activities = sortHiringActivities(process.activities || []);
  if (!activities.length) {
    return `<p class="list-row__meta">Активностей пока нет.</p>`;
  }
  return `<ul class="detail-list">${activities
    .map((activity) => {
      const typeLabel = hiringActivityTypeLabels[activity.activity_type] || activity.activity_type;
      const statusLabel = hiringActivityStatusLabels[activity.status] || activity.status;
      const title = activity.title || typeLabel;
      const when = activityAttentionAt(activity);
      const state = activityDeadlineState(activity);
      const whenLabel = when
        ? `${state === "overdue" ? "Просрочено" : state === "upcoming" ? "Срок" : "Дата"} · ${formatDate(when)}`
        : "Без даты";
      const note = activity.result || activity.note || "";
      const compact = note ? excerpt(note, 80) : "";
      const actions =
        activity.status === "planned"
          ? `<div class="action-plan__links">
              <button class="btn btn--secondary btn--sm" data-complete-hiring-activity="${escapeHtml(activity.id)}" type="button">Завершить</button>
              <button class="btn btn--ghost btn--sm" data-cancel-hiring-activity="${escapeHtml(activity.id)}" type="button">Отменить</button>
            </div>`
          : "";
      return `<li>
        <strong>${escapeHtml(title)}</strong>
        <span class="list-row__meta">${escapeHtml(typeLabel)} · ${escapeHtml(statusLabel)} · ${escapeHtml(whenLabel)}</span>
        ${compact ? `<span class="list-row__meta">${escapeHtml(compact)}</span>` : ""}
        ${actions}
      </li>`;
    })
    .join("")}</ul>`;
}

function renderHiringProcessSection(item) {
  const process = hiringProcessByVacancyId.get(item.id);
  if (!process) {
    return `<div class="hiring-process" data-hiring-vacancy="${escapeHtml(item.id)}">
      <p class="owner-decision__label">Процесс найма</p>
      <p class="list-row__meta">Активного процесса нет.</p>
      <div class="action-plan__links">
        <button class="btn btn--secondary btn--sm" data-start-hiring type="button">Начать процесс</button>
      </div>
    </div>`;
  }
  const stageLabel = hiringStageLabels[process.current_stage] || process.current_stage;
  const offerButton =
    !offersByVacancyId.get(item.id)
      ? `<button class="btn btn--secondary btn--sm" data-record-offer type="button">Записать оффер</button>`
      : "";
  if (process.status !== "active") {
    const statusLabel = process.status === "completed" ? "Завершён" : "Отменён";
    return `<div class="hiring-process" data-hiring-vacancy="${escapeHtml(item.id)}" data-hiring-process="${escapeHtml(process.id)}">
      <p class="owner-decision__label">Процесс найма</p>
      <p class="list-row__meta">${escapeHtml(statusLabel)} · этап · ${escapeHtml(stageLabel)} · с ${escapeHtml(formatDate(process.started_at))}</p>
      <div class="action-plan__links">
        <button class="btn btn--secondary btn--sm" data-start-hiring type="button">Начать новый процесс</button>
        ${offerButton}
      </div>
      <div class="row-detail__section">
        <p class="row-detail__label">Активности</p>
        ${renderHiringActivities(process)}
      </div>
      <div class="row-detail__section">
        <p class="row-detail__label">История этапов</p>
        ${renderHiringStageHistory(process.stage_events)}
      </div>
    </div>`;
  }
  return `<div class="hiring-process" data-hiring-vacancy="${escapeHtml(item.id)}" data-hiring-process="${escapeHtml(process.id)}">
    <p class="owner-decision__label">Процесс найма</p>
    <p class="list-row__meta">Этап · ${escapeHtml(stageLabel)} · с ${escapeHtml(formatDate(process.started_at))}</p>
    <div class="action-plan__links">
      <button class="btn btn--secondary btn--sm" data-transition-hiring type="button">Перейти к этапу</button>
      <button class="btn btn--secondary btn--sm" data-add-hiring-activity type="button">Добавить активность</button>
      ${offerButton}
      <button class="btn btn--ghost btn--sm" data-complete-hiring-process type="button">Завершить процесс</button>
      <button class="btn btn--ghost btn--sm" data-cancel-hiring-process type="button">Отменить процесс</button>
    </div>
    <div class="row-detail__section">
      <p class="row-detail__label">Активности</p>
      ${renderHiringActivities(process)}
    </div>
    <div class="row-detail__section">
      <p class="row-detail__label">История этапов</p>
      ${renderHiringStageHistory(process.stage_events)}
    </div>
  </div>`;
}

const offerStatusLabels = {
  pending: "Ожидает решения",
  accepted: "Принят",
  declined: "Отклонён",
};

const compensationBasisLabels = {
  gross: "gross",
  net: "net",
  unknown: "неизвестно",
};

function formatCompensation(offer) {
  if (offer?.compensation_amount == null) return "Сумма не указана";
  const currency = offer.compensation_currency || "";
  const basis = compensationBasisLabels[offer.compensation_basis] || offer.compensation_basis || "неизвестно";
  return `${offer.compensation_amount} ${currency} (${basis})`.trim();
}

function offerCell(value) {
  if (value == null || value === "") return `<span class="is-empty">пусто</span>`;
  return escapeHtml(String(value));
}

function compensationCompareWarning(offers) {
  const bases = new Set(offers.map((item) => item.compensation_basis || "unknown"));
  const currencies = new Set(
    offers
      .map((item) => String(item.compensation_currency || "").toUpperCase())
      .filter(Boolean),
  );
  const parts = [];
  if (bases.size > 1) parts.push("разный basis (gross/net/unknown) — суммы не эквивалентны");
  if (currencies.size > 1) parts.push("разная валюта — без FX-конвертации");
  if (!parts.length) return "";
  return `Нельзя напрямую сравнивать компенсацию: ${parts.join("; ")}.`;
}

function openOfferDecision(offer, status) {
  if (!offer || !offerDecisionForm || !offerDecisionDialog) return;
  offerDecisionForm.reset();
  offerDecisionForm.elements.offer_id.value = offer.id;
  offerDecisionForm.elements.status.value = status;
  if (offerDecisionContext) {
    offerDecisionContext.textContent =
      status === "accepted" ? "Подтверждение принятия оффера" : "Подтверждение отклонения оффера";
  }
  if (offerDecisionSummary) {
    const company = offer.vacancy?.company?.name || "—";
    const role = offer.position_title || offer.vacancy?.title || "—";
    offerDecisionSummary.hidden = false;
    offerDecisionSummary.innerHTML = `
      <p><strong>${escapeHtml(company)}</strong> · ${escapeHtml(role)}</p>
      <p>${escapeHtml(formatCompensation(offer))}</p>
      <p>${escapeHtml(offer.work_format || "формат н/д")} · ${escapeHtml(offer.location || "локация н/д")}${
        offer.proposed_start_date ? ` · выход ${escapeHtml(offer.proposed_start_date)}` : ""
      }</p>
      <p class="list-row__meta">Другие офферы и search cycle не изменятся автоматически.</p>
    `;
  }
  offerDecisionFormError.hidden = true;
  offerDecisionDialog.showModal();
}

function syncCompareButton() {
  if (!compareOffersButton) return;
  compareOffersButton.disabled = selectedOfferIds.size < 2;
  compareOffersButton.textContent =
    selectedOfferIds.size >= 2 ? `Сравнить (${selectedOfferIds.size})` : "Сравнить";
}

function offerRow(item) {
  const company = item.vacancy?.company?.name || "—";
  const status = offerStatusLabels[item.status] || item.status;
  const pending = item.status === "pending" ? " · требует решения" : "";
  const checked = selectedOfferIds.has(item.id) ? "checked" : "";
  const ownerNote = item.owner_comparison_note
    ? `<p class="list-row__meta">Заметка · ${escapeHtml(excerpt(item.owner_comparison_note, 80))}</p>`
    : "";
  const rank =
    item.owner_preference_rank != null
      ? `<p class="list-row__meta">Предпочтение · ${escapeHtml(String(item.owner_preference_rank))}</p>`
      : "";
  return `<article class="list-row list-row--with-leading" data-offer-id="${escapeHtml(item.id)}">
    <div class="list-row__select">
      <input type="checkbox" data-offer-select="${escapeHtml(item.id)}" aria-label="Выбрать для сравнения" ${checked}>
    </div>
    <div class="list-row__primary">
      <h3 class="list-row__title">${escapeHtml(item.vacancy?.title || "Вакансия")}</h3>
      <p class="list-row__secondary">${escapeHtml(company)} · ${escapeHtml(status)}${escapeHtml(pending)}</p>
      <p class="list-row__meta">${escapeHtml(formatCompensation(item))}</p>
      <p class="list-row__meta">${escapeHtml(item.work_format || "формат н/д")} · ${escapeHtml(item.location || "локация н/д")}${
        item.proposed_start_date ? ` · выход ${escapeHtml(item.proposed_start_date)}` : ""
      }</p>
      ${ownerNote}
      ${rank}
    </div>
  </article>`;
}

function renderOfferCompare(offers) {
  if (!offerComparePanel || !offerCompareTable) return;
  if (offers.length < 2) {
    offerComparePanel.hidden = true;
    return;
  }
  const warning = compensationCompareWarning(offers);
  if (offerCompareDisclaimer) {
    offerCompareDisclaimer.textContent =
      warning || "Компенсация показана как записана работодателем — без нормализации.";
    offerCompareDisclaimer.classList.toggle("is-warn", Boolean(warning));
  }
  const rows = [
    ["Компания / роль", (o) => `${o.vacancy?.company?.name || "—"} / ${o.position_title || o.vacancy?.title || "—"}`],
    ["Компенсация", (o) => formatCompensation(o)],
    ["Валюта", (o) => o.compensation_currency || ""],
    ["Basis", (o) => compensationBasisLabels[o.compensation_basis] || o.compensation_basis || "неизвестно"],
    ["Формат", (o) => o.work_format || ""],
    ["Локация", (o) => o.location || ""],
    ["Бонус / переменная", (o) => o.bonus_text || ""],
    ["Льготы", (o) => o.benefits_text || ""],
    ["Старт", (o) => o.proposed_start_date || ""],
    ["Прочие условия", (o) => o.note || ""],
    ["Статус", (o) => offerStatusLabels[o.status] || o.status],
  ];
  const head = `<tr><th>Параметр</th>${offers
    .map((o) => `<th>${escapeHtml(o.vacancy?.company?.name || "Оффер")}</th>`)
    .join("")}</tr>`;
  const body = rows
    .map(([label, getter]) => {
      const cells = offers.map((o) => `<td>${offerCell(getter(o))}</td>`).join("");
      return `<tr><th scope="row">${escapeHtml(label)}</th>${cells}</tr>`;
    })
    .join("");
  const ownerCells = offers
    .map((o) => {
      const closeSearch =
        o.status === "accepted" && currentSearchCycle?.status === "active"
          ? `<button class="btn btn--primary btn--sm" data-close-search="${escapeHtml(o.id)}" type="button">Завершить поиск</button>`
          : "";
      const actions =
        o.status === "pending"
          ? `<div class="offer-compare-actions">
              <button class="btn btn--secondary btn--sm" data-accept-offer="${escapeHtml(o.id)}" type="button">Принять</button>
              <button class="btn btn--ghost btn--sm" data-decline-offer="${escapeHtml(o.id)}" type="button">Отклонить</button>
            </div>`
          : `<div class="offer-compare-actions">
              <p class="list-row__meta">Решение · ${escapeHtml(formatDate(o.decided_at))}</p>
              ${closeSearch}
            </div>`;
      return `<td>
        <label class="field">
          <span class="field__label">Заметка владельца</span>
          <textarea class="control offer-compare-note" data-offer-note="${escapeHtml(o.id)}" maxlength="2000">${escapeHtml(o.owner_comparison_note || "")}</textarea>
        </label>
        <label class="field">
          <span class="field__label">Предпочтение (1 = выше)</span>
          <input class="control offer-compare-rank" data-offer-rank="${escapeHtml(o.id)}" type="number" min="1" max="99" value="${
            o.owner_preference_rank != null ? escapeHtml(String(o.owner_preference_rank)) : ""
          }">
        </label>
        <button class="btn btn--ghost btn--sm" data-save-offer-comparison="${escapeHtml(o.id)}" type="button">Сохранить заметку</button>
        ${actions}
      </td>`;
    })
    .join("");
  offerCompareTable.innerHTML = `<table class="offer-compare-table">
    <thead>${head}</thead>
    <tbody>${body}<tr><th scope="row">Оценка владельца</th>${ownerCells}</tr></tbody>
  </table>`;
  offerComparePanel.hidden = false;
}

function selectedOffers() {
  return knownOffers.filter((item) => selectedOfferIds.has(item.id));
}

async function loadOffers() {
  if (offersList) offersList.setAttribute("aria-busy", "true");
  try {
    const response = await fetch("/api/v1/offers");
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message || "Не удалось получить офферы");
    knownOffers = payload.items || [];
    offersByVacancyId = new Map();
    for (const item of knownOffers) {
      const vacancyId = item?.vacancy?.id;
      if (!vacancyId) continue;
      if (!offersByVacancyId.has(vacancyId)) offersByVacancyId.set(vacancyId, item);
    }
    selectedOfferIds = new Set(
      [...selectedOfferIds].filter((id) => knownOffers.some((item) => item.id === id)),
    );
    syncCompareButton();
    if (offersCount) setSectionCount(offersCount, payload.total);
    if (offersList) {
      if (payload.total) offersList.innerHTML = knownOffers.map(offerRow).join("");
      else {
        offersList.innerHTML = "";
        renderEmptyState(offersList, "Офферов нет", "Запишите оффер из карточки вакансии с процессом найма.");
      }
    }
    if (offerComparePanel && !offerComparePanel.hidden) {
      renderOfferCompare(selectedOffers());
    }
    if (knownVacancies?.length) renderVacancyList(knownVacancies);
  } catch (error) {
    knownOffers = [];
    offersByVacancyId = new Map();
    if (offersCount) setSectionCount(offersCount, null);
    if (offersList) {
      renderErrorState(offersList, "Не удалось загрузить офферы", error.message, loadOffers);
    }
  } finally {
    if (offersList) offersList.setAttribute("aria-busy", "false");
  }
}

function renderSearchCycleBanner() {
  if (!searchCycleBanner) return;
  if (!currentSearchCycle || currentSearchCycle.status !== "closed") {
    searchCycleBanner.hidden = true;
    searchCycleBanner.innerHTML = "";
    return;
  }
  const offer = currentSearchCycle.accepted_offer;
  const company = offer?.vacancy?.company?.name || "—";
  const role = offer?.position_title || offer?.vacancy?.title || "—";
  searchCycleBanner.hidden = false;
  searchCycleBanner.innerHTML = `
    <p class="search-cycle-banner__title">Поиск завершён</p>
    <p>Победивший оффер · ${escapeHtml(company)} · ${escapeHtml(role)}</p>
    <p>${escapeHtml(formatCompensation(offer || {}))}${
      offer?.proposed_start_date ? ` · выход ${escapeHtml(offer.proposed_start_date)}` : ""
    }</p>
    <p>Закрыт · ${escapeHtml(formatDate(currentSearchCycle.closed_at))}</p>
    <p class="list-row__meta">История вакансий, R3/R4 и офферов доступна для просмотра. Автоматизация остановлена.</p>
  `;
}

async function loadSearchCycle() {
  try {
    const response = await fetch("/api/v1/search-cycle");
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message || "Не удалось получить цикл поиска");
    currentSearchCycle = payload;
  } catch (error) {
    currentSearchCycle = null;
    showNotice(error.message, "warning");
  }
  renderSearchCycleBanner();
  const toggle = document.querySelector("#automation-toggle");
  const runNow = document.querySelector("#automation-run-now");
  const closed = currentSearchCycle?.status === "closed";
  if (toggle) toggle.disabled = Boolean(closed);
  if (runNow) runNow.disabled = Boolean(closed);
}

function openSearchCycleClose(offer) {
  if (!offer || !searchCycleCloseForm || !searchCycleCloseDialog) return;
  searchCycleCloseForm.reset();
  searchCycleCloseForm.elements.accepted_offer_id.value = offer.id;
  const company = offer.vacancy?.company?.name || "—";
  const role = offer.position_title || offer.vacancy?.title || "—";
  if (searchCycleCloseSummary) {
    searchCycleCloseSummary.innerHTML = `
      <p><strong>${escapeHtml(company)}</strong> · ${escapeHtml(role)}</p>
      <p>${escapeHtml(formatCompensation(offer))}</p>
      <p>${escapeHtml(offer.work_format || "формат н/д")} · ${escapeHtml(offer.location || "локация н/д")}${
        offer.proposed_start_date ? ` · выход ${escapeHtml(offer.proposed_start_date)}` : ""
      }</p>
      <p><strong>Будет:</strong> цикл поиска → closed; автоматизация выключена и останется выключенной после restart.</p>
      <p><strong>Не будет:</strong> писем/откликов наружу; удаления истории; авто-decline других офферов; отмены других процессов найма.</p>
    `;
  }
  if (searchCycleCloseFormError) searchCycleCloseFormError.hidden = true;
  searchCycleCloseDialog.showModal();
}

/* --- Vacancy search (R2.2.5 corrected: resume_suitable primary) --- */

function renderOfferSection(item) {
  const offer = offersByVacancyId.get(item.id);
  if (!offer) {
    return `<div class="offer-section" data-offer-vacancy="${escapeHtml(item.id)}">
      <p class="owner-decision__label">Оффер</p>
      <p class="list-row__meta">Оффер ещё не записан. Кнопка «Записать оффер» — в блоке процесса найма.</p>
    </div>`;
  }
  const status = offerStatusLabels[offer.status] || offer.status;
  const closeSearchButton =
    offer.status === "accepted" && currentSearchCycle?.status === "active"
      ? `<button class="btn btn--primary btn--sm" data-close-search="${escapeHtml(offer.id)}" type="button">Завершить поиск</button>`
      : "";
  const actions =
    offer.status === "pending"
      ? `<div class="action-plan__links">
          <button class="btn btn--secondary btn--sm" data-accept-offer="${escapeHtml(offer.id)}" type="button">Принять</button>
          <button class="btn btn--ghost btn--sm" data-decline-offer="${escapeHtml(offer.id)}" type="button">Отклонить</button>
        </div>`
      : `<div class="action-plan__links">
          <p class="list-row__meta">Решение · ${escapeHtml(formatDate(offer.decided_at))}${
            offer.decision_note ? ` · ${escapeHtml(excerpt(offer.decision_note, 80))}` : ""
          }</p>
          ${closeSearchButton}
        </div>`;
  return `<div class="offer-section" data-offer-vacancy="${escapeHtml(item.id)}" data-offer-id="${escapeHtml(offer.id)}">
    <p class="owner-decision__label">Оффер</p>
    <p class="list-row__meta">${escapeHtml(status)} · получен ${escapeHtml(formatDate(offer.received_at))}</p>
    <p class="list-row__meta">${escapeHtml(formatCompensation(offer))}</p>
    <p class="list-row__meta">${escapeHtml(offer.work_format || "формат н/д")} · ${escapeHtml(offer.location || "локация н/д")}${
      offer.proposed_start_date ? ` · выход ${escapeHtml(offer.proposed_start_date)}` : ""
    }</p>
    ${offer.bonus_text ? `<p class="list-row__meta">Бонус · ${escapeHtml(excerpt(offer.bonus_text, 100))}</p>` : ""}
    ${offer.benefits_text ? `<p class="list-row__meta">Льготы · ${escapeHtml(excerpt(offer.benefits_text, 100))}</p>` : ""}
    ${offer.note ? `<p class="list-row__meta">${escapeHtml(excerpt(offer.note, 120))}</p>` : ""}
    ${offer.owner_comparison_note ? `<p class="list-row__meta">Заметка · ${escapeHtml(excerpt(offer.owner_comparison_note, 80))}</p>` : ""}
    ${actions}
  </div>`;
}

const sourceStatusLabels = {
  active: "На источнике",
  archived: "В архиве",
  unknown: "Статус неизвестен",
};

const sourceStatusBadge = {
  active: "success",
  archived: "danger",
  unknown: "warning",
};

const FRESHNESS_DAYS = 14;

function vacancySourceStatus(item) {
  const value = item?.source_status;
  if (value === "active" || value === "archived" || value === "unknown") return value;
  return "unknown";
}

function vacancyPublicationDate(item) {
  return item?.source_published_at || item?.first_seen_at || null;
}

function vacancyFreshnessHint(item) {
  const raw = vacancyPublicationDate(item);
  if (!raw) return "";
  const ageMs = Date.now() - Date.parse(raw);
  if (Number.isNaN(ageMs) || ageMs < 0) return "";
  const days = ageMs / 86400000;
  if (days > FRESHNESS_DAYS) return "старше 14 дн.";
  return "";
}

/**
 * Map NEVER_SCORED / failed_current_identity + source_status to row action markup.
 * States: scored | archived | retry | score.
 */
function vacancyScoreActionHtml(item, assessment, failure) {
  if (assessment) return "";
  const sourceStatus = vacancySourceStatus(item);
  if (sourceStatus === "archived") {
    return `<span class="list-row__score-state" data-score-state="archived">В архиве</span>`;
  }
  if (failure) {
    return `<button class="btn btn--secondary btn--sm" data-score data-score-retry="1" type="button">Повторить оценку</button>`;
  }
  return `<button class="btn btn--secondary btn--sm" data-score type="button">Оценить</button>`;
}

function vacancySourceSignalsHtml(item) {
  const sourceStatus = vacancySourceStatus(item);
  const freshness = vacancyFreshnessHint(item);
  const badge = renderBadge(
    sourceStatusLabels[sourceStatus] || sourceStatus,
    sourceStatusBadge[sourceStatus] || "neutral",
  );
  const hint = freshness
    ? `<span class="list-row__freshness" data-freshness="stale">${escapeHtml(freshness)}</span>`
    : "";
  return `${badge}${hint}`;
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
  const channel = vacancyActionChannel(item);
  const directChannel = channel === "direct" || channel === "both";
  const report = osintReports.find((candidate) => candidate.vacancy_id === item.id);
  const people = report?.people || [];
  const selectedPeople = peopleByVacancyId.get(item.id) || [];
  const mirrorReport = mirrorReports.find((candidate) => candidate.vacancy_id === item.id);
  const mirrors = mirrorReport?.mirrors || [];
  const peopleHtml = people.length
    ? people.slice(0, 3).map((person) => renderEvidencePerson(person, report, { selectLabel: "Подтвердить в Core" })).join("")
    : inlineState("Непроверенные контакты ещё не найдены.");
  const mirrorsHtml = mirrors.length
    ? mirrors.slice(0, 3).map((mirror) => renderMirrorItem(mirror, item)).join("")
    : inlineState("Зеркала вакансии ещё не найдены.");
  const researchButtons = item.company.website_url
    ? `<div class="row-detail__actions">
        ${directChannel ? "" : `<button class="btn btn--ghost btn--sm" data-research type="button">${report ? "Обновить контакты" : "Найти контакты"}</button>`}
        <button class="btn btn--ghost btn--sm" data-mirrors type="button">${mirrorReport ? "Обновить зеркала" : "Найти зеркала"}</button>
      </div>`
    : directChannel
      ? ""
      : inlineState("Для поиска контактов и зеркал сначала нужен сайт компании.");
  const evidenceCount = people.length + mirrors.length + selectedPeople.length;
  const assessment = assessmentsByVacancyId.get(item.id);
  const failure = semanticFailuresByVacancyId.get(item.id);
  const scoringState = vacancyScoringState(item, assessment, failure);
  const ownerDecision = vacancyOwnerDecision(item);
  const actionQueueLabel = vacancyActionQueueLabel(item);
  const assessmentSummary = renderVacancyAssessmentSummary(assessment, failure);
  const assessmentDetail = renderVacancyAssessmentDetail(assessment, failure);
  const scoreAction = vacancyScoreActionHtml(item, assessment, failure);
  const sourceSignals = vacancySourceSignalsHtml(item);
  const facts = vacancyFactsLine(item);
  const hhId = item.source === "hh" ? item.external_id : "";
  const detailParts = ["Разбор"];
  if (directChannel) detailParts.push("Прямой контакт");
  else if (evidenceCount) detailParts.push(`Контакты и зеркала · ${evidenceCount}`);
  else if (item.company.website_url) detailParts.push("OSINT и зеркала");
  const detailSummary = detailParts.join(" · ");
  const detailSections = [
    renderOwnerDecisionControls(item),
    renderActionPlanControls(item),
    renderDirectOsintSection(item),
    renderEmployerResponseSection(item),
    renderHiringProcessSection(item),
    renderOfferSection(item),
    assessmentDetail,
    `<div class="row-detail__section">
      <p class="row-detail__label">Материал вакансии</p>
      <p class="assessment-detail__reason">${escapeHtml(excerpt(item.description, 600))}</p>
      <p class="list-row__meta">Источник: <a class="inline-link" href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">${escapeHtml(item.url)}</a>${hhId ? ` · HH ${escapeHtml(hhId)}` : ""}</p>
    </div>`,
  ];
  if (!directChannel && (item.company.website_url || evidenceCount)) {
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
  } else if (directChannel && item.company.website_url) {
    detailSections.push(
      `<div class="row-detail__actions">
        <button class="btn btn--ghost btn--sm" data-mirrors type="button">${mirrorReport ? "Обновить зеркала" : "Найти зеркала"}</button>
      </div>`,
      `<div class="row-detail__section">
        <p class="row-detail__label">Зеркала · не проверено</p>
        ${mirrorsHtml}
      </div>`,
    );
  }
  const detailBlock = `<details class="row-detail">
        <summary class="row-detail__summary">${escapeHtml(detailSummary)}</summary>
        <div class="row-detail__body">
          ${detailSections.join("")}
        </div>
      </details>`;
  return `<article class="list-row-group list-row-group--vacancy" data-id="${escapeHtml(item.id)}" data-status="${escapeHtml(item.status)}" data-source-status="${escapeHtml(vacancySourceStatus(item))}" data-scoring-state="${escapeHtml(scoringState)}" data-owner-decision="${escapeHtml(ownerDecision)}" data-action-channel="${escapeHtml(vacancyActionChannel(item))}" data-verdict="${escapeHtml(normalizeVerdict(assessment?.verdict) || "")}">
    <div class="list-row">
      <div class="list-row__primary">
        <div class="list-row__identity">
          <h3 class="list-row__title">${escapeHtml(item.title)}</h3>
          <div class="list-row__badges">
            ${renderBadge(ownerDecisionLabels[ownerDecision], ownerDecisionBadge[ownerDecision] || "neutral")}
            ${actionQueueLabel ? renderBadge(actionQueueLabel, actionQueueLabel === "план" ? "info" : "warning") : ""}
            ${sourceSignals}
            ${renderBadge(statusLabels[item.status] || item.status, vacancyStatusBadge[item.status] || "neutral")}
          </div>
        </div>
        <p class="list-row__secondary">${escapeHtml(item.company.name)}${facts ? ` · ${escapeHtml(facts)}` : ""}</p>
        <p class="list-row__published">Опубликована: <time datetime="${escapeHtml(vacancyPublicationDate(item) || "")}">${escapeHtml(formatFirstSeen(vacancyPublicationDate(item)))}</time>${hhId ? ` · HH ${escapeHtml(hhId)}` : ""}</p>
      </div>
      <div class="list-row__trailing">
        ${assessmentSummary}
        <div class="list-row__actions">
          <a class="btn btn--ghost btn--sm" href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">HH ↗</a>
          <label class="list-row__control"><span class="sr-only">Воронка</span><select class="control control--select" data-status>${options}</select></label>
          ${scoreAction}
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
    peopleByVacancyId = new Map();
    for (const item of payload.items || []) {
      const vacancyId = item?.vacancy?.id;
      if (!vacancyId) continue;
      const list = peopleByVacancyId.get(vacancyId) || [];
      list.push(item);
      peopleByVacancyId.set(vacancyId, list);
    }
    setSectionCount(peopleCount, payload.total);
    peopleGrid.innerHTML = payload.total ? payload.items.map(personRow).join("") : "";
    if (!payload.total) {
      renderEmptyState(peopleGrid, "Контактов пока нет", "Добавьте подтверждённого человека к вакансии.", {
        buttonId: "open-person-form",
        label: "+ Добавить контакт",
      });
    }
    if (knownVacancies?.length) renderVacancyList(knownVacancies);
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
    applicationsByVacancyId = new Map();
    for (const item of payload.items || []) {
      const vacancyId = item?.vacancy?.id;
      if (!vacancyId) continue;
      const list = applicationsByVacancyId.get(vacancyId) || [];
      list.push(item);
      applicationsByVacancyId.set(vacancyId, list);
    }
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

async function loadDirectOutreaches() {
  try {
    const response = await fetch("/api/v1/direct-outreaches");
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message || "Не удалось получить историю контактов");
    outreachesByVacancyId = new Map();
    for (const item of payload.items || []) {
      const vacancyId = item?.vacancy?.id;
      if (!vacancyId) continue;
      const list = outreachesByVacancyId.get(vacancyId) || [];
      list.push(item);
      outreachesByVacancyId.set(vacancyId, list);
    }
    if (knownVacancies?.length) renderVacancyList(knownVacancies);
  } catch (_error) {
    outreachesByVacancyId = new Map();
  }
}

async function loadEmployerResponses() {
  try {
    const response = await fetch("/api/v1/employer-responses");
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message || "Не удалось получить ответы работодателей");
    employerResponsesByVacancyId = new Map();
    for (const item of payload.items || []) {
      const vacancyId = item?.vacancy?.id;
      if (!vacancyId) continue;
      const list = employerResponsesByVacancyId.get(vacancyId) || [];
      list.push(item);
      employerResponsesByVacancyId.set(vacancyId, list);
    }
    if (knownVacancies?.length) renderVacancyList(knownVacancies);
  } catch (_error) {
    employerResponsesByVacancyId = new Map();
  }
}

function hiringProcessRow(item) {
  const stageLabel = hiringStageLabels[item.current_stage] || item.current_stage;
  const company = item.vacancy?.company?.name || "—";
  const next = item.vacancy?.next_action || "Шаг не указан";
  const nextDue = nextActionAttentionAt(item);
  const nextDueState = deadlineStateFromStamp(nextDue);
  const nextDueLabel = nextDue
    ? `${nextDueState === "overdue" ? "Просрочено" : "Срок шага"} · ${formatDate(nextDue)}`
    : item.vacancy?.next_action && !item.vacancy?.next_action_done
      ? "Срок шага не указан"
      : "";
  const nearest = nearestPlannedActivity(item);
  const activityState = nearest ? activityDeadlineState(nearest) : "";
  const activityLabel = nearest
    ? `${activityState === "overdue" ? "Просрочено" : "Активность"} · ${
        hiringActivityTypeLabels[nearest.activity_type] || nearest.activity_type
      } · ${formatDate(activityAttentionAt(nearest))}`
    : "Плановых активностей нет";
  const attention = processAttentionState(item);
  const attentionBadge =
    attention === "overdue"
      ? "Требует внимания · просрочено"
      : attention === "upcoming"
        ? "Ближайший срок"
        : attention === "undated"
          ? "Есть шаг без срока"
          : "Нет датированной работы";
  return `<article class="list-row" data-hiring-id="${escapeHtml(item.id)}">
    <div class="list-row__primary">
      <h3 class="list-row__title">${escapeHtml(item.vacancy?.title || "Вакансия")}</h3>
      <p class="list-row__secondary">${escapeHtml(company)} · ${escapeHtml(stageLabel)}</p>
      <p class="list-row__meta">${escapeHtml(attentionBadge)}</p>
      <p class="list-row__meta">Следующий шаг: ${escapeHtml(next)}${nextDueLabel ? ` · ${escapeHtml(nextDueLabel)}` : ""}</p>
      <p class="list-row__meta">${escapeHtml(activityLabel)}</p>
    </div>
  </article>`;
}

async function loadHiringProcesses() {
  if (hiringList) hiringList.setAttribute("aria-busy", "true");
  try {
    const [activeResponse, allResponse] = await Promise.all([
      fetch("/api/v1/hiring-processes?status=active"),
      fetch("/api/v1/hiring-processes"),
    ]);
    const activePayload = await activeResponse.json();
    const allPayload = await allResponse.json();
    if (!activeResponse.ok) {
      throw new Error(activePayload.message || "Не удалось получить процессы найма");
    }
    if (!allResponse.ok) {
      throw new Error(allPayload.message || "Не удалось получить историю найма");
    }
    activeHiringProcesses = activePayload.items || [];
    hiringProcessByVacancyId = new Map();
    const ranked = [...(allPayload.items || [])].sort((left, right) => {
      const leftActive = left.status === "active" ? 0 : 1;
      const rightActive = right.status === "active" ? 0 : 1;
      if (leftActive !== rightActive) return leftActive - rightActive;
      return String(right.updated_at || "").localeCompare(String(left.updated_at || ""));
    });
    for (const item of ranked) {
      const vacancyId = item?.vacancy?.id;
      if (!vacancyId || hiringProcessByVacancyId.has(vacancyId)) continue;
      hiringProcessByVacancyId.set(vacancyId, item);
    }
    if (hiringCount) setSectionCount(hiringCount, activePayload.total);
    if (hiringList) {
      if (activePayload.total) hiringList.innerHTML = activeHiringProcesses.map(hiringProcessRow).join("");
      else {
        hiringList.innerHTML = "";
        renderEmptyState(
          hiringList,
          "Активных процессов нет",
          "Начните процесс из карточки вакансии после ответа работодателя.",
        );
      }
    }
    if (knownVacancies?.length) renderVacancyList(knownVacancies);
  } catch (error) {
    hiringProcessByVacancyId = new Map();
    activeHiringProcesses = [];
    if (hiringCount) setSectionCount(hiringCount, null);
    if (hiringList) {
      renderErrorState(hiringList, "Не удалось загрузить процессы найма", error.message, loadHiringProcesses);
    }
  } finally {
    if (hiringList) hiringList.setAttribute("aria-busy", "false");
  }
}

/* --- Vacancy search (R2.2.5 corrected: resume_suitable primary) --- */

let vacancySearchRunning = false;
let vacancyListFilter = {
  text: "",
  status: "",
  verdict: "",
  scoring: "",
  fresh: "",
  owner: "",
};
let vacancyListSort = "priority";
let vacancyPage = { limit: 50, offset: 0, total: 0 };
let semanticFailedIds = [];

function indexAssessmentsFromVacancies(items) {
  const byVacancy = new Map();
  for (const item of items || []) {
    const assessment = item?.current_assessment;
    if (!assessment) continue;
    byVacancy.set(item.id, { ...assessment, vacancy: { id: item.id } });
  }
  return byVacancy;
}

function buildVacancyListQuery() {
  const params = new URLSearchParams();
  params.set("limit", String(vacancyPage.limit));
  params.set("offset", String(vacancyPage.offset));
  const sort = vacancyListSort || "priority";
  params.set("sort", sort);
  // Keep review_order for priority so older Core builds and filters stay aligned.
  if (sort === "priority") params.set("review_order", "true");
  params.set("include_current_assessment", "true");
  const text = (vacancyListFilter.text || "").trim();
  if (text) params.set("q", text);
  if (vacancyListFilter.status) params.set("status", vacancyListFilter.status);
  if (vacancyListFilter.verdict) params.set("verdict", vacancyListFilter.verdict);
  if (vacancyListFilter.scoring) params.set("scoring_state", vacancyListFilter.scoring);
  if (vacancyListFilter.fresh) params.set("source_status", vacancyListFilter.fresh);
  if (vacancyListFilter.owner) params.set("owner_decision", vacancyListFilter.owner);
  for (const id of semanticFailedIds) {
    params.append("semantic_failed_id", id);
  }
  return params;
}

function renderVacancyPagination() {
  const nav = document.querySelector("#vacancy-pagination");
  const range = document.querySelector("#vacancy-page-range");
  const prev = document.querySelector("#vacancy-page-prev");
  const next = document.querySelector("#vacancy-page-next");
  const size = document.querySelector("#vacancy-page-size");
  if (!nav || !range || !prev || !next) return;
  const total = vacancyPage.total || 0;
  const limit = vacancyPage.limit || 50;
  const offset = vacancyPage.offset || 0;
  if (!total) {
    nav.hidden = true;
    return;
  }
  nav.hidden = false;
  const from = offset + 1;
  const to = Math.min(offset + limit, total);
  range.textContent = `${from}–${to} из ${total}`;
  prev.disabled = offset <= 0;
  next.disabled = offset + limit >= total;
  if (size && String(size.value) !== String(limit)) size.value = String(limit);
}

function renderVacancyList(items) {
  setSectionCount(count, vacancyPage.total);
  grid.innerHTML = items.length ? items.map(vacancyRow).join("") : "";
  renderVacancyPagination();
  if (!vacancyPage.total) {
    const hasFilters = Object.values(vacancyListFilter).some(Boolean);
    if (hasFilters) {
      renderEmptyState(
        grid,
        "Ничего не найдено в фильтре",
        "Сбросьте фильтры очереди, чтобы снова увидеть вакансии.",
      );
    } else {
      renderEmptyState(grid, "Вакансий пока нет", "Проверьте подходящие вакансии по рабочему резюме или добавьте вручную.", {
        buttonId: "suitable-run",
        label: "Проверить подходящие",
      });
    }
    const nav = document.querySelector("#vacancy-pagination");
    if (nav) nav.hidden = true;
  }
}

function compareVacanciesByFirstSeen(a, b, ascending) {
  const ta = Date.parse(a.first_seen_at || a.created_at || "");
  const tb = Date.parse(b.first_seen_at || b.created_at || "");
  const safeA = Number.isNaN(ta) ? 0 : ta;
  const safeB = Number.isNaN(tb) ? 0 : tb;
  return ascending ? safeA - safeB : safeB - safeA;
}
const SEARCH_RECOVERY = {
  browser_login_required: "Нужно войти в HeadHunter",
  browser_session_not_logged_in: "Нужно войти в HeadHunter",
  not_authorized: "Нужно войти в HeadHunter",
  browser_captcha_or_action_required: "HeadHunter требует действие в браузере",
  action_required: "HeadHunter требует действие в браузере",
  profile_locked: "Браузер HeadHunter сейчас используется",
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

const SEARCH_RECOVERY_HISTORY = {
  profile_locked: "Во время проверки браузер HeadHunter был занят",
  browser_login_required: "Нужно было войти в HeadHunter",
  browser_session_not_logged_in: "Нужно было войти в HeadHunter",
  not_authorized: "Нужно было войти в HeadHunter",
  browser_captcha_or_action_required: "HeadHunter требовал действие в браузере",
  action_required: "HeadHunter требовал действие в браузере",
  transport_unavailable: "HeadHunter был недоступен",
  browser_vacancy_read_failed: "HeadHunter был недоступен",
  hh_unavailable: "HeadHunter был недоступен",
};

function humanRecovery(code, { historical = false } = {}) {
  if (!code) return "";
  if (historical) {
    return (
      SEARCH_RECOVERY_HISTORY[code] ||
      SEARCH_RECOVERY[code] ||
      "Проверка завершилась с ошибкой"
    );
  }
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

function hhConnectionLooksHealthy() {
  const status = hhConnection?.dataset?.status || "";
  return status === "connected";
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
  const historyDetail = humanRecovery(run.error_code, { historical: true });
  let headline = `Последняя проверка: ${when}`;
  let detail = "";
  if (status === "running") {
    headline = "Проверяем подходящие вакансии…";
  } else if (status === "success" && processed === 0) {
    detail = "подходящих вакансий в этой проверке нет";
  } else if (status === "success") {
    detail = "завершена";
  } else if (status === "partial") {
    detail = "завершена не полностью";
  } else if (status === "failed") {
    detail = "завершилась с ошибкой";
  }
  if (status !== "running" && detail) {
    headline = `Последняя проверка: ${when} — ${detail}`;
  }
  const counts =
    status === "failed" && processed === 0
      ? ""
      : status === "running"
        ? ""
        : `Проверено: ${processed}. Новых: ${created}. Обновлено: ${updated}. Уже в базе: ${unchanged}.`;
  const historyNote =
    status === "failed" && historyDetail
      ? historyDetail
      : status === "partial" && historyDetail
        ? historyDetail
        : "";
  last.hidden = false;
  const healthyNow = hhConnectionLooksHealthy() && status !== "running";
  last.classList.toggle("is-history", healthyNow && status === "failed");
  last.classList.toggle("is-error", status === "failed" && !healthyNow);
  body.textContent = [headline, counts, historyNote].filter(Boolean).join(" · ");
}

async function loadVacancies({ resetOffset = false } = {}) {
  if (resetOffset) vacancyPage.offset = 0;
  grid.setAttribute("aria-busy", "true");
  if (!vacancySearchRunning) {
    renderLoadingState(grid, "Загружаем вакансии", "Web запрашивает страницу очереди у Core API.");
  }
  try {
    const response = await fetch(`/api/v1/vacancies?${buildVacancyListQuery()}`);
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message || "Не удалось получить вакансии");
    signal.classList.add("online");
    signal.classList.remove("offline");
    connectionLabel.textContent = "Core доступен";
    knownVacancies = payload.items || [];
    vacancyPage.total = Number(payload.total || 0);
    vacancyPage.limit = Number(payload.limit || vacancyPage.limit || 50);
    vacancyPage.offset = Number(payload.offset || 0);
    assessmentsByVacancyId = indexAssessmentsFromVacancies(knownVacancies);
    renderVacancyList(knownVacancies);
    void enrichVacancyBoardSecondary();
  } catch (error) {
    setSectionCount(count, null);
    signal.classList.add("offline");
    signal.classList.remove("online");
    connectionLabel.textContent = "Core недоступен";
    assessmentsByVacancyId = new Map();
    vacancyPage.total = 0;
    renderErrorState(grid, "Не удалось загрузить вакансии", error.message, () => loadVacancies());
    const nav = document.querySelector("#vacancy-pagination");
    if (nav) nav.hidden = true;
  } finally {
    grid.setAttribute("aria-busy", "false");
  }
}

async function enrichVacancyBoardSecondary() {
  const previousFailed = semanticFailedIds.join(",");
  try {
    const [osintResponse, mirrorResponse, failuresResponse] = await Promise.all([
      fetch("/api/v1/osint/people-proposals"),
      fetch("/api/v1/osint/vacancy-mirrors"),
      fetch("/api/v1/semantic-failures"),
    ]);
    const osintPayload = await osintResponse.json().catch(() => ({ items: [] }));
    const mirrorPayload = await mirrorResponse.json().catch(() => ({ items: [] }));
    osintUnavailable = !osintResponse.ok;
    osintReports = osintResponse.ok ? osintPayload.items || [] : [];
    mirrorReports = mirrorResponse.ok ? mirrorPayload.items || [] : [];
    if (failuresResponse.ok) {
      const failuresPayload = await failuresResponse.json();
      semanticFailuresByVacancyId = indexSemanticFailuresByVacancy(failuresPayload.items);
      semanticFailedIds = [...semanticFailuresByVacancyId.keys()];
    }
  } catch (_error) {
    osintUnavailable = true;
    // Secondary enrichment must not blank the review queue.
  }
  const failedChanged = semanticFailedIds.join(",") !== previousFailed;
  const needsFailedFilter =
    vacancyListFilter.scoring === "failed" || vacancyListFilter.scoring === "unscored";
  if (failedChanged && needsFailedFilter) {
    await loadVacancies();
    return;
  }
  if (knownVacancies?.length) renderVacancyList(knownVacancies);
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

let latestSuitableRunCache = null;
let latestSuitableRunMeta = {};

async function loadLatestSuitableRun() {
  const response = await fetch("/api/v1/search-runs");
  const payload = await response.json();
  if (!response.ok || !payload.items?.length) return;
  const latest = payload.items.find((item) => item.acquisition_kind === "resume_suitable") || null;
  if (!latest) return;
  const title = latest.candidate_context_snapshot?.hh_resume_title;
  latestSuitableRunCache = latest;
  latestSuitableRunMeta = { sourceTotal: latest.source_total, resumeTitle: title };
  renderSuitableSummary(latest, latestSuitableRunMeta);
  if (latest.status === "running") {
    setSuitableRunning(true);
    setSuitableStatus("Проверяем подходящие вакансии…", { running: true });
  }
}

function refreshSuitableHistoryPresentation() {
  if (!latestSuitableRunCache) return;
  renderSuitableSummary(latestSuitableRunCache, latestSuitableRunMeta);
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
      latestSuitableRunCache = run;
      latestSuitableRunMeta = {
        sourceTotal: payload.source_total ?? run.source_total,
        resumeTitle,
      };
      renderSuitableSummary(run, latestSuitableRunMeta);
    }
    if (!response.ok && !run) {
      setSuitableStatus(humanRecovery(payload.code) || payload.message || "Проверка не удалась", {
        error: true,
      });
      return;
    }
    const status = String(run?.status || payload.status || "");
    if (status === "failed") {
      // Completed run: keep the live status line neutral; details live in history block.
      setSuitableStatus("Последняя проверка завершилась с ошибкой", { error: false });
      renderSuitableSummary(run, {
        sourceTotal: payload.source_total ?? run?.source_total,
        resumeTitle,
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

function formatAutomationTime(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("ru-RU", { hour12: false });
  } catch (_error) {
    return String(value);
  }
}

function isLiveHhEgressBroken(hhHealth) {
  if (!hhHealth) return false;
  return (
    hhHealth.browser_egress === "unavailable" ||
    hhHealth.code === "browser_proxy_unavailable" ||
    (hhHealth.egress && hhHealth.egress.proxy_connect_ok === false)
  );
}

function isLiveHhEgressOk(hhHealth) {
  if (!hhHealth) return false;
  if (isLiveHhEgressBroken(hhHealth)) return false;
  return (
    hhHealth.browser_egress === "ok" ||
    (hhHealth.egress && hhHealth.egress.proxy_connect_ok === true) ||
    hhHealth.status === "ok"
  );
}

function humanizeAutomationCycleError(raw) {
  const text = String(raw || "").trim();
  if (!text) return "";
  const lower = text.toLowerCase();
  if (lower.includes("browser_proxy_unavailable") || lower.includes("browser egress")) {
    return "сетевой выход HeadHunter был недоступен";
  }
  // Drop internal operator runbook phrases from any historical payload.
  return text
    .replace(/;\s*restart the workspace with make\s+\w+\.?/gi, "")
    .replace(/\bmake\s+(?:boot|up|restart)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function renderAutomationStatus(payload, hhHealth = null) {
  const statusLine = document.querySelector("#automation-status-line");
  const healthLine = document.querySelector("#automation-health-line");
  const metaLine = document.querySelector("#automation-meta-line");
  const errorLine = document.querySelector("#automation-error-line");
  const historyLine = document.querySelector("#automation-history-line");
  const toggle = document.querySelector("#automation-toggle");
  if (!statusLine || !metaLine || !errorLine || !toggle) return;
  const enabled = Boolean(payload?.enabled);
  const running = Boolean(payload?.running);
  const lastStatus = payload?.last_status || "never_run";
  statusLine.textContent = `Автоматизация: ${enabled ? "ВКЛ" : "ВЫКЛ"}${running ? " · выполняется" : ""}`;
  if (healthLine) {
    if (isLiveHhEgressBroken(hhHealth)) {
      healthLine.textContent = "Сетевой выход HeadHunter: недоступен";
    } else if (isLiveHhEgressOk(hhHealth)) {
      healthLine.textContent = "Сетевой выход HeadHunter: доступен";
    } else {
      healthLine.textContent = "Сетевой выход HeadHunter: не проверен";
    }
  }
  const cycle = payload?.last_cycle || {};
  const counts = [
    cycle.created != null ? `new ${cycle.created}` : null,
    cycle.updated != null ? `changed ${cycle.updated}` : null,
    cycle.unchanged != null ? `unchanged ${cycle.unchanged}` : null,
    cycle.scoring_enqueued != null ? `enqueued ${cycle.scoring_enqueued}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const lastAt = formatAutomationTime(payload?.last_finished_at || payload?.last_started_at);
  metaLine.textContent = [
    `Последний цикл: ${lastAt}`,
    `результат: ${lastStatus}`,
    enabled ? `Следующий: ${formatAutomationTime(payload?.next_run_at)}` : null,
    counts || null,
  ]
    .filter(Boolean)
    .join(" · ");

  const liveEgressBroken = isLiveHhEgressBroken(hhHealth);
  if (liveEgressBroken) {
    errorLine.hidden = false;
    errorLine.textContent =
      "Сейчас: сетевой выход HeadHunter недоступен. Повторите позже — это текущая инфраструктурная проблема, не история цикла.";
  } else {
    errorLine.hidden = true;
    errorLine.textContent = "";
  }

  if (historyLine) {
    const historical = humanizeAutomationCycleError(payload?.last_error);
    if (historical && lastStatus === "error") {
      historyLine.hidden = false;
      historyLine.textContent = `Последний цикл завершился с ошибкой (${lastAt}): ${historical}`;
    } else if (historical) {
      historyLine.hidden = false;
      historyLine.textContent = `История цикла (${lastAt}): ${historical}`;
    } else {
      historyLine.hidden = true;
      historyLine.textContent = "";
    }
  }
  toggle.textContent = enabled ? "Выключить" : "Включить";
  toggle.dataset.enabled = enabled ? "1" : "0";
}

async function loadAutomationStatus() {
  let hhHealth = null;
  try {
    const hhResponse = await fetch("/api/v1/hh/health");
    hhHealth = await hhResponse.json();
  } catch (_error) {
    hhHealth = { browser_egress: "unavailable", code: "hh_unavailable" };
  }
  try {
    const response = await fetch("/api/v1/automation/status");
    const payload = await response.json();
    if (!response.ok) {
      renderAutomationStatus(
        {
          enabled: false,
          last_status: "unavailable",
          last_error: payload.message || payload.code || "unavailable",
        },
        hhHealth
      );
      return;
    }
    renderAutomationStatus(payload, hhHealth);
  } catch (error) {
    renderAutomationStatus(
      {
        enabled: false,
        last_status: "unavailable",
        last_error: error.message || "unavailable",
      },
      hhHealth
    );
  }
}

async function toggleAutomation() {
  const toggle = document.querySelector("#automation-toggle");
  if (!toggle) return;
  const next = toggle.dataset.enabled !== "1";
  toggle.disabled = true;
  try {
    const response = await fetch("/api/v1/automation/enable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: next }),
    });
    const payload = await response.json();
    if (!response.ok) {
      showNotice(payload.message || "Не удалось переключить автоматизацию", "warning");
      return;
    }
    await loadAutomationStatus();
    showNotice(next ? "Автоматизация включена" : "Автоматизация выключена");
  } catch (error) {
    showNotice(error.message || "Не удалось переключить автоматизацию", "warning");
  } finally {
    toggle.disabled = false;
  }
}

async function runAutomationNow() {
  const button = document.querySelector("#automation-run-now");
  if (!button || button.disabled) return;
  button.disabled = true;
  const prev = button.textContent;
  button.textContent = "Цикл…";
  showNotice("Запускаем цикл автоматизации…");
  try {
    const response = await fetch("/api/v1/automation/run-now", { method: "POST" });
    const payload = await response.json();
    if (response.status === 409 || payload.status === "skipped_already_running") {
      showNotice("Цикл уже выполняется", "warning");
      await loadAutomationStatus();
      return;
    }
    if (!response.ok && !payload.ok) {
      const detail = payload.detail || payload;
      showNotice(
        detail.message || detail.code || payload.message || "Цикл не выполнен",
        "warning",
      );
      await loadAutomationStatus();
      return;
    }
    const cycle = payload.cycle || {};
    showNotice(
      `Цикл завершён: enqueued ${cycle.scoring_enqueued ?? 0}, new ${cycle.created ?? 0}, changed ${cycle.updated ?? 0}`,
    );
    await loadAutomationStatus();
    await loadVacancies();
  } catch (error) {
    showNotice(error.message || "Цикл не выполнен", "warning");
  } finally {
    button.disabled = false;
    button.textContent = prev;
    await loadAutomationStatus();
  }
}

function initAutomationControls() {
  const toggle = document.querySelector("#automation-toggle");
  const runNow = document.querySelector("#automation-run-now");
  if (toggle) toggle.addEventListener("click", () => void toggleAutomation());
  if (runNow) runNow.addEventListener("click", () => void runAutomationNow());
  void loadAutomationStatus();
}

function initVacancyListFilter() {
  const text = document.querySelector("#vacancy-filter-text");
  const status = document.querySelector("#vacancy-filter-status");
  const verdict = document.querySelector("#vacancy-filter-verdict");
  const scoring = document.querySelector("#vacancy-filter-scoring");
  const fresh = document.querySelector("#vacancy-filter-fresh");
  const owner = document.querySelector("#vacancy-filter-owner");
  const sort = document.querySelector("#vacancy-sort");
  let textTimer;
  const applyFilters = () => {
    vacancyListFilter = {
      text: text?.value || "",
      status: status?.value || "",
      verdict: verdict?.value || "",
      scoring: scoring?.value || "",
      fresh: fresh?.value || "",
      owner: owner?.value || "",
    };
    vacancyListSort = sort?.value || "priority";
    void loadVacancies({ resetOffset: true });
  };
  text?.addEventListener("input", () => {
    window.clearTimeout(textTimer);
    textTimer = window.setTimeout(applyFilters, 300);
  });
  status?.addEventListener("change", applyFilters);
  verdict?.addEventListener("change", applyFilters);
  scoring?.addEventListener("change", applyFilters);
  fresh?.addEventListener("change", applyFilters);
  owner?.addEventListener("change", applyFilters);
  sort?.addEventListener("change", applyFilters);

  document.querySelector("#vacancy-page-prev")?.addEventListener("click", () => {
    vacancyPage.offset = Math.max(0, vacancyPage.offset - vacancyPage.limit);
    void loadVacancies();
  });
  document.querySelector("#vacancy-page-next")?.addEventListener("click", () => {
    vacancyPage.offset = vacancyPage.offset + vacancyPage.limit;
    void loadVacancies();
  });
  document.querySelector("#vacancy-page-size")?.addEventListener("change", (event) => {
    const value = Number(event.target.value);
    if (![25, 50, 100].includes(value)) return;
    vacancyPage.limit = value;
    void loadVacancies({ resetOffset: true });
  });
}

function initVacancySearch() {
  initVacancySearchTabs();
  initVacancyListFilter();
  initAutomationControls();
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
  const decisionButton = event.target.closest("[data-owner-decision]");
  if (decisionButton) {
    const card = decisionButton.closest("[data-id]");
    const vacancyId = card?.dataset.id;
    const ownerDecision = decisionButton.dataset.ownerDecision;
    if (!vacancyId || !ownerDecision) return;
    decisionButton.disabled = true;
    try {
      const response = await fetch(`/api/v1/vacancies/${vacancyId}/owner-decision`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner_decision: ownerDecision }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "Решение не сохранено");
      const label = ownerDecisionLabels[payload.owner_decision] || payload.owner_decision;
      showNotice(`Решение: ${label}`);
      await loadVacancies();
    } catch (error) {
      showNotice(error.message, "error");
      decisionButton.disabled = false;
    }
    return;
  }
  const channelButton = event.target.closest("[data-action-channel]");
  if (channelButton) {
    const card = channelButton.closest("[data-id]");
    const vacancyId = card?.dataset.id;
    const actionChannel = channelButton.dataset.actionChannel;
    if (!vacancyId || !actionChannel) return;
    channelButton.disabled = true;
    const input = card.querySelector("[data-next-action-input]");
    const currentNext = String(input?.value || "").trim();
    const body = { action_channel: actionChannel };
    if (!currentNext && actionChannelDefaults[actionChannel]) {
      body.next_action = actionChannelDefaults[actionChannel];
    }
    try {
      const response = await fetch(`/api/v1/vacancies/${vacancyId}/action-plan`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "Канал не сохранён");
      showNotice(`Канал: ${actionChannelLabels[payload.action_channel] || payload.action_channel}`);
      await loadVacancies();
    } catch (error) {
      showNotice(error.message, "error");
      channelButton.disabled = false;
    }
    return;
  }
  const clearChannelButton = event.target.closest("[data-clear-action-channel]");
  if (clearChannelButton) {
    const card = clearChannelButton.closest("[data-id]");
    const vacancyId = card?.dataset.id;
    if (!vacancyId) return;
    clearChannelButton.disabled = true;
    try {
      const response = await fetch(`/api/v1/vacancies/${vacancyId}/action-plan`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clear_action_channel: true }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "Канал не сброшен");
      showNotice("Канал сброшен");
      await loadVacancies();
    } catch (error) {
      showNotice(error.message, "error");
      clearChannelButton.disabled = false;
    }
    return;
  }
  const saveNextButton = event.target.closest("[data-save-next-action]");
  if (saveNextButton) {
    const card = saveNextButton.closest("[data-id]");
    const vacancyId = card?.dataset.id;
    const input = card?.querySelector("[data-next-action-input]");
    const dueInput = card?.querySelector("[data-next-action-due-input]");
    if (!vacancyId || !input) return;
    saveNextButton.disabled = true;
    const nextAction = String(input.value || "").trim();
    const dueRaw = String(dueInput?.value || "").trim();
    let body;
    if (!nextAction) {
      body = { clear_next_action: true };
    } else {
      body = { next_action: nextAction, next_action_done: false };
      if (dueRaw) body.next_action_at = new Date(dueRaw).toISOString();
      else body.clear_next_action_at = true;
    }
    try {
      const response = await fetch(`/api/v1/vacancies/${vacancyId}/action-plan`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "Шаг не сохранён");
      showNotice(payload.next_action ? "Следующий шаг сохранён" : "Следующий шаг очищен");
      await Promise.all([loadVacancies(), loadHiringProcesses()]);
    } catch (error) {
      showNotice(error.message, "error");
      saveNextButton.disabled = false;
    }
    return;
  }
  const toggleDoneButton = event.target.closest("[data-toggle-next-done]");
  if (toggleDoneButton) {
    const card = toggleDoneButton.closest("[data-id]");
    const vacancyId = card?.dataset.id;
    if (!vacancyId) return;
    const currentlyDone = toggleDoneButton.textContent.includes("Открыть");
    toggleDoneButton.disabled = true;
    try {
      const response = await fetch(`/api/v1/vacancies/${vacancyId}/action-plan`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ next_action_done: !currentlyDone }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "Статус шага не изменён");
      showNotice(payload.next_action_done ? "Шаг закрыт" : "Шаг снова открыт");
      await loadVacancies();
    } catch (error) {
      showNotice(error.message, "error");
      toggleDoneButton.disabled = false;
    }
    return;
  }
  const confirmButton = event.target.closest("[data-confirm]");
  if (confirmButton) {
    confirmButton.disabled = true;
    confirmButton.textContent = "Сохраняем…";
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
      showNotice(`Контакт выбран: ${name}. Можно поставить следующий шаг.`);
      await Promise.all([loadPeople(), loadVacancies()]);
    } catch (error) {
      showNotice(error.message, "error");
      confirmButton.disabled = false;
      confirmButton.textContent = "Выбрать контакт";
    }
    return;
  }
  const suggestNextButton = event.target.closest("[data-suggest-next-action]");
  if (suggestNextButton) {
    const card = suggestNextButton.closest("[data-id]");
    const vacancyId = card?.dataset.id;
    const fullName = suggestNextButton.dataset.suggestNextAction;
    if (!vacancyId || !fullName) return;
    suggestNextButton.disabled = true;
    try {
      const response = await fetch(`/api/v1/vacancies/${vacancyId}/action-plan`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ next_action: `Написать ${fullName}`, next_action_done: false }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "Шаг не сохранён");
      showNotice(`Следующий шаг: ${payload.next_action}`);
      await loadVacancies();
    } catch (error) {
      showNotice(error.message, "error");
      suggestNextButton.disabled = false;
    }
    return;
  }
  const recordOutreachButton = event.target.closest("[data-record-outreach]");
  if (recordOutreachButton) {
    const card = recordOutreachButton.closest("[data-id]");
    const vacancyId = card?.dataset.id;
    const vacancy = knownVacancies.find((item) => item.id === vacancyId);
    const selected = peopleByVacancyId.get(vacancyId) || [];
    if (!vacancy || !selected.length || !outreachForm) return;
    outreachForm.reset();
    outreachForm.elements.vacancy_id.value = vacancyId;
    const personSelect = outreachForm.elements.person_id;
    personSelect.innerHTML = selected
      .map(
        (person) =>
          `<option value="${escapeHtml(person.id)}">${escapeHtml(person.full_name)}${person.title ? ` · ${escapeHtml(person.title)}` : ""}</option>`,
      )
      .join("");
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    outreachForm.elements.occurred_at.value = local;
    if (outreachVacancyTitle) outreachVacancyTitle.textContent = vacancy.title;
    outreachFormError.hidden = true;
    outreachDialog.showModal();
    return;
  }
  const recordResponseButton = event.target.closest("[data-record-response]");
  if (recordResponseButton) {
    const card = recordResponseButton.closest("[data-id]");
    const vacancyId = card?.dataset.id;
    const vacancy = knownVacancies.find((item) => item.id === vacancyId);
    if (!vacancy || !responseForm) return;
    responseForm.reset();
    responseForm.elements.vacancy_id.value = vacancyId;
    const channel = vacancyActionChannel(vacancy);
    responseForm.elements.source.value =
      channel === "direct" ? "direct" : channel === "hh" ? "hh" : "hh";
    const typeSelect = responseForm.elements.response_type;
    typeSelect.value = "replied";
    responseForm.elements.suggested_next_action.value =
      suggestedNextActionByResponseType[typeSelect.value] || "";
    fillResponseRelatedActions(vacancyId, responseForm.elements.source.value);
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    responseForm.elements.occurred_at.value = local;
    if (responseVacancyTitle) responseVacancyTitle.textContent = vacancy.title;
    responseFormError.hidden = true;
    responseDialog.showModal();
    return;
  }
  const startHiringButton = event.target.closest("[data-start-hiring]");
  if (startHiringButton) {
    const card = startHiringButton.closest("[data-id]");
    const vacancyId = card?.dataset.id;
    const vacancy = knownVacancies.find((item) => item.id === vacancyId);
    if (!vacancy || !hiringStartForm) return;
    hiringStartForm.reset();
    hiringStartForm.elements.vacancy_id.value = vacancyId;
    hiringStartForm.elements.initial_stage.value = "screening";
    hiringStartForm.elements.suggested_next_action.value =
      suggestedNextActionByHiringStage.screening;
    if (hiringStartVacancyTitle) hiringStartVacancyTitle.textContent = vacancy.title;
    hiringStartFormError.hidden = true;
    hiringStartDialog.showModal();
    return;
  }
  const transitionHiringButton = event.target.closest("[data-transition-hiring]");
  if (transitionHiringButton) {
    const card = transitionHiringButton.closest("[data-id]");
    const vacancyId = card?.dataset.id;
    const vacancy = knownVacancies.find((item) => item.id === vacancyId);
    const process = hiringProcessByVacancyId.get(vacancyId);
    if (!vacancy || !process || !hiringStageForm) return;
    hiringStageForm.reset();
    hiringStageForm.elements.process_id.value = process.id;
    hiringStageForm.elements.vacancy_id.value = vacancyId;
    hiringStageForm.elements.stage.value = "interview";
    hiringStageForm.elements.suggested_next_action.value =
      suggestedNextActionByHiringStage.interview;
    if (hiringStageVacancyTitle) hiringStageVacancyTitle.textContent = vacancy.title;
    hiringStageFormError.hidden = true;
    hiringStageDialog.showModal();
    return;
  }
  const addHiringActivityButton = event.target.closest("[data-add-hiring-activity]");
  if (addHiringActivityButton) {
    const card = addHiringActivityButton.closest("[data-id]");
    const vacancyId = card?.dataset.id;
    const vacancy = knownVacancies.find((item) => item.id === vacancyId);
    const process = hiringProcessByVacancyId.get(vacancyId);
    if (!vacancy || !process || process.status !== "active" || !hiringActivityForm) return;
    hiringActivityForm.reset();
    hiringActivityForm.elements.process_id.value = process.id;
    hiringActivityForm.elements.vacancy_id.value = vacancyId;
    hiringActivityForm.elements.activity_type.value = "interview";
    if (hiringActivityVacancyTitle) hiringActivityVacancyTitle.textContent = vacancy.title;
    hiringActivityFormError.hidden = true;
    hiringActivityDialog.showModal();
    return;
  }
  const completeHiringProcessButton = event.target.closest("[data-complete-hiring-process]");
  if (completeHiringProcessButton) {
    const card = completeHiringProcessButton.closest("[data-id]");
    const vacancyId = card?.dataset.id;
    const process = hiringProcessByVacancyId.get(vacancyId);
    if (!process || process.status !== "active") return;
    const confirmed = window.confirm(
      "Завершить процесс найма? Он исчезнет из активного списка, история останется в карточке вакансии.",
    );
    if (!confirmed) return;
    try {
      const response = await fetch(`/api/v1/hiring-processes/${process.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || "Не удалось завершить процесс");
      showNotice("Процесс найма завершён");
      await Promise.all([loadHiringProcesses(), loadVacancies()]);
    } catch (error) {
      showNotice(error.message, "warning");
    }
    return;
  }
  const cancelHiringProcessButton = event.target.closest("[data-cancel-hiring-process]");
  if (cancelHiringProcessButton) {
    const card = cancelHiringProcessButton.closest("[data-id]");
    const vacancyId = card?.dataset.id;
    const process = hiringProcessByVacancyId.get(vacancyId);
    if (!process || process.status !== "active") return;
    const confirmed = window.confirm(
      "Отменить процесс найма? Он исчезнет из активного списка, история останется в карточке вакансии.",
    );
    if (!confirmed) return;
    try {
      const response = await fetch(`/api/v1/hiring-processes/${process.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || "Не удалось отменить процесс");
      showNotice("Процесс найма отменён");
      await Promise.all([loadHiringProcesses(), loadVacancies()]);
    } catch (error) {
      showNotice(error.message, "warning");
    }
    return;
  }
  const recordOfferButton = event.target.closest("[data-record-offer]");
  if (recordOfferButton) {
    const card = recordOfferButton.closest("[data-id]");
    const vacancyId = card?.dataset.id;
    const vacancy = knownVacancies.find((item) => item.id === vacancyId);
    const process = hiringProcessByVacancyId.get(vacancyId);
    if (!vacancy || !process || !offerForm) return;
    offerForm.reset();
    offerForm.elements.hiring_process_id.value = process.id;
    offerForm.elements.vacancy_id.value = vacancyId;
    offerForm.elements.compensation_currency.value = "RUB";
    offerForm.elements.compensation_basis.value = "unknown";
    const now = new Date();
    offerForm.elements.received_at.value = new Date(
      now.getTime() - now.getTimezoneOffset() * 60000,
    )
      .toISOString()
      .slice(0, 16);
    if (offerVacancyTitle) offerVacancyTitle.textContent = vacancy.title;
    offerFormError.hidden = true;
    offerDialog.showModal();
    return;
  }
  const acceptOfferButton = event.target.closest("[data-accept-offer]");
  if (acceptOfferButton) {
    const offerId = acceptOfferButton.getAttribute("data-accept-offer");
    const offer = knownOffers.find((item) => item.id === offerId);
    openOfferDecision(offer, "accepted");
    return;
  }
  const declineOfferButton = event.target.closest("[data-decline-offer]");
  if (declineOfferButton) {
    const offerId = declineOfferButton.getAttribute("data-decline-offer");
    const offer = knownOffers.find((item) => item.id === offerId);
    openOfferDecision(offer, "declined");
    return;
  }
  const closeSearchButton = event.target.closest("[data-close-search]");
  if (closeSearchButton) {
    const offerId = closeSearchButton.getAttribute("data-close-search");
    const offer = knownOffers.find((item) => item.id === offerId);
    openSearchCycleClose(offer);
    return;
  }
  const completeHiringActivityButton = event.target.closest("[data-complete-hiring-activity]");
  if (completeHiringActivityButton) {
    const card = completeHiringActivityButton.closest("[data-id]");
    const vacancyId = card?.dataset.id;
    const process = hiringProcessByVacancyId.get(vacancyId);
    const activityId = completeHiringActivityButton.getAttribute("data-complete-hiring-activity");
    const activity = (process?.activities || []).find((item) => item.id === activityId);
    if (!process || !activity || !hiringActivityCompleteForm) return;
    hiringActivityCompleteForm.reset();
    hiringActivityCompleteForm.elements.activity_id.value = activity.id;
    hiringActivityCompleteForm.elements.vacancy_id.value = vacancyId;
    hiringActivityCompleteForm.elements.activity_type.value = activity.activity_type;
    hiringActivityCompleteForm.elements.suggested_next_action.value =
      suggestedNextActionByActivityType[activity.activity_type] || "";
    if (hiringActivityCompleteContext) {
      hiringActivityCompleteContext.textContent =
        activity.title || hiringActivityTypeLabels[activity.activity_type] || activity.activity_type;
    }
    hiringActivityCompleteFormError.hidden = true;
    hiringActivityCompleteDialog.showModal();
    return;
  }
  const cancelHiringActivityButton = event.target.closest("[data-cancel-hiring-activity]");
  if (cancelHiringActivityButton) {
    const activityId = cancelHiringActivityButton.getAttribute("data-cancel-hiring-activity");
    if (!activityId) return;
    const confirmed = window.confirm("Отменить эту активность?");
    if (!confirmed) return;
    try {
      const response = await fetch(`/api/v1/hiring-activities/${activityId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || "Не удалось отменить");
      showNotice("Активность отменена");
      await Promise.all([loadHiringProcesses(), loadVacancies()]);
    } catch (error) {
      showNotice(error.message, "warning");
    }
    return;
  }
  const scoreButton = event.target.closest("[data-score]");
  if (scoreButton) {
    const card = scoreButton.closest("[data-id]");
    const vacancyId = card?.dataset.id;
    if (!vacancyId) return;
    scoreButton.disabled = true;
    scoreButton.classList.add("is-processing");
    const idleLabel = scoreButton.dataset.scoreRetry === "1" ? "Повторить оценку" : "Оценить";
    scoreButton.textContent = "Оценивается…";
    try {
      const response = await fetch(`/api/v1/vacancies/${vacancyId}/score`, { method: "POST" });
      const payload = await response.json();
      if (!response.ok) {
        if (payload.code === "vacancy_archived") {
          showNotice(payload.message || "Вакансия в архиве на источнике", "warning");
          await loadVacancies();
          return;
        }
        if (payload.code === "source_status_unknown") {
          showNotice(payload.message || "Статус на источнике неизвестен — повторите позже", "warning");
          scoreButton.disabled = false;
          scoreButton.classList.remove("is-processing");
          scoreButton.textContent = idleLabel;
          return;
        }
        if (payload.code === "scoring_unavailable") {
          showNotice(
            payload.message || "Scoring сейчас недоступен. Очередь работает; оценку повторите позже.",
            "warning",
          );
          scoreButton.disabled = false;
          scoreButton.classList.remove("is-processing");
          scoreButton.textContent = idleLabel;
          return;
        }
        throw new Error(payload.message || "Оценка не запущена");
      }
      const jobId = payload.job_id;
      scoreButton.textContent = "В очереди";
      showNotice("Оценка поставлена в очередь");
      if (jobId) {
        for (let attempt = 0; attempt < 12; attempt += 1) {
          await new Promise((resolve) => window.setTimeout(resolve, 1500));
          const jobResponse = await fetch(`/api/v1/score/jobs/${jobId}`);
          const jobPayload = await jobResponse.json();
          if (!jobResponse.ok) break;
          if (jobPayload.status === "processing") {
            scoreButton.textContent = "Оценивается…";
            continue;
          }
          if (jobPayload.status === "done") {
            showNotice("Оценка готова");
            await loadVacancies();
            return;
          }
          if (jobPayload.status === "error") {
            throw new Error(jobPayload.error_message || jobPayload.error_code || "Оценка не выполнена");
          }
        }
        showNotice("Оценка ещё в очереди — обновите список позже", "info");
      }
      scoreButton.disabled = false;
      scoreButton.classList.remove("is-processing");
      scoreButton.textContent = idleLabel;
    } catch (error) {
      showNotice(error.message, "error");
      scoreButton.disabled = false;
      scoreButton.classList.remove("is-processing");
      scoreButton.textContent = idleLabel;
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
      showNotice(
        payload.people?.length
          ? `Поиск завершён: ${payload.people.length} кандидатов`
          : "Подходящие контакты не найдены",
      );
      await Promise.all([loadVacancies(), loadPeople()]);
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

if (outreachDialog && outreachForm) {
  document.querySelector("#close-outreach-form")?.addEventListener("click", () => outreachDialog.close());
  document.querySelector("#cancel-outreach-form")?.addEventListener("click", () => outreachDialog.close());
  outreachForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    outreachFormError.hidden = true;
    setButtonProcessing(outreachSubmitButton, true, "Сохраняем…", "Записать контакт");
    const values = Object.fromEntries(new FormData(outreachForm));
    if (values.occurred_at) values.occurred_at = new Date(values.occurred_at).toISOString();
    else delete values.occurred_at;
    if (!values.note) delete values.note;
    try {
      const response = await fetch("/api/v1/direct-outreaches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "Контакт не записан");
      outreachDialog.close();
      const name = payload.person?.full_name || "контакт";
      const setWait = window.confirm(
        `Контакт с ${name} записан (ничего не отправлялось).\n\nПоставить следующий шаг «Ждать ответ»?`,
      );
      if (setWait) {
        await fetch(`/api/v1/vacancies/${values.vacancy_id}/action-plan`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ next_action: "Ждать ответ", next_action_done: false }),
        });
      }
      showNotice(`Записан контакт: ${name}`);
      await Promise.all([loadDirectOutreaches(), loadVacancies()]);
    } catch (error) {
      outreachFormError.textContent = error.message;
      outreachFormError.hidden = false;
    } finally {
      setButtonProcessing(outreachSubmitButton, false, "Сохраняем…", "Записать контакт");
    }
  });
}

function fillResponseRelatedActions(vacancyId, source) {
  const related = responseForm?.elements.related_action;
  if (!related) return;
  const options = ['<option value="">Без привязки</option>'];
  if (source === "hh") {
    for (const app of applicationsByVacancyId.get(vacancyId) || []) {
      options.push(
        `<option value="application:${escapeHtml(app.id)}">Отклик · ${escapeHtml(formatDate(app.applied_at))} · ${escapeHtml(app.source)}</option>`,
      );
    }
  } else {
    for (const outreach of outreachesByVacancyId.get(vacancyId) || []) {
      const method = outreachMethodLabels[outreach.method] || outreach.method;
      const who = outreach.person?.full_name || "контакт";
      options.push(
        `<option value="outreach:${escapeHtml(outreach.id)}">Контакт · ${escapeHtml(method)} · ${escapeHtml(who)}</option>`,
      );
    }
  }
  related.innerHTML = options.join("");
}

if (responseDialog && responseForm) {
  document.querySelector("#close-response-form")?.addEventListener("click", () => responseDialog.close());
  document.querySelector("#cancel-response-form")?.addEventListener("click", () => responseDialog.close());
  responseForm.elements.source?.addEventListener("change", () => {
    fillResponseRelatedActions(
      responseForm.elements.vacancy_id.value,
      responseForm.elements.source.value,
    );
  });
  responseForm.elements.response_type?.addEventListener("change", () => {
    const suggestion =
      suggestedNextActionByResponseType[responseForm.elements.response_type.value] || "";
    responseForm.elements.suggested_next_action.value = suggestion;
  });
  responseForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    responseFormError.hidden = true;
    setButtonProcessing(responseSubmitButton, true, "Сохраняем…", "Записать ответ");
    const values = Object.fromEntries(new FormData(responseForm));
    const payload = {
      vacancy_id: values.vacancy_id,
      source: values.source,
      response_type: values.response_type,
    };
    if (values.occurred_at) payload.occurred_at = new Date(values.occurred_at).toISOString();
    if (values.note) payload.note = values.note;
    const related = String(values.related_action || "");
    if (related.startsWith("application:")) {
      payload.application_id = related.slice("application:".length);
    }
    if (related.startsWith("outreach:")) {
      payload.direct_outreach_id = related.slice("outreach:".length);
    }
    const suggestedNext = String(values.suggested_next_action || "").trim();
    try {
      const response = await fetch("/api/v1/employer-responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || "Ответ не записан");
      responseDialog.close();
      if (suggestedNext) {
        const setNext = window.confirm(
          `Ответ записан (ничего не отправлялось).\n\nПоставить следующий шаг «${suggestedNext}»?`,
        );
        if (setNext) {
          await fetch(`/api/v1/vacancies/${payload.vacancy_id}/action-plan`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ next_action: suggestedNext, next_action_done: false }),
          });
        }
      }
      const typeLabel = employerResponseTypeLabels[body.response_type] || body.response_type;
      showNotice(`Записан ответ: ${typeLabel}`);
      await Promise.all([loadEmployerResponses(), loadVacancies()]);
      if (
        ["invitation", "interview_request"].includes(body.response_type) &&
        !hiringProcessByVacancyId.get(payload.vacancy_id)
      ) {
        const startHiring = window.confirm(
          "Ответ предполагает найм.\n\nНачать процесс найма сейчас? (не автоматически)",
        );
        if (startHiring && hiringStartForm) {
          hiringStartForm.reset();
          hiringStartForm.elements.vacancy_id.value = payload.vacancy_id;
          hiringStartForm.elements.initial_stage.value = "screening";
          hiringStartForm.elements.suggested_next_action.value =
            suggestedNextActionByHiringStage.screening;
          const vacancy = knownVacancies.find((item) => item.id === payload.vacancy_id);
          if (hiringStartVacancyTitle) {
            hiringStartVacancyTitle.textContent = vacancy?.title || "";
          }
          hiringStartFormError.hidden = true;
          hiringStartDialog.showModal();
        }
      }
    } catch (error) {
      responseFormError.textContent = error.message;
      responseFormError.hidden = false;
    } finally {
      setButtonProcessing(responseSubmitButton, false, "Сохраняем…", "Записать ответ");
    }
  });
}

if (hiringStartDialog && hiringStartForm) {
  document.querySelector("#close-hiring-start-form")?.addEventListener("click", () => hiringStartDialog.close());
  document.querySelector("#cancel-hiring-start-form")?.addEventListener("click", () => hiringStartDialog.close());
  hiringStartForm.elements.initial_stage?.addEventListener("change", () => {
    hiringStartForm.elements.suggested_next_action.value =
      suggestedNextActionByHiringStage[hiringStartForm.elements.initial_stage.value] || "";
  });
  hiringStartForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    hiringStartFormError.hidden = true;
    setButtonProcessing(hiringStartSubmitButton, true, "Сохраняем…", "Начать процесс");
    const values = Object.fromEntries(new FormData(hiringStartForm));
    const payload = {
      vacancy_id: values.vacancy_id,
      initial_stage: values.initial_stage,
    };
    if (values.note) payload.note = values.note;
    const suggestedNext = String(values.suggested_next_action || "").trim();
    try {
      const response = await fetch("/api/v1/hiring-processes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || "Процесс не создан");
      hiringStartDialog.close();
      if (suggestedNext) {
        const setNext = window.confirm(
          `Процесс найма начат.\n\nПоставить следующий шаг «${suggestedNext}»?`,
        );
        if (setNext) {
          await fetch(`/api/v1/vacancies/${payload.vacancy_id}/action-plan`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ next_action: suggestedNext, next_action_done: false }),
          });
        }
      }
      showNotice(`Процесс найма: ${hiringStageLabels[body.current_stage] || body.current_stage}`);
      await Promise.all([loadHiringProcesses(), loadVacancies()]);
    } catch (error) {
      hiringStartFormError.textContent = error.message;
      hiringStartFormError.hidden = false;
    } finally {
      setButtonProcessing(hiringStartSubmitButton, false, "Сохраняем…", "Начать процесс");
    }
  });
}

if (hiringStageDialog && hiringStageForm) {
  document.querySelector("#close-hiring-stage-form")?.addEventListener("click", () => hiringStageDialog.close());
  document.querySelector("#cancel-hiring-stage-form")?.addEventListener("click", () => hiringStageDialog.close());
  hiringStageForm.elements.stage?.addEventListener("change", () => {
    hiringStageForm.elements.suggested_next_action.value =
      suggestedNextActionByHiringStage[hiringStageForm.elements.stage.value] || "";
  });
  hiringStageForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    hiringStageFormError.hidden = true;
    setButtonProcessing(hiringStageSubmitButton, true, "Сохраняем…", "Сохранить этап");
    const values = Object.fromEntries(new FormData(hiringStageForm));
    const payload = { stage: values.stage };
    if (values.note) payload.note = values.note;
    const suggestedNext = String(values.suggested_next_action || "").trim();
    try {
      const response = await fetch(`/api/v1/hiring-processes/${values.process_id}/stages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || "Этап не сохранён");
      hiringStageDialog.close();
      if (suggestedNext) {
        const setNext = window.confirm(
          `Этап обновлён.\n\nПоставить следующий шаг «${suggestedNext}»?`,
        );
        if (setNext) {
          await fetch(`/api/v1/vacancies/${values.vacancy_id}/action-plan`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ next_action: suggestedNext, next_action_done: false }),
          });
        }
      }
      showNotice(`Этап: ${hiringStageLabels[body.current_stage] || body.current_stage}`);
      await Promise.all([loadHiringProcesses(), loadVacancies()]);
    } catch (error) {
      hiringStageFormError.textContent = error.message;
      hiringStageFormError.hidden = false;
    } finally {
      setButtonProcessing(hiringStageSubmitButton, false, "Сохраняем…", "Сохранить этап");
    }
  });
}

if (hiringActivityDialog && hiringActivityForm) {
  document.querySelector("#close-hiring-activity-form")?.addEventListener("click", () =>
    hiringActivityDialog.close(),
  );
  document.querySelector("#cancel-hiring-activity-form")?.addEventListener("click", () =>
    hiringActivityDialog.close(),
  );
  hiringActivityForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    hiringActivityFormError.hidden = true;
    setButtonProcessing(hiringActivitySubmitButton, true, "Сохраняем…", "Сохранить");
    const values = Object.fromEntries(new FormData(hiringActivityForm));
    const payload = { activity_type: values.activity_type };
    if (values.title) payload.title = values.title;
    if (values.participant) payload.participant = values.participant;
    if (values.note) payload.note = values.note;
    if (values.url) payload.url = values.url;
    if (values.scheduled_at) payload.scheduled_at = new Date(values.scheduled_at).toISOString();
    if (values.due_at) payload.due_at = new Date(values.due_at).toISOString();
    try {
      const response = await fetch(`/api/v1/hiring-processes/${values.process_id}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || "Активность не создана");
      hiringActivityDialog.close();
      showNotice(
        `Активность: ${hiringActivityTypeLabels[payload.activity_type] || payload.activity_type}`,
      );
      await Promise.all([loadHiringProcesses(), loadVacancies()]);
    } catch (error) {
      hiringActivityFormError.textContent = error.message;
      hiringActivityFormError.hidden = false;
    } finally {
      setButtonProcessing(hiringActivitySubmitButton, false, "Сохраняем…", "Сохранить");
    }
  });
}

if (hiringActivityCompleteDialog && hiringActivityCompleteForm) {
  document.querySelector("#close-hiring-activity-complete-form")?.addEventListener("click", () =>
    hiringActivityCompleteDialog.close(),
  );
  document.querySelector("#cancel-hiring-activity-complete-form")?.addEventListener("click", () =>
    hiringActivityCompleteDialog.close(),
  );
  hiringActivityCompleteForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    hiringActivityCompleteFormError.hidden = true;
    setButtonProcessing(hiringActivityCompleteSubmitButton, true, "Сохраняем…", "Завершить");
    const values = Object.fromEntries(new FormData(hiringActivityCompleteForm));
    const suggestedNext = String(values.suggested_next_action || "").trim();
    try {
      const response = await fetch(`/api/v1/hiring-activities/${values.activity_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed", result: values.result }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || "Не удалось завершить");
      hiringActivityCompleteDialog.close();
      if (suggestedNext) {
        const setNext = window.confirm(
          `Активность завершена.\n\nПоставить следующий шаг «${suggestedNext}»?`,
        );
        if (setNext) {
          await fetch(`/api/v1/vacancies/${values.vacancy_id}/action-plan`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ next_action: suggestedNext, next_action_done: false }),
          });
        }
      }
      showNotice("Активность завершена");
      await Promise.all([loadHiringProcesses(), loadVacancies()]);
    } catch (error) {
      hiringActivityCompleteFormError.textContent = error.message;
      hiringActivityCompleteFormError.hidden = false;
    } finally {
      setButtonProcessing(hiringActivityCompleteSubmitButton, false, "Сохраняем…", "Завершить");
    }
  });
}

if (offerDialog && offerForm) {
  document.querySelector("#close-offer-form")?.addEventListener("click", () => offerDialog.close());
  document.querySelector("#cancel-offer-form")?.addEventListener("click", () => offerDialog.close());
  offerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    offerFormError.hidden = true;
    setButtonProcessing(offerSubmitButton, true, "Сохраняем…", "Сохранить оффер");
    const values = Object.fromEntries(new FormData(offerForm));
    const payload = { hiring_process_id: values.hiring_process_id };
    for (const key of [
      "position_title",
      "compensation_currency",
      "compensation_basis",
      "work_format",
      "location",
      "bonus_text",
      "benefits_text",
      "note",
      "proposed_start_date",
    ]) {
      if (values[key]) payload[key] = values[key];
    }
    if (values.compensation_amount) payload.compensation_amount = Number(values.compensation_amount);
    if (values.received_at) payload.received_at = new Date(values.received_at).toISOString();
    try {
      const response = await fetch("/api/v1/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || "Оффер не сохранён");
      offerDialog.close();
      showNotice("Оффер записан");
      await Promise.all([loadOffers(), loadVacancies(), loadHiringProcesses()]);
    } catch (error) {
      offerFormError.textContent = error.message;
      offerFormError.hidden = false;
    } finally {
      setButtonProcessing(offerSubmitButton, false, "Сохраняем…", "Сохранить оффер");
    }
  });
}

if (offerDecisionDialog && offerDecisionForm) {
  document.querySelector("#close-offer-decision-form")?.addEventListener("click", () =>
    offerDecisionDialog.close(),
  );
  document.querySelector("#cancel-offer-decision-form")?.addEventListener("click", () =>
    offerDecisionDialog.close(),
  );
  offerDecisionForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    offerDecisionFormError.hidden = true;
    setButtonProcessing(offerDecisionSubmitButton, true, "Сохраняем…", "Подтвердить");
    const values = Object.fromEntries(new FormData(offerDecisionForm));
    const payload = { status: values.status };
    if (values.decision_note) payload.decision_note = values.decision_note;
    try {
      const response = await fetch(`/api/v1/offers/${values.offer_id}/decision`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || "Решение не сохранено");
      offerDecisionDialog.close();
      showNotice(payload.status === "accepted" ? "Оффер принят" : "Оффер отклонён");
      await Promise.all([loadOffers(), loadVacancies(), loadHiringProcesses(), loadSearchCycle()]);
    } catch (error) {
      offerDecisionFormError.textContent = error.message;
      offerDecisionFormError.hidden = false;
    } finally {
      setButtonProcessing(offerDecisionSubmitButton, false, "Сохраняем…", "Подтвердить");
    }
  });
}

if (searchCycleCloseDialog && searchCycleCloseForm) {
  document.querySelector("#close-search-cycle-close-form")?.addEventListener("click", () =>
    searchCycleCloseDialog.close(),
  );
  document.querySelector("#cancel-search-cycle-close-form")?.addEventListener("click", () =>
    searchCycleCloseDialog.close(),
  );
  searchCycleCloseForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (searchCycleCloseFormError) searchCycleCloseFormError.hidden = true;
    setButtonProcessing(
      searchCycleCloseSubmitButton,
      true,
      "Завершаем…",
      "Подтвердить завершение",
    );
    const values = Object.fromEntries(new FormData(searchCycleCloseForm));
    const payload = { accepted_offer_id: values.accepted_offer_id };
    if (values.close_note) payload.close_note = values.close_note;
    try {
      const response = await fetch("/api/v1/search-cycle/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || "Не удалось завершить поиск");
      searchCycleCloseDialog.close();
      showNotice(
        body.automation_disable_warning
          ? `Поиск завершён (автоматизация: ${body.automation_disable_warning})`
          : "Поиск завершён · автоматизация выключена",
      );
      await Promise.all([
        loadSearchCycle(),
        loadOffers(),
        loadVacancies(),
        loadHiringProcesses(),
        loadAutomationStatus(),
      ]);
    } catch (error) {
      if (searchCycleCloseFormError) {
        searchCycleCloseFormError.textContent = error.message;
        searchCycleCloseFormError.hidden = false;
      }
    } finally {
      setButtonProcessing(
        searchCycleCloseSubmitButton,
        false,
        "Завершаем…",
        "Подтвердить завершение",
      );
    }
  });
}

document.querySelector("#section-offers")?.addEventListener("click", async (event) => {
  const select = event.target.closest("[data-offer-select]");
  if (select) {
    const offerId = select.getAttribute("data-offer-select");
    if (select.checked) selectedOfferIds.add(offerId);
    else selectedOfferIds.delete(offerId);
    syncCompareButton();
    return;
  }
  const acceptOfferButton = event.target.closest("[data-accept-offer]");
  if (acceptOfferButton) {
    const offer = knownOffers.find(
      (item) => item.id === acceptOfferButton.getAttribute("data-accept-offer"),
    );
    openOfferDecision(offer, "accepted");
    return;
  }
  const declineOfferButton = event.target.closest("[data-decline-offer]");
  if (declineOfferButton) {
    const offer = knownOffers.find(
      (item) => item.id === declineOfferButton.getAttribute("data-decline-offer"),
    );
    openOfferDecision(offer, "declined");
    return;
  }
  const closeSearchButton = event.target.closest("[data-close-search]");
  if (closeSearchButton) {
    const offer = knownOffers.find(
      (item) => item.id === closeSearchButton.getAttribute("data-close-search"),
    );
    openSearchCycleClose(offer);
    return;
  }
  const saveButton = event.target.closest("[data-save-offer-comparison]");
  if (saveButton) {
    const offerId = saveButton.getAttribute("data-save-offer-comparison");
    const noteField = offerCompareTable?.querySelector(`[data-offer-note="${offerId}"]`);
    const rankField = offerCompareTable?.querySelector(`[data-offer-rank="${offerId}"]`);
    const payload = {
      owner_comparison_note: noteField?.value ?? "",
      owner_preference_rank: rankField?.value ? Number(rankField.value) : null,
    };
    try {
      const response = await fetch(`/api/v1/offers/${offerId}/comparison`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || "Заметка не сохранена");
      showNotice("Заметка сравнения сохранена");
      await loadOffers();
    } catch (error) {
      showNotice(error.message, "warning");
    }
  }
});

compareOffersButton?.addEventListener("click", () => {
  const offers = selectedOffers();
  if (offers.length < 2) {
    showNotice("Выберите минимум два оффера", "warning");
    return;
  }
  renderOfferCompare(offers);
  offerComparePanel?.scrollIntoView({ behavior: "smooth", block: "start" });
});

closeOfferCompareButton?.addEventListener("click", () => {
  if (offerComparePanel) offerComparePanel.hidden = true;
});

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
  confirm_login: "Я вошёл — проверить",
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
  hhConnection.dataset.action = actionCode;
  hhConnection.dataset.novncUrl = (payload.action && payload.action.novnc_url) || "";
  // Confirm lives primarily in the resumes strip; also expose it in the header
  // so recovery is visible even when resumes briefly report open_login.
  let headerAction = "none";
  if (actionCode === "acquire_token") {
    headerAction = "acquire_token";
  } else if (actionCode === "confirm_login") {
    headerAction = "confirm_login";
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
  }
  if (hhResumesConfirm) {
    hhResumesConfirm.hidden = !confirm;
    hhResumesConfirm.dataset.novncUrl = url;
  }
}

function hhLoginFailureMessage(payload) {
  const code = payload && payload.code ? String(payload.code) : "";
  if (
    code === "novnc_unavailable" ||
    code === "browser_launch_failed" ||
    code === "profile_locked" ||
    code === "display_missing" ||
    code === "chromium_missing"
  ) {
    return "Не удалось запустить окно входа HeadHunter";
  }
  if (code === "browser_proxy_unavailable") {
    return "Сетевой выход HeadHunter сейчас недоступен. Повторите позже.";
  }
  return (payload && (payload.message || payload.code)) || "Не удалось открыть вход";
}

function hhRetryOutcomeNotice() {
  const status = hhConnection.dataset.status || "unavailable";
  if (status === "connected") {
    showNotice("HeadHunter доступен");
    return;
  }
  if (status === "action_required" || status === "expired" || status === "not_authorized") {
    const action = hhConnection.dataset.action || "";
    if (action === "confirm_login") {
      showNotice("Вход в HeadHunter ещё не завершён. Нажмите «Я вошёл — проверить».", "warning");
      return;
    }
    showNotice("Требуется повторный вход в HeadHunter", "warning");
    return;
  }
  if (status === "unavailable") {
    showNotice("Не удалось проверить HeadHunter", "error");
    return;
  }
  showNotice("Не удалось проверить HeadHunter", "error");
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
  if (hhResumeFile) {
    hhResumeFile.hidden = true;
    hhResumeFile.textContent = "";
  }
}

function formatFileSize(bytes) {
  const value = Number(bytes);
  if (!Number.isFinite(value) || value < 0) return "";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function renderResumeFileBlock(fileMeta) {
  if (!hhResumeFile) return;
  if (!fileMeta || !fileMeta.artifact_id) {
    hhResumeFile.hidden = true;
    hhResumeFile.textContent = "";
    return;
  }
  const label = fileMeta.format_label ? String(fileMeta.format_label) : "FILE";
  const size = formatFileSize(fileMeta.size_bytes);
  const saved = formatResumeTimestamp(fileMeta.captured_at);
  const href = `/api/v1/resume-artifacts/${encodeURIComponent(fileMeta.artifact_id)}/download`;
  hhResumeFile.hidden = false;
  hhResumeFile.innerHTML = "";
  const title = document.createElement("span");
  title.textContent = `Файл резюме: ${label}${size ? ` · ${size}` : ""}${
    saved ? ` · сохранён ${saved}` : ""
  }`;
  const link = document.createElement("a");
  link.href = href;
  link.className = "hh-resume-content__file-link";
  link.textContent = "Скачать локальную копию";
  link.setAttribute("download", fileMeta.original_filename || "resume");
  hhResumeFile.append(title, document.createElement("br"), link);
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
  const fileMeta = payload && payload.resume_file ? payload.resume_file : null;
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
    renderResumeFileBlock(fileMeta);
    return;
  }

  if (contentState === "synced") {
    if (hhResumeSyncState) {
      hhResumeSyncState.removeAttribute("data-tone");
      hhResumeSyncState.textContent = captured
        ? `Содержание синхронизировано\n${captured}`
        : "Содержание синхронизировано";
    }
    renderResumeFileBlock(fileMeta);
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
    showNotice("Проверяем HeadHunter…", "info");
    hhResumeSync.disabled = true;
    try {
      const pendingConfirm = hhConnection.dataset.action === "confirm_login";
      if (pendingConfirm) {
        await runHhLoginAction(
          "confirm_login",
          hhConnection.dataset.novncUrl || "",
          hhResumeSync
        );
        return;
      }
      await loadHhConnection();
      hhRetryOutcomeNotice();
    } finally {
      if (hhResumeSync) hhResumeSync.disabled = false;
    }
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
    if (payload.file && payload.file.ok === false) {
      showNotice("Не удалось сохранить файл резюме.", "error");
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
      "Сетевой выход HeadHunter сейчас недоступен. Повторите позже.";
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
    // Connection SoT for pending confirm: resumes historically returned open_login
    // while auth_session was already pending_operator.
    const connectionAction = hhConnection.dataset.action || "";
    const waitingConfirm =
      actionCode === "confirm_login" || connectionAction === "confirm_login";
    const url =
      novncUrl ||
      hhConnection.dataset.novncUrl ||
      "http://127.0.0.1:6080/vnc.html?autoconnect=1&resize=scale";
    if (waitingConfirm) {
      hhResumesStatus.textContent =
        "Войдите в HeadHunter во вкладке входа, затем нажмите «Я вошёл — проверить».";
      setHhResumesActions({ open: true, confirm: true, novncUrl: url });
      if (!hhResumesPollTimer) startHhResumesPoll({ attempts: 20, intervalMs: 2500 });
      void loadHhResumeContent({ hhCheckFailed: true });
      return false;
    }
    const expiredHint = status === "expired" || kind === "reauth";
    hhResumesStatus.textContent = expiredHint
      ? "Сессия HeadHunter истекла или нужна повторная авторизация. Войдите снова."
      : "Чтобы показать ваши резюме, войдите в HeadHunter. Нажмите кнопку ниже.";
    setHhResumesActions({ open: true, confirm: false, novncUrl: url });
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
    refreshSuitableHistoryPresentation();
  } catch (error) {
    renderHhConnection({ status: "unavailable", action: { code: "none" } });
    refreshSuitableHistoryPresentation();
  }
}

async function runHhLoginAction(action, novncUrl, button) {
  if (button && "disabled" in button) button.disabled = true;
  try {
    if (action === "open_login" || action === "reconnect") {
      // Keep the click gesture: open a tab immediately, then point it at noVNC
      // only after HH confirms the interactive stack is ready.
      const knownUrl = novncUrl || "http://127.0.0.1:6080/vnc.html?autoconnect=1&resize=scale";
      const tokenAtStart = hhResumesRenderToken;
      const loginWindow = window.open("about:blank", "job-search-hh-login");
      showNotice("Запускаем окно входа HeadHunter…", "info");
      const response = await fetch("/api/v1/hh/connection/open-login", { method: "POST" });
      const payload = await response.json();
      if (!response.ok || payload.browser_started === false) {
        if (loginWindow && !loginWindow.closed) loginWindow.close();
        throw new Error(hhLoginFailureMessage(payload));
      }
      const url = payload.novnc_url || knownUrl;
      if (loginWindow && !loginWindow.closed) {
        loginWindow.location.href = url;
      } else {
        // Popup blocked after async work — do not pretend login is open.
        showNotice(
          "Вкладка входа заблокирована браузером. Разрешите всплывающие окна и нажмите снова.",
          "warning"
        );
        if (hhResumes) {
          hhResumes.hidden = false;
          setHhResumesActions({ open: true, confirm: true, novncUrl: url });
        }
        await loadHhConnection();
        return;
      }
      // A newer server render (e.g. after confirm) already owns the strip.
      if (tokenAtStart !== hhResumesRenderToken) return;
      if (hhResumes) {
        hhResumes.hidden = false;
        hhResumesList.innerHTML = "";
        hhResumesStatus.textContent =
          "Войдите в HeadHunter во вкладке входа, затем нажмите «Я вошёл — проверить».";
        setHhResumesActions({ open: true, confirm: true, novncUrl: url });
        showNotice("Войдите во вкладке входа, затем нажмите «Я вошёл — проверить».", "info");
        // Refresh connection SoT so subsequent resume polls keep confirm visible.
        await loadHhConnection();
        setHhResumesActions({
          open: true,
          confirm: true,
          novncUrl: hhConnection.dataset.novncUrl || url,
        });
        startHhResumesPoll({ attempts: 24, intervalMs: 2500 });
      }
      return;
    }
    if (action === "confirm_login") {
      showNotice("Проверяем вход в HeadHunter…", "info");
      const response = await fetch("/api/v1/hh/connection/confirm", { method: "POST" });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || payload.code || "Не удалось подтвердить вход");
      }
      if (
        payload.code === "browser_login_incomplete" ||
        payload.browser_login === "login_required"
      ) {
        await loadHhConnection();
        showNotice("Вход в HeadHunter ещё не завершён", "warning");
        return;
      }
      if (payload.token_refresh === "failed") {
        await loadHhConnection();
        showNotice("Не удалось обновить OAuth-токен HeadHunter", "error");
        return;
      }
      await loadHhConnection();
      const status = hhConnection.dataset.status || "unavailable";
      if (status === "connected") {
        showNotice("HeadHunter доступен");
        return;
      }
      if (status === "action_required" || status === "not_authorized" || status === "expired") {
        showNotice("Вход в HeadHunter ещё не завершён", "warning");
        return;
      }
      showNotice("Не удалось проверить HeadHunter", "error");
      return;
    }
    if (action === "acquire_token") {
      showNotice("Для этого шага нужна помощь разработчика (OAuth-токен).");
    }
    await loadHhConnection();
  } catch (error) {
    showNotice(error.message || "Действие HeadHunter не выполнено", "error");
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
  hhResumesOpen.addEventListener("click", () => {
    const url = hhResumesOpen.dataset.novncUrl || "";
    void runHhLoginAction("open_login", url, hhResumesOpen);
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
void (async () => {
  await loadSearchCycle();
  await loadApplications();
  await loadPeople();
  await loadDirectOutreaches();
  await loadEmployerResponses();
  await loadHiringProcesses();
  await loadOffers();
  await loadVacancies();
})();
loadMetrics();
loadHypotheses();
startLiveReload();
