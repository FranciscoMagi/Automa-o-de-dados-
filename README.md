# Portfólio de Automação e Dados

Projetos demonstrativos de nível júnior feitos para serem lidos, executados e discutidos no GitHub. Cada projeto tem um README próprio, código-fonte, entrada de exemplo e instruções para reproduzir o resultado.

> **Privacidade:** estes exemplos foram recriados para portfólio. Nenhum código, tela, arquivo, macro ou dado de empresa foi copiado. As bases são inteiramente fictícias.

## Projetos

### Monitor de arquivos — Python
Compara arquivos locais por SHA-256 e registra eventos de alteração em JSONL sem guardar o conteúdo monitorado. Inclui modo de uma execução e observação contínua.

[Ver código e instruções](projects/monitor-arquivos/README.md)

### Planejamento semanal — Excel VBA
Macro demonstrativa que seleciona registros ainda abertos em uma tabela e monta uma lista ordenada por prazo. Inclui módulo VBA importável e CSV de exemplo fictício.

[Ver código e instruções](projects/planejamento-vba/README.md)

### Painel de produção — HTML, CSS e JavaScript
Dashboard sem dependências externas com indicadores, filtros por setor e status, busca e tabela com percentual de avanço. Carrega uma base CSV sintética.

[Ver código e instruções](projects/painel-producao/README.md)

### Consultas de produção — PostgreSQL
Esquema simples e dez consultas comentadas, incluindo agregações, CTE e funções de janela. A base de exemplo é artificial.

[Ver código e instruções](projects/consultas-sql/README.md)

## Começar rápido

Para abrir o painel web:

```bash
cd projects/painel-producao
python -m http.server 8000
```

Acesse `http://localhost:8000/`. Para executar os outros projetos, siga o README de cada pasta.

## Estrutura

```text
projects/
├── monitor-arquivos/  # Python, SHA-256 e log de eventos
├── planejamento-vba/  # módulo VBA e CSV demonstrativo
├── painel-producao/   # dashboard web e amostra CSV
└── consultas-sql/     # esquema, consultas e amostra CSV
```

## Stack

Python 3.10+ · Excel VBA · HTML/CSS/JavaScript · PostgreSQL 14+

## Limites

O painel é web, não um arquivo Power BI `.pbix`. A macro VBA é uma implementação didática. Os projetos não se conectam a sistemas ou serviços externos.

## Licença

MIT — veja [LICENSE](LICENSE).
