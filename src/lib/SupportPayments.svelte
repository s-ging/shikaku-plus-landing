<script>
	// SupportPayments.svelte — accordion of payment methods + an email-capture
	// modal that runs before we send a supporter off to a payment provider, so
	// we have a record of who paid (for handing out the foundation badges).
	import { slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import visaLogo       from '$lib/assets/payment-methods/Visa.png';
	import mastercardLogo from '$lib/assets/payment-methods/Mastercard.png';
	import wiseLogo       from '$lib/assets/payment-methods/Wise.png';
	import paypalLogo     from '$lib/assets/payment-methods/Paypal.png';
	import qrphLogo       from '$lib/assets/payment-methods/QRPh.png';

	// ─── Where supporter emails go ───────────────────────────────────────────
	// Paste an endpoint that accepts a POST { email, method } — e.g. a Google
	// Apps Script web app, a Formspree form, or a Zapier/Make webhook. Empty =
	// no recording (the modal still shows and the supporter still gets through).
	const EMAIL_ENDPOINT = '';

	// Redirect methods: clicking "Continue" pops the email modal, then opens the
	// provider in a new tab so the landing page (and live total) stays put.
	const REDIRECT_METHODS = [
		{
			id: 'card',
			label: 'Card / Wise',
			url: 'https://wise.com/pay/me/krischanb',
			note: 'Pay with Visa, Mastercard, or your Wise balance.',
			logos: [
				{ src: visaLogo, alt: 'Visa' },
				{ src: mastercardLogo, alt: 'Mastercard' },
				{ src: wiseLogo, alt: 'Wise' }
			]
		},
		{
			id: 'paypal',
			label: 'PayPal',
			url: 'https://paypal.me/kbalasbas',
			note: 'Pay with your PayPal balance, card, or bank.',
			logos: [{ src: paypalLogo, alt: 'PayPal' }]
		},
		{
			id: 'qrph',
			label: 'QR Ph',
			url: 'https://paymongo.page/l/shikaku-plus',
			note: 'Scan to pay with GCash, Maya, or any QR Ph bank.',
			logos: [{ src: qrphLogo, alt: 'QR Ph' }]
		}
	];

	let expanded = $state(false);                                // payment methods revealed?
	let openId = $state(/** @type {string | null} */ (null));   // which accordion panel is open
	let pending = $state(/** @type {{ label: string, url: string } | null} */ (null)); // email modal target
	let email = $state('');

	const emailValid = $derived(/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim()));

	function toggle(/** @type {string} */ id) {
		openId = openId === id ? null : id;
	}

	function recordEmail(/** @type {string} */ value, /** @type {string} */ method) {
		if (!EMAIL_ENDPOINT || !value) return;
		const payload = JSON.stringify({ email: value, method, ts: Date.now() });
		try {
			if (navigator.sendBeacon) {
				navigator.sendBeacon(EMAIL_ENDPOINT, new Blob([payload], { type: 'application/json' }));
			} else {
				fetch(EMAIL_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true });
			}
		} catch {
			/* best-effort — never block the supporter */
		}
	}

	function go(/** @type {boolean} */ withEmail) {
		if (!pending) return;
		if (withEmail) recordEmail(email.trim(), pending.label);
		window.open(pending.url, '_blank', 'noopener');
		pending = null;
		email = '';
	}
</script>

