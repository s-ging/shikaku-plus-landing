<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import Board from '$lib/Board.svelte';
	import SolvedOverlay from '$lib/SolvedOverlay.svelte';
	import About from '$lib/About.svelte';
	import Changelog from '$lib/Changelog.svelte';
	import Roadmap from '$lib/Roadmap.svelte';
	import Support from '$lib/Support.svelte';
	import SupportRewards from '$lib/SupportRewards.svelte';
	import SupportCountdown from '$lib/SupportCountdown.svelte';
	import AboutHokan from '$lib/AboutHokan.svelte';
	import { dailyGrid, dailySeed, dailyDateLabel } from '$lib/daily.js';
	import { loadProgress, saveProgress, rectsFromProgress, pruneOld } from '$lib/storage.js';
	import { fetchGlobalBoardsSolved } from '$lib/boardsSolved.js';

	const PLAY_URL = 'https://shikaku.plus'; // → full Flutter web app

	/**
	 * Round a raw solved-count DOWN to a clean bucket so the displayed figure is
	 * always a safe under-statement (we never overpromise): nearest 100 at/above
	 * 1,000, nearest 50 below. e.g. 1,247 → 1,200, 83 → 50. Anything that floors
	 * to 0 (and any non-finite input) returns null so the stat renders nothing
	 * rather than a hollow "0+". Pure display logic — kept here on the landing
	 * page, deliberately out of the data layer.
	 * @param {number | null} n
	 * @returns {number | null}
	 */
	function bucketBoardsSolved(n) {
		if (n == null || !Number.isFinite(n)) return null;
		const step = n >= 1000 ? 100 : 50;
		const floored = Math.floor(n / step) * step;
		return floored >= step ? floored : null;
	}

	/** Bucketed global tally for the hero stat, or null until/unless available. */
	/** @type {number | null} */
	let boardsSolved = $state(null);

	/** @type {number[][] | null} */
	let nums = $state(null);
	let seed = $state(0);
	let dateLabel = $state('');
	/** @type {import('$lib/puzzle.js').Rect[]} */
	let initialRects = $state([]);
	let initialSolved = $state(false);
	let solved = $state(false); // puzzle is in a solved state (restored or solved this session)
	let showSolved = $state(false);
	let moves = $state(0);
	/** @type {string | null} */
	let timeLabel = $state(null);

	let tipOpen = $state(false);
	let navVisible = $state(false);
	let startTs = 0;
	/** @type {HTMLElement} */
	let heroSection;

	onMount(() => {
		pruneOld();
		seed = dailySeed();
		dateLabel = dailyDateLabel();
		const p = loadProgress();
		if (p) {
			initialRects = rectsFromProgress(p);
			initialSolved = !!p.solved;
			solved = initialSolved;
			moves = initialRects.length;
			// Already-solved state is restored on the board itself; don't re-pop the
			// modal on load — only show it when the player solves during this session.
		}
		startTs = Date.now();
		nums = dailyGrid(); // generate last so Board mounts with everything ready

		// Fire-and-forget: never block first paint on the global tally. On
		// null/error it stays null and the hero stat simply doesn't render.
		fetchGlobalBoardsSolved().then((n) => {
			boardsSolved = bucketBoardsSolved(n);
		});

		function checkNav() {
			navVisible = heroSection
				? heroSection.getBoundingClientRect().bottom <= 0
				: false;
		}
		window.addEventListener('scroll', checkNav, { passive: true });
		checkNav();
		return () => window.removeEventListener('scroll', checkNav);
	});

	/** @param {import('$lib/puzzle.js').Rect[]} rects @param {boolean} solved */
	function handleChange(rects, solved) {
		moves = rects.length;
		saveProgress(rects, solved);
	}
	function handleSolve() {
		const secs = Math.max(0, Math.round((Date.now() - startTs) / 1000));
		const m = Math.floor(secs / 60),
			s = secs % 60;
		timeLabel = `${m}:${String(s).padStart(2, '0')}`;
		solved = true;
		showSolved = true;
	}
	// Clicking an already-solved board re-opens the solved modal.
	function reopenSolved() {
		if (solved && !showSolved) showSolved = true;
	}
</script>

<svelte:head>
	<title>Shikaku+ — Complete squares with friends</title>
	<meta
		name="description"
		content="Shikaku+ is a cooperative and competitive puzzle platform built on the Nikoli puzzle, Shikaku. Play Shikaku+ today."
	/>
	<meta property="og:title" content="Shikaku+ — Complete squares with friends" />
	<meta
		property="og:description"
		content="Shikaku+ is a cooperative and competitive puzzle platform built on the Nikoli puzzle, Shikaku. Play Shikaku+ today."
	/>
	<meta name="twitter:title" content="Shikaku+ — Complete squares with friends" />
	<meta
		name="twitter:description"
		content="Shikaku+ is a cooperative and competitive puzzle platform built on the Nikoli puzzle, Shikaku. Play Shikaku+ today."
	/>
</svelte:head>

<header class="topbar" class:visible={navVisible}>
	<a class="wordmark" href="/">Shikaku+</a>
	<a class="open-app" href={PLAY_URL}>Open app</a>
