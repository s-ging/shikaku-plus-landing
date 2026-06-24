<script>
	import { goto, invalidate } from '$app/navigation';

	let { data } = $props();
	let email = $state('');
	let password = $state('');
	let err = $state('');
	let busy = $state(false);

	async function login(/** @type {SubmitEvent} */ e) {
		e.preventDefault();
		if (!data.supabase) {
			err = 'Supabase is not configured.';
			return;
		}
		busy = true;
		err = '';
		const { error } = await data.supabase.auth.signInWithPassword({ email, password });
		busy = false;
		if (error) {
			err = error.message;
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
		color: #e88;
		font-size: 13px;
	}
</style>
