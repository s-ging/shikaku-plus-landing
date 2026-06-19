<script>
	import BackToTop from '$lib/BackToTop.svelte';
</script>

<svelte:head>
	<title>Data Deletion — Shikaku+</title>
	<meta name="robots" content="noindex" />
</svelte:head>

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
		<h1>Data Deletion</h1>

		<p class="lead">
			If you want us to delete the personal data associated with your Shikaku+ account, email us at:
		</p>

		<div class="contact-block">
			<a href="mailto:hello.shikaku.plus@gmail.com?subject=Data%20Deletion%20Request">
				hello.shikaku.plus@gmail.com
			</a>
			<p class="subject-line">Subject: <strong>Data Deletion Request</strong></p>
		</div>

		<p>
			Please include the email address or account identifier tied to your Shikaku+ account.
		</p>

		<h2>What happens next</h2>
		<p>
			After we receive your request, we will verify it and delete or anonymize the personal data we
			store for that account, subject to any legal, security, or operational requirements that
			require us to retain certain records.
		</p>

		<h2>What we may retain</h2>
		<p>We may retain limited information needed for:</p>
		<ul>
			<li>Fraud prevention.</li>
			<li>Security.</li>
			<li>Dispute resolution.</li>
			<li>Legal compliance.</li>
			<li>Accounting or audit purposes.</li>
		</ul>

		<h2>OAuth accounts</h2>
		<p>
			If your account was created using Facebook, Google, or Discord sign-in, we may need the same
			email address or identifier used on that account to locate the correct records.
		</p>

		<h2>Questions before requesting</h2>
		<p>
			If you want to ask about what data we store before requesting deletion, contact us at:<br />
			<a href="mailto:hello.shikaku.plus@gmail.com">hello.shikaku.plus@gmail.com</a>
		</p>
	</article>

	<BackToTop />

	<footer class="footer">
		<a href="/privacy-policy">Privacy Policy</a>
		<span class="sep">·</span>
		<a href="/terms-of-service">Terms of Service</a>
	</footer>
</main>

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
