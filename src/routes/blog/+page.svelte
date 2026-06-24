<script>
	let { data } = $props();
	const fmt = (/** @type {string} */ d) =>
		new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
</script>

<svelte:head><title>Blog · Shikaku+</title></svelte:head>

<main class="wrap">
	<header class="head">
		<a class="home" href="/">Shikaku+</a>
		<h1>Blog</h1>
	</header>

	{#if data.posts.length === 0}
		<p class="empty">No posts yet — check back soon.</p>
	{:else}
		<ul class="list">
			{#each data.posts as p (p.slug)}
				<li>
					<a class="post" href="/blog/{p.slug}">
						<h2>{p.title}</h2>
						{#if p.excerpt}<p class="excerpt">{p.excerpt}</p>{/if}
						<time>{fmt(p.created_at)}</time>
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</main>

<style>
	.wrap {
		max-width: 680px;
		margin: 0 auto;
		padding: 56px 24px 96px;
	}
	.head {
		margin-bottom: 40px;
	}
	.home {
		font-family: var(--font-brand);
		font-size: 16px;
		color: var(--text-secondary);
		text-decoration: none;
	}
	.home:hover {
		color: var(--text-primary);
	}
	h1 {
		margin: 10px 0 0;
		font-family: var(--font-brand);
		font-size: 40px;
		font-weight: 700;
		letter-spacing: -0.5px;
		color: var(--text-primary);
	}
	.empty {
		color: var(--text-secondary);
	}
	.list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
	}
	.post {
		display: block;
		padding: 24px 0;
		border-top: 1px solid color-mix(in srgb, var(--text-primary) 10%, transparent);
		text-decoration: none;
	}
	.post h2 {
		margin: 0 0 6px;
		font-family: var(--font-ui);
		font-size: 22px;
		font-weight: normal;
		letter-spacing: -0.4px;
		color: var(--text-primary);
	}
	.post:hover h2 {
		color: var(--button-fill);
	}
	.excerpt {
		margin: 0 0 8px;
		color: var(--text-secondary);
		font-size: 15px;
		line-height: 1.5;
	}
	time {
		font-size: 13px;
		color: var(--text-secondary);
		opacity: 0.7;
	}
</style>
