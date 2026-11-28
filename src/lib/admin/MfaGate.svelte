<script>
	// Second factor for the admin pages. The database refuses every admin
	// function unless the session is aal2 (app migration 56, is_admin()), so
	// this screen only gets the session there: set up an authenticator app
	// once, then type its 6-digit code each sign-in.
	import { onMount } from 'svelte';

	/** @type {{ supabase: import('@supabase/supabase-js').SupabaseClient, children: import('svelte').Snippet, onverified?: () => void }} */
	let { supabase, children, onverified } = $props();

	/** @type {'loading' | 'verify' | 'enroll' | 'ok' | 'error'} */
	let step = $state('loading');
	let factorId = $state('');
	let qr = $state('');
	let secret = $state('');
	let code = $state('');
	let err = $state('');
	let busy = $state(false);

	async function check() {
		err = '';
		const { data: aal, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
		if (error) {
			step = 'error';
			err = error.message;
			return;
		}
		if (aal.currentLevel === 'aal2') {
			step = 'ok';
			onverified?.();
			return;
		}
		const { data: factors, error: listErr } = await supabase.auth.mfa.listFactors();
		if (listErr) {
			step = 'error';
			err = listErr.message;
			return;
		}
		const verified = factors.totp.find((f) => f.status === 'verified');
		if (verified) {
			factorId = verified.id;
			step = 'verify';
			return;
		}
		// A setup that was started and never finished can't be reused: start again.
		for (const f of factors.all.filter((f) => f.status !== 'verified')) {
			await supabase.auth.mfa.unenroll({ factorId: f.id });
		}
		const { data: enrolled, error: enrollErr } = await supabase.auth.mfa.enroll({
			factorType: 'totp',
			friendlyName: 'Shikaku+ admin'
		});
		if (enrollErr) {
			step = 'error';
			err = enrollErr.message;
			return;
		}
		factorId = enrolled.id;
		qr = enrolled.totp.qr_code;
		secret = enrolled.totp.secret;
		step = 'enroll';
	}

	async function submit(/** @type {SubmitEvent} */ e) {
		e.preventDefault();
		busy = true;
		err = '';
		const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code: code.trim() });
		busy = false;
		if (error) {
			err = 'That code didn’t work. Check the time on your phone and try the newest code.';
			code = '';
			return;
		}
		code = '';
		await check();
	}

	onMount(check);
</script>

{#if step === 'ok'}
	{@render children()}
{:else}
	<main class="gate">
		{#if step === 'loading'}
			<p class="muted">Checking your sign-in...</p>
		{:else if step === 'error'}
			<p class="err">{err}</p>
			<button class="btn" onclick={check}>Try again</button>
		{:else}
			<form class="card" onsubmit={submit}>
				{#if step === 'enroll'}
					<h1>Set up your second factor</h1>
					<p class="muted">
						Scan this with an authenticator app (Google Authenticator, 1Password, Aegis...), then type the
						6-digit code it shows. You do this once.
					</p>
					{#if qr}<img class="qr" src={qr} alt="QR code for your authenticator app" width="180" height="180" />{/if}
					<p class="muted small">Can't scan? Enter this key by hand: <code>{secret}</code></p>
				{:else}
					<h1>Enter your code</h1>
					<p class="muted">Admin changes need the 6-digit code from your authenticator app.</p>
				{/if}
				<input
					id="mfa-code"
					inputmode="numeric"
					autocomplete="one-time-code"
					pattern={'[0-9]{6}'}
					maxlength="6"
					placeholder="123456"
					bind:value={code}
					required
				/>
				{#if err}<p class="err">{err}</p>{/if}
				<button class="btn primary" type="submit" disabled={busy || code.trim().length !== 6}>
					{busy ? 'Checking...' : 'Continue'}
				</button>
			</form>
		{/if}
	</main>
{/if}

<style>
	.gate {
		display: grid;
		place-items: center;
		padding: 64px 20px;
		gap: 12px;
	}
	.card {
		display: grid;
		gap: 12px;
		width: min(380px, 100%);
		padding: 24px;
		border-radius: var(--radius);
		background: color-mix(in srgb, var(--text-primary) 4%, transparent);
		border: 1px solid color-mix(in srgb, var(--text-primary) 8%, transparent);
		box-sizing: border-box;
	}
	.card > * {
		box-sizing: border-box;
		min-width: 0;
		max-width: 100%;
	}
	h1 {
		margin: 0;
		font-family: var(--font-ui);
		font-size: 20px;
		font-weight: normal;
		color: var(--text-primary);
	}
	.muted {
		margin: 0;
		color: var(--text-secondary);
		font-size: 14px;
	}
	.small {
		font-size: 12px;
		overflow-wrap: anywhere;
	}
	.qr {
		background: #fff;
		padding: 8px;
		border-radius: var(--radius);
		justify-self: center;
	}
	input {
		font-family: var(--font-ui);
		font-size: 22px;
		letter-spacing: 0.3em;
		text-align: center;
		padding: 10px;
		border-radius: var(--radius);
		border: 1px solid color-mix(in srgb, var(--text-primary) 20%, transparent);
		background: var(--bg);
		color: var(--text-primary);
	}
	.err {
		margin: 0;
		color: var(--invalid-stroke);
		font-size: 13px;
	}
	.btn {
		padding: 10px 16px;
		border-radius: var(--radius);
		font-size: 14px;
		border: 1px solid color-mix(in srgb, var(--text-primary) 15%, transparent);
		background: none;
		color: var(--text-primary);
		cursor: pointer;
		font-family: var(--font-ui);
	}
	.btn.primary {
		background: var(--button-fill);
		color: var(--chip-sel-label);
		border-color: var(--button-fill);
	}
	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
