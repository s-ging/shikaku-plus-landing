<script>
	import Toggle from '$lib/Toggle.svelte';

	let { data } = $props();
	let posts = $state(data.posts);
	$effect(() => {
		posts = data.posts;
	});

	const TYPES = [
		{ value: 'blog', label: 'Blog' },
		{ value: 'patch_notes', label: 'Patch Notes' },
		{ value: 'announcement', label: 'Announcement' }
	];
	const typeLabel = (/** @type {string} */ t) => TYPES.find((x) => x.value === t)?.label ?? t;
	const typeOf = (/** @type {any} */ p) => p.post_type ?? 'blog';

	let filter = $state('all');
	const filtered = $derived(
		filter === 'all' ? posts : posts.filter((/** @type {any} */ p) => typeOf(p) === filter)
	);
	const countFor = (/** @type {string} */ t) =>
		t === 'all' ? posts.length : posts.filter((/** @type {any} */ p) => typeOf(p) === t).length;

	async function togglePublish(/** @type {any} */ post, /** @type {boolean} */ next) {
		if (!data.supabase) return;
		const { error } = await data.supabase
			.from('posts')
			.update({ published: next, updated_at: new Date().toISOString() })
			.eq('id', post.id);
		if (!error) post.published = next;
	}

	async function remove(/** @type {any} */ post) {
		if (!data.supabase) return;
		if (!confirm(`Delete "${post.title}"? This can't be undone.`)) return;
		const { error } = await data.supabase.from('posts').delete().eq('id', post.id);
		if (!error) posts = posts.filter((/** @type {any} */ p) => p.id !== post.id);
	}

	function fmtDate(/** @type {string} */ d) {
		return new Date(d).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}
</script>

<svelte:head><title>Admin · Posts</title></svelte:head>

