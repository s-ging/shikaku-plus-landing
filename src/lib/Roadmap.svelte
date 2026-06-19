<script>
	import checkIcon      from '$lib/assets/icons/check.svg?raw';
	import inProgressIcon from '$lib/assets/icons/in-progress.svg?raw';
	import timeAttackSvg  from '$lib/assets/gamemodes/time-attack.svg?raw';
	import blitzSvg       from '$lib/assets/gamemodes/blitz.svg?raw';
	import tekazuSvg      from '$lib/assets/gamemodes/tekazu.svg?raw';

	const modeParts = [
		{ label: 'Time Attack', svg: timeAttackSvg, color: '#D08080' },
		{ label: 'Blitz',       svg: blitzSvg,      color: '#8098B0' },
		{ label: 'Tekazu',      svg: tekazuSvg,     color: '#88B098' },
	];

	const helpParts = [
		{ label: 'Help Me!',     svg: null, color: null },
		{ label: 'Let Me Help!', svg: null, color: null },
	];

	const items = [
		{ version: 'v0.1', status: 'shipped',  title: 'Shikaku+ was born', detail: 'Classic mode, deterministic puzzle engine' },
		{ version: 'v0.2', status: 'shipped',  title: null,                 detail: 'Zero-backend co-op, shared by link', helpModes: true },
		{ version: 'v0.3', status: 'shipped',  title: 'Shikaku Hokan',      detail: 'Anchors on the board, and you fill in the blanks with Targets.', titleColor: '#6A8AAA' },
		{ version: 'v0.4', status: 'building', title: 'Gamemode update',                 detail: 'Same engine, more Shikaku fun.', modes: true },
		{ version: 'v1',   status: 'building', title: 'Accounts',           detail: 'Save your progress and log in in any device forever.' },
		{ version: 'v2',   status: 'planned',  title: 'Shikaku+ VS',        detail: `Shikaku AGAINST friends. You've solved together, now it's time for war.` },
		{ version: 'v3',   status: 'planned',  title: 'Shikaku Mosaic',     detail: 'Daily collaborative puzzles with your friends, family, your boss, and your cat, together.' }
	];
	/** @type {Record<string, string>} */
	const statusLabel = { shipped: 'Shipped', building: 'Building now', planned: 'Planned' };
</script>

<section class="roadmap">
	<h2 class="heading">Roadmap</h2>
	<div class="card">
		<ol class="timeline">
			{#each items as it, i (it.version)}
				<li class="row" class:last={i === items.length - 1}>
					<span class="node node-{it.status}">
						{#if it.status === 'shipped'}{@html checkIcon}{:else if it.status === 'building'}{@html inProgressIcon}{/if}
					</span>
					<div class="body">
						<div class="meta">
							<span class="version">{it.version}</span>
							<span class="badge badge-{it.status}">{statusLabel[it.status]}</span>
						</div>
						{#if it.modes}
							<div class="title mode-title">
								{#each modeParts as m (m.label)}
									<div class="mode-row">
										{#if m.svg}
											<span class="mode-icon" style="--c: {m.color}">{@html m.svg}</span>
										{/if}
										<span class="mode-label" style={m.color ? `color: ${m.color}` : ''}>{m.label}</span>
									</div>
								{/each}
							</div>
						{:else if it.helpModes}
							<div class="title mode-title">
								{#each helpParts as m (m.label)}
									<div class="mode-row">
										{#if m.svg}
											<span class="mode-icon" style="--c: {m.color}">{@html m.svg}</span>
										{/if}
										<span class="mode-label" style={m.color ? `color: ${m.color}` : ''}>{m.label}</span>
									</div>
								{/each}
							</div>
						{:else}
							<div class="title" style={it.titleColor ? `color: ${it.titleColor}` : ''}>{it.title}</div>
						{/if}
						<div class="detail">{it.detail}</div>
					</div>
				</li>
			{/each}
		</ol>
	</div>
</section>

<style>
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
		padding: 26px 30px;
	}
	.timeline {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.row {
		position: relative;
		display: grid;
		grid-template-columns: 24px 1fr;
		gap: 16px;
		padding-bottom: 26px;
	}
	/* connector line */
	.row::before {
		content: '';
		position: absolute;
		left: 11px;
		top: 22px;
		bottom: -4px;
		width: 2px;
		background: color-mix(in srgb, var(--text-primary) 12%, transparent);
	}
	.row.last {
		padding-bottom: 0;
	}
	.row.last::before {
		display: none;
	}
	.node {
		position: relative;
		z-index: 1;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		display: grid;
		place-items: center;
		font-size: 13px;
		line-height: 1;
		color: #fff;
	}
	.node-shipped {
		background: #88B098;
	}
	.node-shipped :global(svg) {
		width: 16px;
		height: 16px;
		fill: #1B1B1B;
	}
	.node-building {
		background: #8a6d1f;
	}
	.node-building :global(svg) {
		width: 16px;
		height: 16px;
		fill: #fff;
	}
	.node-planned {
		background: transparent;
		border: 2px solid color-mix(in srgb, var(--text-primary) 28%, transparent);
		width: 20px;
		height: 20px;
		margin: 2px;
	}
	.meta {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 3px;
	}
	.version {
		font-size: 13px;
		color: var(--text-secondary);
		letter-spacing: -0.2px;
	}
	.badge {
		font-size: 11px;
		font-weight: 600;
		padding: 2px 8px;
		border-radius: 999px;
		letter-spacing: -0.1px;
	}
	.badge-shipped {
		color: #88B098;
		background: color-mix(in srgb, #88B098 30%, transparent);
	}
	.badge-building {
		color: #1b1b1b;
		background: var(--button-fill);
	}
	.badge-planned {
		color: var(--text-secondary);
		background: color-mix(in srgb, var(--text-primary) 10%, transparent);
	}
	.title {
		font-size: 16px;
		font-weight: 700;
		color: var(--text-primary);
		letter-spacing: -0.2px;
	}
	.detail {
		font-size: 14px;
		color: var(--text-secondary);
		letter-spacing: -0.2px;
		margin-top: 2px;
	}
	.mode-title {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}
	.mode-row {
		display: flex;
		align-items: center;
		gap: 7px;
	}
	.mode-icon :global(svg) {
		width: 15px;
		height: 15px;
		display: block;
	}
	.mode-icon :global(svg path) {
		fill: var(--c);
	}
	.mode-label {
		font-size: 15px;
		font-weight: 700;
		letter-spacing: -0.2px;
	}
</style>
