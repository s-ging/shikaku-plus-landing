<script>
	// Create/edit form. `post` null = new; otherwise edit. Writes go through the
	// browser Supabase client (RLS restricts writes to the admin).
	import Editor from '$lib/Editor.svelte';
	import Toggle from '$lib/Toggle.svelte';
	import { goto } from '$app/navigation';

	const TYPES = [
		{ value: 'blog', label: 'Blog' },
		{ value: 'patch_notes', label: 'Patch Notes' },
		{ value: 'announcement', label: 'Announcement' }
	];

	let { supabase, post = null } = $props();

	let title = $state(post?.title ?? '');
	let slug = $state(post?.slug ?? '');
	let excerpt = $state(post?.excerpt ?? '');
	let html = $state(post?.content_html ?? '');
	let published = $state(post?.published ?? false);
	let postType = $state(post?.post_type ?? 'blog');
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
			post_type: postType,
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
		<button class="save" onclick={save} disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
	</header>

	{#if err}<p class="err">{err}</p>{/if}

	<div class="layout">
		<div class="main">
			<input class="title" placeholder="Post title" bind:value={title} />
			<Editor content={html} onUpdate={(/** @type {string} */ v) => (html = v)} />
		</div>

		<aside class="sidebar">
			<div class="field">
				<span class="field-label">Published</span>
				<Toggle checked={published} onchange={(/** @type {boolean} */ v) => (published = v)} />
			</div>

			<label class="field">
				<span class="field-label">Type</span>
				<select bind:value={postType}>
					{#each TYPES as t (t.value)}
						<option value={t.value}>{t.label}</option>
					{/each}
				</select>
			</label>

			<label class="field">
				<span class="field-label">Slug</span>
				<input bind:value={slug} oninput={() => (slugTouched = true)} placeholder="post-slug" />
			</label>

			<label class="field">
				<span class="field-label">Excerpt</span>
				<textarea
					bind:value={excerpt}
					placeholder="One-line summary for the list"
					rows="3"
				></textarea>
			</label>

			{#if slug}<p class="hint">Public URL: <code>/blog/{slug}</code></p>{/if}
		</aside>
	</div>
</main>

<style>
	.wrap {
		max-width: 1040px;
		margin: 0 auto;
		padding: 40px clamp(20px, 4vw, 40px) 80px;
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
		color: var(--invalid-stroke);
		font-size: 14px;
		margin: 0 0 14px;
	}

	.layout {
		display: grid;
		grid-template-columns: 1fr 280px;
		gap: 24px;
		align-items: start;
	}
	.main {
		min-width: 0;
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

	.sidebar {
		display: flex;
		flex-direction: column;
		gap: 18px;
		background: color-mix(in srgb, var(--text-primary) 4%, transparent);
		border: 1px solid color-mix(in srgb, var(--text-primary) 6%, transparent);
		border-radius: var(--radius);
		padding: 18px;
		position: sticky;
		top: 20px;
	}
	.field {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.field-label {
		font-size: 12px;
		letter-spacing: 0.2px;
		text-transform: uppercase;
		color: var(--text-secondary);
	}
	.field input,
	.field select,
	.field textarea {
		padding: 10px 12px;
		background: color-mix(in srgb, var(--text-primary) 5%, transparent);
		border: 1px solid color-mix(in srgb, var(--text-primary) 12%, transparent);
		border-radius: var(--radius);
		color: var(--text-primary);
		font-family: var(--font-ui);
		font-size: 14px;
		resize: vertical;
	}
	.field input:focus,
	.field select:focus,
	.field textarea:focus {
		outline: none;
		border-color: var(--button-fill);
	}
	.field select {
		cursor: pointer;
	}

	.hint {
		margin: 0;
		font-size: 12px;
		line-height: 1.5;
		color: var(--text-secondary);
		word-break: break-all;
	}
	.hint code {
		color: var(--text-primary);
	}

	@media (max-width: 760px) {
		.layout {
			grid-template-columns: 1fr;
		}
		.sidebar {
			position: static;
		}
	}
</style>
