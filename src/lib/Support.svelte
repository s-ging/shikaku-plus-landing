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

<div class="support-grid">
	<!-- Left: progress bar + tiers -->
	<div class="col">
		<h2 class="heading">Support Us</h2>
		<div class="card">
			<div class="raised-row">
				<p class="raised-line">${Math.round($shown).toLocaleString('en-US')} raised</p>
				<p class="goal-line">of ${maxAmount.toLocaleString('en-US')} goal</p>
			</div>

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

			<!-- Tier detail list (priority order, high → low) -->
			<ol class="tiers">
				{#each tiers as t (t.amount)}
					{@const unlocked = raised >= t.amount}
					<li class="tier" class:unlocked>
						<span class="tier-amt">${t.amount}</span>
						<div class="body">
							<div class="tier-header">
								<span class="title">{t.title}</span>
								<span class="badge" class:badge-unlocked={unlocked}>
									{#if unlocked}<span class="check-icon">{@html checkIcon}</span>{/if}
									{unlocked ? 'Unlocked' : 'Locked'}
								</span>
							</div>
							<div class="detail">{t.detail}</div>
						</div>
					</li>
				{/each}
			</ol>

			<button class="support-btn" onclick={onsupport}>Support the project</button>
		</div>
	</div>

	<!-- Right: badge rewards -->
	<div class="col">
		<h2 class="heading">Your support, rewarded</h2>
		<div class="card rewards-card">
			<p class="blurb">
				Get an exclusive early supporter badge when you support the game. This badge will be visible
				in public rooms, Help Me! and Let Me Help!, and (soon) in Shikaku+ VS!
			</p>
			<div class="badge-list">
				{#each badges as b}
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
		</div>

		<!-- Countdown: the Foundation period is winding down -->
		<div class="deadline-section">
			<div class="card deadline-card" class:ended>
				{#if ended}
					<div class="deadline-ended">
						Foundation has ended — thank you to everyone who supported.
					</div>
				{:else}
					<div class="deadline-label">Early support ends in</div>
					<div class="countdown" role="timer" aria-label="Time remaining until the Foundation fundraiser ends">
						<div class="seg">
							<span class="num">{pad(countdown.days)}</span>
							<span class="unit">days</span>
						</div>
						<span class="colon" aria-hidden="true">:</span>
						<div class="seg">
							<span class="num">{pad(countdown.hours)}</span>
							<span class="unit">hours</span>
						</div>
						<span class="colon" aria-hidden="true">:</span>
						<div class="seg">
							<span class="num">{pad(countdown.minutes)}</span>
							<span class="unit">minutes</span>
						</div>
						<span class="colon" aria-hidden="true">:</span>
						<div class="seg">
							<span class="num">{pad(countdown.seconds)}</span>
							<span class="unit">seconds</span>
						</div>
					</div>
					<div class="footnote text-center">
						The Foundation fundraiser wraps up at the end of August 2026. Support before then to lock
						in your tier rewards and exclusive badge.
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	.support-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: clamp(28px, 5vw, 64px);
		align-items: start;
	}

	/* Total raised, sits at the top of the box */
	.raised-line {
		margin: 0 0 20px;
		font-size: 18px;
		font-weight: 700;
		color: var(--text-primary);
		letter-spacing: -0.3px;
	}

	/* —— Countdown section —— */
	.deadline-section {
		margin-top: 20px;
	}
	.deadline-card {
		align-items: center;
		gap: 14px;
		padding: 22px 24px;
	}
	.deadline-label {
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.8px;
		color: var(--text-secondary);
	}
	.countdown {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		font-variant-numeric: tabular-nums;
	}
	.seg {
		display: flex;
		flex-direction: column;
		align-items: center;
		min-width: 44px;
	}
	.num {
		font-size: 32px;
		font-weight: 700;
		line-height: 1;
		color: var(--text-primary);
		letter-spacing: -0.5px;
	}
	.unit {
		margin-top: 6px;
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		color: var(--text-secondary);
	}
	.colon {
		font-size: 28px;
		font-weight: 700;
		line-height: 1;
		color: var(--text-secondary);
		opacity: 0.5;
		/* nudge up so the colon centres on the numerals, not the unit labels */
		padding-top: 2px;
	}
	.deadline-ended {
		font-size: 15px;
		font-weight: 600;
		color: var(--text-secondary);
		letter-spacing: -0.2px;
		text-align: center;
	}

	.heading {
		font-family: var(--font-ui);
		font-size: 22px;
		font-weight: normal;
		letter-spacing: -0.8px;
		color: var(--text-primary);
		margin: 0 0 18px;
	}

	.card {
		background: color-mix(in srgb, var(--text-primary) 4%, transparent);
		border: 1px solid color-mix(in srgb, var(--text-primary) 6%, transparent);
		border-radius: var(--radius);
		padding: 28px 28px 28px 20px;
		display: flex;
		flex-direction: column;
	}

	/* —— Raised / goal header —— */
	.raised-row {
		display: flex;
		align-items: baseline;
		gap: 8px;
		margin: 0 0 16px;
	}
	.goal-line {
		margin: 0;
		font-size: 14px;
		font-weight: 500;
		color: var(--text-secondary);
		letter-spacing: -0.2px;
	}

	/* —— Horizontal progress bar —— */
	.bar {
		position: relative;
		/* room below the rail for the tick marks + amount labels */
		margin: 0 0 28px;
	}
	.bar-track {
		position: relative;
		height: 8px;
		border-radius: 999px;
		background: #2B2B2B;
	}
	.bar-fill {
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		min-width: 8px;                 /* keep the rounded cap visible at tiny values */
		border-radius: 999px;
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
		border-radius: 50%;
		background: var(--button-fill);
		transform: translate(50%, -50%);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--button-fill) 22%, transparent);
	}
	.pulse {
		position: absolute;
		inset: 0;
		border-radius: 50%;
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
		height: 34px;
	}
	.tick {
		position: absolute;
		top: 0;
		transform: translateX(-50%);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		white-space: nowrap;
	}
	.tick-mark {
		width: 2px;
		height: 8px;
		border-radius: 999px;
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
	/* The top tier sits at 100% (right edge); pull its label fully left so it
	   doesn't overflow the card. The mark stays put via its own centering. */
	.tick.tick-edge { transform: translateX(-100%); align-items: flex-end; }
	.tick.tick-edge .tick-mark { margin-right: 0; }

	.tiers {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 18px;
	}

	.tier {
		display: grid;
		grid-template-columns: 48px 1fr;
		gap: 0 14px;
	}

	.tier-amt {
		font-size: 14px;
		font-weight: 700;
		color: var(--text-primary);
		letter-spacing: -0.3px;
		padding-top: 2px;
		opacity: 0.4;
	}
	.tier.unlocked .tier-amt { opacity: 1; }

	.tier-header {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
		margin-bottom: 3px;
	}
	.title {
		font-size: 15px;
		font-weight: 700;
		color: var(--text-primary);
		letter-spacing: -0.2px;
	}
	.tier:not(.unlocked) .title,
	.tier:not(.unlocked) .detail { opacity: 0.55; }

	.badge {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-size: 11px;
		font-weight: 600;
		padding: 2px 8px;
		border-radius: 999px;
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

	.support-btn {
		margin-top: 24px;
		background: var(--button-fill);
		color: var(--chip-sel-label);
		border: none;
		border-radius: var(--radius);
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

	/* —— Rewards card —— */
	.rewards-card {
		display: block;
		padding: 28px;
	}
	.blurb {
		font-size: 15px;
		line-height: 1.65;
		color: var(--text-secondary);
		letter-spacing: -0.2px;
		margin: 0 0 28px;
	}
	.badge-list {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}
	.badge-row {
		display: flex;
		align-items: center;
		gap: 14px;
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
		margin: 24px 0 0;
	}

	.footnote.text-center {
		text-align: center;
	}

	@media (max-width: 880px) {
		.support-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
