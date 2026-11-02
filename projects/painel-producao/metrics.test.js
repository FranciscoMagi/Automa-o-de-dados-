import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  REFERENCE_DATE,
  bySector,
  lateInsight,
  parseCsv,
  sortOrders,
  summarize,
} from "./metrics.js";

const csv = readFileSync(new URL("../../data/ordens_producao.csv", import.meta.url), "utf8");
const orders = parseCsv(csv);

test("lê as 18 ordens do CSV com números convertidos", () => {
  assert.equal(orders.length, 18);
  assert.equal(typeof orders[0].quantidade_planejada, "number");
  assert.equal(orders[0].ordem_id, "OP-DEMO-001");
});

test("aceita campos entre aspas, vírgulas internas e CRLF", () => {
  const rows = parseCsv('a,b\r\n"x, y","he said ""hi"""\r\n');
  assert.deepEqual(rows, [{ a: "x, y", b: 'he said "hi"' }]);
});

test("indicadores gerais batem com as consultas SQL do repositório", () => {
  const s = summarize(orders);
  assert.equal(s.total, 18);
  assert.equal(s.open, 10);
  assert.equal(s.doneCount, 8);
  assert.equal(s.progressPct, 67); // 1303 produzidas de 1940 planejadas
  assert.equal(s.onTimePct, 75); // 6 das 8 concluídas no prazo (consulta 2 mostra as 2 atrasadas)
  assert.equal(s.late, 8); // consulta 3 na data de referência
});

test("a data de referência muda a contagem de vencidas", () => {
  assert.equal(summarize(orders, "2026-09-10").late, 1);
  assert.equal(summarize(orders, "2026-09-27").late, 10);
  assert.equal(REFERENCE_DATE, "2026-09-24");
});

test("avanço por setor bate com a consulta 1", () => {
  const sectors = Object.fromEntries(bySector(orders).map((g) => [g.sector, g.pct]));
  assert.deepEqual(sectors, { Corte: 67, Dobra: 71, Montagem: 52, Pintura: 81 });
});

test("filtros vazios não geram divisão por zero", () => {
  const s = summarize([]);
  assert.equal(s.total, 0);
  assert.equal(s.progressPct, null);
  assert.equal(s.onTimePct, null);
  assert.equal(s.hoursPct, null);
});

test("ordenação por avanço, em ambas as direções", () => {
  const asc = sortOrders(orders, "avanco", "asc");
  const desc = sortOrders(orders, "avanco", "desc");
  assert.equal(asc[0].quantidade_produzida, 0);
  assert.equal(desc[0].quantidade_produzida / desc[0].quantidade_planejada, 1);
});

test("aponta o setor com mais ordens vencidas", () => {
  assert.equal(lateInsight(orders), "Montagem concentra 4 das 8 ordens vencidas.");
  assert.equal(lateInsight(orders, "2026-08-01"), "Nenhuma ordem em aberto está vencida na data de referência.");
});

test("a frase de destaque trata um setor único e uma única ordem", () => {
  const montagem = orders.filter((order) => order.setor === "Montagem");
  assert.equal(lateInsight(montagem), "Todas as 4 ordens vencidas estão em Montagem.");
  assert.equal(lateInsight(orders, "2026-09-10"), "A única ordem vencida está em Montagem.");
});
