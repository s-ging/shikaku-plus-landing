<script>
	import { goto, invalidate } from '$app/navigation';

	let { data } = $props();
	let posts = $state(data.posts);
	$effect(() => {
		posts = data.posts;
	});

	async function logout() {
		await data.supabase?.auth.signOut();
		await invalidate('supabase:auth');
		goto('/admin/login');
	}

	async function togglePublish(/** @type {any} */ post) {
		if (!data.supabase) return;
		const next = !post.published;
		const { error } = await data.supabase
			.from('posts')
			.update({ published: next, updated_at: new Date().toISOString() })
			.eq('id', post.id);
		if (!error) post.published = next;
	}

	async function remove(/** @type {any} */ post) {
		if (!data.supabase) return;
		if (!confirm(`Delete “${post.title}”? This can't be undone.`)) return;
		const { error } = await data.supabase.from('posts').delete().eq('id', post.id);
		if (!error) posts = posts.filter((/** @type {any} */ p) => p.id !== post.id);
	}
</script>

<svelte:head><title>Admin · Posts</title></svelte:head>

<main class="wrap">
	<header class="bar">
		<h1>Posts</h1>
		<div class="actions">
			<a class="btn" href="/blog" target="_blank">View blog ↗</a>
			<a class="btn primary" href="/admin/new">New post</a>
			<button class="btn ghost" onclick={logout}>Sign out</button>
		</div>
	</header>

	{#if posts.length === 0}
		<p class="empty">No posts yet. <a href="/admin/new">Write your first one →</a></p>
	{:else}
		<ul class="list">
			{#each posts as p (p.id)}
				<li class="row">
					<a class="title" href="/admin/{p.id}">{p.title || '(untitled)'}</a>
					<span class="status" class:live={p.published}>{p.published ? 'Published' : 'Draft'}</span>
					<button class="link" onclick={() => togglePublish(p)}>{p.published ? 'Unpublish' : 'Publish'}</button>
					<a class="link" href="/admin/{p.id}">Edit</a>
					<button class="link danger" onclick={() => remove(p)}>Delete</button>
				</li>
			{/each}
		</ul>
	{/if}
</main>

<style>
	.wrap {
		max-width: 760px;
		margin: 0 auto;
		padding: 48px 24px 80px;
	}
	.bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		margin-bottom: 28px;
	}
	h1 {
		margin: 0;
		font-family: var(--font-ui);
		font-size: 26px;
		font-weight: normal;
		letter-spacing: -0.6px;
		color: var(--text-primary);
	}
	.actions {
		display: flex;
		gap: 8px;
	}
	.btn {
		padding: 9px 14px;
		border-radius: var(--radius);
		font-size: 14px;
		text-decoration: none;
		color: var(--text-primary);
		background: color-mix(in srgb, var(--text-primary) 8%, transparent);
		border: none;
		cursor: pointer;
		font-family: var(--font-ui);
	}
	.btn.primary {
		background: var(--button-fill);
		color: var(--chip-sel-label);
	}
	.btn.ghost {
		background: none;
		color: var(--text-secondary);
	}
	.empty {
		color: var(--text-secondary);
	}
	.empty a,
	.title {
		color: var(--button-fill);
		text-decoration: none;
	}
	.list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
	}
	.row {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 14px 0;
		border-top: 1px solid color-mix(in srgb, var(--text-primary) 8%, transparent);
	}
	.title {
		flex: 1;
		font-size: 16px;
		color: var(--text-primary);
	}
	.status {
		font-size: 12px;
		color: var(--text-secondary);
		padding: 2px 8px;
		border-radius: 999px;
		background: color-mix(in srgb, var(--text-primary) 10%, transparent);
	}
	.status.live {
		color: #88b098;
		background: color-mix(in srgb, #88b098 22%, transparent);
	}
	.link {
		background: none;
		border: none;
		color: var(--text-secondary);
		font-size: 13px;
		cursor: pointer;
		text-decoration: none;
		font-family: var(--font-ui);
		padding: 0;
	}
	.link:hover {
		color: var(--text-primary);
	}
	.link.danger:hover {
		color: #e88;
	}
</style>
