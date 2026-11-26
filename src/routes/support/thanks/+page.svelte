<script>
	// /support/thanks: Polar's success URL. It confirms nothing by itself: the
	// polar-webhook edge function grants the perk and emails the buyer.
	import copyText from '$lib/copy/support.txt?raw';
	import { parseCopy, blocks } from '$lib/copy/parse.js';

	// Words live in src/lib/copy/support.txt.
	const copy = parseCopy(copyText);
</script>

<svelte:head>
	<title>Thank you — Shikaku+</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="legal-page">
	<header class="topbar">
		<a class="wordmark" href="/">Shikaku+</a>
	</header>

	<main>
		<article class="doc">
			<h1>{copy['thanks.title'] || 'Thank you'}</h1>
			<div class="lead">{@html blocks(copy['thanks.body'] || '')}</div>
			<p><a class="play" href="https://play.shikaku.plus">Open Shikaku+</a></p>
		</article>

		<footer class="footer">
			<a href="/support">Support</a>
			<span class="sep">·</span>
			<a href="/terms-of-service">Terms of Service</a>
		</footer>
	</main>
</div>

<style>
	@import '$lib/legal.css';

	.play {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		padding: 0 20px;
		border-radius: var(--radius);
		background: var(--button-fill);
		color: var(--button-label);
		font-family: var(--font-ui);
		text-decoration: none;
	}
</style>
