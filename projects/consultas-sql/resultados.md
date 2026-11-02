# Resultados das consultas

Saída real das 10 consultas de [`consultas.sql`](consultas.sql), executadas em PostgreSQL 16 sobre os 18 registros de [`data/ordens_producao.csv`](../../data/ordens_producao.csv). Serve para conferir o que esperar ao rodar o projeto; os números coincidem com os do [painel](../painel-producao/).

Para reproduzir: carregue os dados conforme o [README](README.md) e rode `\i projects/consultas-sql/consultas.sql` no `psql`.

## 1. Volume e avanço agregado por setor

```text
  setor   | total_ordens | quantidade_planejada | quantidade_produzida | avanco_pct 
----------+--------------+----------------------+----------------------+------------
 Corte    |            5 |                  545 |                  365 |       67.0
 Dobra    |            5 |                  460 |                  325 |       70.7
 Montagem |            4 |                  495 |                  258 |       52.1
 Pintura  |            4 |                  440 |                  355 |       80.7
(4 rows)
```

## 2. Ordens concluídas depois da data prevista

```text
  ordem_id   | data_prevista | data_real  | dias_de_atraso 
-------------+---------------+------------+----------------
 OP-DEMO-002 | 2026-09-06    | 2026-09-08 |              2
 OP-DEMO-008 | 2026-09-15    | 2026-09-16 |              1
(2 rows)
```

## 3. Ordens abertas vencidas na data de referência (24/09/2026, a mesma do painel)

```text
  ordem_id   |  produto  |  setor   | data_prevista | dias_vencidos 
-------------+-----------+----------+---------------+---------------
 OP-DEMO-003 | Produto C | Montagem | 2026-09-09    |            15
 OP-DEMO-005 | Produto D | Corte    | 2026-09-12    |            12
 OP-DEMO-007 | Produto C | Montagem | 2026-09-14    |            10
 OP-DEMO-009 | Produto A | Corte    | 2026-09-17    |             7
 OP-DEMO-011 | Produto C | Montagem | 2026-09-19    |             5
 OP-DEMO-012 | Produto D | Pintura  | 2026-09-20    |             4
 OP-DEMO-014 | Produto B | Dobra    | 2026-09-22    |             2
 OP-DEMO-015 | Produto C | Montagem | 2026-09-23    |             1
(8 rows)
```

## 4. Horas realizadas x planejadas por linha, só em ordens concluídas

```text
  linha  | horas_planejadas | horas_realizadas | utilizacao_pct 
---------+------------------+------------------+----------------
 Linha 1 |            16.00 |            14.00 |           87.5
 Linha 2 |            15.00 |            17.00 |          113.3
 Linha 3 |            35.00 |            33.00 |           94.3
(3 rows)
```

## 5. Carga acumulada planejada por linha (CTE + janela)

```text
  linha  | data_prevista | qtd_planejada | qtd_acumulada 
---------+---------------+---------------+---------------
 Linha 1 | 2026-09-05    |           120 |           120
 Linha 1 | 2026-09-09    |           150 |           270
 Linha 1 | 2026-09-13    |           110 |           380
 Linha 1 | 2026-09-17    |            95 |           475
 Linha 1 | 2026-09-20    |            85 |           560
 Linha 1 | 2026-09-23    |           115 |           675
 Linha 1 | 2026-09-26    |            90 |           765
 Linha 2 | 2026-09-06    |            80 |            80
 Linha 2 | 2026-09-12    |            90 |           170
 Linha 2 | 2026-09-15    |           130 |           300
 Linha 2 | 2026-09-19    |           160 |           460
 Linha 2 | 2026-09-22    |            75 |           535
 Linha 2 | 2026-09-25    |           100 |           635
 Linha 3 | 2026-09-10    |           100 |           100
 Linha 3 | 2026-09-14    |            70 |           170
 Linha 3 | 2026-09-18    |           105 |           275
 Linha 3 | 2026-09-21    |           140 |           415
 Linha 3 | 2026-09-24    |           125 |           540
(18 rows)
```

