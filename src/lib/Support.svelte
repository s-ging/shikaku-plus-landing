<script>
	import tier1 from '$lib/assets/foundation-badges/f-tier-1.svg?raw';
	import tier2 from '$lib/assets/foundation-badges/f-tier-2.svg?raw';
	import tier3 from '$lib/assets/foundation-badges/f-tier-3.svg?raw';
	import tier4 from '$lib/assets/foundation-badges/f-tier-4.svg?raw';
	import lockIcon     from '$lib/assets/icons/lock.svg?raw';
	import checkIcon    from '$lib/assets/icons/check.svg?raw';
	import barTickerSvg from '$lib/assets/bar-ticker.svg?raw';

	const tiers = [
		{ amount: 500, title: 'Sustained development', detail: 'The strongest tier, keeps the project moving without stalling' },
		{ amount: 300, title: 'Runway',                detail: 'More breathing room for hosting, updates, and the next round of dev' },
		{ amount: 200, title: 'shikaku.plus',          detail: 'Unlocks the real domain, a permanent home for the project' },
		{ amount: 100, title: 'iOS release',           detail: 'Unlocks the App Store version, so iPhone players can join in' },
		{ amount: 25,  title: 'Google Play',           detail: 'Already covered.' }
	];

	const badges = [
		{ svg: tier1, label: 'Donate any amount in the beta stage!', name: 'Foundation ★' },
		{ svg: tier2, label: 'Donate at least $5!',                  name: 'Foundation ★★' },
		{ svg: tier3, label: 'Donate at least $20!',                 name: 'Foundation ★★★' },
		{ svg: tier4, label: 'Donate at least $50!',                 name: 'Foundation ★★★★' }
	];

	let { onsupport } = $props();

	const maxAmount      = tiers[0].amount; // 500
	const fillPct        = 25;              // bar height %, so raised = $125
	const raised         = (maxAmount * fillPct) / 100;

	// Lowest milestone above the current raise level
	const nextTier       = [...tiers].reverse().find(t => t.amount > raised);
	// Highest milestone at or below the current raise level (baseline for % calc)
	const prevTierAmount = tiers.find(t => t.amount <= raised)?.amount ?? 0;
	const pctToNext      = nextTier
		? Math.round(((raised - prevTierAmount) / (nextTier.amount - prevTierAmount)) * 100)
		: 100;
</script>

