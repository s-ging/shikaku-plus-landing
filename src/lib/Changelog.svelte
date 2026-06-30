<script>
	const groups = [
		{
			label: 'Badges',
			color: 'var(--button-fill)',
			items: [
				'Badge system is live. 30+ badges across Special, Foundation, Supporter, and gameplay tiers.',
				"Earn badges automatically by clearing boards in any mode. Open your Account to claim progress you've already made.",
				'Equip a badge by tapping it on the Account screen. Foundation and Master badges are hidden until earned.'
			]
		},
		{
			label: 'Player Tags',
			color: '#6A8AAA',
			items: [
				'Every registered account gets a 6-character tag (e.g. <code>#AB12CD</code>). Shown on the Account screen — tap to copy.',
				"Help Me! and Let Me Help! links now use tags instead of raw usernames. Opening a friend's link shows their current name and badge."
			]
		},
		{
			label: 'Fixes',
			color: null,
			items: [
				'Daily Puzzle: <code>R</code> key no longer resets the board. Reset and New Puzzle disabled for Daily.',
				'Badge list redesigned with proper plates and spacing.',
				'Anonymous accounts can no longer earn or equip badges.'
			]
		}
	];
</script>

<section class="changelog">
	<div class="card">
		<div class="header-row">
			<h2 class="heading">Changelog</h2>
			<span class="badge-latest">Latest</span>
			<span class="date">July 1, 2026</span>
		</div>
		<div class="groups">
			{#each groups as g (g.label)}
				<div class="group">
					<h3 class="group-heading" style={g.color ? `color: ${g.color}` : ''}>{g.label}</h3>
					<ul class="list">
						{#each g.items as item}
							<li style={g.color ? `--dot: ${g.color}` : ''}>{@html item}</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>
	</div>
</section>

<style>
	.heading {
		font-family: var(--font-ui);
		font-size: 22px;
		font-weight: normal;
		letter-spacing: -0.8px;
		color: var(--text-primary);
		margin: 0;
	}
	.card {
		background: color-mix(in srgb, var(--text-primary) 4%, transparent);
		border: 1px solid color-mix(in srgb, var(--text-primary) 6%, transparent);
		border-radius: var(--radius);
		padding: 16px 20px;
	}
	.header-row {
		display: flex;
		align-items: center;
		gap: 10px;
		margin: 0 0 18px;
	}
	.badge-latest {
		font-size: 11px;
		font-weight: 600;
		padding: 2px 8px;
		border-radius: 999px;
		letter-spacing: -0.1px;
		color: #1b1b1b;
		background: var(--button-fill);
	}
	.date {
		margin-left: auto;
		font-size: 13px;
		color: var(--text-secondary);
		letter-spacing: -0.2px;
	}
	.groups {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 20px;
	}
	.group-heading {
		font-size: 15px;
		font-weight: 700;
		letter-spacing: -0.2px;
		color: var(--text-primary);
		margin: 0 0 10px;
	}
	.list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.list li {
		--dot: var(--text-secondary);
		position: relative;
		padding-left: 16px;
		font-size: 14px;
		line-height: 1.55;
		color: var(--text-secondary);
		letter-spacing: -0.2px;
	}
	.list li::before {
		content: '';
		position: absolute;
		left: 0;
		top: 6px;
		width: 6px;
		height: 6px;
		background: var(--dot);
		opacity: 0.9;
	}
	.list :global(code) {
		font-family: ui-monospace, 'SF Mono', Consolas, monospace;
		font-size: 12.5px;
		padding: 1px 5px;
		border-radius: 3px;
		background: color-mix(in srgb, var(--text-primary) 10%, transparent);
		color: var(--text-primary);
	}

	@media (max-width: 880px) {
		.groups {
			grid-template-columns: 1fr;
			gap: 22px;
		}
		.header-row {
			flex-wrap: wrap;
		}
	}
</style>
