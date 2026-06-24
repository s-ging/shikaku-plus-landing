<script>
	// Tiptap rich-text editor. Emits HTML via onUpdate; render that HTML on the
	// blog page. Mounts only in the browser (Tiptap touches the DOM).
	import { onMount, onDestroy } from 'svelte';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import Link from '@tiptap/extension-link';

	let { content = '', onUpdate } = $props();

	/** @type {HTMLElement} */
	let element;
	/** @type {Editor | undefined} */
	let editor = $state();
	let tick = $state(0); // bumped on every transaction so toolbar active-states stay live

	onMount(() => {
		editor = new Editor({
			element,
			extensions: [
				StarterKit,
				Link.configure({ openOnClick: false, autolink: true })
			],
			content,
			onUpdate: ({ editor }) => onUpdate?.(editor.getHTML()),
			onTransaction: () => (tick += 1),
			editorProps: { attributes: { class: 'tiptap' } }
		});
	});
	onDestroy(() => editor?.destroy());

	const active = (/** @type {string} */ name, /** @type {any} */ attrs = undefined) => {
		void tick; // reactive dependency
		return (attrs ? editor?.isActive(name, attrs) : editor?.isActive(name)) ?? false;
	};

	function setLink() {
		if (!editor) return;
		const prev = editor.getAttributes('link').href ?? '';
		const url = window.prompt('Link URL', prev);
		if (url === null) return;
		if (url === '') editor.chain().focus().extendMarkRange('link').unsetLink().run();
		else editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
	}
</script>

<div class="editor">
	{#if editor}
		<div class="toolbar">
			<button type="button" class:on={active('bold')} onclick={() => editor?.chain().focus().toggleBold().run()}><b>B</b></button>
			<button type="button" class:on={active('italic')} onclick={() => editor?.chain().focus().toggleItalic().run()}><i>I</i></button>
			<span class="sep"></span>
			<button type="button" class:on={active('heading', { level: 2 })} onclick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
			<button type="button" class:on={active('heading', { level: 3 })} onclick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}>H3</button>
			<span class="sep"></span>
			<button type="button" class:on={active('bulletList')} onclick={() => editor?.chain().focus().toggleBulletList().run()}>• List</button>
			<button type="button" class:on={active('orderedList')} onclick={() => editor?.chain().focus().toggleOrderedList().run()}>1. List</button>
			<button type="button" class:on={active('blockquote')} onclick={() => editor?.chain().focus().toggleBlockquote().run()}>❝</button>
			<button type="button" class:on={active('codeBlock')} onclick={() => editor?.chain().focus().toggleCodeBlock().run()}>{'</>'}</button>
			<span class="sep"></span>
			<button type="button" class:on={active('link')} onclick={setLink}>Link</button>
			<span class="sep"></span>
			<button type="button" onclick={() => editor?.chain().focus().undo().run()}>↶</button>
			<button type="button" onclick={() => editor?.chain().focus().redo().run()}>↷</button>
		</div>
	{/if}
	<div class="surface" bind:this={element}></div>
</div>

<style>
	.editor {
		border: 1px solid color-mix(in srgb, var(--text-primary) 14%, transparent);
		border-radius: var(--radius);
		background: color-mix(in srgb, var(--text-primary) 3%, transparent);
		overflow: hidden;
	}
	.toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 4px;
		padding: 8px;
		border-bottom: 1px solid color-mix(in srgb, var(--text-primary) 10%, transparent);
	}
	.toolbar button {
		min-width: 34px;
		padding: 6px 9px;
		background: none;
		border: 1px solid transparent;
		border-radius: var(--radius);
		color: var(--text-secondary);
		font-family: var(--font-ui);
		font-size: 13px;
		cursor: pointer;
	}
	.toolbar button:hover {
		color: var(--text-primary);
		background: color-mix(in srgb, var(--text-primary) 8%, transparent);
	}
	.toolbar button.on {
		color: var(--chip-sel-label);
		background: var(--button-fill);
	}
	.sep {
		width: 1px;
		align-self: stretch;
		margin: 2px 4px;
		background: color-mix(in srgb, var(--text-primary) 12%, transparent);
	}
	.surface {
		padding: 14px 16px;
		min-height: 320px;
	}
	/* Editing surface typography — mirrors the public article styles. */
	.surface :global(.tiptap) {
		outline: none;
		color: var(--text-primary);
		font-size: 16px;
		line-height: 1.7;
	}
	.surface :global(.tiptap:focus) { outline: none; }
	.surface :global(.tiptap h2) { font-size: 24px; margin: 1.2em 0 0.4em; }
	.surface :global(.tiptap h3) { font-size: 19px; margin: 1.1em 0 0.4em; }
	.surface :global(.tiptap p) { margin: 0 0 0.9em; }
	.surface :global(.tiptap a) { color: var(--button-fill); }
	.surface :global(.tiptap blockquote) {
		border-left: 3px solid var(--button-fill);
		margin: 1em 0;
		padding-left: 14px;
		color: var(--text-secondary);
	}
	.surface :global(.tiptap pre) {
		background: color-mix(in srgb, var(--text-primary) 8%, transparent);
		padding: 12px 14px;
		border-radius: var(--radius);
		overflow-x: auto;
	}
	.surface :global(.tiptap p.is-editor-empty:first-child::before) {
		content: 'Write your post…';
		color: var(--text-secondary);
		opacity: 0.5;
		float: left;
		height: 0;
		pointer-events: none;
	}
</style>
