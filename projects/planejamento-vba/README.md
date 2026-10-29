# Planejamento semanal com VBA

Macro de demonstração que copia registros não concluídos de uma tabela do Excel para uma aba de planejamento e ordena por prazo. Inclui um módulo VBA importável e dados fictícios para montar a pasta de trabalho localmente.

## Preparar a pasta de trabalho

1. Crie uma planilha chamada `Entrada`.
2. Importe `amostras/ordens_demo.csv` para essa planilha.
3. Converta o intervalo em Tabela do Excel e nomeie a tabela `tbOrdens`.
4. Abra o editor VBA (`Alt+F11`) e importe `AtualizarPlanejamento.bas`.
5. Execute `AtualizarPlanejamento`.

A macro cria/atualiza a aba `Planejamento`, mantém apenas linhas cujo status não é `Concluída` e ordena pela coluna `data_prevista`.

## Colunas esperadas

`ordem_id`, `produto`, `setor`, `data_prevista`, `quantidade`, `status`.

## Exemplo de entrada

Os identificadores `DEMO-*`, produtos, setores e datas do CSV são inventados. O projeto não contém macros, planilhas ou regras copiadas de ambiente de trabalho.

## Compatibilidade

Excel desktop com suporte a VBA. Salve uma cópia local como `.xlsm` antes de executar macros.
