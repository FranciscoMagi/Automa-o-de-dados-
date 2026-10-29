const csvUrl = "data/ordens_producao.csv";
let allOrders = [];
const $ = (selector) => document.querySelector(selector);
const formatNumber = (value) => new Intl.NumberFormat("pt-BR").format(value);

function parseCsv(text) {
  const [header, ...lines] = text.trim().split(/\r?\n/);
  const columns = header.split(",");
  return lines.map((line) => Object.fromEntries(
    line.split(",").map((value, index) => [columns[index], value])
  ));
}

function renderOptions(selector, values) {
  for (const value of [...new Set(values)].sort()) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    $(selector).append(option);
  }
}

function getVisibleOrders() {
  const sector = $("#filter-sector").value;
  const status = $("#filter-status").value;
  const query = $("#search").value.trim().toLocaleLowerCase("pt-BR");
  return allOrders.filter((order) => {
    const matchesSector = !sector || order.setor === sector;
    const matchesStatus = !status || order.status === status;
    const matchesText = !query || `${order.ordem_id} ${order.produto}`.toLocaleLowerCase("pt-BR").includes(query);
    return matchesSector && matchesStatus && matchesText;
  });
}

function render() {
  const orders = getVisibleOrders();
  const open = orders.filter((order) => order.status !== "Concluída");
  const late = open.filter((order) => order.data_prevista < "2026-09-27");
  const planned = orders.reduce((sum, order) => sum + Number(order.quantidade_planejada), 0);
  const made = orders.reduce((sum, order) => sum + Number(order.quantidade_produzida), 0);
  const progress = planned ? Math.round((made / planned) * 100) : 0;
  const metrics = [["Ordens", orders.length], ["Em aberto", open.length], ["Vencidas em 27/09", late.length], ["Avanço total", `${progress}%`]];
  $("#kpis").innerHTML = metrics.map(([label, value]) => `<article class="metric"><strong>${value}</strong><span>${label}</span></article>`).join("");
  $("#result-count").textContent = `${orders.length} registro(s)`;
  $("#orders").innerHTML = orders.map((order) => {
    const percent = Math.round((Number(order.quantidade_produzida) / Number(order.quantidade_planejada)) * 100) || 0;
    return `<tr><td>${order.ordem_id}</td><td>${order.produto}</td><td>${order.setor}</td><td>${order.data_prevista}</td><td><span class="status" data-status="${order.status}">${order.status}</span></td><td><span class="progress"><i style="width:${percent}%"></i></span>${percent}%</td></tr>`;
  }).join("");
  $("#empty").hidden = orders.length > 0;
}

fetch(csvUrl).then((response) => {
  if (!response.ok) throw new Error("Não foi possível carregar o CSV de demonstração.");
  return response.text();
}).then((text) => {
  allOrders = parseCsv(text);
  renderOptions("#filter-sector", allOrders.map((order) => order.setor));
  renderOptions("#filter-status", allOrders.map((order) => order.status));
  for (const selector of ["#filter-sector", "#filter-status", "#search"]) $(selector).addEventListener("input", render);
  render();
}).catch((error) => {
  $("#result-count").textContent = error.message;
  $("#empty").hidden = false;
});
