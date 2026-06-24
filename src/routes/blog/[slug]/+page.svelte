<script>
	let { data } = $props();
	const fmt = (/** @type {string} */ d) =>
		new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
</script>

<svelte:head>
	<title>{data.post.title} · Shikaku+</title>
	{#if data.post.excerpt}<meta name="description" content={data.post.excerpt} />{/if}
	<meta property="og:title" content={data.post.title} />
	{#if data.post.excerpt}<meta property="og:description" content={data.post.excerpt} />{/if}
	<meta property="og:type" content="article" />
	<meta name="twitter:title" content={data.post.title} />
	{#if data.post.excerpt}<meta name="twitter:description" content={data.post.excerpt} />{/if}
</svelte:head>

<main class="wrap">
	<a class="back" href="/blog">← Blog</a>
	<article>
		<h1>{data.post.title}</h1>
		<time>{fmt(data.post.created_at)}</time>
		<!-- Content authored by the site owner via the gated editor. -->
		<div class="body">{@html data.post.content_html}</div>
	</article>
</main>

<style>
	.wrap {
		max-width: 680px;
		margin: 0 auto;
		padding: 48px 24px 96px;
	}
	.back {
		color: var(--text-secondary);
		text-decoration: none;
		font-size: 14px;
	}
	.back:hover {
		color: var(--text-primary);
	}
	h1 {
		margin: 22px 0 8px;
		font-family: var(--font-brand);
		font-size: clamp(30px, 6vw, 44px);
		font-weight: 700;
		letter-spacing: -0.5px;
		line-height: 1.1;
		color: var(--text-primary);
	}
	time {
		font-size: 14px;
		color: var(--text-secondary);
		opacity: 0.7;
	}
	.body {
		margin-top: 32px;
		color: var(--text-primary);
		font-size: 17px;
		line-height: 1.75;
	}
	.body :global(h2) {
		font-family: var(--font-ui);
		font-size: 26px;
		letter-spacing: -0.4px;
		margin: 1.4em 0 0.4em;
	}
	.body :global(h3) {
		font-family: var(--font-ui);
		font-size: 20px;
		margin: 1.2em 0 0.4em;
	}
	.body :global(p) {
		margin: 0 0 1.1em;
	}
	.body :global(a) {
		color: var(--button-fill);
	}
	.body :global(ul),
	.body :global(ol) {
		padding-left: 1.4em;
		margin: 0 0 1.1em;
	}
	.body :global(li) {
		margin: 0.3em 0;
	}
	.body :global(blockquote) {
		border-left: 3px solid var(--button-fill);
		margin: 1.2em 0;
		padding-left: 16px;
		color: var(--text-secondary);
	}
	.body :global(pre) {
		background: color-mix(in srgb, var(--text-primary) 8%, transparent);
		padding: 14px 16px;
		border-radius: var(--radius);
		overflow-x: auto;
		font-size: 14px;
	}
	.body :global(img) {
		max-width: 100%;
		height: auto;
		border-radius: var(--radius);
	}
</style>
