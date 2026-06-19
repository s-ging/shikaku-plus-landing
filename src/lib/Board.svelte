<script>
	// Board.svelte — canvas renderer (spec §8) + pointer interaction (spec §9).
	import { onMount, untrack } from 'svelte';
	import { commit, rectColor, cellUnderBlock } from '$lib/game.js';

	let {
		nums,
		initialRects = [],
		initialSolved = false,
		interactive = true,
		onchange,
		onsolve
	} = $props();

	const N = untrack(() => nums.length); // 6 for the daily
	const GAP = 5; // kCellGap (fixed logical px)
	const MAX_BOARD = 550; // kMaxBoardSize

	/** @typedef {import('$lib/puzzle.js').Rect} Rect */
	/** @typedef {{ x1: number, y1: number, x2: number, y2: number }} RectLike */

	// —— Game state (drawn imperatively; not reactive on purpose) ——
	/** @type {Rect[]} */
	let rects = untrack(() => initialRects.map((/** @type {Rect} */ r) => r));
	let solved = untrack(() => initialSolved);

	// —— Canvas / geometry ——
	/** @type {HTMLDivElement} */
	let wrapEl;
	/** @type {HTMLCanvasElement} */
	let canvasEl;
	/** @type {CanvasRenderingContext2D | null} */
	let ctx = null;
	let S = 0; // CSS-px board side
	let cell = 0; // CSS-px per cell
	let dpr = 1;

	// —— Drag state ——
	let dragging = false;
	let ox = 0,
		oy = 0,
		cx = 0,
		cy = 0;

	// —— Animation clocks (ms; -1 = inactive) ——
	let revealStart = -1;
	let flashStart = -1;
	/** @type {Rect | null} */
	let flashRect = null;
	let shakeStart = -1;
	/** @type {RectLike | null} */
	let ghostRect = null; // transient red deny ghost
	let rafId = 0;
	let lastNow = 0;

	const REVEAL_MS = 750;
	const FLASH_MS = 140;
	const SHAKE_MS = 280;
	const FADE_W = 0.45;

	/** @param {number} v @param {number} lo @param {number} hi */
	const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
	/** @param {Record<string, string>} cache @param {string} name */
	const css = (cache, name) => cache[name] ?? (cache[name] = read(name));
	/** @param {string} name */
	function read(name) {
		return getComputedStyle(canvasEl).getPropertyValue(name).trim();
	}

	/**
	 * @param {CanvasRenderingContext2D} c
	 * @param {number} x @param {number} y @param {number} w @param {number} h @param {number} r
	 */
	function roundRect(c, x, y, w, h, r) {
		const rr = Math.min(r, w / 2, h / 2);
		c.beginPath();
		c.moveTo(x + rr, y);
		c.arcTo(x + w, y, x + w, y + h, rr);
		c.arcTo(x + w, y + h, x, y + h, rr);
		c.arcTo(x, y + h, x, y, rr);
		c.arcTo(x, y, x + w, y, rr);
		c.closePath();
	}

	// Pixel rect for grid cell (x,y), inset by GAP/2 on every side (spec §8.1).
	/** @param {number} x @param {number} y */
	function cellRect(x, y) {
		const g = GAP / 2;
		return {
			left: x * cell + g,
			top: y * cell + g,
			w: cell - GAP,
			h: cell - GAP
		};
	}
	// Pixel rect spanning a Rect (grid coords x1..x2, y1..y2).
	/** @param {RectLike} r */
	function spanRect(r) {
		const g = GAP / 2;
		return {
			left: r.x1 * cell + g,
			top: r.y1 * cell + g,
			w: (r.x2 - r.x1 + 1) * cell - GAP,
			h: (r.y2 - r.y1 + 1) * cell - GAP
		};
	}

	function setupCanvas() {
		if (!wrapEl || !canvasEl) return;
		dpr = Math.max(1, window.devicePixelRatio || 1);
		const avail = wrapEl.clientWidth;
		// Floor to an integer so the canvas can never be a sub-pixel wider than
		// its container (which would force a horizontal scrollbar / left-lean).
		S = Math.floor(clamp(Math.min(avail, MAX_BOARD), 0, MAX_BOARD));
		cell = S / N;
		canvasEl.style.width = `${S}px`;
		canvasEl.style.height = `${S}px`;
		canvasEl.width = Math.round(S * dpr);
		canvasEl.height = Math.round(S * dpr);
		ctx = canvasEl.getContext('2d');
		scheduleDraw();
	}

	/** @param {number} now */
	function animating(now) {
		return (
			dragging ||
			(revealStart >= 0 && now - revealStart < REVEAL_MS) ||
			(flashStart >= 0 && now - flashStart < FLASH_MS) ||
			(shakeStart >= 0 && now - shakeStart < SHAKE_MS)
		);
	}

	function scheduleDraw() {
		if (rafId) return;
		rafId = requestAnimationFrame(frame);
	}
	/** @param {number} now */
	function frame(now) {
		rafId = 0;
		lastNow = now;
		draw(now);
		if (animating(now)) scheduleDraw();
	}

	/** @param {number} now */
	function draw(now) {
		if (!ctx) return;
		const c = ctx;
		/** @type {Record<string, string>} */
		const k = {}; // per-frame CSS var cache

		c.setTransform(dpr, 0, 0, dpr, 0, 0);
		c.clearRect(0, 0, S, S);

		// Deny shake: translate the whole board horizontally.
		let shakeDX = 0;
		if (shakeStart >= 0) {
			const t = (now - shakeStart) / SHAKE_MS;
			if (t < 1) shakeDX = Math.sin(t * Math.PI * 5) * 2;
			else shakeStart = -1;
		}
		c.save();
		c.translate(shakeDX, 0);

		// Reveal progress (center-out Chebyshev fade).
		let revealT = 1;
		if (revealStart >= 0) {
			revealT = (now - revealStart) / REVEAL_MS;
			if (revealT >= 1) {
				revealT = 1;
				revealStart = -1;
			}
		}
		const center = (N - 1) / 2;
		/** @param {number} x @param {number} y */
		const cellAlpha = (x, y) => {
			if (revealT >= 1) return 1;
			const dn = Math.max(Math.abs(x - center), Math.abs(y - center)) / (center + 0.0001);
			const front = revealT * (1 + FADE_W);
			return clamp((front - dn) / FADE_W, 0, 1);
		};

		// 1) Cells.
		const cellFill = css(k, '--cell');
		const rCell = cell * 0.12;
		for (let y = 0; y < N; y++) {
			for (let x = 0; x < N; x++) {
				const a = cellAlpha(x, y);
				if (a <= 0) continue;
				const { left, top, w, h } = cellRect(x, y);
				c.globalAlpha = a;
				c.fillStyle = cellFill;
				roundRect(c, left, top, w, h, rCell);
				c.fill();
			}
		}
		c.globalAlpha = 1;

		// 2) Placed rectangles (only valid ones persist in Zen).
		for (const r of rects) {
			const { left, top, w, h } = spanRect(r);
			if (r.valid === true) {
				c.fillStyle = rectColor(r);
				roundRect(c, left, top, w, h, rCell);
				c.fill();
			} else {
				c.fillStyle = css(k, '--invalid-fill');
				roundRect(c, left, top, w, h, rCell);
				c.fill();
				c.lineWidth = 2;
				c.strokeStyle = css(k, '--invalid-stroke');
				c.stroke();
			}
		}

		// 2b) Commit flash on the just-placed block.
		if (flashStart >= 0 && flashRect) {
			const t = (now - flashStart) / FLASH_MS;
			if (t < 1) {
				const { left, top, w, h } = spanRect(flashRect);
				c.globalAlpha = (1 - t) * 0.62;
				c.fillStyle = '#ffffff';
				roundRect(c, left, top, w, h, rCell);
				c.fill();
				c.globalAlpha = 1;
			} else {
				flashStart = -1;
				flashRect = null;
			}
		}

		// 2c) Deny ghost (red, fading).
		if (ghostRect && shakeStart >= 0) {
			const t = (now - shakeStart) / SHAKE_MS;
			const { left, top, w, h } = spanRect(ghostRect);
			c.globalAlpha = (1 - t) * 0.9;
			c.fillStyle = css(k, '--invalid-fill');
			roundRect(c, left, top, w, h, rCell);
			c.fill();
			c.lineWidth = 2;
			c.strokeStyle = css(k, '--invalid-stroke');
			c.stroke();
			c.globalAlpha = 1;
		} else if (shakeStart < 0) {
			ghostRect = null;
		}

		// 3) Drag preview.
		if (dragging) {
			const x1 = Math.min(ox, cx),
				y1 = Math.min(oy, cy);
			const x2 = Math.max(ox, cx),
				y2 = Math.max(oy, cy);
			const g = GAP / 2;
			const left = Math.round(x1 * cell + g);
			const top = Math.round(y1 * cell + g);
			const w = Math.round((x2 - x1 + 1) * cell - GAP);
			const h = Math.round((y2 - y1 + 1) * cell - GAP);
			c.fillStyle = css(k, '--drag-fill');
			roundRect(c, left, top, w, h, 4);
			c.fill();
			c.lineWidth = 2;
			c.strokeStyle = css(k, '--drag-stroke');
			c.stroke();

			// 4) Drag label pill: "{w}×{h}  {area}".
			const pw = x2 - x1 + 1,
				ph = y2 - y1 + 1;
			const label = `${pw}×${ph}  ${pw * ph}`;
			const fs = clamp(cell * 0.3, 9, 15);
			c.font = `600 ${fs}px ${css(k, '--font-ui') || 'sans-serif'}`;
			const tw = c.measureText(label).width;
			const padX = 5,
				padY = 2.5;
			const pillW = tw + padX * 2;
			const pillH = fs + padY * 2;
			let pillX = left + (w - pillW) / 2;
			pillX = clamp(pillX, 0, S - pillW);
			let pillY = top - pillH - 4;
			if (pillY < 0) pillY = top + h + 4;
			c.globalAlpha = 0.65;
			c.fillStyle = css(k, '--pill-fill');
			roundRect(c, pillX, pillY, pillW, pillH, 4);
			c.fill();
			c.globalAlpha = 1;
			c.fillStyle = css(k, '--pill-text');
			c.textAlign = 'center';
			c.textBaseline = 'middle';
			c.fillText(label, pillX + pillW / 2, pillY + pillH / 2 + 0.5);
		}

		// 5) Clue numbers (on top).
		c.textAlign = 'center';
		c.textBaseline = 'middle';
		const numFs = cell * 0.45;
		try {
			c.letterSpacing = '-0.2px';
		} catch {
			/* not supported — ignore */
		}
		c.font = `${numFs}px ${css(k, '--font-ui') || 'sans-serif'}`;
		const colNum = css(k, '--num');
		const colOnBlock = css(k, '--num-on-block');
		for (let y = 0; y < N; y++) {
			for (let x = 0; x < N; x++) {
				const n = nums[y][x];
				if (!n) continue;
				const a = cellAlpha(x, y);
				if (a <= 0) continue;
				c.globalAlpha = a;
				c.fillStyle = cellUnderBlock(x, y, rects) ? colOnBlock : colNum;
				c.fillText(String(n), x * cell + cell / 2, y * cell + cell / 2 + numFs * 0.05);
			}
		}
		c.globalAlpha = 1;
		try {
			c.letterSpacing = '0px';
		} catch {
			/* ignore */
		}

		c.restore();
	}

	// —— Pointer → cell ——
	/** @param {PointerEvent} e */
	function cellFromEvent(e) {
		const rect = canvasEl.getBoundingClientRect();
		const px = e.clientX - rect.left;
		const py = e.clientY - rect.top;
		return {
			x: clamp(Math.floor(px / cell), 0, N - 1),
			y: clamp(Math.floor(py / cell), 0, N - 1)
		};
	}

	/** @param {PointerEvent} e */
	function onPointerDown(e) {
		if (!interactive || solved) return;
		e.preventDefault();
		canvasEl.setPointerCapture(e.pointerId);
		const p = cellFromEvent(e);
		ox = cx = p.x;
		oy = cy = p.y;
		dragging = true;
		scheduleDraw();
	}
	/** @param {PointerEvent} e */
	function onPointerMove(e) {
		if (!dragging) return;
		const p = cellFromEvent(e);
		if (p.x !== cx || p.y !== cy) {
			cx = p.x;
			cy = p.y;
			scheduleDraw();
		}
	}
	/** @param {PointerEvent} e */
	function onPointerUp(e) {
		if (!dragging) return;
		dragging = false;
		try {
			canvasEl.releasePointerCapture(e.pointerId);
		} catch {
			/* ignore */
		}
		const res = commit(ox, oy, cx, cy, { nums, rects, N });
		const now = lastNow || performance.now();
		if (res.denied) {
			ghostRect = { x1: Math.min(ox, cx), y1: Math.min(oy, cy), x2: Math.max(ox, cx), y2: Math.max(oy, cy) };
			shakeStart = now;
		} else if (res.changed) {
			if (res.placed) {
				flashRect = res.placed;
				flashStart = now;
			}
			onchange?.(rects, !!res.solved);
			if (res.solved && !solved) {
				solved = true;
				onsolve?.();
			}
		}
		scheduleDraw();
	}

	/**
	 * Public-ish: reset interaction lock after parent clears the board, etc.
	 * @param {boolean} v
	 */
	export function setSolved(v) {
		solved = v;
		scheduleDraw();
	}

	onMount(() => {
		setupCanvas();
		// Kick off the reveal only on a fresh board (nothing restored).
		revealStart = rects.length ? -1 : performance.now();
		scheduleDraw();
		const ro = new ResizeObserver(() => setupCanvas());
		ro.observe(wrapEl);
		const mq = window.matchMedia('(prefers-color-scheme: light)');
		const onTheme = () => scheduleDraw();
		mq.addEventListener?.('change', onTheme);
		return () => {
			ro.disconnect();
			mq.removeEventListener?.('change', onTheme);
			if (rafId) cancelAnimationFrame(rafId);
		};
	});
</script>

<div class="board-wrap" bind:this={wrapEl}>
	<canvas
		bind:this={canvasEl}
		class="board"
		aria-label="Daily Shikaku puzzle, {N} by {N} grid. Drag across cells to box each number into a rectangle whose area equals it."
		onpointerdown={onPointerDown}
		onpointermove={onPointerMove}
		onpointerup={onPointerUp}
		onpointercancel={onPointerUp}
	></canvas>
</div>

<style>
	.board-wrap {
		width: 100%;
		max-width: var(--max-board);
		aspect-ratio: 1 / 1;
		margin: 0 auto;
	}
	.board {
		display: block;
		margin: 0 auto; /* center the fixed-size canvas inside the wrapper */
		max-width: 100%; /* never overflow → no stray horizontal scroll */
		touch-action: none; /* let us own drag gestures */
		cursor: crosshair;
		user-select: none;
		-webkit-user-select: none;
	}
</style>
