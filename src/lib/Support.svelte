<script>
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { raised as raisedStore, FALLBACK_RAISED } from '$lib/donations.js';
	import checkIcon from '$lib/assets/icons/check.svg?raw';
	import SupportPayments from '$lib/SupportPayments.svelte';

	const tiers = [
		{ amount: 500, title: 'Full client-side customization', detail: 'A separate add-on to the game where you can customize the full Shikaku experience.' },
		{ amount: 300, title: 'Replay System',                  detail: `Advanced playback controls of your games, and your friend's games! See how they look at… squares! Or something.` },
		{ amount: 200, title: 'Friend System',                  detail: `For a game so geared towards friendship and love, we'd want to give you a robust backend to make sure you share your best clears.` },
		{ amount: 100, title: 'iOS App Store Launch',           detail: 'Unlocking the iOS App Store launch allows for even more of your friends to enjoy Shikaku+ anywhere. (Covers Apple’s $99/year developer fee.)' },
		{ amount: 25,  title: 'Google Play Store launch',       detail: 'We all have to start somewhere, and Google Play kicks things off for our mobile takeover.' }
	];

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
</script>

<div class="support-grid">
	<!-- Left: progress bar + tiers -->
	<div class="card">
		<h2 class="heading">Support Us</h2>
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

		<SupportPayments />
	</div>
</div>

<style>
	.support-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 16px;
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

	.heading {
		font-family: var(--font-ui);
		font-size: 22px;
		font-weight: normal;
		letter-spacing: -0.8px;
		color: var(--text-primary);
		margin: 0 0 16px;
	}

	.card {
		background: color-mix(in srgb, var(--text-primary) 4%, transparent);
		border: 1px solid color-mix(in srgb, var(--text-primary) 6%, transparent);
		border-radius: var(--radius);
		padding: 16px 20px;
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

	@media (max-width: 880px) {
		.support-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
