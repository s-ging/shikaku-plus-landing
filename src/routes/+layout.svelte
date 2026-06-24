<script lang="ts">
	import '$lib/tokens.css';
	import { onMount } from 'svelte';
	import { invalidate } from '$app/navigation';
	import { page } from '$app/state';

	let { children, data } = $props();

	// Absolute URLs for social cards — built from the live request origin so
	// they're correct on whatever domain this landing is served from.
	const origin = $derived(page.url.origin);
	const ogImage = $derived(`${origin}/og.png`);
	const canonical = $derived(`${origin}${page.url.pathname}`);

	// Keep server + client in sync: when the auth session changes (login/logout),
	// re-run the loads that depend on it.
	onMount(() => {
		if (!data.supabase) return;
		const {
			data: { subscription }
		} = data.supabase.auth.onAuthStateChange((_event, newSession) => {
			if (newSession?.expires_at !== data.session?.expires_at) invalidate('supabase:auth');
		});
		return () => subscription.unsubscribe();
	});
</script>

<svelte:head>
	<link rel="icon" href="/favicon.png" sizes="192x192" type="image/png" />
	<link rel="apple-touch-icon" href="/icon-192.png" />
	<link rel="manifest" href="/manifest.webmanifest" />
	<meta name="theme-color" content="#1b1b1b" />

	<!-- Open Graph / Twitter — shared defaults; pages set their own title/description. -->
	<link rel="canonical" href={canonical} />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="Shikaku+" />
	<meta property="og:url" content={canonical} />
	<meta property="og:image" content={ogImage} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content="Shikaku+ — Complete squares with friends." />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:image" content={ogImage} />
</svelte:head>

{@render children()}
