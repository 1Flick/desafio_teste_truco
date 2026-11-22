#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { analisarResultado, lerIds } from './lib/relatorio-testes.mjs';

export { MODO } from './lib/relatorio-testes.mjs';

export function verificar(raiz, { completo = false } = {}) {
  const jest = join(raiz, 'node_modules', 'jest', 'bin', 'jest.js');
  if (!existsSync(jest)) {
    return { ok: false, semSetup: true, texto: 'Jest não instalado: rode `npm install` (o setup vem da tarefa G1).' };
  }
  const plano = join(raiz, 'PLANEJAMENTO.md');
  const ids = lerIds(existsSync(plano) ? readFileSync(plano, 'utf8') : '');
  const temporario = mkdtempSync(join(tmpdir(), 'verificar-'));
  try {
    const saida = join(temporario, 'r.json');
    // Executar o JavaScript pelo Node evita depender de wrappers .cmd no Windows.
    spawnSync(process.execPath, [jest, '--runInBand', '--json', `--outputFile=${saida}`], {
      cwd: raiz, encoding: 'utf8', timeout: 110_000,
    });
    if (!existsSync(saida)) {
      return { ok: false, texto: 'O Jest não gerou resultado (veja `npm test`).' };
    }
    return analisarResultado(JSON.parse(readFileSync(saida, 'utf8')), raiz, ids, { completo });
  } finally {
    rmSync(temporario, { recursive: true, force: true });
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const raiz = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const resultado = verificar(raiz, { completo: process.argv.includes('--completo') });
  console.log(resultado.texto);
  process.exitCode = resultado.ok ? 0 : 1;
}
