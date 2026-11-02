-- 1. Volume e avanço agregado por setor
SELECT setor, COUNT(*) AS total_ordens,
       SUM(quantidade_planejada) AS quantidade_planejada,
       SUM(quantidade_produzida) AS quantidade_produzida,
       ROUND(100.0 * SUM(quantidade_produzida) / NULLIF(SUM(quantidade_planejada), 0), 1) AS avanco_pct
FROM fato_producao GROUP BY setor ORDER BY setor;

-- 2. Ordens concluídas depois da data prevista
SELECT ordem_id, data_prevista, data_real, data_real - data_prevista AS dias_de_atraso
FROM fato_producao WHERE data_real > data_prevista ORDER BY dias_de_atraso DESC;

-- 3. Ordens abertas vencidas na data de referência (24/09/2026, a mesma do painel)
SELECT ordem_id, produto, setor, data_prevista, DATE '2026-09-24' - data_prevista AS dias_vencidos
FROM fato_producao WHERE status <> 'Concluída' AND data_prevista < DATE '2026-09-24' ORDER BY dias_vencidos DESC;

-- 4. Horas realizadas x planejadas por linha, só em ordens concluídas
-- (ordens em andamento têm horas parciais; incluí-las faria a utilização parecer baixa demais)
SELECT linha, SUM(horas_planejadas) AS horas_planejadas, SUM(horas_realizadas) AS horas_realizadas,
       ROUND(100.0 * SUM(horas_realizadas) / NULLIF(SUM(horas_planejadas), 0), 1) AS utilizacao_pct
FROM fato_producao WHERE status = 'Concluída' GROUP BY linha ORDER BY linha;

-- 5. Carga acumulada planejada por linha (CTE + janela)
WITH carga_diaria AS (
  SELECT linha, data_prevista, SUM(quantidade_planejada) AS qtd_planejada
  FROM fato_producao GROUP BY linha, data_prevista
)
SELECT linha, data_prevista, qtd_planejada,
       SUM(qtd_planejada) OVER (PARTITION BY linha ORDER BY data_prevista) AS qtd_acumulada
FROM carga_diaria ORDER BY linha, data_prevista;

-- 6. Ordens e participação por situação
SELECT status, COUNT(*) AS total,
       ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS participacao_pct
FROM fato_producao GROUP BY status ORDER BY total DESC;

-- 7. Ranking de produtos por quantidade produzida
SELECT produto, SUM(quantidade_produzida) AS produzido,
       DENSE_RANK() OVER (ORDER BY SUM(quantidade_produzida) DESC) AS ranking
FROM fato_producao GROUP BY produto ORDER BY ranking, produto;

-- 8. Desvio de horas nas ordens concluídas (positivo = gastou mais do que o planejado)
SELECT ordem_id, linha, horas_planejadas, horas_realizadas,
       horas_realizadas - horas_planejadas AS variacao_horas
FROM fato_producao WHERE status = 'Concluída'
ORDER BY ABS(horas_realizadas - horas_planejadas) DESC, ordem_id;

-- 9. Conclusão por setor (agregação condicional)
SELECT setor, COUNT(*) FILTER (WHERE status = 'Concluída') AS concluidas,
       COUNT(*) AS total,
       ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'Concluída') / NULLIF(COUNT(*), 0), 1) AS conclusao_pct
FROM fato_producao GROUP BY setor ORDER BY conclusao_pct DESC;

-- 10. Comparação com ordem anterior no mesmo setor (LAG)
SELECT setor, ordem_id, data_abertura, quantidade_produzida,
       LAG(quantidade_produzida) OVER (PARTITION BY setor ORDER BY data_abertura) AS produzido_ordem_anterior
FROM fato_producao ORDER BY setor, data_abertura;
