<script>
	import BackToTop from '$lib/BackToTop.svelte';
</script>

<svelte:head>
	<title>Privacy Policy — Shikaku+</title>
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
		<span class="breadcrumb-current">Privacy Policy</span>
	</nav>

	<article class="doc">
		<h1>Privacy Policy</h1>

		<p class="lead">
			<strong>Shikaku+ / Shikaku Plus</strong> ("we," "us," or "our") operates the Shikaku Plus
			game, website, and related services.
		</p>
		<p class="lead">
			This Privacy Policy explains what information we collect, how we use it, how we store it, and
			your choices regarding that information. By using Shikaku+, you agree to the practices
			described below.
		</p>

		<h2>Who we are</h2>
		<p>
			Shikaku Plus is operated by an individual developer based in the Philippines.
		</p>
		<p>
			If you have questions about this Privacy Policy or your data, contact us at:<br />
			<a href="mailto:hello.shikaku.plus@gmail.com">hello.shikaku.plus@gmail.com</a>
		</p>

		<h2>Information we collect</h2>
		<p>We may collect the following information:</p>
		<ul>
			<li>Email address.</li>
			<li>Display name or username.</li>
			<li>
				OAuth account information from Meta, Google, or Discord, if you choose to sign in through
				those providers.
			</li>
			<li>Donation status and supporter status.</li>
			<li>Opt-in status for emails, supporter perks, updates, or related communications.</li>
			<li>Gameplay statistics and service usage information.</li>
			<li>
				Account security data managed by our authentication provider, including encrypted password
				information where applicable.
			</li>
		</ul>
		<p>
			We do not intentionally collect credit card numbers, debit card numbers, or bank account
			details through our website. If you make a crypto donation, the payment is handled through the
			external wallet or payment service you use, not by us directly.
		</p>

		<h2>How we use your information</h2>
		<p>We use your information to:</p>
		<ul>
			<li>Create and manage user accounts.</li>
			<li>Let you sign in through supported OAuth providers.</li>
			<li>Track donation status and supporter status.</li>
			<li>
				Connect donations to accounts when the same email address is used.
			</li>
			<li>Store opt-in choices.</li>
			<li>Record gameplay statistics, progress, and related service data.</li>
			<li>Improve the game, website, and community features.</li>
			<li>Send important service-related messages.</li>
		</ul>

		<h2>Donation linking</h2>
		<p>
			If you donate using an email address, we may use that email address to later connect your
			donation to a Shikaku+ account, supporter badge, or related perks. This is used to keep
			supporter status and account identity aligned.
		</p>

		<h2>Data storage and third parties</h2>
		<p>We may store data using third-party services such as Supabase and Google Sheets.</p>
		<p>We may also rely on third-party providers for:</p>
		<ul>
			<li>Authentication.</li>
			<li>Database and storage services.</li>
			<li>Email delivery.</li>
			<li>Website hosting.</li>
			<li>Crypto payment handling, if used.</li>
		</ul>
		<p>
			These providers may process information on our behalf under their own privacy terms.
		</p>

		<h2>Tracking and analytics</h2>
		<p>
			We do not use advertising pixels, retargeting pixels, or social media tracking pixels.
		</p>
		<p>
			We do not intentionally use Google Pixel, Meta Pixel, Facebook Pixel, or similar ad-tracking
			tools.
		</p>
		<p>
			We may use in-game analytics or internal service metrics to understand gameplay performance,
			account activity, and product usage, but we do not use third-party ad tracking for marketing
			surveillance.
		</p>

		<h2>Cookies and local storage</h2>
		<p>
			Our website may use essential cookies or local storage that are necessary for account login,
			session management, preferences, or service operation.
		</p>
		<p>
			If we use any analytics or functional storage in the future, we will update this policy to
			explain it clearly.
		</p>

		<h2>How we protect your data</h2>
		<p>
			We take reasonable technical and organizational measures to protect your information. However,
			no online system is completely secure, and we cannot guarantee absolute security.
		</p>

		<h2>Data retention</h2>
		<p>
			We keep personal data only as long as needed for the purposes described in this policy, unless
			a longer retention period is required by law or needed for legitimate service operations.
		</p>

		<h2>Deleting your account</h2>
		<p>
			You can delete your account at any time, either in the app (Settings → Account → Delete
			account) or by emailing us. When you do, we permanently remove your account identity, sign-in
			methods (email, Google, Discord), display name and profile, saved puzzles, daily progress, and
			your individual gameplay history, along with on-device data stored locally by the app. This is
			immediate and cannot be undone.
		</p>
		<p>
			We retain <strong>anonymized, aggregate</strong> statistics — for example the total number of
			puzzles solved across all players — in a de-linked form that carries no user id and can no
			longer be tied to you. This keeps community totals accurate without identifying you. See our
			<a href="/data-deletion">Data Deletion</a> page for full details.
		</p>

		<h2>Your rights</h2>
		<p>
			Depending on applicable law, including the Philippines Data Privacy Act, you may have rights
			to:
		</p>
		<ul>
			<li>Access your personal data.</li>
			<li>Correct inaccurate information.</li>
			<li>Request deletion of your data, subject to service and legal limits.</li>
			<li>Withdraw consent for optional processing.</li>
			<li>Ask questions about how your data is used.</li>
		</ul>

		<h2>Children's privacy</h2>
		<p>
			Shikaku+ is not intended for children under 13. If a younger user has provided personal data,
			contact us and we will handle it appropriately.
		</p>

		<h2>Changes to this policy</h2>
		<p>
			We may update this Privacy Policy from time to time. If we make material changes, we will post
			the updated version on this page with a new effective date.
		</p>

		<h2>Contact</h2>
		<p>
			For privacy requests, account questions, or supporter issues, contact:<br />
			<a href="mailto:hello.shikaku.plus@gmail.com">hello.shikaku.plus@gmail.com</a>
		</p>
	</article>

	<BackToTop />

	<footer class="footer">
		<a href="/terms-of-service">Terms of Service</a>
		<span class="sep">·</span>
		<a href="/data-deletion">Data Deletion</a>
	</footer>
</main>
</div>

<style>
	@import '$lib/legal.css';
</style>
