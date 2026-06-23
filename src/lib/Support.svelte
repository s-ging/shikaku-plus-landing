<script>
	import { onMount } from 'svelte';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { raised as raisedStore, FALLBACK_RAISED } from '$lib/donations.js';
	import tier1 from '$lib/assets/foundation-badges/f-tier-1.svg?raw';
	import tier2 from '$lib/assets/foundation-badges/f-tier-2.svg?raw';
	import tier3 from '$lib/assets/foundation-badges/f-tier-3.svg?raw';
	import tier4 from '$lib/assets/foundation-badges/f-tier-4.svg?raw';
	import checkIcon from '$lib/assets/icons/check.svg?raw';

	const tiers = [
		{ amount: 500, title: 'Full client-side customization', detail: 'A separate add-on to the game where you can customize the full Shikaku experience.' },
		{ amount: 300, title: 'Replay System',                  detail: `Advanced playback controls of your games, and your friend's games! See how they look at… squares! Or something.` },
		{ amount: 200, title: 'Friend System',                  detail: `For a game so geared towards friendship and love, we'd want to give you a robust backend to make sure you share your best clears.` },
		{ amount: 100, title: 'iOS App Store Launch',           detail: 'Unlocking the iOS App Store launch allows for even more of your friends to enjoy Shikaku+ anywhere.' },
		{ amount: 25,  title: 'Google Play Store launch',       detail: 'We all have to start somewhere, and Google Play kicks things off for our mobile takeover.' }
	];

	const badges = [
		{ svg: tier1, label: 'Donate any amount in the beta stage!', name: 'Foundation ★' },
		{ svg: tier2, label: 'Donate at least $5!',                  name: 'Foundation ★★' },
		{ svg: tier3, label: 'Donate at least $20!',                 name: 'Foundation ★★★' },
		{ svg: tier4, label: 'Donate at least $50!',                 name: 'Foundation ★★★★' }
	];

	let { onsupport } = $props();

	// —— Countdown ——
	// The Foundation fundraiser ends at the close of August 2026. (Month is
	// 0-indexed: 7 = August.) The timer ticks down days : hours : minutes : seconds.
	const DEADLINE = new Date(2026, 7, 31, 23, 59, 59);
	let now = $state(new Date());
	const remaining = $derived(Math.max(0, DEADLINE.getTime() - now.getTime()));
	const ended     = $derived(remaining <= 0);
	const countdown = $derived.by(() => {
		const total = Math.floor(remaining / 1000);
		return {
			days:    Math.floor(total / 86_400),
			hours:   Math.floor((total % 86_400) / 3600),
			minutes: Math.floor((total % 3600) / 60),
			seconds: total % 60
		};
	});
	const pad = (/** @type {number} */ n) => String(n).padStart(2, '0');

	// —— Funding state ——
	// `raised` comes live from the donations sheet (see $lib/donations.js).
	// The bar is a real linear scale: 0 → maxAmount maps to 0 → 100% width, and
	// each tier tick sits at its own amount/maxAmount position. No DOM measuring,
	// so it can't drift or flash. Tiers run high → low in the array; `pct()` maps
	// any dollar amount onto that shared scale.
	const raised    = $derived($raisedStore);
	const maxAmount  = tiers[0].amount;                              // top tier = a full bar
	const pct        = (/** @type {number} */ amount) => Math.min(100, Math.max(0, (amount / maxAmount) * 100));
	const fillPct    = $derived(pct(raised));

	// Count-up: the displayed number rolls when `raised` changes.
	const shown = tweened(FALLBACK_RAISED, { duration: 700, easing: cubicOut });
	$effect(() => void shown.set(raised));

	onMount(() => {
		// Tick the countdown once a second.
		const clock = setInterval(() => (now = new Date()), 1000);
		return () => clearInterval(clock);
	});
</script>

