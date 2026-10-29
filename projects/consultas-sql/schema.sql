CREATE TABLE fato_producao (
  ordem_id TEXT PRIMARY KEY,
  produto TEXT NOT NULL,
  setor TEXT NOT NULL,
  linha TEXT NOT NULL,
  data_abertura DATE NOT NULL,
  data_prevista DATE NOT NULL,
  data_real DATE,
  quantidade_planejada INTEGER NOT NULL CHECK (quantidade_planejada >= 0),
  quantidade_produzida INTEGER NOT NULL CHECK (quantidade_produzida >= 0),
  horas_planejadas NUMERIC(8,2) NOT NULL CHECK (horas_planejadas >= 0),
  horas_realizadas NUMERIC(8,2) NOT NULL CHECK (horas_realizadas >= 0),
  status TEXT NOT NULL CHECK (status IN ('Planejada', 'Em produção', 'Concluída'))
);
