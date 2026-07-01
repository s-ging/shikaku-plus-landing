<script>
	import BackToTop from '$lib/BackToTop.svelte';
	import Credits from '$lib/Credits.svelte';
	import OpenSource from '$lib/OpenSource.svelte';
</script>

<svelte:head>
	<title>About — Shikaku+</title>
	<meta
		name="description"
		content="Credits, attribution, and open-source acknowledgements for Shikaku+."
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
		<span class="breadcrumb-current">About</span>
	</nav>

	<article class="doc">
		<h1>About Shikaku+</h1>
		<p class="lead">
			Shikaku+ is a cooperative and competitive puzzle platform built on the Nikoli puzzle,
			Shikaku.
		</p>
		<p class="lead">
			The core mechanic is simple: partition a grid into rectangles so each rectangle contains
			exactly one number, and the rectangle&rsquo;s area matches that number.
		</p>
	</article>

	<div class="stack">
		<Credits />
		<OpenSource />
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
</style>
