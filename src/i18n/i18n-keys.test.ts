/// <reference types="node" />
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const en = JSON.parse(readFileSync(join(here, 'en.json'), 'utf8')) as Record<string, unknown>;
const zh = JSON.parse(readFileSync(join(here, 'zh.json'), 'utf8')) as Record<string, unknown>;

function collectKeys(obj: unknown, prefix = ''): string[] {
  if (obj === null || typeof obj !== 'object') return [];
  const out: string[] = [];
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === 'object') out.push(...collectKeys(v, path));
    else out.push(path);
  }
  return out.sort();
}

describe('i18n key symmetry (en <-> zh)', () => {
  const enKeys = new Set(collectKeys(en));
  const zhKeys = new Set(collectKeys(zh));

  it('zh has every key en has', () => {
    const missing = [...enKeys].filter((k) => !zhKeys.has(k));
    expect(missing).toEqual([]);
  });

  it('en has every key zh has', () => {
    const missing = [...zhKeys].filter((k) => !enKeys.has(k));
    expect(missing).toEqual([]);
  });
});