<div class="pay">
	{#if !expanded}
		<button class="support-btn" onclick={() => (expanded = true)}>Support the project</button>
	{:else}
	<div class="reveal" transition:slide={{ duration: 320, easing: cubicOut }}>
	<h3 class="pay-heading">Choose a payment method</h3>

	<ul class="methods">
		{#each REDIRECT_METHODS as m (m.id)}
			<li class="method" class:open={openId === m.id}>
				<button class="method-head" aria-expanded={openId === m.id} onclick={() => toggle(m.id)}>
					<span class="logos">
						{#each m.logos as logo}
							<img src={logo.src} alt={logo.alt} />
						{/each}
					</span>
					<span class="method-label">{m.label}</span>
					<span class="chevron" aria-hidden="true">›</span>
				</button>
				{#if openId === m.id}
					<div class="panel" transition:slide={{ duration: 260, easing: cubicOut }}>
						<p class="panel-note">{m.note}</p>
						<button class="go-btn" onclick={() => (pending = { label: m.label, url: m.url })}>
							Continue to {m.label}
						</button>
					</div>
				{/if}
			</li>
		{/each}
	</ul>
	</div>
	{/if}
</div>

<!-- Email-capture modal, shown before redirecting to a provider -->
{#if pending}
	<div class="modal-scrim" role="dialog" aria-modal="true" aria-label="Tell us who you are">
		<div class="modal">
			<button class="modal-close" aria-label="Cancel" onclick={() => (pending = null)}>×</button>
			<h3 class="modal-title">Before you go</h3>
			<p class="modal-sub">Drop your email so we can match your support to your foundation badge. Then we'll send you to {pending.label}.</p>
			<input
				class="modal-input"
				type="email"
				placeholder="you@example.com"
				bind:value={email}
				onkeydown={(e) => e.key === 'Enter' && emailValid && go(true)}
			/>
			<button class="go-btn" disabled={!emailValid} onclick={() => go(true)}>
				Continue to {pending.label}
			</button>
			<button class="skip-btn" onclick={() => go(false)}>Continue without email</button>
		</div>
	</div>
{/if}

<style>
	.pay {
		margin-top: 24px;
	}

	.support-btn {
		background: var(--button-fill);
		color: var(--chip-sel-label);
		border: none;
		border-radius: var(--radius);
		padding: 14px 22px;
		font-family: var(--font-ui);
		font-size: 15px;
		letter-spacing: -0.3px;
		cursor: pointer;
		width: 100%;
		transition: filter 120ms ease, transform 80ms ease;
	}
	.support-btn:hover { filter: brightness(1.06); }
	.support-btn:active { transform: translateY(1px); }
	.pay-heading {
		font-family: var(--font-ui);
		font-size: 15px;
		font-weight: normal;
		letter-spacing: -0.3px;
		color: var(--text-primary);
		margin: 0 0 12px;
	}

	.methods {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.method {
		border: 1px solid color-mix(in srgb, var(--text-primary) 10%, transparent);
		border-radius: var(--radius);
		background: color-mix(in srgb, var(--text-primary) 4%, transparent);
		overflow: hidden;
	}
	.method-head {
		display: flex;
		align-items: center;
		gap: 12px;
		width: 100%;
		padding: 12px 14px;
		background: none;
		border: none;
		cursor: pointer;
		color: var(--text-primary);
		font-family: var(--font-ui);
		text-align: left;
	}
	.logos {
		display: flex;
		align-items: center;
		gap: 6px;
		flex-shrink: 0;
	}
	.logos img {
		height: 22px;
		width: auto;
		display: block;
		border-radius: 3px;
	}
	.method-label {
		flex: 1;
		font-size: 14px;
		letter-spacing: -0.2px;
	}
	.chevron {
		font-size: 20px;
		line-height: 1;
		color: var(--text-secondary);
		transition: transform 160ms ease;
	}
	.method.open .chevron {
		transform: rotate(90deg);
	}

	.panel {
		padding: 0 14px 14px;
	}
	.panel-note {
		margin: 0 0 12px;
		font-size: 13px;
		color: var(--text-secondary);
		letter-spacing: -0.2px;
		line-height: 1.5;
	}

	.go-btn {
		background: var(--button-fill);
		color: var(--chip-sel-label);
		border: none;
		border-radius: var(--radius);
		padding: 12px 18px;
		font-family: var(--font-ui);
		font-size: 14px;
		letter-spacing: -0.3px;
		cursor: pointer;
		width: 100%;
		transition: filter 120ms ease, transform 80ms ease;
	}
	.go-btn:hover { filter: brightness(1.06); }
	.go-btn:active { transform: translateY(1px); }
	.go-btn:disabled { opacity: 0.45; cursor: not-allowed; }

	/* —— Email modal —— */
	.modal-scrim {
		position: fixed;
		inset: 0;
		z-index: 2000;
		display: grid;
		place-items: center;
		padding: 24px;
		background: rgba(0, 0, 0, 0.6);
		animation: fade 180ms ease both;
	}
	@keyframes fade { from { opacity: 0; } to { opacity: 1; } }
	.modal {
		position: relative;
		width: 100%;
		max-width: 380px;
		background: var(--bg);
		border: 1px solid color-mix(in srgb, var(--text-primary) 12%, transparent);
		border-radius: var(--radius);
		padding: 28px 24px 22px;
	}
	.modal-close {
		position: absolute;
		top: 8px;
		right: 12px;
		background: none;
		border: none;
		color: var(--text-secondary);
		font-size: 24px;
		line-height: 1;
		cursor: pointer;
		padding: 4px;
	}
	.modal-close:hover { color: var(--text-primary); }
	.modal-title {
		font-family: var(--font-ui);
		font-size: 22px;
		font-weight: normal;
		letter-spacing: -0.6px;
		color: var(--text-primary);
		margin: 0 0 8px;
	}
	.modal-sub {
		font-size: 13px;
		color: var(--text-secondary);
		letter-spacing: -0.2px;
		line-height: 1.5;
		margin: 0 0 16px;
	}
	.modal-input {
		width: 100%;
		padding: 12px 14px;
		margin-bottom: 14px;
		background: color-mix(in srgb, var(--text-primary) 6%, transparent);
		border: 1px solid color-mix(in srgb, var(--text-primary) 14%, transparent);
		border-radius: var(--radius);
		color: var(--text-primary);
		font-family: var(--font-ui);
		font-size: 15px;
		letter-spacing: -0.2px;
	}
	.modal-input:focus {
		outline: none;
		border-color: var(--button-fill);
	}
	.skip-btn {
		display: block;
		margin: 12px auto 0;
		background: none;
		border: none;
		color: var(--text-secondary);
		font-family: var(--font-ui);
		font-size: 13px;
		letter-spacing: -0.2px;
		cursor: pointer;
		text-decoration: underline;
	}
	.skip-btn:hover { color: var(--text-primary); }
</style>
