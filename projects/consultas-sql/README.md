# Consultas SQL para análise de produção

Esquema PostgreSQL, base sintética e dez consultas comentadas sobre avanço, prazos, utilização de horas e agregações por setor.

## Requisitos

PostgreSQL 14+ e `psql`.

## Carregar os dados

Na **raiz do repositório**, crie um banco local e execute:

```bash
createdb producao_demo
psql -d producao_demo -v ON_ERROR_STOP=1 -f projects/consultas-sql/schema.sql
psql -d producao_demo -v ON_ERROR_STOP=1 -c "\copy fato_producao FROM 'data/ordens_producao.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8')"
```

Depois rode as consultas:

```bash
psql -d producao_demo -f projects/consultas-sql/consultas.sql
```

A saída esperada, conferida em PostgreSQL 16, está em [`resultados.md`](resultados.md).

## O que as consultas cobrem

`GROUP BY` com `NULLIF`, `FILTER`, CTE, funções de janela (`SUM() OVER`, `DENSE_RANK`, `LAG`) e aritmética de datas.

## Decisões

- **Mesmos dados do painel.** O CSV em [`data/`](../../data/ordens_producao.csv) é compartilhado com o [painel](../painel-producao/), e os números coincidem entre os dois.
- **Data de referência 24/09/2026** na consulta 3, a mesma do painel (a amostra é de setembro de 2026; com a data de hoje, toda ordem aberta estaria vencida).
- **Horas só de ordens concluídas** (consultas 4 e 8): horas parciais de ordens em andamento fariam a utilização parecer baixa demais.
- **Tabela fato única** para manter a configuração pequena. Uma evolução possível é separar produto, setor e calendário em dimensões, como no [esquema conceitual](../painel-producao/docs/modelo.svg).

## Dados

Os 18 registros foram inventados para demonstração. Identificadores `OP-DEMO-*`, nomes e datas são artificiais.
