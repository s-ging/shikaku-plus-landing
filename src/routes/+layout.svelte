<script lang="ts">
	import '$lib/tokens.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href="/favicon.png" sizes="192x192" type="image/png" />
	<link rel="apple-touch-icon" href="/icon-192.png" />
	<link rel="manifest" href="/manifest.webmanifest" />
	<meta name="theme-color" content="#1b1b1b" />
</svelte:head>

{@render children()}
