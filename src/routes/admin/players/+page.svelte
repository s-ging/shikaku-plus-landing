<script>
	// Players: every registered player, their badges, and an Activity log.
	// Every read and change goes through the admin_* database functions (app
	// migration 56, part 2), which refuse anyone but the admin with a second
	// factor and log each change; this page holds no key of its own.
	// Design: shikaku-plus-info project/admin-panel-2026-11-26.md.
	import MfaGate from '$lib/admin/MfaGate.svelte';
	import { HAND_BADGES, EARNED_BADGES, TEMPLATES, LIMITS, badgeName, fill } from '$lib/admin/catalog.js';

	let { data } = $props();
	// Only used once data.supabase is known to be set (see the markup).
	const db = $derived(/** @type {import('@supabase/supabase-js').SupabaseClient} */ (data.supabase));

	/** @typedef {{ user_id: string, display_name: string, player_tag: string | null, active_badge_id: string | null, badges: string[], created_at: string, time_played_ms: number, games_finished: number, boards_finished: number, foundation_tier: number, supporter_until: string | null, name_flagged: boolean, country_code: string | null }} Player */
	/** @typedef {{ id: number, at: string, action: string, target_id: string | null, target_name: string | null, detail: any, reason: string }} Activity */

	let tab = $state('players');
	/** @type {Player[]} */
	let players = $state([]);
	/** @type {Activity[]} */
	let activity = $state([]);
	let loadErr = $state('');
	let loaded = $state(false);
	let query = $state('');
	let sortKey = $state('time_played_ms');
	let sortDir = $state(-1);
	/** @type {string | null} */
	let selectedId = $state(null);

	// The change being prepared in the side panel.
	/** @typedef {{ kind: 'badge' | 'tier', badge?: string, tier?: number, revoke: boolean }} Pending */
	let pending = $state(/** @type {Pending | null} */ (null));
	let reason = $state('');
	/** @type {'template' | 'custom' | 'none'} */
	let msgMode = $state('template');
	let templateKey = $state('bug');
	let customTitle = $state('');
	let customBody = $state('');
	let confirming = $state(false);
	let actionErr = $state('');
	let busy = $state(false);
	let toast = $state('');

	async function load() {
		loadErr = '';
		const [p, a] = await Promise.all([
			db.rpc('admin_list_players'),
			db.rpc('admin_activity', { p_limit: 200 })
		]);
		if (p.error || a.error) {
			loadErr = (p.error ?? a.error)?.message ?? 'Could not load.';
			return;
		}
		players = p.data;
		activity = a.data;
		loaded = true;
	}

	const selected = $derived(players.find((p) => p.user_id === selectedId) ?? null);

	const visible = $derived.by(() => {
		const q = query.trim().toLowerCase();
		const list = players.filter(
			(p) =>
				!q ||
				(p.display_name ?? '').toLowerCase().includes(q) ||
				(p.player_tag ?? '').toLowerCase().includes(q)
		);
		const val = (/** @type {Player} */ p) =>
			sortKey === 'badge' ? badgeName(p.active_badge_id) : /** @type {any} */ (p)[sortKey] ?? '';
		return list.sort((a, b) => {
			const x = val(a);
			const y = val(b);
			return (typeof x === 'string' ? x.localeCompare(y) : x - y) * sortDir;
		});
	});

	function sortBy(/** @type {string} */ key) {
		if (sortKey === key) sortDir = -sortDir;
		else {
			sortKey = key;
			sortDir = ['display_name', 'player_tag', 'badge'].includes(key) ? 1 : -1;
		}
	}

	function select(/** @type {string} */ id) {
		selectedId = id;
		resetPending();
	}

	function resetPending() {
		pending = null;
		reason = '';
		confirming = false;
		actionErr = '';
		customTitle = '';
		customBody = '';
	}

	function startBadge(/** @type {string} */ id) {
		if (!selected) return;
		if (pending?.kind === 'badge' && pending.badge === id) return resetPending();
		resetPending();
		const revoke = selected.badges.includes(id);
		pending = { kind: 'badge', badge: id, revoke };
		msgMode = revoke ? 'none' : 'template';
		templateKey = 'bug';
	}

	function startTier(/** @type {number} */ tier) {
		if (!selected) return;
		resetPending();
		if (tier === selected.foundation_tier) return;
		const revoke = tier < selected.foundation_tier;
		pending = { kind: 'tier', tier, revoke };
		msgMode = revoke ? 'none' : 'template';
		templateKey = 'foundation';
	}

	const pendingBadge = $derived(
		!pending ? '' : pending.kind === 'badge' ? pending.badge ?? '' : pending.tier ? `foundation_${pending.tier}` : ''
	);

	const title = $derived.by(() => {
		if (!pending || !selected) return '';
		const who = selected.display_name;
		if (pending.kind === 'tier') {
			if (pending.tier === 0) return `Remove Foundation from ${who}`;
			return `${pending.revoke ? 'Lower' : 'Set'} Foundation to ${'★'.repeat(pending.tier ?? 0)} for ${who}`;
		}
		const b = badgeName(pending.badge);
		return pending.revoke ? `Revoke ${b} from ${who}` : `Grant ${b} to ${who}`;
	});

	const message = $derived.by(() => {
		if (msgMode === 'none' || !selected) return null;
		if (msgMode === 'custom') return { title: customTitle, body: customBody };
		const t = TEMPLATES.find((x) => x.key === templateKey) ?? TEMPLATES[0];
		const vars = { name: selected.display_name, badge: badgeName(pendingBadge) };
		return { title: fill(t.title, vars), body: fill(t.body, vars) };
	});

	function problem() {
		if (!reason.trim()) return 'Add a reason. It goes in the Activity log.';
		if (reason.length > LIMITS.reason) return `Keep the reason under ${LIMITS.reason} characters.`;
		if (message) {
			if (!message.title.trim() || !message.body.trim())
				return 'Write a title and a message, or pick "Don’t send".';
			if (message.title.length > LIMITS.title) return `The title is ${message.title.length - LIMITS.title} characters too long.`;
			if (message.body.length > LIMITS.body) return `The message is ${message.body.length - LIMITS.body} characters too long.`;
		}
		return '';
	}

	function next() {
		actionErr = problem();
		if (!actionErr) confirming = true;
	}

	async function apply() {
		if (!pending || !selected) return;
		busy = true;
		actionErr = '';
		const msg = message ? { p_msg_title: message.title, p_msg_body: message.body } : {};
		const base = { p_user_id: selected.user_id, p_reason: reason.trim(), ...msg };
		const { error } =
			pending.kind === 'tier'
				? await db.rpc('admin_set_foundation', { ...base, p_tier: pending.tier })
				: await db.rpc(pending.revoke ? 'admin_revoke_badge' : 'admin_grant_badge', {
						...base,
						p_badge_id: pending.badge
					});
		busy = false;
		if (error) {
			actionErr = error.message;
			confirming = false;
			return;
		}
		const sent = !!message;
		resetPending();
		await load();
		flash(sent ? 'Done. The player sees the message next time they open the game.' : 'Done.');
	}

	let toastTimer = 0;
	function flash(/** @type {string} */ t) {
		toast = t;
		clearTimeout(toastTimer);
		toastTimer = window.setTimeout(() => (toast = ''), 3000);
	}

	const fmtTime = (/** @type {number} */ ms) => {
		const m = Math.round(ms / 60000);
		return m >= 60 ? `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m` : `${m}m`;
	};
	const fmtDate = (/** @type {string} */ d) =>
		new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
	const fmtStamp = (/** @type {string} */ d) =>
		new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
	const num = (/** @type {number} */ n) => Number(n).toLocaleString('en');

	/** @param {Activity} a */
	function describe(a) {
		const who = a.target_name ?? 'a deleted account';
		const d = a.detail ?? {};
		switch (a.action) {
			case 'grant_badge':
				return `Granted ${badgeName(d.badge)} to ${who}`;
			case 'revoke_badge':
				return `Revoked ${badgeName(d.badge)} from ${who}`;
			case 'set_foundation':
				return d.to === 0
					? `Removed Foundation from ${who}`
					: `Set Foundation ${'★'.repeat(d.to)} for ${who}` + (d.from ? ` (was ${'★'.repeat(d.from)})` : '');
			case 'message':
				return `Sent a message to ${who}`;
			default:
				return `${a.action} on ${who}`;
		}
	}