<div class="support-grid">
	<!-- Left: thermometer + tiers -->
	<div class="col">
		<h2 class="heading">Support Us</h2>
		<div class="card">
			<div class="track" aria-hidden="true">
				<!-- Background bar -->
				<div class="bar-bg"></div>
				<!-- Fill + ticker -->
				<div class="bar-fill" style="height: {fillPct}%">
					<span class="ticker">{@html barTickerSvg}</span>
					<span class="next-label">{pctToNext}% to next milestone!</span>
				</div>
				<!-- Proportionally placed milestone labels -->
				{#each tiers as t}
					<div
						class="milestone"
						style="top: {((maxAmount - t.amount) / maxAmount) * 100}%"
					>
						<span class="milestone-label" class:reached={raised >= t.amount}>${t.amount}</span>
					</div>
				{/each}
			</div>

			<ol class="tiers">
				{#each tiers as t, i (t.amount)}
					{@const unlocked  = raised >= t.amount}
					{@const nextAmt   = i < tiers.length - 1 ? tiers[i + 1].amount : 0}
					{@const gapPx     = Math.round(((t.amount - nextAmt) / maxAmount) * 120)}
					<li class="tier" class:unlocked style="padding-bottom: {gapPx}px">
						<span class="icon" class:icon-check={unlocked}>
							{#if unlocked}{@html checkIcon}{:else}{@html lockIcon}{/if}
						</span>
						<div class="body">
							<div class="meta">
								<span class="amount">${t.amount}</span>
								<span class="badge" class:badge-unlocked={unlocked}>{unlocked ? 'Unlocked' : 'Locked'}</span>
							</div>
							<div class="title">{t.title}</div>
							<div class="detail">{t.detail}</div>
						</div>
					</li>
				{/each}
			</ol>
		</div>
		<button class="support-btn" onclick={onsupport}>Support the project</button>
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
		padding: 30px 30px 30px 22px;
		display: grid;
		grid-template-columns: 80px 1fr;
		gap: 14px;
		overflow: visible;
	}

	/* —— Thermometer —— */
	.track {
		position: relative;
		align-self: stretch;
		min-height: 220px;
		overflow: visible;
	}
	.bar-bg {
		position: absolute;
		left: 4px;
		top: 0;
		bottom: 0;
		width: 8px;
		border-radius: 999px;
		background: #2B2B2B;
	}
	.bar-fill {
		position: absolute;
		left: 4px;
		bottom: 0;
		width: 8px;
		border-radius: 999px;
		background: var(--button-fill);
		transition: height 600ms ease;
		overflow: visible;
	}
	/* ticker SVG sits centered on the fill's top edge */
	.ticker {
		position: absolute;
		top: 0;
		left: 0;
		transform: translate(-2px, -50%);
		display: block;
		line-height: 0;
	}
	.ticker :global(svg) {
		width: 12px;
		height: auto;
		display: block;
	}
	/* progress label floats right of the ticker */
	.next-label {
		position: absolute;
		top: 0;
		left: 18px;
		transform: translateY(-50%);
		font-size: 11px;
		color: var(--text-secondary);
		white-space: nowrap;
		letter-spacing: -0.1px;
	}
	/* proportionally spaced milestone markers */
	.milestone {
		position: absolute;
		left: 0;
		right: 0;
		height: 0;
		overflow: visible;
	}
	.milestone-label {
		position: absolute;
		left: 18px;
		top: 0;
		transform: translateY(-50%);
		font-size: 12px;
		color: var(--text-secondary);
		letter-spacing: -0.2px;
		white-space: nowrap;
		transition: color 300ms ease;
	}
	.milestone-label.reached {
		color: var(--text-primary);
	}

	/* —— Tier rows —— */
	.tiers {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	/* padding-bottom set inline per tier for proportional spacing */
	.tier {
		display: grid;
		grid-template-columns: 28px 1fr;
		gap: 14px;
	}
	.tier:last-child { padding-bottom: 0 !important; }
	.icon {
		width: 28px;
		height: 28px;
		display: grid;
		place-items: center;
		opacity: 0.45;
	}
	.icon :global(svg) {
		width: 20px;
		height: 20px;
	}
	.tier.unlocked .icon { opacity: 1; }
	.icon-check :global(svg) {
		fill: #88B098;
	}
	.meta {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 3px;
	}
	.amount {
		font-size: 14px;
		color: var(--text-secondary);
		letter-spacing: -0.2px;
	}
	.badge {
		font-size: 11px;
		font-weight: 600;
		padding: 2px 8px;
		border-radius: 999px;
		color: var(--text-secondary);
		background: color-mix(in srgb, var(--text-primary) 10%, transparent);
	}
	.badge-unlocked {
		color: #88B098;
		background: color-mix(in srgb, #88B098 30%, transparent);
	}
	.title {
		font-size: 16px;
		font-weight: 700;
		color: var(--text-primary);
		letter-spacing: -0.2px;
	}
	.tier:not(.unlocked) .title,
	.tier:not(.unlocked) .detail { opacity: 0.78; }
	.detail {
		font-size: 14px;
		color: var(--text-secondary);
		letter-spacing: -0.2px;
		margin-top: 2px;
	}

	.support-btn {
		margin-top: 22px;
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
	}
	.support-btn:hover { filter: brightness(1.06); }
	.support-btn:active { transform: translateY(1px); }

	/* —— Rewards card —— */
	.rewards-card {
		display: block;
		padding: 30px;
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

	@media (max-width: 880px) {
		.support-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