## 6. Ordens e participação por situação

```text
   status    | total | participacao_pct 
-------------+-------+------------------
 Concluída   |     8 |             44.4
 Em produção |     8 |             44.4
 Planejada   |     2 |             11.1
(3 rows)
```

## 7. Ranking de produtos por quantidade produzida

```text
  produto  | produzido | ranking 
-----------+-----------+---------
 Produto A |       420 |       1
 Produto B |       325 |       2
 Produto D |       300 |       3
 Produto C |       258 |       4
(4 rows)
```

## 8. Desvio de horas nas ordens concluídas (positivo = gastou mais do que o planejado)

```text
  ordem_id   |  linha  | horas_planejadas | horas_realizadas | variacao_horas 
-------------+---------+------------------+------------------+----------------
 OP-DEMO-001 | Linha 1 |             8.00 |             7.00 |          -1.00
 OP-DEMO-002 | Linha 2 |             6.00 |             7.00 |           1.00
 OP-DEMO-006 | Linha 1 |             8.00 |             7.00 |          -1.00
 OP-DEMO-008 | Linha 2 |             9.00 |            10.00 |           1.00
 OP-DEMO-013 | Linha 3 |            10.00 |             9.00 |          -1.00
 OP-DEMO-016 | Linha 3 |             9.00 |             8.00 |          -1.00
 OP-DEMO-004 | Linha 3 |             8.00 |             8.00 |           0.00
 OP-DEMO-010 | Linha 3 |             8.00 |             8.00 |           0.00
(8 rows)
```

## 9. Conclusão por setor (agregação condicional)

```text
  setor   | concluidas | total | conclusao_pct 
----------+------------+-------+---------------
 Pintura  |          3 |     4 |          75.0
 Dobra    |          3 |     5 |          60.0
 Corte    |          2 |     5 |          40.0
 Montagem |          0 |     4 |           0.0
(4 rows)
```

## 10. Comparação com ordem anterior no mesmo setor (LAG)

```text
  setor   |  ordem_id   | data_abertura | quantidade_produzida | produzido_ordem_anterior 
----------+-------------+---------------+----------------------+--------------------------
 Corte    | OP-DEMO-001 | 2026-09-01    |                  120 |                         
 Corte    | OP-DEMO-005 | 2026-09-05    |                   45 |                      120
 Corte    | OP-DEMO-009 | 2026-09-09    |                   40 |                       45
 Corte    | OP-DEMO-013 | 2026-09-13    |                  140 |                       40
 Corte    | OP-DEMO-017 | 2026-09-17    |                   20 |                      140
 Dobra    | OP-DEMO-002 | 2026-09-02    |                   80 |                         
 Dobra    | OP-DEMO-006 | 2026-09-06    |                  110 |                       80
 Dobra    | OP-DEMO-010 | 2026-09-10    |                  105 |                      110
 Dobra    | OP-DEMO-014 | 2026-09-14    |                   30 |                      105
 Dobra    | OP-DEMO-018 | 2026-09-18    |                    0 |                       30
 Montagem | OP-DEMO-003 | 2026-09-03    |                   90 |                         
 Montagem | OP-DEMO-007 | 2026-09-07    |                   28 |                       90
 Montagem | OP-DEMO-011 | 2026-09-11    |                   80 |                       28
 Montagem | OP-DEMO-015 | 2026-09-15    |                   60 |                       80
 Pintura  | OP-DEMO-004 | 2026-09-04    |                  100 |                         
 Pintura  | OP-DEMO-008 | 2026-09-08    |                  130 |                      100
 Pintura  | OP-DEMO-012 | 2026-09-12    |                    0 |                      130
 Pintura  | OP-DEMO-016 | 2026-09-16    |                  125 |                        0
(18 rows)
```
