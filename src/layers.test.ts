/**
 * @jest-environment node
 *
 * Checks the rules in docs/architecture/app.md: who may import whom, kebab-case file names
 * and one component per file.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';

const SRC = __dirname;
const LAYERS = ['app', 'domain', 'ui', 'global'] as const;
type Layer = (typeof LAYERS)[number];

const ALLOWED: Record<Layer, Layer[]> = {
  app: ['domain', 'ui', 'global'],
  domain: ['domain', 'ui', 'global'],
  ui: ['ui'],
  global: ['global'],
};
const UI_PACKAGES = /^(react|react-native|expo-[\w-]+)(\/|$)/;
const KEBAB_FILE = /^[a-z0-9]+(-[a-z0-9]+)*(\.test|\.d)?\.tsx?$/;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? sourceFiles(join(dir, e.name)) : /\.tsx?$/.test(e.name) ? [join(dir, e.name)] : [],
  );
}

function layerOf(file: string): Layer | undefined {
  const top = relative(SRC, file).split(sep)[0];
  return LAYERS.find((l) => l === top);
}

function importsOf(code: string): string[] {
  return [...code.matchAll(/(?:from\s+|import\s*\(\s*|require\s*\(\s*|jest\.mock\(\s*)['"]([^'"]+)['"]/g)].map(
    (m) => m[1],
  );
}

const files = sourceFiles(SRC)
  .map((file) => ({ file, name: relative(SRC, file), layer: layerOf(file) }))
  .filter((f): f is { file: string; name: string; layer: Layer } => f.layer !== undefined);

test('finds the source files', () => {
  expect(files.length).toBeGreaterThan(0);
});

describe.each(files)('$name', ({ file, layer }) => {
  const code = readFileSync(file, 'utf8');

  test('imports only what its layer allows', () => {
    const broken = importsOf(code).filter((spec) => {
      if (spec.startsWith('@/')) return !ALLOWED[layer].includes(spec.split('/')[1] as Layer);
      if (spec.startsWith('.')) {
        const target = resolve(dirname(file), spec);
        // Files outside src/ (assets/, data/) are not a layer.
        return !relative(SRC, target).startsWith('..') && layerOf(target) !== layer;
      }
      return layer === 'ui' && !UI_PACKAGES.test(spec);
    });
    expect(broken).toEqual([]);
  });

  if (layer !== 'app') {
    test('has a kebab-case name and at most one component', () => {
      expect(file.split(sep).pop()).toMatch(KEBAB_FILE);
      // shortcut: counts top-level `function Foo` / `const Foo = (` declarations only; upgrade to a TS AST
      // check if components start being declared another way (memo, forwardRef).
      const components = code.match(/^(export\s+)?(default\s+)?(function\s+[A-Z]\w*\s*\(|const\s+[A-Z]\w*\s*=\s*\()/gm);
      expect(file.endsWith('.test.tsx') || (components?.length ?? 0) <= 1).toBe(true);
    });
  }
});
