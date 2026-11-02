# Monitor de arquivos por hash

CLI em Python que acompanha um arquivo local sem copiar nem registrar o conteúdo. A primeira execução cria uma referência SHA-256; as seguintes detectam se os bytes mudaram e acrescentam um evento JSONL com horário, nome do arquivo e hashes curtos.

## Requisitos

Python 3.10 ou superior. Nenhuma dependência externa.

## Rodar

Na pasta deste projeto:

```bash
python monitor.py --file amostras/plano_semanal.csv --once
```

Edite uma célula do CSV fictício e rode o comando de novo para registrar uma alteração. O arquivo `.monitor-state.json` guarda o último hash e `changes.jsonl` recebe os eventos. Ambos ficam locais e são ignorados pelo Git.

Exemplo de evento registrado:

```json
{"timestamp_utc": "2026-11-02T21:13:58+00:00", "file": "plano_semanal.csv", "old_sha256": "492d5ea49605", "new_sha256": "8baab0330389", "event": "content_changed"}
```

Para observar mudanças continuamente:

```bash
python monitor.py --file amostras/plano_semanal.csv --interval 3
```

Encerre com `Ctrl+C`.

## Testes

```bash
python -m unittest discover -s . -v
```

Cobrem a referência inicial, a ausência de alteração, o evento de mudança (sem conteúdo nem caminho no log), arquivos de mesmo nome em pastas diferentes, arquivo inexistente e estado corrompido.

## Decisões

- SHA-256 compara conteúdo sem salvar cópias.
- O log registra só o nome-base, hashes abreviados e horário UTC; não grava o caminho completo nem o conteúdo.
- O estado usa o nome do arquivo mais um hash curto do caminho como chave, para que dois `plano.csv` de pastas diferentes não se confundam.
- Os caminhos de estado e de log podem ser alterados com `--state` e `--log`.
- Verifica um arquivo por execução. Não é um serviço de produção nem envia notificações.

## Arquivo de exemplo

`amostras/plano_semanal.csv` foi inventado para demonstração. Não use arquivos confidenciais em uma cópia pública.
