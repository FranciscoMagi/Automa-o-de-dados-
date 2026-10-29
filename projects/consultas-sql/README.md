# Consultas SQL para análise de produção

Projeto PostgreSQL com esquema, base sintética e consultas comentadas sobre avanço, prazos, utilização de horas e agregações por setor.

## Requisitos

PostgreSQL 14+ e `psql`.

## Carregar os dados

Crie um banco local e execute `schema.sql`. Depois, no `psql`, importe o CSV (ajuste o caminho para a pasta local):

```sql
\copy fato_producao FROM 'data/ordens_producao.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');
```

Execute `consultas.sql` para exemplos de `GROUP BY`, `FILTER`, CTEs e funções de janela.

## Modelo

O exemplo usa uma tabela fato simples para manter a configuração pequena. Uma evolução possível é separar produto, setor e calendário em dimensões.

## Dados

Os 18 registros do CSV foram inventados para demonstração. Identificadores `OP-DEMO-*`, nomes e datas são artificiais.