<div class="bento">
	<!-- Left column: funding tile + tier tiles -->
	<div class="col">
		<!-- Funding tile -->
		<section class="tile fund-tile">
			<header class="tile-head">
				<h2 class="tile-title">Support Us</h2>
				<span class="tile-amt">
					${Math.round($shown).toLocaleString('en-US')}
					<span class="tile-amt-goal">/ ${maxAmount.toLocaleString('en-US')}</span>
				</span>
			</header>

			<!-- Horizontal progress bar; tier ticks sit at amount/maxAmount along it -->
			<div class="bar" aria-hidden="true">
				<div class="bar-track">
					<div class="bar-fill" style="width: {fillPct}%">
						<span class="bar-head"><span class="pulse"></span></span>
					</div>
				</div>
				<div class="bar-ticks">
					{#each tiers as t (t.amount)}
						<span
							class="tick"
							class:reached={raised >= t.amount}
							class:tick-edge={t.amount === maxAmount}
							style="left: {pct(t.amount)}%"
						>
							<span class="tick-mark"></span>
							<span class="tick-amt">${t.amount}</span>
						</span>
					{/each}
				</div>
			</div>

			<button class="support-btn" onclick={onsupport}>Support the project</button>
		</section>

		<!-- Tier tiles (priority order, high → low) -->
		<ol class="tiers">
			{#each tiers as t (t.amount)}
				{@const unlocked = raised >= t.amount}
				<li class="tile tier" class:unlocked>
					<div class="tier-head">
						<span class="tier-amt">${t.amount}</span>
						<span class="title">{t.title}</span>
						<span class="badge" class:badge-unlocked={unlocked}>
							{#if unlocked}<span class="check-icon">{@html checkIcon}</span>{/if}
							{unlocked ? 'Unlocked' : 'Locked'}
						</span>
					</div>
					<div class="detail">{t.detail}</div>
				</li>
			{/each}
		</ol>
	</div>

	<!-- Right column: rewards tile + countdown tile -->
	<div class="col">
		<!-- Rewards tile -->
		<section class="tile rewards-tile">
			<header class="tile-head">
				<h2 class="tile-title">Your support, rewarded</h2>
			</header>
			<p class="blurb">
				Get an exclusive early supporter badge when you support the game. This badge will be visible
				in public rooms, Help Me! and Let Me Help!, and (soon) in Shikaku+ VS!
			</p>
			<div class="badge-list">
				{#each badges as b (b.name)}
					<div class="badge-row">
						<div class="badge-icon">{@html b.svg}</div>
						<div class="badge-info">
							<div class="badge-name">{b.name}</div>
							<div class="badge-threshold">{b.label}</div>
						</div>
					</div>
				{/each}
			</div>
			<p class="footnote">
				These badges are minted once and never again — once the Foundation period closes, there's no
				way to get them.
			</p>
		</section>

		<!-- Countdown tile -->
		<section class="tile deadline-tile" class:ended>
			<header class="tile-head">
				<h2 class="tile-title">
					{ended ? 'Foundation has ended' : 'Early support ends in'}
				</h2>
			</header>
			{#if ended}
				<p class="deadline-ended">
					Thank you to everyone who supported during the Foundation period.
				</p>
			{:else}
				<div class="countdown" role="timer" aria-label="Time remaining until the Foundation fundraiser ends">
					<div class="seg">
						<span class="num">{pad(countdown.days)}</span>
						<span class="unit">days</span>
					</div>
					<div class="seg">
						<span class="num">{pad(countdown.hours)}</span>
						<span class="unit">hrs</span>
					</div>
					<div class="seg">
						<span class="num">{pad(countdown.minutes)}</span>
						<span class="unit">min</span>
					</div>
					<div class="seg">
						<span class="num">{pad(countdown.seconds)}</span>
						<span class="unit">sec</span>
					</div>
				</div>
				<p class="footnote text-center">
					The Foundation fundraiser wraps up at the end of August 2026. Support before then to lock
					in your tier rewards and exclusive badge.
				</p>
			{/if}
		</section>
	</div>
</div>

<style>
	/* —— Bento geometry, drawn from the in-game grid grammar (tokens.css) ——
	   The board uses a soft ~12% tile radius, 5px cell gaps, 16px grid padding.
	   We echo that here: tiles get a game-tile radius, chips the global 4px,
	   and every gap/pad is one of two units so the whole section feels like a
	   board of nested tiles. */
	.bento {
		--tile-radius: 12px;     /* big container — echoes the board's tile corner */
		--chip-radius: var(--radius); /* 4px — small chrome (badges, button, bar) */
		--tile-pad: var(--grid-padding); /* 16px — interior padding everywhere */
		--tile-gap: var(--grid-padding); /* 16px — gap between tiles */
		--inner-gap: 10px;       /* gap inside a tile */

		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--tile-gap);
		align-items: start;
	}
	.col {
		display: flex;
		flex-direction: column;
		gap: var(--tile-gap);
		min-width: 0;
	}

	/* —— Tile: the one container primitive —— */
	.tile {
		background: color-mix(in srgb, var(--text-primary) 5%, transparent);
		border: 1px solid color-mix(in srgb, var(--text-primary) 8%, transparent);
		border-radius: var(--tile-radius);
		padding: var(--tile-pad);
		display: flex;
		flex-direction: column;
		gap: var(--inner-gap);
	}
	.tile-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 12px;
		flex-wrap: wrap;
	}
	.tile-title {
		font-family: var(--font-ui);
		font-size: 18px;
		font-weight: normal;
		letter-spacing: -0.5px;
		color: var(--text-primary);
		margin: 0;
	}

	/* —— Funding tile —— */
	.tile-amt {
		font-size: 18px;
		font-weight: 700;
		color: var(--text-primary);
		letter-spacing: -0.3px;
		font-variant-numeric: tabular-nums;
	}
	.tile-amt-goal {
		font-size: 13px;
		font-weight: 500;
		color: var(--text-secondary);
	}

	/* —— Horizontal progress bar —— */
	.bar {
		position: relative;
		margin-top: 4px;
	}
	.bar-track {
		position: relative;
		height: 10px;
		border-radius: var(--chip-radius);
		background: var(--cell);
	}
	.bar-fill {
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		min-width: 10px;
		border-radius: var(--chip-radius);
		background: var(--button-fill);
		transition: width 600ms ease;
	}
	/* leading-edge knob + radar ping at the current funding level */
	.bar-head {
		position: absolute;
		top: 50%;
		right: 0;
		width: 14px;
		height: 14px;
		border-radius: var(--chip-radius);
		background: var(--button-fill);
		transform: translate(50%, -50%) rotate(45deg); /* a little square gem, board-like */
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--button-fill) 22%, transparent);
	}
	.pulse {
		position: absolute;
		inset: 0;
		border-radius: var(--chip-radius);
		background: var(--button-fill);
		pointer-events: none;
		animation: level-pulse 1.6s ease-out infinite;
	}
	@keyframes level-pulse {
		0%   { opacity: 0.6; transform: scale(1); }
		70%  { opacity: 0;   transform: scale(3); }
		100% { opacity: 0;   transform: scale(3); }
	}
	@media (prefers-reduced-motion: reduce) {
		.pulse { animation: none; opacity: 0; }
	}

	/* —— Tier ticks under the rail —— */
	.bar-ticks {
		position: relative;
		height: 32px;
		margin-top: 8px;
	}
	.tick {
		position: absolute;
		top: 0;
		transform: translateX(-50%);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 5px;
		white-space: nowrap;
	}
	.tick-mark {
		width: 3px;
		height: 7px;
		border-radius: var(--chip-radius);
		background: color-mix(in srgb, var(--text-primary) 22%, transparent);
	}
	.tick-amt {
		font-size: 11px;
		font-weight: 700;
		color: var(--text-secondary);
		letter-spacing: -0.2px;
		opacity: 0.55;
	}
	.tick.reached .tick-mark { background: var(--button-fill); }
	.tick.reached .tick-amt  { color: var(--text-primary); opacity: 1; }
	/* Top tier sits at 100% (right edge); pull its label left so it doesn't clip. */
	.tick.tick-edge { transform: translateX(-100%); align-items: flex-end; }

	/* —— Tier tiles —— */
	.tiers {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--tile-gap);
	}
	.tier {
		gap: 6px;
	}
	.tier:not(.unlocked) { opacity: 0.62; }
	.tier-head {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
	}
	.tier-amt {
		font-size: 13px;
		font-weight: 700;
		color: var(--chip-sel-label);
		background: var(--button-fill);
		border-radius: var(--chip-radius);
		padding: 2px 7px;
		letter-spacing: -0.2px;
		font-variant-numeric: tabular-nums;
	}
	.tier:not(.unlocked) .tier-amt {
		color: var(--text-primary);
		background: color-mix(in srgb, var(--text-primary) 12%, transparent);
	}
	.title {
		font-size: 15px;
		font-weight: 700;
		color: var(--text-primary);
		letter-spacing: -0.2px;
		margin-right: auto;
	}
	.badge {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-size: 11px;
		font-weight: 600;
		padding: 2px 8px;
		border-radius: var(--chip-radius);
		color: var(--text-secondary);
		background: color-mix(in srgb, var(--text-primary) 10%, transparent);
		letter-spacing: -0.1px;
	}
	.badge-unlocked {
		color: #88B098;
		background: color-mix(in srgb, #88B098 25%, transparent);
	}
	.check-icon {
		display: flex;
		align-items: center;
	}
	.check-icon :global(svg) {
		width: 10px;
		height: 10px;
		fill: #88B098;
	}
	.detail {
		font-size: 13px;
		color: var(--text-secondary);
		letter-spacing: -0.2px;
		line-height: 1.5;
	}

	/* —— Support button —— */
	.support-btn {
		margin-top: 6px;
		background: var(--button-fill);
		color: var(--chip-sel-label);
		border: none;
		border-radius: var(--chip-radius);
		padding: 14px 22px;
		font-family: var(--font-ui);
		font-size: 15px;
		letter-spacing: -0.3px;
		cursor: pointer;
		transition: filter 120ms ease, transform 80ms ease;
		width: 100%;
	}
	.support-btn:hover { filter: brightness(1.06); }
	.support-btn:active { transform: translateY(1px); }

	/* —— Rewards tile —— */
	.blurb {
		font-size: 15px;
		line-height: 1.6;
		color: var(--text-secondary);
		letter-spacing: -0.2px;
		margin: 0;
	}
	.badge-list {
		display: flex;
		flex-direction: column;
		gap: var(--inner-gap);
		margin-top: 4px;
	}
	/* each reward is its own little inset tile */
	.badge-row {
		display: flex;
		align-items: center;
		gap: 14px;
		background: color-mix(in srgb, var(--text-primary) 4%, transparent);
		border-radius: var(--chip-radius);
		padding: 10px 12px;
	}
	.badge-icon {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		image-rendering: pixelated;
	}
	.badge-icon :global(svg) {
		width: 36px;
		height: 36px;
		image-rendering: pixelated;
	}
	.badge-name {
		font-size: 15px;
		font-weight: 600;
		color: var(--text-primary);
		letter-spacing: -0.2px;
	}
	.badge-threshold {
		font-size: 13px;
		color: var(--text-secondary);
		letter-spacing: -0.1px;
		margin-top: 2px;
	}
	.footnote {
		font-size: 12px;
		line-height: 1.5;
		color: var(--text-secondary);
		letter-spacing: -0.1px;
		opacity: 0.7;
		margin: 4px 0 0;
	}
	.footnote.text-center { text-align: center; }

	/* —— Countdown tile —— */
	.countdown {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 8px;
		font-variant-numeric: tabular-nums;
		margin-top: 2px;
	}
	/* each unit is a board-like score tile */
	.seg {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		background: var(--cell);
		border-radius: var(--chip-radius);
		padding: 12px 4px 8px;
	}
	.num {
		font-size: 30px;
		font-weight: 700;
		line-height: 1;
		color: var(--text-primary);
		letter-spacing: -0.5px;
	}
	.unit {
		font-size: 10px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		color: var(--text-secondary);
	}
	.deadline-ended {
		font-size: 14px;
		line-height: 1.55;
		color: var(--text-secondary);
		letter-spacing: -0.2px;
		margin: 0;
	}

	@media (max-width: 880px) {
		.bento {
			grid-template-columns: 1fr;
		}
	}
</style>
