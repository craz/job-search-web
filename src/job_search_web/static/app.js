const grid = document.querySelector("#vacancies");
const count = document.querySelector("#vacancy-count");
const notice = document.querySelector("#notice");
const dialog = document.querySelector("#vacancy-dialog");
const form = document.querySelector("#vacancy-form");
const formError = document.querySelector("#form-error");
const submitButton = document.querySelector("#submit-form");
const signal = document.querySelector(".signal");
const connectionLabel = document.querySelector("#connection-label");

const statusLabels = {
  new: "Новая",
  reviewing: "Изучаю",
  shortlisted: "В шорт-листе",
  rejected: "Не подходит",
};

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

function stateCard(title, detail) {
  grid.innerHTML = `<article class="state-card"><div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(detail)}</p></div></article>`;
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
  </article>`;
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
    if (!payload.total) stateCard("Воронка пока пуста", "Добавьте первую вакансию — она сохранится в Core.");
  } catch (error) {
    count.textContent = "—";
    signal.classList.add("offline");
    signal.classList.remove("online");
    connectionLabel.textContent = "Core недоступен";
    stateCard("Не удалось загрузить вакансии", error.message);
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

loadVacancies();
