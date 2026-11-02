// Lógica pura do painel (sem DOM), separada para poder ser testada com `node --test`.

// Data usada para decidir se uma ordem em aberto está "vencida".
// 24/09/2026 é o primeiro dia depois da última conclusão registrada na amostra (23/09).
export const REFERENCE_DATE = "2026-09-24";

const NUMERIC_COLUMNS = [
  "quantidade_planejada",
  "quantidade_produzida",
  "horas_planejadas",
  "horas_realizadas",
];

/** Lê CSV com suporte a campos entre aspas e a finais de linha LF ou CRLF. */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const [header, ...body] = rows.filter((values) => values.some((value) => value !== ""));
  return body.map((values) => {
    const order = Object.fromEntries(header.map((name, i) => [name, values[i] ?? ""]));
    for (const column of NUMERIC_COLUMNS) {
      if (column in order) order[column] = Number(order[column]);
    }
    return order;
  });
}

// Datas ISO (aaaa-mm-dd) podem ser comparadas como texto.
export const isOpen = (order) => order.status !== "Concluída";
export const isLate = (order, ref = REFERENCE_DATE) => isOpen(order) && order.data_prevista < ref;
export const wasOnTime = (order) => order.status === "Concluída" && order.data_real <= order.data_prevista;
export const formatDate = (iso) => iso.split("-").reverse().join("/");

const percent = (part, whole) => (whole ? Math.round((part / whole) * 100) : null);
const total = (orders, key) => orders.reduce((sum, order) => sum + order[key], 0);

/**
 * Indicadores do conjunto de ordens recebido.
 * Pontualidade e horas só consideram ordens concluídas: comparar horas parciais de
 * ordens em andamento com o planejado inteiro faria a utilização parecer baixa demais.
 */
export function summarize(orders, ref = REFERENCE_DATE) {
  const done = orders.filter((order) => order.status === "Concluída");
  return {
    total: orders.length,
    open: orders.filter(isOpen).length,
    late: orders.filter((order) => isLate(order, ref)).length,
    doneCount: done.length,
    progressPct: percent(total(orders, "quantidade_produzida"), total(orders, "quantidade_planejada")),
    onTimePct: percent(done.filter(wasOnTime).length, done.length),
    hoursPct: percent(total(done, "horas_realizadas"), total(done, "horas_planejadas")),
  };
}

/** Quantidade planejada x produzida por setor, em ordem alfabética. */
export function bySector(orders) {
  const groups = new Map();
  for (const order of orders) {
    const group = groups.get(order.setor) ?? { sector: order.setor, planned: 0, made: 0 };
    group.planned += order.quantidade_planejada;
    group.made += order.quantidade_produzida;
    groups.set(order.setor, group);
  }
  return [...groups.values()]
    .map((group) => ({ ...group, pct: percent(group.made, group.planned) }))
    .sort((a, b) => a.sector.localeCompare(b.sector, "pt-BR"));
}

export function sortOrders(orders, key, direction = "asc") {
  const factor = direction === "desc" ? -1 : 1;
  const value = (order) =>
    key === "avanco"
      ? (order.quantidade_planejada ? order.quantidade_produzida / order.quantidade_planejada : 0)
      : order[key];
  return [...orders].sort((a, b) => {
    const x = value(a);
    const y = value(b);
    return (x < y ? -1 : x > y ? 1 : 0) * factor;
  });
}

/** Frase curta que aponta onde as ordens vencidas se concentram. */
export function lateInsight(orders, ref = REFERENCE_DATE) {
  const late = orders.filter((order) => isLate(order, ref));
  if (late.length === 0) return "Nenhuma ordem em aberto está vencida na data de referência.";

  const counts = new Map();
  for (const order of late) counts.set(order.setor, (counts.get(order.setor) ?? 0) + 1);
  const [sector, count] = [...counts.entries()].sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "pt-BR"),
  )[0];

  if (late.length === 1) return `A única ordem vencida está em ${sector}.`;
  if (count === late.length) return `Todas as ${count} ordens vencidas estão em ${sector}.`;
  return `${sector} concentra ${count} das ${late.length} ordens vencidas.`;
}
