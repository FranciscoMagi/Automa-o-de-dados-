import json
import tempfile
import unittest
from contextlib import redirect_stdout
from io import StringIO
from pathlib import Path

import monitor


class MonitorTest(unittest.TestCase):
    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self._tmp.cleanup)
        self.dir = Path(self._tmp.name)
        self.state = self.dir / "state.json"
        self.log = self.dir / "changes.jsonl"

    def check(self, path):
        with redirect_stdout(StringIO()):
            return monitor.check_file(path, self.state, self.log)

    def test_primeira_execucao_cria_referencia_sem_log(self):
        target = self.dir / "plano.csv"
        target.write_text("a,b\n1,2\n", encoding="utf-8")
        self.assertEqual(self.check(target), "baseline")
        self.assertFalse(self.log.exists())

    def test_sem_alteracao(self):
        target = self.dir / "plano.csv"
        target.write_text("a,b\n1,2\n", encoding="utf-8")
        self.check(target)
        self.assertEqual(self.check(target), "unchanged")
        self.assertFalse(self.log.exists())

    def test_alteracao_gera_evento_sem_conteudo_nem_caminho(self):
        target = self.dir / "plano.csv"
        target.write_text("a,b\n1,2\n", encoding="utf-8")
        self.check(target)
        target.write_text("a,b\n1,SEGREDO\n", encoding="utf-8")
        self.assertEqual(self.check(target), "changed")

        raw = self.log.read_text(encoding="utf-8")
        event = json.loads(raw.splitlines()[0])
        self.assertEqual(event["file"], "plano.csv")
        self.assertEqual(event["event"], "content_changed")
        self.assertEqual(len(event["old_sha256"]), 12)
        self.assertEqual(len(event["new_sha256"]), 12)
        self.assertNotIn("SEGREDO", raw)
        self.assertNotIn(str(self.dir), raw)

    def test_arquivos_homonimos_em_pastas_diferentes_nao_colidem(self):
        first = self.dir / "a" / "plano.csv"
        second = self.dir / "b" / "plano.csv"
        for path, text in ((first, "um\n"), (second, "dois\n")):
            path.parent.mkdir()
            path.write_text(text, encoding="utf-8")
        self.assertEqual(self.check(first), "baseline")
        self.assertEqual(self.check(second), "baseline")
        self.assertEqual(self.check(first), "unchanged")
        self.assertEqual(self.check(second), "unchanged")

    def test_arquivo_inexistente_encerra_com_mensagem(self):
        with self.assertRaises(SystemExit) as caught:
            self.check(self.dir / "nao-existe.csv")
        self.assertIn("não encontrado", str(caught.exception))

    def test_estado_corrompido_encerra_com_mensagem(self):
        target = self.dir / "plano.csv"
        target.write_text("x\n", encoding="utf-8")
        self.state.write_text("{isto não é json", encoding="utf-8")
        with self.assertRaises(SystemExit) as caught:
            self.check(target)
        self.assertIn("Não foi possível ler o estado", str(caught.exception))

    def test_fingerprint_conhecido(self):
        target = self.dir / "vazio.txt"
        target.write_bytes(b"")
        self.assertEqual(
            monitor.fingerprint(target),
            "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        )


if __name__ == "__main__":
    unittest.main()