</header>

<main>
	<!-- Hero -->
	<section class="hero" bind:this={heroSection}>
		<div class="hero-text">
			<h1 class="brand">Shikaku+</h1>
			<p class="tagline">Complete squares with friends.</p>
			<a class="play" href={PLAY_URL}>Play now</a>

			{#if boardsSolved}
				<p class="solved-stat">
					<span class="solved-num">{boardsSolved.toLocaleString()}+</span>
					<span class="solved-label">puzzles solved by players worldwide</span>
				</p>
			{/if}
		</div>

		<div class="board-col">
			<div class="daily-label">
				<div class="daily-label-text">
					<span class="daily-name">Daily Shikaku</span>
					{#if seed}<span class="daily-meta">Puzzle #{seed} · {dateLabel}</span>{/if}
				</div>
				<div class="info-wrap">
					<button
						class="info-btn"
						aria-label="How to play"
						aria-expanded={tipOpen}
						onclick={() => (tipOpen = !tipOpen)}
						onmouseenter={() => (tipOpen = true)}
						onmouseleave={() => (tipOpen = false)}
					>
						<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor" aria-hidden="true"><path d="M513.5-254.5Q528-269 528-290t-14.5-35.5Q499-340 478-340t-35.5 14.5Q428-311 428-290t14.5 35.5Q457-240 478-240t35.5-14.5ZM442-394h74q0-33 7.5-52t42.5-52q26-26 41-49.5t15-56.5q0-56-41-86t-97-30q-57 0-92.5 30T342-618l66 26q5-18 22.5-39t53.5-21q32 0 48 17.5t16 38.5q0 20-12 37.5T506-526q-44 39-54 59t-10 73Zm38 314q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
					</button>
					{#if tipOpen}
						<div class="info-tip" role="tooltip">
							Drag to box each number into a rectangle whose area equals it. Fill the grid. Tap a block to remove it.
						</div>
					{/if}
				</div>
			</div>
			<div class="board-stage">
				{#if browser && nums}
					<!-- When solved, a tap on the board re-opens the celebratory modal. -->
					<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
					<div
						class="board-wrap"
						class:solved
						onclick={reopenSolved}
						onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && reopenSolved()}
						role={solved && !showSolved ? 'button' : undefined}
						tabindex={solved && !showSolved ? 0 : undefined}
						aria-label={solved && !showSolved ? 'Show solved summary' : undefined}
					>
						<Board
							{nums}
							{initialRects}
							{initialSolved}
							onchange={handleChange}
							onsolve={handleSolve}
						/>
					</div>
				{:else}
					<div class="board-skeleton" aria-hidden="true"></div>
				{/if}
				<SolvedOverlay
					open={showSolved}
					{timeLabel}
					moveCount={moves}
					onOpenApp={() => (window.location.href = PLAY_URL)}
					onClose={() => (showSolved = false)}
				/>
			</div>
			<p class="board-note">New puzzle every day, at 6:00 AM Philippine Time.</p>
		</div>
	</section>

	<Changelog />

	<!-- About + Roadmap -->
	<section class="two-col">
		<div class="left-col">
			<About />
			<AboutHokan />
			<Support />
		</div>
		<div class="right-col">
			<Roadmap />
			<SupportRewards />
		</div>
		<SupportCountdown />
	</section>

	<footer class="footer">
		<nav class="legal-links">
			<a href="/blog">Blog</a>
			<span class="sep">·</span>
			<a href="/privacy-policy">Privacy Policy</a>
			<span class="sep">·</span>
			<a href="/terms-of-service">Terms of Service</a>
			<span class="sep">·</span>
			<a href="/data-deletion">Data Deletion</a>
		</nav>
	</footer>
</main>

<style>
	.topbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 18px clamp(20px, 5vw, 56px);
		background: var(--appbar-bg);
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 100;
		opacity: 0;
		pointer-events: none;
		transform: translateY(-6px);
		transition: opacity 200ms ease, transform 200ms ease;
	}
	.topbar.visible {
		opacity: 1;
		pointer-events: auto;
		transform: translateY(0);
	}
	.wordmark {
		font-family: var(--font-brand);
		font-size: 22px;
		font-weight: 700;
		letter-spacing: -0.5px;
		color: var(--appbar-fg);
		text-decoration: none;
	}
	.open-app {
		font-size: 14px;
		color: var(--text-secondary);
		text-decoration: none;
		letter-spacing: -0.2px;
	}
	.open-app:hover {
		color: var(--text-primary);
	}

	main {
		max-width: 1120px;
		margin: 0 auto;
		padding: 0 clamp(20px, 5vw, 56px) 80px;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	/* —— Hero —— */
	.hero {
		display: grid;
		grid-template-columns: 1fr minmax(320px, 560px);
		align-items: center;
		gap: clamp(32px, 6vw, 80px);
		min-height: min(82vh, 760px);
		padding: clamp(24px, 6vh, 64px) 0;
	}
	.brand {
		font-family: var(--font-brand);
		font-size: clamp(32px, 8vw, 56px);
		font-weight: 700;
		letter-spacing: -0.2px;
		line-height: 1.02;
		margin: 0;
		color: var(--text-primary);
	}
	.tagline {
		font-size: 18px;
		color: var(--text-secondary);
		letter-spacing: -0.2px;
		margin: 14px 0 28px;
	}
	.play {
		display: inline-block;
		background: var(--button-fill);
		color: var(--chip-sel-label);
		border: none;
		border-radius: var(--radius);
		padding: 14px 30px;
		font-family: var(--font-ui);
		font-size: 16px;
		letter-spacing: -0.3px;
		text-decoration: none;
		cursor: pointer;
		transition: filter 120ms ease, transform 80ms ease;
	}
	.play:hover {
		filter: brightness(1.06);
	}
	.play:active {
		transform: translateY(1px);
	}

	.solved-stat {
		display: flex;
		flex-direction: column;
		gap: 2px;
		margin: 36px 0 0;
	}
	.solved-num {
		font-family: var(--font-brand);
		font-size: clamp(34px, 6vw, 48px);
		font-weight: 700;
		line-height: 1;
		letter-spacing: -0.5px;
		color: var(--button-fill);
	}
	.solved-label {
		font-size: 14px;
		letter-spacing: -0.2px;
		color: var(--text-secondary);
	}

	.board-col {
		width: 100%;
	}
	.daily-label {
		display: flex;
		flex-direction: row;
		align-items: flex-start;
		justify-content: space-between;
		margin: 0 auto 14px;
		max-width: var(--max-board);
	}
	.daily-label-text {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.daily-name {
		font-family: var(--font-brand);
		font-size: 18px;
		font-weight: 600;
		letter-spacing: -0.3px;
		color: var(--text-primary);
	}
	.daily-meta {
		font-size: 13px;
		color: var(--text-secondary);
		letter-spacing: -0.2px;
	}
	.info-wrap {
		position: relative;
		flex-shrink: 0;
	}
	.info-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 4px;
		background: none;
		border: none;
		border-radius: var(--radius);
		color: var(--text-secondary);
		cursor: pointer;
		transition: color 120ms ease;
	}
	.info-btn:hover {
		color: var(--text-primary);
	}
	.info-btn:focus-visible {
		outline: 2px solid var(--button-fill);
		outline-offset: 2px;
	}
	.info-tip {
		position: absolute;
		right: 0;
		top: calc(100% + 8px);
		width: 240px;
		background: color-mix(in srgb, var(--text-primary) 6%, var(--bg));
		border: 1px solid color-mix(in srgb, var(--text-primary) 12%, transparent);
		border-radius: var(--radius);
		padding: 12px 14px;
		font-size: 13px;
		line-height: 1.6;
		letter-spacing: -0.1px;
		color: var(--text-secondary);
		z-index: 1100;
	}
	.board-stage {
		position: relative;
		width: 100%;
		max-width: var(--max-board);
		margin: 0 auto;
	}
	/* A solved board is tappable to re-open the summary modal. */
	.board-wrap.solved {
		cursor: pointer;
	}
	.board-skeleton {
		width: 100%;
		aspect-ratio: 1 / 1;
		max-width: var(--max-board);
		border-radius: var(--radius);
		background: color-mix(in srgb, var(--cell) 60%, transparent);
	}
	.board-note {
		max-width: var(--max-board);
		margin: 14px auto 0;
		text-align: center;
		font-size: 13px;
		color: var(--text-secondary);
		letter-spacing: -0.2px;
	}
	/* —— About + Roadmap —— */
	.two-col {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
		align-items: stretch;
	}
	.left-col {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.right-col {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	/* Right column fills the row height; its two cards share it equally. */
	.right-col > :global(*) {
		flex: 1;
	}
	.footer {
		padding-top: 64px;
		font-size: 13px;
		color: var(--text-secondary);
		letter-spacing: -0.2px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.legal-links {
		display: flex;
		gap: 10px;
		align-items: center;
	}
	.legal-links a {
		color: var(--text-secondary);
		text-decoration: none;
	}
	.legal-links a:hover {
		color: var(--text-primary);
	}
	.sep {
		opacity: 0.4;
	}

	/* —— Responsive —— */
	@media (max-width: 880px) {
		.hero {
			display: flex;
			flex-direction: column;
			align-items: center;
			text-align: center;
			min-height: 0;
			gap: 36px;
		}
		.hero-text {
			order: 1;
			width: 100%;
		}
		.board-col {
			order: 2;
			width: 100%;
			max-width: var(--max-board);
		}
		.daily-label {
			justify-content: center;
		}
		/* Single stacked column: flatten both cols so their cards can be
		   reordered freely, then put Roadmap above the Support Us card. */
		.two-col {
			display: flex;
			flex-direction: column;
		}
		.left-col,
		.right-col {
			display: contents;
		}
		.two-col :global(.about)        { order: 1; }
		.two-col :global(.about-hokan)  { order: 2; }
		.two-col :global(.roadmap)      { order: 3; }
		.two-col :global(.support-grid) { order: 4; }
		.two-col :global(.rewards-card) { order: 5; }
		.two-col :global(.deadline-card) { order: 6; }
	}
</style>
