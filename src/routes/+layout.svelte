<script lang="ts">
	import '$lib/tokens.css';
	import { onMount } from 'svelte';
	import { invalidate } from '$app/navigation';

	let { children, data } = $props();

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
</svelte:head>

{@render children()}
