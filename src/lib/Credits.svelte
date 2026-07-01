<script>
	const credits = [
		{ label: 'Art', value: 'sagings' },
		{ label: 'Alpha feedback', value: 'nootellart, Peyt, Carrot Man, Frutos' },
		{
			label: 'Fonts',
			value: 'Shippori Antique (subset) & Shippori Mincho (subset), SIL Open Font License 1.1'
		}
	];
</script>

<section class="credits">
	<div class="card">
		<h2 class="heading">Credits</h2>
		<dl class="credit-list">
			{#each credits as c (c.label)}
				<div class="credit-row">
					<dt>{c.label}</dt>
					<dd>{c.value}</dd>
				</div>
			{/each}
			<div class="credit-row">
				<dt>Game code</dt>
				<dd>
					Based on <a href="https://github.com/Zaphoood/shikaku" target="_blank" rel="noopener noreferrer">shikaku by Zaphoood</a>, GNU GPL v3.0
				</dd>
			</div>
			<div class="credit-row">
				<dt>Icons</dt>
				<dd>
					Google Material Symbols (<a href="https://fonts.google.com/icons" target="_blank" rel="noopener noreferrer">fonts.google.com/icons</a>)
				</dd>
			</div>
		</dl>
		<p class="byline">By sagings and nootellart. Current version: 1.26.7.1.</p>
	</div>
</section>

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
	}
	.credit-list {
		margin: 0;
	}
	.credit-row {
		display: grid;
		grid-template-columns: 130px 1fr;
		gap: 12px;
		padding: 8px 0;
		border-bottom: 1px solid color-mix(in srgb, var(--text-primary) 6%, transparent);
	}
	.credit-row:first-child {
		padding-top: 0;
	}
	.credit-row:last-child {
		padding-bottom: 0;
		border-bottom: none;
	}
	.credit-row dt {
		font-size: 14px;
		font-weight: 700;
		color: var(--text-primary);
		letter-spacing: -0.2px;
	}
	.credit-row dd {
		font-size: 15px;
		line-height: 1.5;
		color: var(--text-secondary);
		letter-spacing: -0.2px;
		margin: 0;
	}
	.credit-row a {
		color: var(--button-fill);
		text-decoration: none;
	}
	.credit-row a:hover {
		text-decoration: underline;
	}
	.byline {
		font-size: 13px;
		color: var(--text-secondary);
		letter-spacing: -0.2px;
		margin: 16px 0 0;
	}

	@media (max-width: 560px) {
		.credit-row {
			grid-template-columns: 1fr;
			gap: 3px;
		}
	}
</style>
