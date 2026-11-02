# Planejamento semanal com VBA

Macro de demonstração que copia os registros não concluídos de uma tabela do Excel para uma aba de planejamento e ordena por prazo. Inclui o módulo VBA importável e uma pasta de trabalho de exemplo.

## Preparar e executar

1. Abra `amostras/planejamento-demo.xlsx`. Ela já traz a planilha `Entrada` com a tabela `tbOrdens` (dados fictícios).
2. Salve uma cópia como **Pasta de Trabalho Habilitada para Macro do Excel (`.xlsm`)**.
3. Abra o editor VBA (`Alt+F11`), use **Arquivo → Importar arquivo** e escolha `AtualizarPlanejamento.bas`.
4. Execute a macro `AtualizarPlanejamento` (`Alt+F8`).

A macro cria ou atualiza a aba `Planejamento`, mantém apenas as linhas cujo status não é `Concluída` (também aceita `Concluida`, sem acento, em qualquer caixa) e ordena pela coluna `data_prevista`.

Para usar seus próprios dados de teste, importe `amostras/ordens_demo.csv` para uma planilha chamada `Entrada`, converta o intervalo em Tabela do Excel e nomeie-a `tbOrdens`.

## Colunas esperadas

`ordem_id`, `produto`, `setor`, `data_prevista`, `quantidade`, `status`.

## Exemplo de entrada

Os identificadores `DEMO-*`, produtos, setores e datas são inventados. O projeto não contém macros, planilhas ou regras copiadas de ambiente de trabalho.

## Decisões

- O módulo usa apenas caracteres ASCII: o editor VBA importa `.bas` em ANSI, e acentos podem se corromper. Por isso o `i` acentuado de "Concluída" é montado com `ChrW`.
- A macro restaura o estado de `ScreenUpdating` e limpa a área de cópia mesmo quando ocorre um erro.

## Compatibilidade

Excel desktop com suporte a VBA. Salve uma cópia local como `.xlsm` antes de executar macros. O `.xlsx` de exemplo não contém macros.
