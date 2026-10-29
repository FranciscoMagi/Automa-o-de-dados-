# Painel de produção fictício

Aplicação web estática que lê o CSV de exemplo, calcula indicadores no navegador e permite filtrar ordens por setor e situação. Sem bibliotecas externas ou backend.

## Executar

Na pasta `projects/painel-producao`, execute:

```bash
python -m http.server 8000
```

Acesse `http://localhost:8000/`. Um servidor local simples é necessário para carregar o CSV via `fetch`.

## Funcionalidades

- Indicadores de ordens, ordens abertas, vencidas e percentual de avanço.
- Filtros por setor e situação.
- Busca por identificador ou produto.
- Tabela com avanço individual e estado vazio quando não há resultados.
- Datas e valores pertencem exclusivamente à amostra sintética.

## Arquivos

- `index.html`: estrutura da página.
- `styles.css`: layout adaptável.
- `app.js`: leitura do CSV, cálculos e filtros.
- `data/ordens_producao.csv`: 18 linhas artificiais.
- `docs/medidas.dax`: medidas equivalentes como referência para Power BI.
- `docs/modelo.svg`: esquema conceitual.

## Power BI

Este exemplo não inclui `.pbix`. O CSV, esquema e medidas servem para reconstruir o modelo em uma instalação local do Power BI Desktop.