<main class="wrap">
	<header class="bar">
		<h1>Posts</h1>
		<a class="btn primary" href="/admin/new">+ New post</a>
	</header>

	<div class="tabs">
		<button class="tab" class:active={filter === 'all'} onclick={() => (filter = 'all')}>
			All <span class="count">{countFor('all')}</span>
		</button>
		{#each TYPES as t (t.value)}
			<button class="tab" class:active={filter === t.value} onclick={() => (filter = t.value)}>
				{t.label} <span class="count">{countFor(t.value)}</span>
			</button>
		{/each}
	</div>

	<div class="panel">
		{#if filtered.length === 0}
			<p class="empty">
				{#if posts.length === 0}
					No posts yet. <a href="/admin/new">Write your first one →</a>
				{:else}
					No posts in this category.
				{/if}
			</p>
		{:else}
			<div class="table">
				<div class="thead">
					<span class="col-title">Title</span>
					<span class="col-type">Type</span>
					<span class="col-status">Status</span>
					<span class="col-date">Updated</span>
					<span class="col-actions"></span>
				</div>
				{#each filtered as p (p.id)}
					<div class="row">
						<a class="col-title title" href="/admin/{p.id}">{p.title || '(untitled)'}</a>
						<span class="col-type">
							<span class="type-badge type-{typeOf(p)}">{typeLabel(typeOf(p))}</span>
						</span>
						<span class="col-status">
							<Toggle checked={p.published} onchange={(/** @type {boolean} */ next) => togglePublish(p, next)} />
							<span class="status-label" class:live={p.published}>
								{p.published ? 'Live' : 'Draft'}
							</span>
						</span>
						<span class="col-date">{fmtDate(p.updated_at)}</span>
						<span class="col-actions">
							<a class="link" href="/admin/{p.id}">Edit</a>
							<button class="link danger" onclick={() => remove(p)}>Delete</button>
						</span>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</main>

<style>
	.wrap {
		max-width: 960px;
		margin: 0 auto;
		padding: 40px clamp(20px, 4vw, 40px) 0;
	}
	.bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 24px;
	}
	h1 {
		margin: 0;
		font-family: var(--font-ui);
		font-size: 26px;
		font-weight: normal;
		letter-spacing: -0.6px;
		color: var(--text-primary);
	}
	.btn {
		padding: 10px 16px;
		border-radius: var(--radius);
		font-size: 14px;
		text-decoration: none;
		border: none;
		cursor: pointer;
		font-family: var(--font-ui);
	}
	.btn.primary {
		background: var(--button-fill);
		color: var(--chip-sel-label);
	}

	.tabs {
		display: flex;
		gap: 4px;
		margin-bottom: 16px;
		border-bottom: 1px solid color-mix(in srgb, var(--text-primary) 8%, transparent);
	}
	.tab {
		display: flex;
		align-items: center;
		gap: 6px;
		background: none;
		border: none;
		padding: 10px 14px;
		font-family: var(--font-ui);
		font-size: 14px;
		color: var(--text-secondary);
		cursor: pointer;
		border-bottom: 2px solid transparent;
	}
	.tab:hover {
		color: var(--text-primary);
	}
	.tab.active {
		color: var(--text-primary);
		border-bottom-color: var(--button-fill);
	}
	.count {
		font-size: 12px;
		color: var(--text-secondary);
		background: color-mix(in srgb, var(--text-primary) 10%, transparent);
		border-radius: 999px;
		padding: 1px 7px;
	}
	.tab.active .count {
		color: var(--chip-sel-label);
		background: var(--button-fill);
	}

	.panel {
		background: color-mix(in srgb, var(--text-primary) 4%, transparent);
		border: 1px solid color-mix(in srgb, var(--text-primary) 6%, transparent);
		border-radius: var(--radius);
		padding: 4px 20px;
		margin-bottom: 40px;
	}
	.empty {
		padding: 24px 0;
		color: var(--text-secondary);
	}
	.empty a {
		color: var(--button-fill);
		text-decoration: none;
	}

	.table {
		display: flex;
		flex-direction: column;
	}
	.thead,
	.row {
		display: grid;
		grid-template-columns: 1fr 130px 140px 100px 110px;
		align-items: center;
		gap: 12px;
	}
	.thead {
		padding: 12px 0;
		font-size: 12px;
		letter-spacing: 0.3px;
		text-transform: uppercase;
		color: var(--text-secondary);
		border-bottom: 1px solid color-mix(in srgb, var(--text-primary) 8%, transparent);
	}
	.row {
		padding: 14px 0;
		border-bottom: 1px solid color-mix(in srgb, var(--text-primary) 6%, transparent);
	}
	.row:last-child {
		border-bottom: none;
	}

	.title {
		color: var(--text-primary);
		text-decoration: none;
		font-size: 15px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.title:hover {
		color: var(--button-fill);
	}

	.type-badge {
		font-size: 12px;
		padding: 3px 9px;
		border-radius: 999px;
		color: var(--text-secondary);
		background: color-mix(in srgb, var(--text-primary) 10%, transparent);
		white-space: nowrap;
	}
	.type-badge.type-patch_notes {
		color: #6a8aaa;
		background: color-mix(in srgb, #6a8aaa 22%, transparent);
	}
	.type-badge.type-announcement {
		color: #d08080;
		background: color-mix(in srgb, #d08080 22%, transparent);
	}

	.col-status {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.status-label {
		font-size: 13px;
		color: var(--text-secondary);
	}
	.status-label.live {
		color: #88b098;
	}

	.col-date {
		font-size: 13px;
		color: var(--text-secondary);
	}

	.col-actions {
		display: flex;
		gap: 12px;
		justify-content: flex-end;
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

	@media (max-width: 720px) {
		.thead {
			display: none;
		}
		.row {
			grid-template-columns: 1fr;
			gap: 8px;
			padding: 16px 0;
		}
		.col-actions {
			justify-content: flex-start;
		}
	}
</style>
