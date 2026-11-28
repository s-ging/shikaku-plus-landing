<script>
	// HomeBento.svelte: everything below the hero on shikaku.plus, from Kris's
	// "Shikaku+ homepage rethink" design (2026-11, bento layout). Every word comes
	// from src/lib/copy/home.txt, which Kris edits; this file is only structure.
	import copyText from '$lib/copy/home.txt?raw';
	import { parseCopy, inline, blocks, pair, pairs, faqPairs } from '$lib/copy/parse.js';
	import { PLAY_STORE_URL } from '$lib/jsonld.js';
	import { lazyVideo } from '$lib/lazyVideo.js';
	import tier1 from '$lib/assets/foundation-badges/f-tier-1.svg?raw';
	import tier2 from '$lib/assets/foundation-badges/f-tier-2.svg?raw';
	import tier3 from '$lib/assets/foundation-badges/f-tier-3.svg?raw';
	import tier4 from '$lib/assets/foundation-badges/f-tier-4.svg?raw';
	// The app's own mode icons (assets/images/gamemode-icons in the app repo).
	import zenIcon from '$lib/assets/mode-icons/zen.svg?raw';
	import timeAttackIcon from '$lib/assets/mode-icons/time-attack.svg?raw';
	import blitzIcon from '$lib/assets/mode-icons/blitz.svg?raw';
	import tekazuIcon from '$lib/assets/mode-icons/tekazu.svg?raw';
	import { jsonLd } from '$lib/jsonld.js';

	/** @type {{ posts?: { title: string, slug: string, excerpt?: string | null, created_at: string, post_type?: string | null }[] }} */
	let { posts = [] } = $props();

	const PLAY_URL = 'https://play.shikaku.plus';
	const TYPE_LABEL = /** @type {Record<string, string>} */ ({
		announcement: 'Announcement',
		patch_notes: 'Patch notes',
		blog: 'Blog'
	});
	const dateOf = (/** @type {string} */ iso) =>
		new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'Asia/Manila' });
	const TRAILER_URL = 'https://www.youtube.com/watch?v=hgGbH0npVNM';

	const c = parseCopy(copyText);
	const t = (/** @type {string} */ k, fallback = '') => c[k] || fallback;
	/** A one-line string with links, as HTML. */
	const line = (/** @type {string} */ k, fallback = '') => inline(t(k, fallback));
	/** Paragraphs and bullets, as HTML. */
	const para = (/** @type {string} */ k) => blocks(t(k));

	// As many roadmap items as home.txt has ([roadmap.1.title], [roadmap.2.title] …).
	const roadmap = [1, 2, 3, 4, 5, 6, 7, 8, 9]
		.map((i) => ({
			status: t(`roadmap.${i}.status`, 'planned').toLowerCase(),
			label: t(`roadmap.${i}.label`),
			title: t(`roadmap.${i}.title`),
			body: t(`roadmap.${i}.body`)
		}))
		.filter((r) => r.title);

	// Clips: home.txt gives a path without extension, e.g. /media/help-me
	// (files /media/help-me.webm, .mp4 and .jpg in static/). Empty = placeholder.
	const helpVideo = t('help.video');
	const vsVideo = t('vs.video');

	const modes = [
		{ key: 'modes.zen', cls: 'zen', icon: zenIcon },
		{ key: 'modes.time_attack', cls: 'ta', icon: timeAttackIcon },
		{ key: 'modes.blitz', cls: 'blitz', icon: blitzIcon },
		{ key: 'modes.tekazu', cls: 'tekazu', icon: tekazuIcon }
	]
		.map((m) => ({ ...m, parts: pair(t(m.key)) }))
		.filter((m) => m.parts[0]);

	const vsModes = ['vs.standard', 'vs.knockout'].map((k) => pair(t(k))).filter(([n]) => n);
	const goals = pairs(t('foundation.goals'));
	const tiers = [tier1, tier2, tier3, tier4].map((svg, i) => ({
		svg,
		name: `Foundation ${'★'.repeat(i + 1)}`,
		note: t(`foundation.tier.${i + 1}`)
	}));
	const faq = faqPairs(t('faq'));
	const faqHalf = Math.ceil(faq.length / 2);
	/** Open questions, by index. Several can be open at once. */
	let openFaq = $state(/** @type {Set<number>} */ (new Set()));
	function toggleFaq(/** @type {number} */ i) {
		const next = new Set(openFaq);
		if (next.has(i)) next.delete(i);
		else next.add(i);
		openFaq = next;
	}
	// The questions as structured data, for search engines and AI answers.
	const faqData = faq.length
		? jsonLd({
				'@context': 'https://schema.org',
				'@type': 'FAQPage',
				mainEntity: faq.map((p) => ({
					'@type': 'Question',
					name: p.q,
					acceptedAnswer: { '@type': 'Answer', text: p.a.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') }
				}))
			})
		: '';
</script>

<svelte:head>
	{#if faqData}{@html faqData}{/if}
</svelte:head>

<div class="bento">
	<!-- Changelog: the four newest blog posts; home.txt's words when there are none
	     (preview builds have no Supabase). -->
	<section class="card span-6">
		<div class="row">
			<h2 class="h2">{t('changelog.title', 'Changelog')}</h2>
			{#if t('changelog.badge')}<span class="pill pill-gold">{t('changelog.badge')}</span>{/if}
			{#if !posts.length}<span class="muted small push">{t('changelog.date')}</span>{/if}
		</div>
		{#if posts.length}
			<div class="posts">
				{#each posts as post (post.slug)}
					<a class="post" href="/blog/{post.slug}">
						<span class="post-meta">
							<span class="post-type {post.post_type ?? 'blog'}">{TYPE_LABEL[post.post_type ?? 'blog'] ?? 'Blog'}</span>
							<span class="muted xsmall">{dateOf(post.created_at)}</span>
						</span>
						<span class="post-title">{post.title}</span>
						{#if post.excerpt}<span class="post-excerpt">{post.excerpt}</span>{/if}
					</a>
				{/each}
			</div>
		{:else}
			<div class="split-2">
				<div class="col">
					<h3 class="h3 violet">{t('changelog.left.title')}</h3>
					<div class="body">{@html para('changelog.left.points')}</div>
				</div>
				<div class="col">
					<h3 class="h3 gold">{t('changelog.right.title')}</h3>
					<div class="body">{@html para('changelog.right.points')}</div>
				</div>
			</div>
		{/if}
		{#if t('changelog.more')}<p class="more">{@html line('changelog.more')}</p>{/if}
	</section>

	<!-- Where it's at -->
	<section class="card span-6">
		<h2 class="h2">{t('roadmap.title', 'Where it’s at')}</h2>
		{#each roadmap as r (r.title)}
			<div class="stack-3">
				<span><span class="pill pill-{r.status}">{r.label}</span></span>
				<span class="item-title">{@html inline(r.title)}</span>
				<span class="muted">{@html inline(r.body)}</span>
			</div>
		{/each}
	</section>

	<!-- Help Me! -->
	<section id="help" class="card span-7">
		<h2 class="h2">{t('help.title')}</h2>
		<div class="body">{@html para('help.body')}</div>
		{#if helpVideo}
			<!-- svelte-ignore a11y_media_has_caption -->
			<video class="clip" use:lazyVideo={helpVideo} poster="{helpVideo}.jpg" muted loop playsinline aria-label={t('help.video.label', 'Help Me! in action')}></video>
		{:else}
			<div class="placeholder clip-placeholder"><span class="muted">{t('help.video.placeholder', '[Help Me! clip]')}</span></div>
		{/if}
		{#if t('help.button')}<a class="btn btn-gold self-start" href={PLAY_URL}>{t('help.button')}</a>{/if}
	</section>

	<!-- Modes -->
	<section id="modes" class="card span-5">
		<h2 class="h2">{t('modes.title', 'Modes')}</h2>
		<div class="modes">
			{#each modes as m (m.key)}
				<a class="mode {m.cls}" href={PLAY_URL}>
					<span class="mode-icon" aria-hidden="true">{@html m.icon}</span>
					<span class="mode-name">{m.parts[0]}</span>
					<span class="mode-sub">{m.parts[1]}</span>
				</a>
			{/each}
		</div>
		<p class="muted small">{t('modes.note')}</p>
	</section>

	<!-- VS -->
	<section id="vs" class="card span-12 vs-card">
		<div class="split-12">
			<div class="col vs-left">
				{#if t('vs.badge')}<span><span class="pill pill-violet">{t('vs.badge')}</span></span>{/if}
				<h2 class="vs-mark">
					<span class="sr-only">Shikaku+ VS</span>
					<svg aria-hidden="true" width="222" height="42" viewBox="0 0 111 21" fill="none"><path d="M64.4375 0C66.1792 2.86275e-05 67.6336 0.23336 68.8008 0.700195C69.968 1.16709 71.0999 1.95694 72.1953 3.07031L69.4805 4.87109V4.88672H67.1338V4.87109L67.1279 4.875C66.2441 3.73048 65.0326 3.04818 63.4941 2.82715C62.9681 2.90493 62.5283 3.03963 62.1748 3.23242C61.6003 3.55557 61.2142 3.91464 61.0166 4.30957C60.837 4.70464 60.7471 5.05507 60.7471 5.36035C60.7471 6.00682 60.9982 6.52779 61.501 6.92285C62.0038 7.31791 62.7496 7.67677 63.7373 8C63.8286 8.03633 64.5195 8.24357 65.8105 8.62012C66.6186 8.83561 67.4544 9.07732 68.3164 9.34668C70.2017 9.97514 71.4584 10.7746 72.0869 11.7441C72.7334 12.7138 73.0566 13.648 73.0566 14.5459C73.0566 15.5155 72.8233 16.4405 72.3564 17.3203C71.9075 18.2001 71.1082 18.9367 69.959 19.5293C68.8277 20.1038 67.2918 20.3906 65.3525 20.3906C65.1457 20.3906 64.9426 20.386 64.7432 20.3799V20.3848H63.3105C63.2104 20.3864 63.1092 20.3906 63.0068 20.3906C62.8465 20.3906 62.6881 20.3884 62.5322 20.3848H62.3965V20.3799C60.2764 20.3149 58.576 19.9063 57.2959 19.1514C55.9136 18.3075 54.9172 17.2933 54.3066 16.1084L56.752 14.2529V14.249H59.0977V14.2529L59.1035 14.249C60.0776 16.228 61.7843 17.3528 64.2227 17.6279C64.9925 17.5314 65.6736 17.3317 66.2656 17.0234C67.1455 16.5745 67.5859 15.8567 67.5859 14.8691C67.5859 14.1329 67.3348 13.5576 66.832 13.1445C66.3473 12.7316 65.5927 12.3642 64.5693 12.041C63.6357 11.7538 63.0519 11.5822 62.8184 11.5283C61.274 11.0794 60.1599 10.7299 59.4775 10.4785C57.7538 9.83207 56.6133 9.08614 56.0566 8.24219C55.7409 7.76345 55.5175 7.27236 55.3809 6.77051C55.2705 8.13453 54.8325 9.20875 54.0635 9.99316C53.1657 10.891 51.9717 11.4569 50.4814 11.6904L56.1377 20.0674H50.2891L44.875 11.8252H42.0498V20.0674H36.7676V0.323242H49.1611C50.9926 0.323247 52.492 0.790017 53.6592 1.72363C54.5545 2.4261 55.1049 3.44081 55.3135 4.7666C55.4211 4.25931 55.6242 3.73009 55.9229 3.17871C56.4077 2.29885 57.1611 1.55291 58.1846 0.942383C59.2261 0.313868 60.5285 1.02311e-06 62.0908 0C62.1494 0 62.2077 0.00240132 62.2656 0.00292969H64.2197C64.2916 0.00155523 64.3644 0 64.4375 0ZM78.3984 0.323242V12.6875C78.3985 14.1059 78.748 15.3 79.4482 16.2695C80.008 17.0253 80.9283 17.4846 82.208 17.6514C83.4877 17.4846 84.408 17.0253 84.9678 16.2695C85.6859 15.3 86.0448 14.1059 86.0449 12.6875V0.323242H91.4355V12.9297C91.4355 14.3842 91.1385 15.6773 90.5459 16.8086C89.9713 17.9218 89.0735 18.8018 87.8525 19.4482C86.6494 20.0767 85.1586 20.3906 83.3809 20.3906C82.9749 20.3906 82.584 20.3726 82.208 20.3398C81.832 20.3726 81.4411 20.3906 81.0352 20.3906C79.2574 20.3906 77.7666 20.0767 76.5635 19.4482C75.3605 18.8018 74.4627 17.9218 73.8701 16.8086C73.2955 15.6773 73.0078 14.3842 73.0078 12.9297V0.323242H78.3984ZM101.596 0C103.337 3.40795e-06 104.792 0.2334 105.959 0.700195C107.126 1.16707 108.258 1.95701 109.354 3.07031L106.633 4.875C106.629 4.86969 106.624 4.86467 106.62 4.85938V4.88672H104.274V4.86035C103.392 3.72501 102.185 3.04732 100.653 2.82715C100.127 2.90492 99.6867 3.03949 99.333 3.23242C98.7585 3.55559 98.3724 3.9146 98.1748 4.30957C97.9952 4.70464 97.9053 5.05507 97.9053 5.36035C97.9053 6.00675 98.1565 6.5278 98.6592 6.92285C99.162 7.31792 99.9078 7.67676 100.896 8C100.986 8.03606 101.677 8.24319 102.97 8.62012C103.778 8.83558 104.613 9.07736 105.475 9.34668C107.36 9.97513 108.617 10.7746 109.245 11.7441C109.892 12.7138 110.215 13.648 110.215 14.5459C110.215 15.5155 109.981 16.4405 109.515 17.3203C109.066 18.2001 108.266 18.9368 107.117 19.5293C105.986 20.1037 104.451 20.3906 102.512 20.3906C102.298 20.3906 102.088 20.3854 101.883 20.3789V20.3848H100.469C100.369 20.3864 100.267 20.3906 100.165 20.3906C100.005 20.3906 99.8464 20.3884 99.6904 20.3848H99.5371V20.3789C97.4255 20.3122 95.7316 19.9041 94.4551 19.1514C93.0725 18.3075 92.0754 17.2934 91.4648 16.1084L93.8926 14.2666V14.249H96.2383V14.2666L96.2627 14.249C97.2368 16.2282 98.9431 17.3529 101.382 17.6279C102.151 17.5313 102.833 17.3317 103.425 17.0234C104.304 16.5745 104.744 15.8565 104.744 14.8691C104.744 14.1329 104.493 13.5576 103.99 13.1445C103.505 12.7316 102.751 12.3642 101.728 12.041C100.794 11.7537 100.21 11.5822 99.9766 11.5283C98.4325 11.0795 97.3191 10.7299 96.6367 10.4785C94.9128 9.83204 93.7725 9.08619 93.2158 8.24219C92.6592 7.39822 92.3809 6.51833 92.3809 5.60254C92.3809 4.84841 92.6142 4.04055 93.0811 3.17871C93.5659 2.29879 94.3202 1.55294 95.3438 0.942383C96.3852 0.314039 97.687 3.88717e-05 99.249 0C99.3075 0 99.366 0.00240303 99.4238 0.00292969H101.378C101.45 0.00155163 101.523 0 101.596 0ZM10.0615 12.7441L14.6533 0.323242H36.6133V2.90918H24.1152V8.53906H31.9805V11.125H24.1152V17.4814H36.6133V20.0674H18.833V3.78906L12.7705 20.0674H7.35352L0 0.323242H5.4707L10.0615 12.7441ZM42.0498 9.21191H45.1445C46.15 9.21191 46.985 9.15849 47.6494 9.05078C48.3318 8.94304 48.9071 8.65537 49.374 8.18848C49.8587 7.72158 50.1006 7.01213 50.1006 6.06055C50.1006 5.10894 49.8588 4.39949 49.374 3.93262C48.9071 3.46572 48.3318 3.17806 47.6494 3.07031C47.1512 2.98955 46.5571 2.93915 45.8672 2.91895L45.1445 2.90918H42.0498V9.21191Z" fill="#A090C0"/></svg>
				</h2>
				<div class="body big">{@html para('vs.body')}</div>
				<div class="vs-modes">
					{#each vsModes as [name, sub] (name)}
						<div class="vs-mode">
							<span class="item-title small-title">{name}</span>
							<span class="muted small">{sub}</span>
						</div>
					{/each}
				</div>
				{#if t('vs.plates')}<div class="placeholder violet-dash"><span class="muted">{t('vs.plates')}</span></div>{/if}
				<div class="row wrap">
					<!-- Play VS opens the main app; Learn goes to the how-to-play post (Kris, 2026-11-28). -->
					<a class="btn btn-violet" href={PLAY_URL}>{t('vs.play', 'Play VS')}</a>
					<a class="btn btn-dark" href="/blog/how-to-play-shikaku-plus-versus">{t('vs.learn', 'Learn how VS works')}</a>
				</div>
			</div>
			<div class="vs-right">
				{#if vsVideo}
					<!-- svelte-ignore a11y_media_has_caption -->
					<video class="clip" use:lazyVideo={vsVideo} poster="{vsVideo}.jpg" muted loop playsinline aria-label={t('vs.video.label', 'A Shikaku+ VS match')}></video>
				{:else}
					<div class="placeholder clip-placeholder violet-dash"><span class="muted">{t('vs.video.placeholder', '[VS clip]')}</span></div>
				{/if}
				{#if t('vs.video.title')}<a class="trailer-link" href={TRAILER_URL}>{t('vs.video.title')}</a>{/if}
			</div>
		</div>
	</section>

	<!-- Foundation (hidden unless home.txt says [foundation.show] yes) -->
	{#if t('foundation.show', 'no').toLowerCase() === 'yes'}
	<section id="foundation" class="card span-12 foundation split-12">
		<div class="col f-left">
			<div class="row wrap">
				{#if t('foundation.badge')}<span class="pill pill-gold">{t('foundation.badge')}</span>{/if}
				<span class="muted small">{t('foundation.dates')}</span>
			</div>
			<h2 class="h2 f-title">{t('foundation.title')}</h2>
			<div class="body big">{@html para('foundation.body')}</div>
			<div class="stack-8">
				<div class="row baseline">
					<span class="raised">{t('foundation.raised')}</span>
					<span class="muted small">{t('foundation.goal')}</span>
				</div>
				<div class="track"><div class="fill" style="width: 0%"></div></div>
			</div>
			{#if goals.length}
				<div class="goals">
					{#each goals as [amt, what] (amt + what)}
						<span class="muted">{amt}</span><span class="muted">{what}</span>
					{/each}
				</div>
			{/if}
			<div class="row wrap">
				<a class="btn btn-gold btn-lg" href="/support">{t('foundation.button', 'Support the project')}</a>
				<span class="muted small">{t('foundation.methods')}</span>
			</div>
		</div>
		<div class="col f-right">
			<div class="countdown">
				<span class="muted small">{t('foundation.countdown.label')}</span>
				<span class="countdown-value">{t('foundation.countdown')}</span>
			</div>
			<h3 class="h3">{t('foundation.rewards.title')}</h3>
			<div class="body">{@html para('foundation.rewards.body')}</div>
			<div class="stack-12">
				{#each tiers as tier (tier.name)}
					<div class="row">
						<span class="tier-icon" aria-hidden="true">{@html tier.svg}</span>
						<span class="tier-text"><span class="tier-name">{tier.name}</span><span class="muted xsmall">{tier.note}</span></span>
					</div>
				{/each}
			</div>
		</div>
	</section>

	{/if}

	<!-- About -->
	<section class="card span-6">
		<h2 class="h2">{t('about.title', 'About Shikaku+')}</h2>
		<div class="body">{@html para('about.body')}</div>
		{#if t('about.more')}<p class="more">{@html line('about.more')}</p>{/if}
	</section>

	<!-- About Hokan -->
	<section class="card span-6">
		<h2 class="h2 hokan">{t('hokan.title', 'About Shikaku Hokan')}</h2>
		<div class="body">{@html para('hokan.body')}</div>
	</section>

	<!-- Get it -->
	<section id="get" class="card span-12 get">
		<h2 class="h2 tight">{t('get.title')}</h2>
		<!-- Google's official badge, unaltered (brand rules), beside a button of the same size. -->
		<div class="get-row">
			<a class="store-badge" href={PLAY_STORE_URL}>
				<img src="/badges/google-play.svg" alt={t('get.android', 'Get it on Google Play')} width="150" height="45" />
			</a>
			<a class="btn-outline" href={PLAY_URL}>{t('get.browser', 'Play online')}</a>
		</div>
	</section>

	<!-- Questions -->
	{#if faq.length}
		<section id="faq" class="card span-12">
			<h2 class="h2 faq-title">{t('faq.title', 'Questions')}</h2>
			<div class="faq-cols">
				{#each [faq.slice(0, faqHalf), faq.slice(faqHalf)] as half, h (h)}
					<div class="faq-col">
						{#each half as item, j (item.q)}
							{@const i = h * faqHalf + j}
							<div class="faq-item" class:open={openFaq.has(i)}>
								<h3 class="faq-q">
									<button type="button" aria-expanded={openFaq.has(i)} aria-controls="faq-a-{i}" onclick={() => toggleFaq(i)}>
										<span>{item.q}</span>
										<svg class="faq-icon" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2v12M2 8h12" stroke="currentColor" stroke-width="2" stroke-linecap="square" fill="none" /></svg>
									</button>
								</h3>
								<div class="faq-a" id="faq-a-{i}" role="region" inert={!openFaq.has(i)}>
									<div class="faq-a-inner"><p>{@html inline(item.a)}</p></div>
								</div>
							</div>
						{/each}
					</div>
				{/each}
			</div>
		</section>
	{/if}
</div>

<style>
	.bento {
		display: grid;
		grid-template-columns: repeat(12, minmax(0, 1fr));
		gap: 12px;
		align-items: stretch;
		margin-top: 12px;
	}
	.span-5 { grid-column: span 5; }
	.span-6 { grid-column: span 6; }
	.span-7 { grid-column: span 7; }
	.span-12 { grid-column: span 12; }
	.card {
		background: color-mix(in srgb, var(--text-primary) 4%, transparent);
		border: 1px solid color-mix(in srgb, var(--text-primary) 6%, transparent);
		border-radius: var(--radius);
		padding: 16px 20px;
		display: flex;
		flex-direction: column;
		gap: 14px;
		min-width: 0;
		color: var(--text-primary);
	}
	.h2 { margin: 0; font-family: var(--font-ui); font-size: 22px; font-weight: normal; letter-spacing: -0.8px; }
	.h2.tight { line-height: 1.3; }
	.h3 { margin: 0; font-size: 15px; font-weight: 700; }
	.violet { color: #a090c0; }
	.gold { color: var(--button-fill); }
	.hokan { color: var(--num-anchor); }
	.muted { color: var(--text-secondary); margin: 0; }
	.small { font-size: 13px; }
	.xsmall { font-size: 12px; }
	.body { font-size: 14px; line-height: 1.55; color: var(--text-secondary); }
	.body.big { font-size: 15px; line-height: 1.6; }
	.body :global(p) { margin: 0 0 10px; }
	.body :global(p:last-child) { margin-bottom: 0; }
	.body :global(ul) { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
	.body :global(li)::before { content: '▪ '; }
	.body :global(a), .more :global(a), .muted :global(a) { color: var(--button-fill); text-decoration: none; }
	.body :global(a:hover), .more :global(a:hover) { text-decoration: underline; }
	.more { margin: 0; font-size: 14px; }
	.row { display: flex; align-items: center; gap: 10px; }
	.row.wrap { flex-wrap: wrap; }
	.row.between { justify-content: space-between; flex-wrap: wrap; gap: 8px; }
	.row.baseline { align-items: baseline; gap: 8px; }
	.push { margin-left: auto; }
	.grow { flex: 1; }
	.self-start { align-self: flex-start; }
	.col { display: flex; flex-direction: column; gap: 10px; min-width: 0; }
	.stack-3 { display: flex; flex-direction: column; gap: 3px; }
	.stack-8 { display: flex; flex-direction: column; gap: 8px; }
	.stack-12 { display: flex; flex-direction: column; gap: 12px; }
	.split-2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
	.split-12 { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 24px; }
	.item-title { font-size: 16px; font-weight: 700; }
	.small-title { font-size: 15px; }
	.pill { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 999px; white-space: nowrap; }
	.pill-gold, .pill-building { background: var(--button-fill); color: #1b1b1b; }
	.pill-shipped { color: #88b098; background: rgba(136, 176, 152, 0.3); }
	.pill-planned { color: var(--text-secondary); background: color-mix(in srgb, var(--text-primary) 10%, transparent); }
	.pill-violet { background: #a090c0; color: #1b1b1b; }
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 44px;
		padding: 0 18px;
		border-radius: var(--radius);
		text-decoration: none;
		font-size: 15px;
		font-family: var(--font-ui);
	}
	.btn.block { display: flex; }
	.btn-lg { min-height: 48px; padding: 0 28px; }
	.btn-gold { background: var(--button-fill); color: #1b1b1b; }
	.btn-violet { background: #a090c0; color: #1b1b1b; }
	.btn-dark { background: var(--chip-unsel-fill); color: var(--text-primary); }
	.btn:hover { filter: brightness(1.08); }
	.btn:focus-visible, .mode:focus-visible, .trailer-link:focus-visible { outline: 2px solid var(--text-primary); outline-offset: 3px; }
	.example { background: var(--bg); border-radius: var(--radius); padding: 14px 16px; display: flex; flex-direction: column; gap: 12px; }
	.bar { display: flex; height: 10px; border-radius: 999px; overflow: hidden; gap: 2px; }
	.dot { width: 10px; height: 10px; border-radius: 2px; flex-shrink: 0; }
	/* Mode cards: the app's CustomGameButton (lib/custom_game_button.dart): square,
	   page-coloured with the mode's stroke as border, the icon as a 30% watermark
	   bleeding off the right; hover or focus fills it like a selected card. */
	.modes { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
	.mode {
		--fill: #d0b878;
		--stroke: #655733;
		position: relative;
		aspect-ratio: 1 / 1;
		overflow: hidden;
		box-sizing: border-box;
		padding: 12px;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: 6px;
		background: var(--bg);
		border: 2.5px solid var(--stroke);
		border-radius: var(--radius);
		color: var(--text-primary);
		text-decoration: none;
		transition: background 160ms ease-out;
	}
	.mode-icon {
		position: absolute;
		right: -14%;
		top: 20%;
		width: 102%;
		color: var(--stroke);
		opacity: 0.3;
		pointer-events: none;
	}
	.mode-icon :global(svg) { display: block; width: 100%; height: auto; }
	.mode-icon :global(path) { fill: currentColor; }
	.mode-name { position: relative; font-family: var(--font-ui); font-size: 20px; letter-spacing: -0.5px; line-height: 1.1; }
	.mode-sub { position: relative; font-size: 12px; line-height: 1.35; color: var(--fill); }
	.mode:hover, .mode:focus-visible { background: var(--fill); }
	.mode:hover .mode-name, .mode:focus-visible .mode-name { color: #1b1b1b; }
	.mode:hover .mode-sub, .mode:focus-visible .mode-sub { color: var(--stroke); }
	.ta { --fill: #d08080; --stroke: #773535; }
	.blitz { --fill: #8098b0; --stroke: #364a5f; }
	.tekazu { --fill: #88b098; --stroke: #2a6341; }
	@media (prefers-color-scheme: light) {
		.mode { border-color: var(--fill); }
		.mode-sub { color: var(--stroke); }
	}
	@media (prefers-reduced-motion: reduce) {
		.mode, .faq-a, .faq-icon { transition: none !important; }
	}
	.vs-card { border-color: rgba(160, 144, 192, 0.45); padding: 20px; gap: 20px; }
	.vs-left { grid-column: span 5; gap: 14px; }
	.vs-mark { margin: 0; }
	.vs-mark svg { max-width: 100%; height: auto; }
	.sr-only { position: absolute; width: 1px; height: 1px; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
	.vs-modes { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
	.vs-mode { background: var(--chip-unsel-fill); border-radius: var(--radius); padding: 12px 14px; display: flex; flex-direction: column; gap: 2px; }
	.placeholder { flex: 1; min-height: 96px; border-radius: var(--radius); display: flex; align-items: center; justify-content: center; padding: 12px; font-size: 14px; }
	.violet-dash { border: 2px dashed #5b4e76; }
	.vs-right { grid-column: span 7; align-self: center; display: flex; flex-direction: column; gap: 8px; min-width: 0; }
	.clip { display: block; width: 100%; height: auto; border-radius: var(--radius); background: #000; }
	.vs-right .clip { border: 2px solid #5b4e76; box-sizing: border-box; aspect-ratio: 16 / 9; object-fit: cover; }
	#help .clip { aspect-ratio: 16 / 9; object-fit: cover; border: 1px solid color-mix(in srgb, var(--text-primary) 8%, transparent); box-sizing: border-box; }
	.clip-placeholder { aspect-ratio: 16 / 9; flex: none; border: 2px dashed color-mix(in srgb, var(--text-primary) 20%, transparent); }
	.trailer-link { font-size: 14px; color: #a090c0; text-decoration: none; align-self: flex-start; }
	.trailer-link:hover { text-decoration: underline; }
	.get { flex-direction: row; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px 24px; padding: 20px; }
	.get .h2 { font-size: 24px; }
	.get-row { display: flex; flex-wrap: nowrap; gap: 10px; align-items: center; }
	.posts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
	.post {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 12px 14px;
		border-radius: var(--radius);
		background: color-mix(in srgb, var(--text-primary) 4%, transparent);
		border: 1px solid color-mix(in srgb, var(--text-primary) 6%, transparent);
		text-decoration: none;
		color: var(--text-primary);
		min-width: 0;
	}
	.post:hover { border-color: color-mix(in srgb, var(--button-fill) 50%, transparent); }
	.post:focus-visible { outline: 2px solid var(--text-primary); outline-offset: 3px; }
	.post-meta { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
	.post-type { font-size: 11px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.4px; }
	.post-type.announcement { color: var(--button-fill); }
	.post-type.patch_notes { color: #a090c0; }
	.post-title { font-size: 15px; font-weight: 700; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
	.post-excerpt { font-size: 13px; line-height: 1.5; color: var(--text-secondary); display: -webkit-box; -webkit-line-clamp: 3; line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
	.store-badge, .btn-outline { flex: 0 0 auto; width: 150px; height: 45px; box-sizing: border-box; }
	.store-badge img { display: block; width: 150px; height: 45px; }
	.btn-outline {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border: 2px solid var(--button-fill);
		border-radius: 5px;
		color: var(--button-fill);
		text-decoration: none;
		font-family: var(--font-ui);
		font-size: 15px;
	}
	.btn-outline:hover { background: color-mix(in srgb, var(--button-fill) 12%, transparent); }
	.store-badge:focus-visible, .btn-outline:focus-visible { outline: 2px solid var(--text-primary); outline-offset: 3px; }
	.foundation { background: color-mix(in srgb, var(--button-fill) 6%, transparent); border-color: color-mix(in srgb, var(--button-fill) 50%, transparent); padding: 20px; display: grid; }
	.f-left { grid-column: span 7; gap: 14px; }
	.f-right { grid-column: span 5; gap: 14px; }
	.f-title { font-size: 28px; }
	.raised { font-size: 20px; font-weight: 700; }
	.track { position: relative; height: 6px; background: color-mix(in srgb, var(--text-primary) 10%, transparent); border-radius: 999px; }
	.fill { position: absolute; inset: 0 auto 0 0; background: var(--button-fill); border-radius: 999px; }
	.goals { display: grid; grid-template-columns: 52px minmax(0, 1fr); row-gap: 8px; column-gap: 12px; font-size: 14px; }
	.countdown { background: color-mix(in srgb, var(--text-primary) 4%, transparent); border-radius: var(--radius); padding: 14px 16px; display: flex; flex-direction: column; gap: 6px; }
	.countdown-value { font-family: var(--font-brand); font-weight: 700; font-size: 30px; color: var(--button-fill); }
	.tier-icon { display: inline-flex; width: 28px; height: 28px; }
	.tier-icon :global(svg) { width: 100%; height: 100%; shape-rendering: crispEdges; }
	.tier-text { display: flex; flex-direction: column; }
	.tier-name { font-size: 14px; font-weight: 700; }
	.faq-cols { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; align-items: start; }
	.faq-col { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
	.faq-item {
		background: color-mix(in srgb, var(--text-primary) 4%, transparent);
		border: 1px solid color-mix(in srgb, var(--text-primary) 6%, transparent);
		border-radius: var(--radius);
		transition: border-color 160ms ease-out;
	}
	.faq-item:hover, .faq-item.open { border-color: color-mix(in srgb, var(--button-fill) 45%, transparent); }
	.faq-q { margin: 0; font-size: inherit; font-weight: normal; }
	.faq-q button {
		width: 100%;
		min-height: 48px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 12px 16px;
		background: none;
		border: none;
		color: var(--text-primary);
		font-family: var(--font-ui);
		font-size: 15px;
		letter-spacing: -0.2px;
		text-align: left;
		cursor: pointer;
	}
	.faq-q button:focus-visible { outline: 2px solid var(--text-primary); outline-offset: -2px; border-radius: var(--radius); }
	.faq-icon { flex-shrink: 0; color: var(--button-fill); transition: transform 220ms ease-out; }
	.open .faq-icon { transform: rotate(45deg); }
	.faq-a { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 220ms ease-out; }
	.open .faq-a { grid-template-rows: 1fr; }
	.faq-a-inner { overflow: hidden; }
	.faq-a p { margin: 0; padding: 0 16px 14px; font-size: 14px; line-height: 1.6; color: var(--text-secondary); }
	@media (max-width: 880px) {
		.bento > *,
		.split-12 > *,
		.split-2 > * {
			grid-column: 1 / -1 !important;
		}
		.split-2 { grid-template-columns: minmax(0, 1fr); }
		.foundation, .split-12 { grid-template-columns: minmax(0, 1fr); }
		.faq-cols { grid-template-columns: minmax(0, 1fr); }
		.get { flex-direction: column; align-items: flex-start; }
	}
</style>
