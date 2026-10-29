# Francisco Gabriel Magi

Projetos demonstrativos em automação, planilhas, JavaScript e SQL.

Este repositório reúne quatro exemplos pequenos para mostrar código que dá para abrir e experimentar. As demonstrações foram feitas separadamente e usam dados inventados; não incluí arquivos, telas ou código do trabalho.

## Projetos

| Projeto | Ferramentas | Para ver |
| --- | --- | --- |
| Painel de produção | HTML, CSS, JavaScript | [Demo](projects/painel-producao/index.html) · [README](projects/painel-producao/README.md) |
| Monitor de arquivos | Python | [Código](projects/monitor-arquivos/monitor.py) · [README](projects/monitor-arquivos/README.md) |
| Planejamento semanal | Excel VBA | [Módulo](projects/planejamento-vba/AtualizarPlanejamento.bas) · [README](projects/planejamento-vba/README.md) |
| Consultas de produção | PostgreSQL | [SQL](projects/consultas-sql/consultas.sql) · [README](projects/consultas-sql/README.md) |

## Abrir o site localmente

Na raiz desta pasta, execute:

```bash
python -m http.server 8000
```

Depois abra `http://localhost:8000/`.

## Publicar no GitHub

Crie no GitHub um repositório vazio chamado `portfolio-automacao-dados`. Na raiz desta pasta, conecte e envie a branch `main`:

```bash
git remote add origin https://github.com/SEU-USUARIO/portfolio-automacao-dados.git
git push -u origin main
```

Troque `SEU-USUARIO` pelo seu usuário. Antes de criar novos commits, configure o nome e o e-mail público `noreply` indicado nas configurações do GitHub; não use o e-mail do trabalho.

Para publicar o `index.html` como GitHub Pages, abra **Settings → Pages** e selecione a branch `main` e a pasta `/ (root)` como fonte.

## Observações

- O painel é uma demonstração web, não um `.pbix`.
- A macro VBA precisa de uma tabela chamada `tbOrdens`; os passos estão no README do projeto.
- O monitor acompanha um arquivo por vez e grava o log apenas localmente.
- Cada projeto tem seu próprio README com requisitos e limitações.

MIT — consulte [LICENSE](LICENSE).
