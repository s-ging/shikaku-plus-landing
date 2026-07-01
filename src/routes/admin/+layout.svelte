<script>
	import { goto, invalidate } from '$app/navigation';
	import { page } from '$app/state';

	let { data, children } = $props();
	const isLogin = $derived(page.url.pathname === '/admin/login');

	async function logout() {
		await data.supabase?.auth.signOut();
		await invalidate('supabase:auth');
		goto('/admin/login');
	}
</script>

{#if isLogin}
	{@render children()}
{:else}
	<div class="shell">
		<header class="topbar">
			<a class="wordmark" href="/admin">Shikaku+ <span>Admin</span></a>
			<nav class="nav">
				<a href="/admin" class:active={page.url.pathname === '/admin'}>Posts</a>
			</nav>
			<div class="right">
				<a class="view" href="/blog" target="_blank" rel="noopener noreferrer">View blog ↗</a>
				<button class="signout" onclick={logout}>Sign out</button>
			</div>
		</header>
		<div class="content">
			{@render children()}
		</div>
	</div>
{/if}

<style>
	.shell {
		min-height: 100vh;
	}
	.topbar {
		display: flex;
		align-items: center;
		gap: 32px;
		padding: 16px clamp(20px, 4vw, 40px);
		border-bottom: 1px solid color-mix(in srgb, var(--text-primary) 8%, transparent);
	}
	.wordmark {
		font-family: var(--font-brand);
		font-size: 17px;
		font-weight: 700;
		letter-spacing: -0.3px;
		color: var(--text-primary);
		text-decoration: none;
		white-space: nowrap;
	}
	.wordmark span {
		font-weight: 400;
		color: var(--text-secondary);
	}
	.nav {
		display: flex;
		gap: 20px;
		flex: 1;
	}
	.nav a {
		font-family: var(--font-ui);
		font-size: 14px;
		color: var(--text-secondary);
		text-decoration: none;
		padding: 6px 0;
		border-bottom: 2px solid transparent;
	}
	.nav a:hover {
		color: var(--text-primary);
	}
	.nav a.active {
		color: var(--text-primary);
		border-bottom-color: var(--button-fill);
	}
	.right {
		display: flex;
		align-items: center;
		gap: 16px;
	}
	.view {
		font-size: 13px;
		color: var(--text-secondary);
		text-decoration: none;
	}
	.view:hover {
		color: var(--text-primary);
	}
	.signout {
		background: none;
		border: none;
		color: var(--text-secondary);
		font-family: var(--font-ui);
		font-size: 13px;
		cursor: pointer;
		padding: 0;
	}
	.signout:hover {
		color: var(--text-primary);
	}
	.content {
		padding: 0 0 80px;
	}
</style>
