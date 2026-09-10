#!/usr/bin/env node
/**
 * Lightweight bootstrap smoke (no browser E2E framework).
 *
 * Loads shipped app.js against stubbed DOM + degraded HH/challenge APIs and
 * asserts vacancies still load without an uncaught bootstrap exception.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const appJsPath = join(root, "src", "job_search_web", "static", "app.js");
const source = readFileSync(appJsPath, "utf8");

const fetchCalls = [];
const uncaught = [];
const timers = [];

function makeEl(tag = "div") {
  const listeners = {};
  const el = {
    tagName: String(tag).toUpperCase(),
    id: "",
    className: "",
    textContent: "",
    innerHTML: "",
    value: "",
    checked: false,
    hidden: false,
    disabled: false,
    dataset: {},
    style: {},
    classList: {
      _set: new Set(),
      add(...names) {
        names.forEach((n) => el.classList._set.add(n));
      },
      remove(...names) {
        names.forEach((n) => el.classList._set.delete(n));
      },
      toggle(name, force) {
        if (force === true) el.classList._set.add(name);
        else if (force === false) el.classList._set.delete(name);
        else if (el.classList._set.has(name)) el.classList._set.delete(name);
        else el.classList._set.add(name);
        return el.classList._set.has(name);
      },
      contains(name) {
        return el.classList._set.has(name);
      },
    },
    setAttribute(name, value) {
      if (name === "hidden") el.hidden = value !== null && value !== false;
      else if (name === "aria-busy") el.dataset.ariaBusy = String(value);
      else el.dataset[`attr_${name}`] = String(value);
    },
    getAttribute(name) {
      if (name === "hidden") return el.hidden ? "" : null;
      return el.dataset[`attr_${name}`] ?? null;
    },
    removeAttribute(name) {
      if (name === "hidden") el.hidden = false;
      delete el.dataset[`attr_${name}`];
    },
    addEventListener(type, fn) {
      (listeners[type] ||= []).push(fn);
    },
    removeEventListener() {},
    dispatchEvent() {
      return true;
    },
    focus() {},
    click() {},
    closest() {
      return null;
    },
    matches() {
      return false;
    },
    appendChild(child) {
      return child;
    },
    remove() {},
    querySelector() {
      return makeEl();
    },
    querySelectorAll() {
      return [];
    },
    showModal() {},
    close() {},
  };
  // Forms use .elements.field — must exist so optional chaining does not throw.
  el.elements = new Proxy(
    {},
    {
      get(_t, prop) {
        if (prop === "namedItem") return () => makeEl("input");
        return makeEl("input");
      },
    },
  );
  el.options = [];
  el.selectedOptions = [];
  el.contentWindow = null;
  return el;
}

const byId = new Map();
function elFor(selector) {
  if (!selector) return makeEl();
  const idMatch = String(selector).match(/^#([\w-]+)$/);
  if (idMatch) {
    const id = idMatch[1];
    if (!byId.has(id)) {
      const node = makeEl();
      node.id = id;
      byId.set(id, node);
    }
    return byId.get(id);
  }
  return makeEl();
}

const documentStub = {
  documentElement: makeEl("html"),
  body: makeEl("body"),
  readyState: "complete",
  querySelector(sel) {
    return elFor(sel);
  },
  querySelectorAll() {
    return [];
  },
  addEventListener() {},
  createElement(tag) {
    return makeEl(tag);
  },
};

async function stubFetch(input, init = {}) {
  const url = String(input);
  fetchCalls.push({ url, method: (init.method || "GET").toUpperCase() });
  const json = async (payload, ok = true, status = ok ? 200 : 503) => ({
    ok,
    status,
    json: async () => payload,
    text: async () => JSON.stringify(payload),
  });

  // Degrade HH / challenge: bootstrap must still load Core vacancies.
  if (url.includes("/api/v1/hh/")) {
    return json({ message: "hh_unavailable", code: "hh_unavailable" }, false, 503);
  }
  if (url.includes("/api/v1/vacancies")) {
    return json({
      items: [
        {
          id: "vac-1",
          title: "Stub Vacancy",
          company: { name: "Stub Co" },
          status: "new",
        },
      ],
      total: 1,
      limit: 25,
      offset: 0,
    });
  }
  if (url.includes("/api/v1/search-runs")) {
    return json({ items: [] });
  }
  if (url.includes("/api/v1/automation")) {
    return json({ enabled: false, running: false, last_status: "ok" });
  }
  if (url.includes("/api/v1/search-cycle")) {
    return json({ status: "open" });
  }
  if (url.includes("/api/v1/applications")) return json({ items: [] });
  if (url.includes("/api/v1/people")) return json({ items: [] });
  if (url.includes("/api/v1/direct-outreaches")) return json({ items: [] });
  if (url.includes("/api/v1/employer-responses")) return json({ items: [] });
  if (url.includes("/api/v1/hiring-processes")) return json({ items: [] });
  if (url.includes("/api/v1/offers")) return json({ items: [] });
  if (url.includes("/api/v1/metrics")) return json({ items: [] });
  if (url.includes("/api/v1/hypotheses")) return json({ items: [] });
  if (url.includes("/api/v1/osint")) return json({ items: [] });
  if (url.includes("/api/v1/live-reload") || url.includes("revision")) {
    return json({ revision: "smoke" });
  }
  return json({});
}

const sandbox = {
  console,
  setTimeout(fn, ms, ...args) {
    const id = timers.length + 1;
    timers.push({ id, fn, ms, args });
    return id;
  },
  clearTimeout() {},
  setInterval() {
    return 1;
  },
  clearInterval() {},
  addEventListener() {},
  removeEventListener() {},
  dispatchEvent() {
    return true;
  },
  open() {
    return null;
  },
  close() {},
  scrollTo() {},
  fetch: stubFetch,
  document: documentStub,
  window: null,
  location: { href: "http://127.0.0.1:8080/", hash: "#vacancies", reload() {} },
  navigator: { userAgent: "bootstrap-smoke" },
  localStorage: {
    _data: {},
    getItem(k) {
      return this._data[k] ?? null;
    },
    setItem(k, v) {
      this._data[k] = String(v);
    },
    removeItem(k) {
      delete this._data[k];
    },
  },
  sessionStorage: {
    _data: {},
    getItem(k) {
      return this._data[k] ?? null;
    },
    setItem(k, v) {
      this._data[k] = String(v);
    },
    removeItem(k) {
      delete this._data[k];
    },
  },
  crypto: {
    randomUUID() {
      return "00000000-0000-4000-8000-000000000001";
    },
  },
  URL,
  URLSearchParams,
  FormData: class FormData {
    constructor() {
      this._map = new Map();
    }
    append(k, v) {
      this._map.set(k, v);
    }
    entries() {
      return this._map.entries();
    }
  },
  Headers: Map,
  Request: class Request {
    constructor(input) {
      this.url = String(input);
    }
  },
  Response: class Response {},
  AbortController: class AbortController {
    constructor() {
      this.signal = { aborted: false };
    }
    abort() {
      this.signal.aborted = true;
    }
  },
  MutationObserver: class MutationObserver {
    observe() {}
    disconnect() {}
  },
  ResizeObserver: class ResizeObserver {
    observe() {}
    disconnect() {}
  },
  IntersectionObserver: class IntersectionObserver {
    observe() {}
    disconnect() {}
  },
  queueMicrotask,
  Promise,
  Map,
  Set,
  WeakMap,
  WeakSet,
  JSON,
  Math,
  Date,
  Number,
  String,
  Boolean,
  Array,
  Object,
  Error,
  TypeError,
  ReferenceError,
  SyntaxError,
  RegExp,
  parseInt,
  parseFloat,
  isNaN,
  Infinity,
  NaN,
  undefined,
  atob: (s) => Buffer.from(s, "base64").toString("binary"),
  btoa: (s) => Buffer.from(s, "binary").toString("base64"),
  encodeURIComponent,
  decodeURIComponent,
  TextDecoder,
  TextEncoder,
  Intl,
  performance: { now: () => Date.now() },
  requestAnimationFrame(fn) {
    return sandbox.setTimeout(fn, 0);
  },
  cancelAnimationFrame() {},
  matchMedia() {
    return { matches: false, addEventListener() {}, removeEventListener() {} };
  },
  getComputedStyle() {
    return { getPropertyValue: () => "", display: "block", visibility: "visible" };
  },
  HTMLElement: class HTMLElement {},
  Element: class Element {},
  Node: class Node {},
  Event: class Event {
    constructor(type) {
      this.type = type;
    }
  },
  CustomEvent: class CustomEvent {
    constructor(type) {
      this.type = type;
    }
  },
  process: undefined,
  module: undefined,
  exports: undefined,
  require: undefined,
  Buffer: undefined,
  global: undefined,
  globalThis: null,
};

sandbox.window = sandbox;
sandbox.globalThis = sandbox;
sandbox.self = sandbox;

process.on("uncaughtException", (error) => {
  uncaught.push(error);
});
process.on("unhandledRejection", (reason) => {
  uncaught.push(reason instanceof Error ? reason : new Error(String(reason)));
});

let script;
try {
  script = new vm.Script(source, { filename: "app.js" });
} catch (error) {
  console.error("bootstrap-smoke: SyntaxError while compiling app.js");
  console.error(error);
  process.exit(1);
}

const context = vm.createContext(sandbox);
try {
  script.runInContext(context, { timeout: 10_000 });
} catch (error) {
  console.error("bootstrap-smoke: exception during app.js evaluation");
  console.error(error);
  process.exit(1);
}

// Drain immediate timers / microtasks used by bootstrap.
await new Promise((resolve) => setImmediate(resolve));
for (const timer of [...timers]) {
  if (typeof timer.fn === "function" && (timer.ms || 0) <= 5) {
    try {
      timer.fn(...(timer.args || []));
    } catch (error) {
      uncaught.push(error);
    }
  }
}
await new Promise((resolve) => setTimeout(resolve, 50));
await new Promise((resolve) => setImmediate(resolve));

const hhCalls = fetchCalls.filter((c) => c.url.includes("/api/v1/hh/"));
const vacancyCalls = fetchCalls.filter((c) => c.url.includes("/api/v1/vacancies"));

if (uncaught.length) {
  console.error("bootstrap-smoke: uncaught errors");
  for (const error of uncaught) console.error(error);
  process.exit(1);
}

if (!vacancyCalls.length) {
  console.error("bootstrap-smoke: vacancies fetch never ran after HH degradation");
  console.error("fetchCalls=", fetchCalls.map((c) => c.url));
  process.exit(1);
}

if (!hhCalls.length) {
  // HH connection is attempted; if stubs swallowed it that is still OK as long as
  // vacancies ran. Prefer seeing the degraded call for stronger proof.
  console.warn("bootstrap-smoke: warning — no HH fetch observed");
}

console.log(
  `bootstrap-smoke: OK (hh_calls=${hhCalls.length}, vacancy_calls=${vacancyCalls.length}, fetches=${fetchCalls.length})`,
);
