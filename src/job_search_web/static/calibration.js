(() => {
  "use strict";

  const DEFAULT_SUITE_ID = "cal-r2361-realhh-20260831";
  const VERDICTS = ["apply", "maybe", "skip"];

  const state = {
    suiteId: DEFAULT_SUITE_ID,
    overview: null,
    casePayload: null,
    index: 0,
    selectedVerdict: null,
    busy: false,
  };

  const els = {};

  function qs(id) {
    return document.getElementById(id);
  }

  function readSuiteId() {
    const params = new URLSearchParams(window.location.search);
    return params.get("suite_id") || DEFAULT_SUITE_ID;
  }

  function setNotice(message) {
    if (!message) {
      els.notice.hidden = true;
      els.notice.textContent = "";
      return;
    }
    els.notice.hidden = false;
    els.notice.textContent = message;
  }

  async function api(method, path, body) {
    const options = { method, headers: { Accept: "application/json" } };
    if (body !== undefined) {
      options.headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(body);
    }
    const response = await fetch(path, options);
    let payload = null;
    try {
      payload = await response.json();
    } catch (_error) {
      payload = null;
    }
    if (!response.ok) {
      const detail = payload && (payload.detail || payload);
      const code =
        (detail && detail.code) ||
        (payload && payload.code) ||
        `http_${response.status}`;
      const message =
        (detail && detail.message) ||
        (payload && payload.message) ||
        code;
      throw new Error(message);
    }
    return payload;
  }

  function factRows(caseView) {
    const rows = [];
    if (caseView.salary) rows.push(["Salary / conditions", caseView.salary]);
    else if (caseView.conditions_summary) {
      rows.push(["Conditions", caseView.conditions_summary]);
    }
    if (caseView.location) rows.push(["Location", caseView.location]);
    if (caseView.work_format) rows.push(["Work format", caseView.work_format]);
    if (caseView.experience) rows.push(["Experience", caseView.experience]);
    return rows;
  }

  function renderFacts(caseView) {
    els.facts.replaceChildren();
    for (const [label, value] of factRows(caseView)) {
      const dt = document.createElement("dt");
      dt.textContent = label;
      const dd = document.createElement("dd");
      dd.textContent = String(value);
      els.facts.append(dt, dd);
    }
  }

  function setVerdictPressed(verdict) {
    state.selectedVerdict = verdict;
    for (const button of els.verdictButtons) {
      button.setAttribute(
        "aria-pressed",
        button.dataset.verdict === verdict ? "true" : "false",
      );
    }
  }

  function renderCase(payload) {
    state.casePayload = payload;
    state.index = payload.index;
    const caseView = payload.case || {};
    els.company.textContent = caseView.company || "—";
    els.title.textContent = caseView.title || "(без названия)";
    els.description.textContent = caseView.description || "Описание отсутствует.";
    renderFacts(caseView);

    const labeled = payload.labeled_cases ?? 0;
    const total = payload.total ?? 0;
    els.progress.textContent = `Case ${payload.position}/${total} · labels ${labeled}/${total}`;

    if (payload.label) {
      els.currentLabel.hidden = false;
      els.currentLabel.textContent = `Saved: ${payload.label.expected_verdict}`;
      setVerdictPressed(payload.label.expected_verdict);
      els.reason.value = payload.label.reason || "";
    } else {
      els.currentLabel.hidden = true;
      els.currentLabel.textContent = "";
      setVerdictPressed(null);
      els.reason.value = "";
    }

    els.prev.disabled = payload.index <= 0;
    els.next.disabled = payload.index >= total - 1;
    els.casePanel.hidden = false;
    els.labelPanel.hidden = false;

    if (payload.complete) {
      showComplete(true);
    } else {
      showComplete(false);
    }
  }

  function showComplete(complete) {
    els.complete.hidden = !complete;
    if (!complete || !state.overview) return;
    const dist = state.overview.distribution || {};
    els.completeSummary.textContent =
      `${state.overview.labeled_cases}/${state.overview.labels_total} labeled · ` +
      `apply=${dist.apply || 0}, maybe=${dist.maybe || 0}, skip=${dist.skip || 0}`;
  }

  async function loadOverview() {
    state.overview = await api(
      "GET",
      `/api/v1/calibration/suites/${encodeURIComponent(state.suiteId)}`,
    );
    els.suiteMeta.textContent =
      `suite ${state.overview.suite_id} · seed ${state.overview.selection_seed} · ` +
      `${state.overview.labeled_cases}/${state.overview.labels_total} labeled`;
    return state.overview;
  }

  async function loadCaseAt(index) {
    const overview = state.overview || (await loadOverview());
    const caseIds = overview.selected_case_ids || [];
    if (!caseIds.length) throw new Error("suite_has_no_cases");
    const safeIndex = Math.max(0, Math.min(index, caseIds.length - 1));
    const caseId = caseIds[safeIndex];
    const payload = await api(
      "GET",
      `/api/v1/calibration/suites/${encodeURIComponent(state.suiteId)}/cases/${encodeURIComponent(caseId)}`,
    );
    renderCase(payload);
    await api("PUT", `/api/v1/calibration/suites/${encodeURIComponent(state.suiteId)}/session`, {
      index: safeIndex,
    });
  }

  async function saveLabel() {
    if (state.busy) return;
    if (!state.selectedVerdict || !VERDICTS.includes(state.selectedVerdict)) {
      setNotice("Выберите expected_verdict: apply, maybe или skip.");
      return;
    }
    const caseId = state.casePayload && state.casePayload.case && state.casePayload.case.case_id;
    if (!caseId) return;
    state.busy = true;
    els.save.disabled = true;
    setNotice("");
    try {
      const body = { expected_verdict: state.selectedVerdict };
      const reason = els.reason.value.trim();
      if (reason) body.reason = reason;
      await api(
        "PUT",
        `/api/v1/calibration/suites/${encodeURIComponent(state.suiteId)}/labels/${encodeURIComponent(caseId)}`,
        body,
      );
      await loadOverview();
      const nextIndex = Math.min(state.index + 1, (state.overview.case_count || 1) - 1);
      if (state.overview.complete) {
        await loadCaseAt(state.index);
      } else {
        await loadCaseAt(nextIndex);
      }
    } catch (error) {
      setNotice(error.message || String(error));
    } finally {
      state.busy = false;
      els.save.disabled = false;
    }
  }

  async function jumpUnlabeled() {
    const overview = await loadOverview();
    const index =
      overview.first_unlabeled_index === null || overview.first_unlabeled_index === undefined
        ? overview.session_index || 0
        : overview.first_unlabeled_index;
    await loadCaseAt(index);
  }

  function bind() {
    els.suiteMeta = qs("suite-meta");
    els.progress = qs("progress");
    els.notice = qs("notice");
    els.casePanel = qs("case-panel");
    els.company = qs("case-company");
    els.title = qs("case-title");
    els.facts = qs("case-facts");
    els.description = qs("case-description");
    els.labelPanel = document.querySelector(".calibration-label-panel");
    els.reason = qs("label-reason");
    els.currentLabel = qs("current-label");
    els.prev = qs("prev-case");
    els.next = qs("next-case");
    els.save = qs("save-label");
    els.jump = qs("jump-unlabeled");
    els.complete = qs("complete-panel");
    els.completeSummary = qs("complete-summary");
    els.verdictButtons = Array.from(document.querySelectorAll("[data-verdict]"));

    for (const button of els.verdictButtons) {
      button.addEventListener("click", () => {
        setVerdictPressed(button.dataset.verdict);
      });
    }
    els.prev.addEventListener("click", async () => {
      if (state.index > 0) {
        setNotice("");
        try {
          await loadCaseAt(state.index - 1);
        } catch (error) {
          setNotice(error.message || String(error));
        }
      }
    });
    els.next.addEventListener("click", async () => {
      const total = (state.overview && state.overview.case_count) || 0;
      if (state.index < total - 1) {
        setNotice("");
        try {
          await loadCaseAt(state.index + 1);
        } catch (error) {
          setNotice(error.message || String(error));
        }
      }
    });
    els.save.addEventListener("click", () => {
      void saveLabel();
    });
    els.jump.addEventListener("click", () => {
      void jumpUnlabeled().catch((error) => setNotice(error.message || String(error)));
    });
  }

  async function boot() {
    bind();
    state.suiteId = readSuiteId();
    try {
      const overview = await loadOverview();
      const start =
        overview.first_unlabeled_index === null || overview.first_unlabeled_index === undefined
          ? overview.session_index || 0
          : overview.first_unlabeled_index;
      await loadCaseAt(start);
    } catch (error) {
      setNotice(error.message || String(error));
      els.casePanel.hidden = true;
      if (els.labelPanel) els.labelPanel.hidden = true;
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    void boot();
  });
})();
