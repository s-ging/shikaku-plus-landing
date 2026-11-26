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
		FOUNDATION_TIERS,
		SUPPORTER_PACKS,
		SUPPORT_EMAIL
	} from '$lib/checkout.js';

	const badgeSvg = [tier1, tier2, tier3, tier4];
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
			<p class="lead">
				Shikaku+ is free and made by one person. Supporting it unlocks player-tag editing and a
				badge on your account.
			</p>
		</article>

		<div class="stack">
			<section class="card" aria-labelledby="foundation">
				<h2 class="heading" id="foundation">Foundation</h2>
				<p class="body">
					One time, pay what you want. Edit your player tag for good, and wear the Foundation badge
					for what you paid.
				</p>
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
					<a class="buy" href={FOUNDATION_CHECKOUT}>Get Foundation</a>
				{:else}
					<span class="buy disabled" aria-disabled="true">Coming soon</span>
				{/if}
			</section>

			<section class="card" aria-labelledby="supporter">
				<h2 class="heading" id="supporter">Supporter</h2>
				<p class="body">
					Buy months, once each time (no subscription). Edit your player tag while it lasts, and wear
					the Supporter badge. Months add up.
				</p>
				<ul class="packs">
					{#each SUPPORTER_PACKS as p (p.months)}
						<li>
							<span>{p.months} month{p.months === 1 ? '' : 's'}</span>
							<span class="tier-amt">${p.usd}</span>
						</li>
					{/each}
				</ul>
				{#if SUPPORTER_CHECKOUT}
					<a class="buy" href={SUPPORTER_CHECKOUT}>Become a Supporter</a>
				{:else}
					<span class="buy disabled" aria-disabled="true">Coming soon</span>
				{/if}
			</section>

			<section class="card" aria-labelledby="how">
				<h2 class="heading" id="how">How it reaches your account</h2>
				<ul class="notes">
					<li>
						Pay with the email of your Shikaku+ account, or type your player tag in the checkout.
						You need an account: guests can't hold perks.
					</li>
					<li>
						It usually takes under a minute. You get an email when it's on your account; open or
						restart the game to see it.
					</li>
					<li>On Android, buy in the app through Google Play instead.</li>
					<li>
						Payments are handled by Polar, our reseller and merchant of record. Purchases are final,
						except where the law or <a href="https://polar.sh/legal/checkout-buyer-terms"
							>Polar's buyer terms</a
						> require a refund. See our <a href="/terms-of-service">Terms of Service</a>.
					</li>
					<li>
						Something wrong? Email <a href="mailto:{SUPPORT_EMAIL}">{SUPPORT_EMAIL}</a>.
					</li>
				</ul>
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
	.body {
		margin: 0 0 12px;
		color: var(--text-secondary);
		font-size: 15px;
		line-height: 1.55;
	}
	.tiers,
	.packs,
	.notes {
		list-style: none;
		margin: 0 0 16px;
		padding: 0;
	}
	.tiers li,
	.packs li {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 7px 0;
		border-bottom: 1px solid color-mix(in srgb, var(--text-primary) 6%, transparent);
		font-size: 15px;
		color: var(--text-primary);
	}
	.tiers li:last-child,
	.packs li:last-child {
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
	.notes {
		margin: 0;
	}
	.notes li {
		position: relative;
		padding: 0 0 10px 16px;
		color: var(--text-secondary);
		font-size: 15px;
		line-height: 1.55;
	}
	.notes li:last-child {
		padding-bottom: 0;
	}
	.notes li::before {
		content: '';
		position: absolute;
		left: 2px;
		top: 0.65em;
		width: 5px;
		height: 5px;
		background: var(--text-secondary);
	}
	.notes a {
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
