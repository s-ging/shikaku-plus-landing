// Parity guard (spec §7 / §13). These vectors were emitted by BOTH the real
// Dart generator and this JS port — if any fails, the port has drifted and the
// landing-page daily puzzle no longer matches the in-app daily puzzle.
import { describe, it, expect } from 'vitest';
import { Rng, stableHash, generateGrid, DIFFICULTY } from './puzzle.js';

/** @param {number[][]} g */
const render = (g) => g.map((row) => row.map((n) => (n === 0 ? '.' : n)).join(' ')).join('\n');
/** @param {string} s */
const parse = (s) =>
	s
		.trim()
		.split('\n')
		.map((/** @type {string} */ line) =>
			line
				.trim()
				.split(/\s+/)
				.map((/** @type {string} */ t) => (t === '.' ? 0 : Number(t)))
		);

const GOLDEN = {
	20623: `
. . 2 . . 6
. . 2 . . .
8 . 2 . . .
. . 4 . . .
6 . . . . .
. . . . 6 .`,
	20624: `
. . . . . 5
. . . . . .
4 3 . . . .
. . . . . 12
. . 5 . . .
3 . . . 2 2`,
	20454: `
4 . . . . 4
. . . . . 4
2 . . . 6 .
. 4 . 4 . .
. . . 2 . .
. . . 4 . 2`
};

describe('RNG primitives', () => {
	it('stableHash("abc") === 193485963', () => {
		expect(stableHash('abc')).toBe(193485963);
	});
	it('Rng(20623).nextInt(100) ×6 === [33, 71, 31, 62, 29, 92]', () => {
		const rng = new Rng(20623);
		const six = Array.from({ length: 6 }, () => rng.nextInt(100));
		expect(six).toEqual([33, 71, 31, 62, 29, 92]);
	});
});

describe('6×6 Easy golden grids', () => {
	for (const [seed, expected] of Object.entries(GOLDEN)) {
		it(`grid seed ${seed} matches §7`, () => {
			const grid = generateGrid(6, DIFFICULTY.easy, Number(seed));
			expect(render(grid)).toBe(render(parse(expected)));
		});
		it(`clue sum seed ${seed} === 36 (perfect 6×6 tiling)`, () => {
			const grid = generateGrid(6, DIFFICULTY.easy, Number(seed));
			expect(grid.flat().reduce((a, b) => a + b, 0)).toBe(36);
		});
	}
});
