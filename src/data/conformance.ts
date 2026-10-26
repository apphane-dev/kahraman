// Reads the conformance bundle that `mise run conformance` unpacks into
// public/conformance/. Astro builds from the project root.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import bundle from './conformance.json';

type Cell =
  | { status: 'pass' }
  | { status: 'n/a' }
  | { status: 'known gap'; ticket: string; path: string; failsWith: string }
  | { status: 'differs'; pattern: string; path: string; failsWith: string };

interface Matrix {
  kits: { dir: string; name: string; pass: number; differs: number; knownGaps: number }[];
  scenarios: { id: string; baseline: boolean; cells: Cell[] }[];
  page: Cell[];
}

interface StorybookIndex {
  entries: Record<string, { id: string; name: string; subtype?: string }>;
}

const unpacked = join(process.cwd(), 'public/conformance');
const read = <T>(path: string): T => JSON.parse(readFileSync(join(unpacked, path), 'utf8'));

export const matrix = read<Matrix>('matrix.json');

/** Source file at the commit the bundle was released from. */
export const sourceUrl = (path: string) =>
  `https://github.com/apphane-dev/kahraman/blob/${bundle.tag}/${path}`;

// Each kit's `page` story test runs every scenario on one page.
const pageTestId = (dir: string) => {
  const entries = Object.values(read<StorybookIndex>(`kits/${dir}/index.json`).entries);
  const entry = entries.find((e) => e.subtype === 'test' && e.name === 'page');
  if (!entry || !/^[a-z0-9-]+:page$/.test(entry.id)) {
    throw new Error(`${dir}: the Storybook index has no page story test`);
  }
  return entry.id;
};

export const kits = matrix.kits.map((kit, index) => {
  const testId = pageTestId(kit.dir);
  return {
    ...kit,
    page: matrix.page[index],
    gaps: matrix.scenarios.flatMap(({ id, cells }) => {
      const cell = cells[index];
      return cell.status === 'known gap' ? [{ id, ticket: cell.ticket, path: cell.path }] : [];
    }),
    run: `/conformance/kits/${kit.dir}/iframe.html?id=${testId}&viewMode=story`,
    storybook: `/conformance/kits/${kit.dir}/?path=/story/${testId}`,
  };
});

export { bundle };
