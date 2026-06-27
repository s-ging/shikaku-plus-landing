<script>
	import BackToTop from '$lib/BackToTop.svelte';
</script>

<svelte:head>
	<title>Data Deletion — Shikaku+</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="legal-page">
<header class="topbar">
	<a class="wordmark" href="/">Shikaku+</a>
</header>

<main>
	<nav class="breadcrumb" aria-label="Breadcrumb">
		<a href="/">Home</a>
		<span class="breadcrumb-sep">›</span>
		<span class="breadcrumb-current">Data Deletion</span>
	</nav>

	<article class="doc">
		<h1>Deleting your Shikaku+ account</h1>

		<p class="lead">
			You can delete your Shikaku+ account and its data at any time. There are two ways to do it:
		</p>

		<h2>In the app</h2>
		<p>
			Go to <strong>Settings → Account → Delete account</strong> and confirm. This removes your
			account immediately.
		</p>

		<h2>By email</h2>
		<p>If you can't access the app, send us a deletion request:</p>

		<div class="contact-block">
			<a href="mailto:hello.shikaku.plus@gmail.com?subject=Data%20Deletion%20Request">
				hello.shikaku.plus@gmail.com
			</a>
			<p class="subject-line">Subject: <strong>Data Deletion Request</strong></p>
		</div>

		<p>
			Please include the email address or account identifier tied to your Shikaku+ account. If your
			account was created using Google or Discord sign-in, use the same email or identifier so we can
			locate the correct records.
		</p>

		<h2>What we permanently delete</h2>
		<p>When your account is deleted we permanently remove:</p>
		<ul>
			<li>Your account identity and sign-in methods (email, Google, Discord).</li>
			<li>Your display name and profile.</li>
			<li>Your saved puzzles and daily progress.</li>
			<li>Your individual gameplay history (the per-account event log).</li>
			<li>On-device data stored locally by the app.</li>
		</ul>

		<h2>What we retain, anonymized</h2>
		<p>
			We keep <strong>aggregate</strong> gameplay statistics — for example the total number of
			puzzles solved across all players — in a <strong>de-linked</strong> form that carries
			<strong>no user id</strong> and can no longer be tied to you or any account. This keeps
			community totals (such as the global counter on our homepage) accurate, and it does not
			identify you.
		</p>

		<h2>This is immediate and irreversible</h2>
		<p>
			Deletion takes effect immediately and cannot be undone. We may retain a minimal record of the
			deletion request itself where required for legal, security, or fraud-prevention purposes.
		</p>
	</article>

	<BackToTop />

	<footer class="footer">
		<a href="/privacy-policy">Privacy Policy</a>
		<span class="sep">·</span>
		<a href="/terms-of-service">Terms of Service</a>
	</footer>
</main>
</div>

<style>
	@import '$lib/legal.css';

	.contact-block {
		background: color-mix(in srgb, var(--cell) 40%, transparent);
		border-radius: var(--radius);
		padding: 20px 24px;
		margin: 0 0 24px;
	}
	.contact-block a {
		font-family: var(--font-brand);
		font-size: 18px;
		font-weight: 600;
		color: var(--button-fill);
		text-decoration: none;
		display: block;
		margin-bottom: 6px;
	}
	.contact-block a:hover {
		text-decoration: underline;
	}
	.subject-line {
		font-size: 13px;
		color: var(--text-secondary);
		margin: 0 !important;
		letter-spacing: -0.1px;
	}
	.subject-line strong {
		color: var(--text-primary);
	}
</style>
