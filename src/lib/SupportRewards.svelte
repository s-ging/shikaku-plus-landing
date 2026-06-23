<script>
	import tier1 from '$lib/assets/foundation-badges/f-tier-1.svg?raw';
	import tier2 from '$lib/assets/foundation-badges/f-tier-2.svg?raw';
	import tier3 from '$lib/assets/foundation-badges/f-tier-3.svg?raw';
	import tier4 from '$lib/assets/foundation-badges/f-tier-4.svg?raw';

	const badges = [
		{ svg: tier1, label: 'Donate any amount in the beta stage!', name: 'Foundation ★' },
		{ svg: tier2, label: 'Donate at least $5!',                  name: 'Foundation ★★' },
		{ svg: tier3, label: 'Donate at least $20!',                 name: 'Foundation ★★★' },
		{ svg: tier4, label: 'Donate at least $50!',                 name: 'Foundation ★★★★' }
	];
</script>

<div class="card rewards-card">
	<h2 class="heading">Your support, rewarded</h2>
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
</div>

<style>
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

	/* —— Rewards card —— */
	.rewards-card {
		display: block;
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
</style>
