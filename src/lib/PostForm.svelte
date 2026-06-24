<script>
	// Create/edit form. `post` null = new; otherwise edit. Writes go through the
	// browser Supabase client (RLS restricts writes to the admin).
	import Editor from '$lib/Editor.svelte';
	import { goto } from '$app/navigation';

	let { supabase, post = null } = $props();

	let title = $state(post?.title ?? '');
	let slug = $state(post?.slug ?? '');
	let excerpt = $state(post?.excerpt ?? '');
	let html = $state(post?.content_html ?? '');
	let published = $state(post?.published ?? false);
	let slugTouched = $state(!!post); // don't auto-rewrite an existing slug
	let busy = $state(false);
	let err = $state('');

	const slugify = (/** @type {string} */ s) =>
		s
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '');

	// Auto-fill slug from the title until the user edits it by hand.
	$effect(() => {
		if (!slugTouched) slug = slugify(title);
	});

	async function save() {
		if (!supabase) {
			err = 'Supabase is not configured.';
			return;
		}
		if (!title.trim()) {
			err = 'Give it a title.';
			return;
		}
		busy = true;
		err = '';
		const row = {
			title: title.trim(),
			slug: slug || slugify(title),
			excerpt: excerpt.trim(),
			content_html: html,
			published,
			updated_at: new Date().toISOString()
		};
		const res = post
			? await supabase.from('posts').update(row).eq('id', post.id)
			: await supabase.from('posts').insert(row);
		busy = false;
		if (res.error) {
			err = res.error.message;
			return;
		}
		goto('/admin');
	}
</script>

<main class="wrap">
	<header class="bar">
		<a class="back" href="/admin">← Posts</a>
		<div class="right">
			<label class="pub"><input type="checkbox" bind:checked={published} /> Published</label>
			<button class="save" onclick={save} disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
		</div>
	</header>

	{#if err}<p class="err">{err}</p>{/if}

	<input class="title" placeholder="Post title" bind:value={title} />

	<div class="meta">
		<label>
			<span>Slug</span>
			<input bind:value={slug} oninput={() => (slugTouched = true)} placeholder="post-slug" />
		</label>
		<label>
			<span>Excerpt</span>
			<input bind:value={excerpt} placeholder="One-line summary for the list" />
		</label>
	</div>

	<Editor content={html} onUpdate={(/** @type {string} */ v) => (html = v)} />

	{#if slug}<p class="hint">Public URL: <code>/blog/{slug}</code></p>{/if}
</main>

<style>
	.wrap {
		max-width: 760px;
		margin: 0 auto;
		padding: 40px 24px 80px;
	}
	.bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 20px;
	}
	.back {
		color: var(--text-secondary);
		text-decoration: none;
		font-size: 14px;
	}
	.back:hover {
		color: var(--text-primary);
	}
	.right {
		display: flex;
		align-items: center;
		gap: 14px;
	}
	.pub {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 14px;
		color: var(--text-secondary);
		cursor: pointer;
	}
	.save {
		background: var(--button-fill);
		color: var(--chip-sel-label);
		border: none;
		border-radius: var(--radius);
		padding: 10px 20px;
		font-family: var(--font-ui);
		font-size: 14px;
		cursor: pointer;
	}
	.save:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.err {
		color: #e88;
		font-size: 14px;
		margin: 0 0 14px;
	}
	.title {
		width: 100%;
		padding: 6px 0;
		margin-bottom: 16px;
		background: none;
		border: none;
		color: var(--text-primary);
		font-family: var(--font-ui);
		font-size: 30px;
		letter-spacing: -0.6px;
	}
	.title:focus {
		outline: none;
	}
	.meta {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
		margin-bottom: 16px;
	}
	.meta label {
		display: flex;
		flex-direction: column;
		gap: 4px;
		font-size: 12px;
		color: var(--text-secondary);
	}
	.meta input {
		padding: 10px 12px;
		background: color-mix(in srgb, var(--text-primary) 5%, transparent);
		border: 1px solid color-mix(in srgb, var(--text-primary) 12%, transparent);
		border-radius: var(--radius);
		color: var(--text-primary);
		font-family: var(--font-ui);
		font-size: 14px;
	}
	.meta input:focus {
		outline: none;
		border-color: var(--button-fill);
	}
	.hint {
		margin: 14px 0 0;
		font-size: 13px;
		color: var(--text-secondary);
	}
	.hint code {
		color: var(--text-primary);
	}
	@media (max-width: 560px) {
		.meta {
			grid-template-columns: 1fr;
		}
	}
</style>
