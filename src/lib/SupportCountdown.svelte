<script>
	import { onMount } from 'svelte';

	// —— Countdown ——
	// The Foundation fundraiser ends at the close of August 2026. (Month is
	// 0-indexed: 7 = August.) The timer ticks down days : hours : minutes : seconds.
	const DEADLINE = new Date(2026, 7, 31, 23, 59, 59);
	let now = $state(new Date());
	const remaining = $derived(Math.max(0, DEADLINE.getTime() - now.getTime()));
	const ended     = $derived(remaining <= 0);
	const countdown = $derived.by(() => {
		const total = Math.floor(remaining / 1000);
		return {
			days:    Math.floor(total / 86_400),
			hours:   Math.floor((total % 86_400) / 3600),
			minutes: Math.floor((total % 3600) / 60),
			seconds: total % 60
		};
	});
	const pad = (/** @type {number} */ n) => String(n).padStart(2, '0');

	onMount(() => {
		// Tick the countdown once a second.
		const clock = setInterval(() => (now = new Date()), 1000);
		return () => clearInterval(clock);
	});
</script>

<div class="card deadline-card" class:ended>
	{#if ended}
		<div class="deadline-ended">
			Foundation has ended — thank you to everyone who supported.
		</div>
	{:else}
		<div class="deadline-label">Early support ends in</div>
		<div class="countdown" role="timer" aria-label="Time remaining until the Foundation fundraiser ends">
			<div class="seg">
				<span class="num">{pad(countdown.days)}</span>
				<span class="unit">days</span>
			</div>
			<span class="colon" aria-hidden="true">:</span>
			<div class="seg">
				<span class="num">{pad(countdown.hours)}</span>
				<span class="unit">hours</span>
			</div>
			<span class="colon" aria-hidden="true">:</span>
			<div class="seg">
				<span class="num">{pad(countdown.minutes)}</span>
				<span class="unit">minutes</span>
			</div>
			<span class="colon" aria-hidden="true">:</span>
			<div class="seg">
				<span class="num">{pad(countdown.seconds)}</span>
				<span class="unit">seconds</span>
			</div>
		</div>
		<div class="footnote text-center">
			The Foundation fundraiser wraps up at the end of August 2026. Support before then to lock
			in your tier rewards and exclusive badge.
		</div>
	{/if}
</div>

<style>
	.card {
		background: color-mix(in srgb, var(--text-primary) 4%, transparent);
		border: 1px solid color-mix(in srgb, var(--text-primary) 6%, transparent);
		border-radius: var(--radius);
		padding: 16px 20px;
		display: flex;
		flex-direction: column;
	}

	/* —— Countdown section —— */
	.deadline-card {
		grid-column: 1 / -1;
		align-items: center;
		gap: 14px;
	}
	.deadline-label {
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.8px;
		color: var(--text-secondary);
	}
	.countdown {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		font-variant-numeric: tabular-nums;
	}
	.seg {
		display: flex;
		flex-direction: column;
		align-items: center;
		min-width: 44px;
	}
	.num {
		font-size: 32px;
		font-weight: 700;
		line-height: 1;
		color: var(--text-primary);
		letter-spacing: -0.5px;
	}
	.unit {
		margin-top: 6px;
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		color: var(--text-secondary);
	}
	.colon {
		font-size: 28px;
		font-weight: 700;
		line-height: 1;
		color: var(--text-secondary);
		opacity: 0.5;
		/* nudge up so the colon centres on the numerals, not the unit labels */
		padding-top: 2px;
	}
	.deadline-ended {
		font-size: 15px;
		font-weight: 600;
		color: var(--text-secondary);
		letter-spacing: -0.2px;
		text-align: center;
	}

	.footnote {
		font-size: 12px;
		line-height: 1.5;
		color: var(--text-secondary);
		letter-spacing: -0.1px;
		opacity: 0.7;
		margin: 24px 0 0;
	}
	.footnote.text-center {
		text-align: center;
	}
</style>
