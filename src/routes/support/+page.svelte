<script>
	// /support: Foundation and Supporter through Polar (Kris, 2026-11-26).
	// The app's Support link on web and desktop lands here (kSupportUrl). Words
	// are a draft for Kris. Structure only: the look follows the other plain pages.
	import BackToTop from '$lib/BackToTop.svelte';
	import tier1 from '$lib/assets/foundation-badges/f-tier-1.svg?raw';
	import tier2 from '$lib/assets/foundation-badges/f-tier-2.svg?raw';
	import tier3 from '$lib/assets/foundation-badges/f-tier-3.svg?raw';
	import tier4 from '$lib/assets/foundation-badges/f-tier-4.svg?raw';
	import {
		FOUNDATION_CHECKOUT,
		SUPPORTER_CHECKOUT,
		FOUNDATION_TIERS
	} from '$lib/checkout.js';

	import copyText from '$lib/copy/support.txt?raw';
	import { parseCopy, blocks } from '$lib/copy/parse.js';

	const badgeSvg = [tier1, tier2, tier3, tier4];
	// Words live in src/lib/copy/support.txt (Kris edits them there).
	const copy = parseCopy(copyText);
	const t = (/** @type {string} */ k, /** @type {string} */ fallback = '') => copy[k] || fallback;
</script>

<svelte:head>
	<title>Support Shikaku+</title>
	<meta
		name="description"
		content="Support Shikaku+ with Foundation or Supporter: edit your player tag and wear a badge in the game."
	/>
</svelte:head>

<div class="legal-page">
	<header class="topbar">
		<a class="wordmark" href="/">Shikaku+</a>
	</header>

	<main>
		<nav class="breadcrumb" aria-label="Breadcrumb">
			<a href="/">Home</a>
			<span class="breadcrumb-sep">›</span>
			<span class="breadcrumb-current">Support</span>
		</nav>

		<article class="doc">
			<h1>Support Shikaku+</h1>
			<div class="lead">{@html blocks(t('page.intro'))}</div>
		</article>

		<div class="stack">
			<section class="card" aria-labelledby="foundation">
				<h2 class="heading" id="foundation">{t('foundation.title', 'Foundation')}</h2>
				<div class="body">{@html blocks(t('foundation.body'))}</div>
				<ul class="tiers">
					{#each FOUNDATION_TIERS as t, i (t.tier)}
						<li>
							<span class="badge-icon" aria-hidden="true">{@html badgeSvg[i]}</span>
							<span class="tier-name">{t.name}</span>
							<span class="tier-amt">${t.min}+</span>
						</li>
					{/each}
				</ul>
				{#if FOUNDATION_CHECKOUT}
					<a class="buy" href={FOUNDATION_CHECKOUT}>{t('foundation.button', 'Get Foundation')}</a>
				{:else}
					<span class="buy disabled" aria-disabled="true">Coming soon</span>
				{/if}
			</section>

			<section class="card" aria-labelledby="supporter">
				<h2 class="heading" id="supporter">{t('supporter.title', 'Supporter')}</h2>
				<div class="body">{@html blocks(t('supporter.body'))}</div>
				<div class="packs">{@html blocks(t('supporter.prices'))}</div>
				{#if SUPPORTER_CHECKOUT}
					<a class="buy" href={SUPPORTER_CHECKOUT}>{t('supporter.button', 'Become a Supporter')}</a>
				{:else}
					<span class="buy disabled" aria-disabled="true">Coming soon</span>
				{/if}
			</section>

			<section class="card" aria-labelledby="how">
				<h2 class="heading" id="how">{t('how.title', 'How it reaches your account')}</h2>
				<div class="notes">{@html blocks(t('how.points'))}</div>
			</section>
		</div>

		<BackToTop />

		<footer class="footer">
			<a href="/privacy-policy">Privacy Policy</a>
			<span class="sep">·</span>
			<a href="/terms-of-service">Terms of Service</a>
		</footer>
	</main>
</div>

<style>
	@import '$lib/legal.css';

	.stack {
		display: flex;
		flex-direction: column;
		gap: 16px;
		margin-top: 8px;
	}
	.card {
		background: color-mix(in srgb, var(--text-primary) 4%, transparent);
		border: 1px solid color-mix(in srgb, var(--text-primary) 6%, transparent);
		border-radius: var(--radius);
		padding: 16px 20px;
	}
	.heading {
		font-family: var(--font-ui);
		font-size: 22px;
		font-weight: normal;
		letter-spacing: -0.8px;
		color: var(--text-primary);
		margin: 0 0 8px;
	}
	.body :global(p),
	.lead :global(p) {
		margin: 0 0 8px;
	}
	.body {
		margin: 0 0 12px;
		color: var(--text-secondary);
		font-size: 15px;
		line-height: 1.55;
	}
	.tiers,
	.packs :global(ul) {
		list-style: none;
		margin: 0 0 16px;
		padding: 0;
	}
	.tiers li,
	.packs :global(li) {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 7px 0;
		border-bottom: 1px solid color-mix(in srgb, var(--text-primary) 6%, transparent);
		font-size: 15px;
		color: var(--text-primary);
	}
	.tiers li:last-child,
	.packs :global(li:last-child) {
		border-bottom: none;
	}
	.badge-icon {
		display: inline-flex;
		width: 21px;
		height: 21px;
	}
	.badge-icon :global(svg) {
		width: 100%;
		height: 100%;
		image-rendering: pixelated;
		shape-rendering: crispEdges;
	}
	.tier-name {
		flex: 1;
	}
	.tier-amt {
		margin-left: auto;
		color: var(--text-secondary);
		font-variant-numeric: tabular-nums;
	}
	.notes :global(ul) {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.notes :global(p) {
		margin: 0 0 10px;
		color: var(--text-secondary);
	}
	.notes :global(li) {
		position: relative;
		padding: 0 0 10px 16px;
		color: var(--text-secondary);
		font-size: 15px;
		line-height: 1.55;
	}
	.notes :global(li:last-child) {
		padding-bottom: 0;
	}
	.notes :global(li)::before {
		content: '';
		position: absolute;
		left: 2px;
		top: 0.65em;
		width: 5px;
		height: 5px;
		background: var(--text-secondary);
	}
	.notes :global(a) {
		color: var(--text-primary);
	}
	.buy {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 44px;
		padding: 0 20px;
		border-radius: var(--radius);
		background: var(--button-fill);
		color: var(--button-label);
		font-family: var(--font-ui);
		font-size: 15px;
		text-decoration: none;
	}
	.buy:hover {
		filter: brightness(1.08);
	}
	.buy:focus-visible {
		outline: 2px solid var(--text-primary);
		outline-offset: 3px;
	}
	.buy.disabled {
		background: var(--chip-unsel-fill);
		color: var(--text-secondary);
		cursor: default;
		filter: none;
	}
</style>
