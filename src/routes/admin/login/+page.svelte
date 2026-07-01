<script>
	import { goto, invalidate } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';
	import { env } from '$env/dynamic/public';

	let { data } = $props();
	let email = $state('');
	let password = $state('');
	let err = $state('');
	let busy = $state(false);
	let captchaToken = $state('');

	// The Supabase project has Bot Protection (Turnstile) enabled, shared with the
	// game's own auth flows — this must be the SAME widget (same secret already
	// configured in Supabase), just with go.shikaku.plus/localhost added to its
	// allowed domains. A fresh widget here would mint tokens Supabase can't verify.
	const siteKey = env.PUBLIC_TURNSTILE_SITE_KEY;

	/** @type {HTMLDivElement} */
	let turnstileEl;
	/** @type {string | undefined} */
	let widgetId;

	function renderWidget() {
		if (!window.turnstile || !turnstileEl || widgetId) return;
		widgetId = window.turnstile.render(turnstileEl, {
			sitekey: siteKey,
			theme: 'auto',
			callback: (/** @type {string} */ token) => (captchaToken = token),
			'expired-callback': () => (captchaToken = '')
		});
	}

	onMount(() => {
		if (!siteKey) return;
		if (window.turnstile) {
			renderWidget();
			return;
		}
		const existing = /** @type {HTMLScriptElement | null} */ (
			document.querySelector('script[data-turnstile]')
		);
		if (existing) {
			existing.addEventListener('load', renderWidget);
			return;
		}
		const script = document.createElement('script');
		script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
		script.async = true;
		script.defer = true;
		script.dataset.turnstile = 'true';
		script.onload = renderWidget;
		document.head.appendChild(script);
	});

	onDestroy(() => {
		// onDestroy (unlike onMount) also fires during SSR — guard for no `window` there.
		if (typeof window !== 'undefined' && window.turnstile && widgetId) {
			window.turnstile.remove(widgetId);
		}
	});

	async function login(/** @type {SubmitEvent} */ e) {
		e.preventDefault();
		if (!data.supabase) {
			err = 'Supabase is not configured.';
			return;
		}
		if (siteKey && !captchaToken) {
			err = 'Please complete the verification.';
			return;
		}
		busy = true;
		err = '';
		const { error } = await data.supabase.auth.signInWithPassword({
			email,
			password,
			options: captchaToken ? { captchaToken } : undefined
		});
		busy = false;
		if (error) {
			err = error.message;
			// Turnstile tokens are single-use — reset so the next attempt gets a fresh one.
			if (window.turnstile && widgetId) window.turnstile.reset(widgetId);
			captchaToken = '';
			return;
		}
		await invalidate('supabase:auth');
		goto('/admin');
	}
</script>

<svelte:head><title>Admin · Sign in</title></svelte:head>

<main class="wrap">
	<form class="card" onsubmit={login}>
		<h1>Sign in</h1>
		<input type="email" placeholder="Email" bind:value={email} autocomplete="username" required />
		<input type="password" placeholder="Password" bind:value={password} autocomplete="current-password" required />
		{#if siteKey}<div class="turnstile" bind:this={turnstileEl}></div>{/if}
		{#if err}<p class="err">{err}</p>{/if}
		<button type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
	</form>
</main>

<style>
	.wrap {
		min-height: 100vh;
		display: grid;
		place-items: center;
		padding: 24px;
	}
	.card {
		width: 100%;
		max-width: 360px;
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 28px 24px;
		background: color-mix(in srgb, var(--text-primary) 4%, transparent);
		border: 1px solid color-mix(in srgb, var(--text-primary) 10%, transparent);
		border-radius: var(--radius);
	}
	h1 {
		margin: 0 0 6px;
		font-family: var(--font-ui);
		font-size: 22px;
		font-weight: normal;
		letter-spacing: -0.5px;
		color: var(--text-primary);
	}
	input {
		padding: 12px 14px;
		background: color-mix(in srgb, var(--text-primary) 6%, transparent);
		border: 1px solid color-mix(in srgb, var(--text-primary) 14%, transparent);
		border-radius: var(--radius);
		color: var(--text-primary);
		font-family: var(--font-ui);
		font-size: 15px;
	}
	input:focus {
		outline: none;
		border-color: var(--button-fill);
	}
	button {
		background: var(--button-fill);
		color: var(--chip-sel-label);
		border: none;
		border-radius: var(--radius);
		padding: 13px;
		font-family: var(--font-ui);
		font-size: 15px;
		cursor: pointer;
	}
	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.err {
		margin: 0;
		color: var(--invalid-stroke);
		font-size: 13px;
	}
	.turnstile {
		display: flex;
		justify-content: center;
	}
</style>
