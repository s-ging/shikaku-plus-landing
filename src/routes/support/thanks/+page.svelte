<script>
	// /support/thanks: Polar's success URL. It confirms nothing by itself: the
	// polar-webhook edge function grants the perk and emails the buyer.
	import { SUPPORT_EMAIL } from '$lib/checkout.js';
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
			<h1>Thank you</h1>
			<p class="lead">Your payment went through. Thanks for supporting Shikaku+.</p>
			<p>
				Your perk is being added to your account; it usually takes under a minute. We'll email you
				when it's there. Then open the game, or restart it if it's already open.
			</p>
			<p>
				No email within 10 minutes? Check your spam folder, then write to
				<a href="mailto:{SUPPORT_EMAIL}">{SUPPORT_EMAIL}</a> with your player tag.
			</p>
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
