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

const statusLabels = {
  new: "Новая",
  reviewing: "Изучаю",
  shortlisted: "В шорт-листе",
  rejected: "Не подходит",
};

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

function showNotice(message, isError = false) {
  notice.textContent = message;
  notice.classList.toggle("error", isError);
  notice.hidden = false;
  window.setTimeout(() => { notice.hidden = true; }, 4500);
}

function stateCard(target, title, detail) {
  target.innerHTML = `<article class="state-card"><div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(detail)}</p></div></article>`;
}

function vacancyCard(item) {
  const options = Object.entries(statusLabels)
    .map(([value, label]) => `<option value="${value}" ${value === item.status ? "selected" : ""}>${label}</option>`)
    .join("");
  return `<article class="vacancy-card" data-id="${escapeHtml(item.id)}">
    <div class="card-meta"><span>${escapeHtml(item.source)}</span><span>${escapeHtml(statusLabels[item.status] || item.status)}</span></div>
    <h3>${escapeHtml(item.title)}</h3>
    <p class="company">${escapeHtml(item.company.name)}</p>
    <p class="description">${escapeHtml(item.description || "Описание пока не добавлено.")}</p>
    <div class="card-footer">
      <a href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">Открыть ↗</a>
      <label><span class="sr-only">Статус</span><select data-status>${options}</select></label>
    </div>
    <button class="application-button" data-apply type="button">Записать отклик</button>
  </article>`;
}

function formatDate(value) {
  if (!value) return "Дата не указана";
  return new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function applicationCard(item) {
  return `<article class="application-card">
    <div class="application-date">${escapeHtml(formatDate(item.applied_at))}</div>
    <div>
      <p class="card-meta"><span>${escapeHtml(item.source)}</span><span>Отклик записан</span></p>
      <h3>${escapeHtml(item.vacancy.title)}</h3>
      <p>${escapeHtml(item.next_action || "Следующий шаг пока не указан.")}</p>
    </div>
    <div class="application-details">
      <span>Резюме</span>
      <strong>${escapeHtml(item.resume_version || "—")}</strong>
    </div>
  </article>`;
}

async function loadApplications() {
  applicationList.setAttribute("aria-busy", "true");
  try {
    const response = await fetch("/api/v1/applications");
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message || "Не удалось получить отклики");
    applicationCount.textContent = String(payload.total).padStart(2, "0");
    applicationList.innerHTML = payload.total ? payload.items.map(applicationCard).join("") : "";
    if (!payload.total) stateCard(applicationList, "Откликов пока нет", "Запишите первый факт отклика из карточки вакансии.");
  } catch (error) {
    applicationCount.textContent = "—";
    stateCard(applicationList, "Не удалось загрузить отклики", error.message);
  } finally {
    applicationList.setAttribute("aria-busy", "false");
  }
}

async function loadVacancies() {
  grid.setAttribute("aria-busy", "true");
  try {
    const response = await fetch("/api/v1/vacancies");
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message || "Не удалось получить вакансии");
    count.textContent = String(payload.total).padStart(2, "0");
    signal.classList.add("online");
    signal.classList.remove("offline");
    connectionLabel.textContent = "Core доступен";
    grid.innerHTML = payload.total
      ? payload.items.map(vacancyCard).join("")
      : "";
    if (!payload.total) stateCard(grid, "Воронка пока пуста", "Добавьте первую вакансию — она сохранится в Core.");
  } catch (error) {
    count.textContent = "—";
    signal.classList.add("offline");
    signal.classList.remove("online");
    connectionLabel.textContent = "Core недоступен";
    stateCard(grid, "Не удалось загрузить вакансии", error.message);
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
  submitButton.disabled = true;
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
    submitButton.disabled = false;
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
    showNotice(error.message, true);
    await loadVacancies();
  } finally {
    select.disabled = false;
  }
});

grid.addEventListener("click", (event) => {
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
  applicationSubmitButton.disabled = true;
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
    applicationSubmitButton.disabled = false;
  }
});

loadVacancies();
loadApplications();
startLiveReload();
