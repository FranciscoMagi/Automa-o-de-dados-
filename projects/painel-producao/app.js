import {
  REFERENCE_DATE,
  bySector,
  formatDate,
  isLate,
  lateInsight,
  parseCsv,
  sortOrders,
  summarize,
} from "./metrics.js";

const CSV_URL = "../../data/ordens_producao.csv";
const COLUMNS = [
  ["ordem_id", "Ordem fictícia"],
  ["produto", "Produto"],
  ["setor", "Setor"],
  ["data_prevista", "Previsão"],
  ["status", "Situação"],
  ["avanco", "Avanço"],
];

const $ = (selector) => document.querySelector(selector);
const state = { orders: [], sortKey: "data_prevista", sortDir: "asc" };

/** Cria elementos com textContent: dados do CSV nunca são interpretados como HTML. */
function el(tag, { className, text, ...attrs } = {}, children = []) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value);
  node.append(...children);
  return node;
}

const showPercent = (value) => (value === null ? "—" : `${value}%`);
const orderProgress = (order) =>
  order.quantidade_planejada ? Math.round((order.quantidade_produzida / order.quantidade_planejada) * 100) : 0;

function fillOptions(select, values) {
  for (const value of [...new Set(values)].sort((a, b) => a.localeCompare(b, "pt-BR"))) {
    select.append(el("option", { value, text: value }));
  }
}

function visibleOrders() {
  const sector = $("#filter-sector").value;
  const status = $("#filter-status").value;
  const query = $("#search").value.trim().toLocaleLowerCase("pt-BR");
  return state.orders.filter((order) => {
    const text = `${order.ordem_id} ${order.produto}`.toLocaleLowerCase("pt-BR");
    return (!sector || order.setor === sector) && (!status || order.status === status) && (!query || text.includes(query));
  });
}

function renderKpis(orders, ref) {
  const s = summarize(orders, ref);
  const cards = [
    ["Ordens", s.total, ""],
    ["Em aberto", s.open, ""],
    [`Vencidas em ${formatDate(ref)}`, s.late, "em aberto e após a previsão"],
    ["Avanço", showPercent(s.progressPct), "quantidade produzida / planejada"],
    ["Entregas no prazo", showPercent(s.onTimePct), `${s.doneCount} ordens concluídas`],
    ["Horas realizadas / previstas", showPercent(s.hoursPct), "somente ordens concluídas"],
  ];
  $("#kpis").replaceChildren(
    ...cards.map(([label, value, note]) =>
      el("article", { className: "metric" }, [
        el("strong", { text: String(value) }),
        el("span", { text: label }),
        el("small", { text: note }),
      ]),
    ),
  );
}

function renderChart(orders) {
  const rows = bySector(orders).map((group) => {
    const fill = el("i");
    fill.style.width = `${Math.min(group.pct ?? 0, 100)}%`;
    return el("div", { className: "bar-row" }, [
      el("span", { className: "bar-label", text: group.sector }),
      el("span", { className: "bar-track", "aria-hidden": "true" }, [fill]),
      el("span", { className: "bar-value", text: `${group.made} de ${group.planned} · ${showPercent(group.pct)}` }),
    ]);
  });
  $("#sector-chart").replaceChildren(...rows);
}

function renderHead() {
  const cells = COLUMNS.map(([key, label]) => {
    const active = state.sortKey === key;
    const arrow = active ? (state.sortDir === "asc" ? " ▲" : " ▼") : "";
    const button = el("button", { type: "button", "data-key": key, text: label + arrow });
    return el(
      "th",
      { scope: "col", "aria-sort": active ? (state.sortDir === "asc" ? "ascending" : "descending") : "none" },
      [button],
    );
  });
  $("#table-head").replaceChildren(el("tr", {}, cells));
}

function renderRows(orders, ref) {
  const rows = sortOrders(orders, state.sortKey, state.sortDir).map((order) => {
    const percent = orderProgress(order);
    const bar = el("i");
    bar.style.width = `${percent}%`;
    const due = el("td", { text: formatDate(order.data_prevista) });
    if (isLate(order, ref)) due.append(" ", el("span", { className: "tag-late", text: "vencida" }));
    return el("tr", {}, [
      el("td", { text: order.ordem_id }),
      el("td", { text: order.produto }),
      el("td", { text: order.setor }),
      due,
      el("td", {}, [el("span", { className: "status", "data-status": order.status, text: order.status })]),
      el("td", {}, [el("span", { className: "progress", "aria-hidden": "true" }, [bar]), ` ${percent}%`]),
    ]);
  });
  $("#orders").replaceChildren(...rows);
  $("#result-count").textContent = `${orders.length} registro(s)`;
  $("#empty").hidden = orders.length > 0;
}

function render() {
  const ref = $("#ref-date").value || REFERENCE_DATE;
  const orders = visibleOrders();
  renderKpis(orders, ref);
  renderChart(orders);
  $("#insight").textContent = lateInsight(orders, ref);
  renderHead();
  renderRows(orders, ref);
}

function showError(message) {
  const box = $("#message");
  box.textContent = message;
  box.hidden = false;
  $("#result-count").textContent = "Sem dados para exibir.";
}

async function start() {
  $("#ref-date").value = REFERENCE_DATE;
  try {
    const response = await fetch(CSV_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.orders = parseCsv(await response.text());
  } catch {
    showError("Não foi possível carregar o CSV de demonstração. Abra o painel por um servidor local (veja o README).");
    return;
  }

  fillOptions($("#filter-sector"), state.orders.map((order) => order.setor));
  fillOptions($("#filter-status"), state.orders.map((order) => order.status));
  for (const selector of ["#filter-sector", "#filter-status", "#search", "#ref-date"]) {
    $(selector).addEventListener("input", render);
  }
  $("#table-head").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-key]");
    if (!button) return;
    const key = button.dataset.key;
    state.sortDir = state.sortKey === key && state.sortDir === "asc" ? "desc" : "asc";
    state.sortKey = key;
    render();
  });
  render();
}

start();
