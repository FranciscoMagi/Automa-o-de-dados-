"""Monitor de alterações de um arquivo por SHA-256. Biblioteca padrão apenas."""
from __future__ import annotations
import argparse
import hashlib
import json
import time
from datetime import datetime, timezone
from pathlib import Path


def fingerprint(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def read_state(path: Path) -> dict:
    if not path.exists():
        return {}
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
        return value if isinstance(value, dict) else {}
    except (OSError, json.JSONDecodeError) as exc:
        raise SystemExit(f"Não foi possível ler o estado {path.name}: {exc}") from exc


def state_key(path: Path) -> str:
    """Nome do arquivo + hash curto do caminho: evita colisão entre arquivos homônimos de pastas
    diferentes, sem gravar o caminho completo."""
    where = hashlib.sha256(str(path.resolve()).encode("utf-8")).hexdigest()[:8]
    return f"{path.name}:{where}"


def check_file(path: Path, state_path: Path, log_path: Path) -> str:
    """Compara o arquivo com a última referência. Retorna 'baseline', 'unchanged' ou 'changed'."""
    if not path.is_file():
        raise SystemExit(f"Arquivo não encontrado: {path}")
    current = fingerprint(path)
    state = read_state(state_path)
    key = state_key(path)
    previous = state.get(key)
    state[key] = current
    state_path.write_text(json.dumps(state, indent=2), encoding="utf-8")
    if previous is None:
        print(f"Referência criada para {path.name} ({current[:12]}).")
        return "baseline"
    if previous == current:
        print(f"Sem alterações em {path.name}.")
        return "unchanged"
    event = {
        "timestamp_utc": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "file": path.name,
        "old_sha256": previous[:12],
        "new_sha256": current[:12],
        "event": "content_changed",
    }
    with log_path.open("a", encoding="utf-8", newline="\n") as stream:
        stream.write(json.dumps(event, ensure_ascii=False) + "\n")
    print(f"Alteração detectada em {path.name}; evento salvo em {log_path.name}.")
    return "changed"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--file", required=True, type=Path, help="arquivo local a acompanhar")
    parser.add_argument("--state", type=Path, default=Path(".monitor-state.json"))
    parser.add_argument("--log", type=Path, default=Path("changes.jsonl"))
    parser.add_argument("--interval", type=float, default=0, help="intervalo em segundos; 0 executa uma verificação")
    parser.add_argument("--once", action="store_true", help="faz uma verificação e sai")
    args = parser.parse_args()
    if args.interval < 0:
        parser.error("--interval deve ser zero ou positivo")
    try:
        while True:
            check_file(args.file, args.state, args.log)
            if args.once or args.interval == 0:
                break
            time.sleep(args.interval)
    except KeyboardInterrupt:
        print("\nMonitoramento encerrado.")


if __name__ == "__main__":
    main()
