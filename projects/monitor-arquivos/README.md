# Monitor de arquivos por hash

Exemplo de CLI em Python que acompanha um arquivo local sem copiar nem registrar o conteúdo. A primeira execução cria uma referência SHA-256; execuções seguintes detectam se os bytes mudaram e adicionam um evento JSONL com horário, nome do arquivo e hashes curtos.

## Requisitos

Python 3.10 ou superior. Nenhuma dependência externa.

## Rodar

Na pasta deste projeto:

```bash
python monitor.py --file amostras/plano_semanal.csv --once
```

Edite uma célula do CSV fictício e rode o comando de novo para registrar uma alteração. O arquivo `.monitor-state.json` mantém o último hash e `changes.jsonl` recebe os eventos. Ambos ficam locais e são ignorados pelo Git.

Para observar mudanças continuamente:

```bash
python monitor.py --file amostras/plano_semanal.csv --interval 3
```

Encerre com `Ctrl+C`.

## Decisões

- SHA-256 compara conteúdo sem salvar cópias.
- O log registra só o nome-base, hashes abreviados e horário UTC; não grava o caminho completo nem conteúdo do arquivo.
- Os caminhos de estado e log podem ser alterados via `--state` e `--log`.
- Este exemplo verifica um arquivo por execução. Não é um serviço de produção nem envia notificações.

## Arquivo de exemplo

`amostras/plano_semanal.csv` foi inventado para demonstração. Não use arquivos confidenciais em uma cópia pública.