</script>

<svelte:head><title>Admin · Players</title></svelte:head>

{#if !data.supabase}
	<main class="wrap"><p class="muted">Supabase is not configured.</p></main>
{:else}
	<MfaGate supabase={data.supabase} onverified={load}>
		{#if !loaded && !loadErr}
			<main class="wrap"><p class="muted">Loading players...</p></main>
		{:else}
			<main class="wrap">
				<header class="bar">
					<h1>Players</h1>
					<div class="tabs" role="tablist">
						<button role="tab" class="tab" class:active={tab === 'players'} aria-selected={tab === 'players'} onclick={() => (tab = 'players')}>
							Players <span class="count">{players.length}</span>
						</button>
						<button role="tab" class="tab" class:active={tab === 'activity'} aria-selected={tab === 'activity'} onclick={() => (tab = 'activity')}>
							Activity
						</button>
					</div>
				</header>

				{#if loadErr}
					<p class="err">{loadErr}</p>
				{/if}

				{#if tab === 'players'}
					<div class="layout">
						<section class="list">
							<input id="player-search" class="search" type="search" placeholder="Search name or tag" aria-label="Search players" bind:value={query} />
							<div class="tablebox">
								<table>
									<thead>
										<tr>
											<th><button onclick={() => sortBy('badge')}>Badge</button></th>
											<th><button onclick={() => sortBy('display_name')}>Name</button></th>
											<th><button onclick={() => sortBy('player_tag')}>Tag</button></th>
											<th class="num"><button onclick={() => sortBy('time_played_ms')}>Playtime</button></th>
											<th><button onclick={() => sortBy('created_at')}>Account since</button></th>
											<th class="num"><button onclick={() => sortBy('boards_finished')}>Solo boards</button></th>
											<th class="soon">VS</th>
											<th class="soon">Peak rank / Vol.</th>
										</tr>
									</thead>
									<tbody>
										{#each visible as p (p.user_id)}
											<tr class:sel={p.user_id === selectedId} onclick={() => select(p.user_id)} onkeydown={(e) => e.key === 'Enter' && select(p.user_id)} tabindex="0">
												<td>{#if p.active_badge_id}<span class="chip">{badgeName(p.active_badge_id)}</span>{:else}<span class="muted">none</span>{/if}</td>
												<td>{p.display_name}{#if p.name_flagged}<span class="flag" title="On the name blocklist: hidden from leaderboards">flagged</span>{/if}</td>
												<td class="tag">{p.player_tag ?? ''}</td>
												<td class="num">{fmtTime(p.time_played_ms)}</td>
												<td>{fmtDate(p.created_at)}</td>
												<td class="num">{num(p.boards_finished)}</td>
												<td class="soon">later</td>
												<td class="soon">later</td>
											</tr>
										{:else}
											<tr><td colspan="8" class="muted empty">No players match.</td></tr>
										{/each}
									</tbody>
								</table>
							</div>
						</section>

						<aside class="sheet" aria-live="polite">
							{#if !selected}
								<p class="muted empty">Pick a player to see their badges.</p>
							{:else}
								<div class="sheet-head">
									<h2>{selected.display_name}</h2>
									<div class="muted">
										{#if selected.player_tag}<span class="tag">{selected.player_tag}</span> · {/if}
										{selected.country_code ?? 'no country'}
									</div>
								</div>
								<dl class="facts">
									<dt>Account since</dt><dd>{fmtDate(selected.created_at)}</dd>
									<dt>Playtime</dt><dd>{fmtTime(selected.time_played_ms)}</dd>
									<dt>Solo</dt><dd>{num(selected.games_finished)} games · {num(selected.boards_finished)} boards</dd>
									<dt>Foundation</dt><dd>{selected.foundation_tier ? 'Foundation ' + '★'.repeat(selected.foundation_tier) : 'no'}</dd>
									<dt>Supporter</dt><dd>{selected.supporter_until && new Date(selected.supporter_until) > new Date() ? 'until ' + fmtDate(selected.supporter_until) : 'no'}</dd>
								</dl>

								<h3>Granted by hand</h3>
								<div class="badges">
									{#each HAND_BADGES as b (b.id)}
										<button class="badge" class:owned={selected.badges.includes(b.id)} aria-pressed={pending?.kind === 'badge' && pending.badge === b.id} onclick={() => startBadge(b.id)}>
											<span>{b.name}</span>{#if selected.badges.includes(b.id)}<span class="tick">✓</span>{/if}
										</button>
									{/each}
								</div>

								<h3>Foundation</h3>
								<div class="tiers">
									{#each [0, 1, 2, 3, 4] as n (n)}
										<button aria-pressed={(pending?.kind === 'tier' ? pending.tier : selected.foundation_tier) === n} onclick={() => startTier(n)}>
											{n ? '★'.repeat(n) : 'None'}
										</button>
									{/each}
								</div>

								<h3>Earned by playing</h3>
								<div class="earned">
									{#each selected.badges.filter((id) => id in EARNED_BADGES) as id (id)}
										<span class="chip">{badgeName(id)}</span>
									{:else}
										<span class="muted">None yet</span>
									{/each}
								</div>
								<p class="muted small">These follow the player's stats, so they can't be granted here.</p>

								{#if pending}
									<div class="action">
										<strong>{title}</strong>
										<label for="reason">Reason (kept in the Activity log; the player doesn't see it)</label>
										<input id="reason" bind:value={reason} maxlength={LIMITS.reason} placeholder="e.g. Reported the 12×12 save bug" />

										<span class="label">Message to the player</span>
										<div class="seg" role="group" aria-label="Message">
											<button aria-pressed={msgMode === 'template'} onclick={() => (msgMode = 'template')}>Template</button>
											<button aria-pressed={msgMode === 'custom'} onclick={() => (msgMode = 'custom')}>Custom</button>
											<button aria-pressed={msgMode === 'none'} onclick={() => (msgMode = 'none')}>Don't send</button>
										</div>
										{#if msgMode === 'template'}
											<label for="tpl">Template</label>
											<select id="tpl" bind:value={templateKey}>
												{#each TEMPLATES as t (t.key)}<option value={t.key}>{t.label}</option>{/each}
											</select>
										{:else if msgMode === 'custom'}
											<label for="mtitle">Title</label>
											<input id="mtitle" bind:value={customTitle} maxlength={LIMITS.title} />
											<label for="mbody">Message</label>
											<textarea id="mbody" bind:value={customBody} rows="4"></textarea>
											<span class="counter" class:over={customBody.length > LIMITS.body}>{customBody.length} / {LIMITS.body}</span>
										{/if}
										{#if message}
											<span class="label">What the player sees in the game</span>
											<div class="preview"><b>{message.title || 'Untitled'}</b>{message.body || '...'}</div>
										{/if}

										{#if actionErr}<p class="err">{actionErr}</p>{/if}
										{#if confirming}
											<div class="confirm">
												<span>{title}{message ? ' and send the message' : ''}?</span>
												<div class="row">
													<button class="btn" onclick={() => (confirming = false)} disabled={busy}>Back</button>
													<button class="btn {pending.revoke ? 'danger' : 'primary'}" onclick={apply} disabled={busy}>
														{busy ? 'Saving...' : pending.revoke ? 'Yes, revoke' : 'Yes, grant'}
													</button>
												</div>
											</div>
										{:else}
											<div class="row">
												<button class="btn" onclick={resetPending}>Cancel</button>
												<button class="btn {pending.revoke ? 'danger' : 'primary'}" onclick={next}>{pending.revoke ? 'Revoke...' : 'Grant...'}</button>
											</div>
										{/if}
									</div>
								{/if}
							{/if}
						</aside>
					</div>
				{:else}
					<div class="log">
						{#each activity as a (a.id)}
							<div class="log-row">
								<time>{fmtStamp(a.at)}</time>
								<div>
									{describe(a)}{#if a.detail?.message}<span class="pill">message sent</span>{/if}
									<div class="muted small">{a.reason}</div>
									{#if a.detail?.message}<div class="muted small">“{a.detail.title}”: {a.detail.body}</div>{/if}
								</div>
							</div>
						{:else}
							<p class="muted empty">Nothing yet. Every grant, revoke and message shows up here.</p>
						{/each}
					</div>
					<p class="muted small">This log can't be edited or deleted, by anyone.</p>
				{/if}
			</main>
		{/if}
	</MfaGate>
{/if}

{#if toast}<div class="toast" role="status">{toast}</div>{/if}

<style>
	.wrap {
		max-width: 1280px;
		margin: 0 auto;
		padding: 32px clamp(16px, 4vw, 40px) 0;
	}
	.bar {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		justify-content: space-between;
		gap: 12px;
		margin-bottom: 16px;
		border-bottom: 1px solid color-mix(in srgb, var(--text-primary) 8%, transparent);
	}
	h1 {
		margin: 0 0 10px;
		font-family: var(--font-ui);
		font-size: 26px;
		font-weight: normal;
		color: var(--text-primary);
	}
	.tabs {
		display: flex;
		gap: 4px;
	}
	.tab {
		display: flex;
		align-items: center;
		gap: 6px;
		background: none;
		border: none;
		padding: 10px 14px;
		font-family: var(--font-ui);
		font-size: 14px;
		color: var(--text-secondary);
		cursor: pointer;
		border-bottom: 2px solid transparent;
	}
	.tab.active {
		color: var(--text-primary);
		border-bottom-color: var(--button-fill);
	}
	.count {
		font-size: 12px;
		background: color-mix(in srgb, var(--text-primary) 10%, transparent);
		border-radius: var(--radius);
		padding: 1px 7px;
		font-variant-numeric: tabular-nums;
	}
	.layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 380px;
		gap: 20px;
		align-items: start;
	}
	@media (max-width: 980px) {
		.layout {
			grid-template-columns: minmax(0, 1fr);
		}
	}
	.list {
		min-width: 0;
		display: grid;
		gap: 12px;
	}
	.search,
	.action input,
	.action select,
	.action textarea {
		font-family: var(--font-ui);
		font-size: 14px;
		padding: 8px 10px;
		border-radius: var(--radius);
		border: 1px solid color-mix(in srgb, var(--text-primary) 15%, transparent);
		background: var(--bg);
		color: var(--text-primary);
		width: 100%;
		box-sizing: border-box;
	}
	.tablebox {
		overflow-x: auto;
		border: 1px solid color-mix(in srgb, var(--text-primary) 8%, transparent);
		border-radius: var(--radius);
	}
	table {
		border-collapse: collapse;
		width: 100%;
		min-width: 780px;
		font-size: 14px;
	}
	th,
	td {
		text-align: left;
		padding: 8px 10px;
		border-bottom: 1px solid color-mix(in srgb, var(--text-primary) 8%, transparent);
		white-space: nowrap;
		color: var(--text-primary);
	}
	th {
		font-size: 11px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		font-weight: normal;
		color: var(--text-secondary);
		background: color-mix(in srgb, var(--text-primary) 4%, transparent);
	}
	th button {
		background: none;
		border: 0;
		padding: 0;
		font: inherit;
		color: inherit;
		letter-spacing: inherit;
		text-transform: inherit;
		cursor: pointer;
	}
	.num {
		text-align: right;
		font-variant-numeric: tabular-nums;
	}
	.soon {
		color: var(--text-secondary);
		font-style: italic;
	}
	tbody tr {
		cursor: pointer;
	}
	tbody tr:hover,
	tbody tr.sel {
		background: color-mix(in srgb, var(--text-primary) 7%, transparent);
	}
	tbody tr:focus-visible {
		outline: 2px solid var(--button-fill);
		outline-offset: -2px;
	}
	.tag {
		font-family: 'Inconsolata', ui-monospace, Menlo, Consolas, monospace;
		letter-spacing: 0.04em;
	}
	.chip {
		display: inline-block;
		padding: 1px 8px;
		border-radius: var(--radius);
		background: var(--cell);
		color: var(--text-primary);
		font-size: 12px;
	}
	.flag {
		margin-left: 6px;
		font-size: 11px;
		color: var(--invalid-stroke);
		border: 1px solid currentColor;
		border-radius: var(--radius);
		padding: 0 5px;
	}
	.muted {
		color: var(--text-secondary);
	}
	.small {
		font-size: 12px;
		margin: 6px 0 0;
	}
	.empty {
		padding: 24px 12px;
		text-align: center;
	}
	.err {
		color: var(--invalid-stroke);
		font-size: 13px;
		margin: 0;
	}
	.sheet {
		position: sticky;
		top: 16px;
		padding: 16px;
		border-radius: var(--radius);
		background: color-mix(in srgb, var(--text-primary) 4%, transparent);
		border: 1px solid color-mix(in srgb, var(--text-primary) 8%, transparent);
		color: var(--text-primary);
		font-size: 14px;
	}
	@media (max-width: 980px) {
		.sheet {
			position: static;
		}
	}
	.sheet-head h2 {
		margin: 0;
		font-family: var(--font-brand);
		font-size: 20px;
		overflow-wrap: anywhere;
	}
	.facts {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 4px 14px;
		margin: 14px 0;
		font-size: 13px;
	}
	.facts dt {
		color: var(--text-secondary);
	}
	.facts dd {
		margin: 0;
		font-variant-numeric: tabular-nums;
	}
	h3 {
		margin: 16px 0 8px;
		font-size: 11px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		font-weight: normal;
		color: var(--text-secondary);
	}
	.badges {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 6px;
	}
	.badge,
	.tiers button,
	.seg button {
		display: flex;
		justify-content: space-between;
		gap: 6px;
		padding: 6px 9px;
		border-radius: var(--radius);
		border: 1px solid color-mix(in srgb, var(--text-primary) 15%, transparent);
		background: var(--bg);
		color: var(--text-primary);
		font-family: var(--font-ui);
		font-size: 13px;
		cursor: pointer;
		text-align: left;
	}
	.badge.owned {
		border-color: var(--button-fill);
	}
	.tick {
		color: var(--button-fill);
	}
	.badge[aria-pressed='true'],
	.seg button[aria-pressed='true'] {
		outline: 2px solid var(--text-primary);
		outline-offset: -1px;
	}
	.tiers,
	.seg,
	.earned {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.tiers button[aria-pressed='true'] {
		background: var(--button-fill);
		border-color: var(--button-fill);
		color: var(--chip-sel-label);
	}
	.action {
		display: grid;
		gap: 8px;
		margin-top: 18px;
		padding: 12px;
		border-radius: var(--radius);
		border: 1px solid color-mix(in srgb, var(--text-primary) 15%, transparent);
		background: var(--bg);
	}
	.action label,
	.label {
		font-size: 12px;
		color: var(--text-secondary);
	}
	.counter {
		font-size: 12px;
		color: var(--text-secondary);
		text-align: right;
		font-variant-numeric: tabular-nums;
	}
	.counter.over {
		color: var(--invalid-stroke);
	}
	.preview {
		padding: 10px 12px;
		border-radius: var(--radius);
		border: 1px dashed color-mix(in srgb, var(--text-primary) 20%, transparent);
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		font-size: 13px;
	}
	.preview b {
		display: block;
		margin-bottom: 4px;
		font-family: var(--font-brand);
	}
	.confirm {
		display: grid;
		gap: 8px;
		padding-top: 8px;
		border-top: 1px solid color-mix(in srgb, var(--text-primary) 10%, transparent);
		font-size: 13px;
	}
	.row {
		display: flex;
		gap: 8px;
		justify-content: flex-end;
		flex-wrap: wrap;
	}
	.btn {
		padding: 8px 14px;
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
		border-color: var(--button-fill);
		color: var(--chip-sel-label);
	}
	.btn.danger {
		background: var(--invalid-stroke);
		border-color: var(--invalid-stroke);
		color: #fff;
	}
	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.log {
		border: 1px solid color-mix(in srgb, var(--text-primary) 8%, transparent);
		border-radius: var(--radius);
	}
	.log-row {
		display: grid;
		grid-template-columns: 140px minmax(0, 1fr);
		gap: 4px 16px;
		padding: 10px 14px;
		border-bottom: 1px solid color-mix(in srgb, var(--text-primary) 8%, transparent);
		color: var(--text-primary);
		font-size: 14px;
		overflow-wrap: anywhere;
	}
	.log-row:last-child {
		border-bottom: 0;
	}
	.log-row time {
		color: var(--text-secondary);
		font-size: 13px;
		font-variant-numeric: tabular-nums;
	}
	@media (max-width: 560px) {
		.log-row {
			grid-template-columns: minmax(0, 1fr);
		}
	}
	.pill {
		margin-left: 8px;
		font-size: 11px;
		border: 1px solid currentColor;
		border-radius: 999px;
		padding: 0 7px;
		color: var(--text-secondary);
	}
	.toast {
		position: fixed;
		left: 50%;
		bottom: 24px;
		transform: translateX(-50%);
		background: var(--text-primary);
		color: var(--bg);
		padding: 9px 16px;
		border-radius: var(--radius);
		font-size: 13px;
		max-width: calc(100% - 32px);
		z-index: 20;
	}
</style>
