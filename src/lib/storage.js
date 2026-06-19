// storage.js — Wordle-style per-day localStorage persistence (spec §11).
import { Rect } from './puzzle.js';
import { dailyKey, dailySeed } from './daily.js';

/** @param {import('./puzzle.js').Rect[]} rects @param {boolean} solved */
export function saveProgress(rects, solved) {
	const payload = {
		seed: dailySeed(),
		rects: rects.map((r) => [r.x1, r.y1, r.x2, r.y2]),
		solved,
		ts: Date.now()
	};
	try {
		localStorage.setItem(dailyKey(), JSON.stringify(payload));
	} catch {
		/* storage unavailable (private mode / quota) — fail silently */
	}
}

export function loadProgress() {
	try {
		const raw = localStorage.getItem(dailyKey());
		if (!raw) return null;
		const p = JSON.parse(raw);
		if (p.seed !== dailySeed()) return null; // stale → ignore (new day)
		return p;
	} catch {
		return null;
	}
}

// Rebuild Rect objects from a saved payload. Only valid rects are ever saved,
// so every restored rect is marked valid.
/** @param {{ rects?: number[][] } | null} p */
export function rectsFromProgress(p) {
	if (!p || !Array.isArray(p.rects)) return [];
	return p.rects.map((/** @type {number[]} */ [x1, y1, x2, y2]) => {
		const r = new Rect(x1, y1, x2, y2);
		r.valid = true;
		return r;
	});
}

// Prune any keys from previous days.
export function pruneOld() {
	try {
		const keep = dailyKey();
		for (let i = localStorage.length - 1; i >= 0; i--) {
			const k = localStorage.key(i);
			if (k && k.startsWith('shikaku-daily-') && k !== keep) localStorage.removeItem(k);
		}
	} catch {
		/* ignore */
	}
}
