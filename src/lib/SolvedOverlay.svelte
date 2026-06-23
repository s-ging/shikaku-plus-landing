<script>
	// SolvedOverlay.svelte — celebratory post-solve overlay (spec §10.2).
	let {
		open = false,
		timeLabel = null, // e.g. "2:41"
		moveCount = null, // e.g. 7
		onOpenApp,
		onClose
	} = $props();
</script>

{#if open}
	<div class="overlay" role="dialog" aria-modal="true" aria-label="Puzzle solved">
		<button class="close" aria-label="Close" onclick={onClose}>×</button>
		<div class="inner">
			<h2 class="title">Solved!</h2>
			<p class="flavour">Nicely done. Same time tomorrow?</p>

			{#if timeLabel || moveCount != null}
				<div class="stats">
					{#if timeLabel}
						<div class="stat"><span class="stat-label">Time</span><span class="stat-value">{timeLabel}</span></div>
					{/if}
					{#if moveCount != null}
						<div class="stat"><span class="stat-label">Moves</span><span class="stat-value">{moveCount}</span></div>
					{/if}
				</div>
			{/if}

			<div class="cta">
				<button class="btn btn-primary" onclick={onOpenApp}>Open the full game</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.overlay {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		background: var(--solved-overlay);
		border-radius: var(--radius);
		padding: 32px 40px;
		z-index: 10;
		animation: fade 220ms ease both;
	}

	/* On mobile the board overlay is cramped — go fullscreen over the viewport. */
	@media (max-width: 880px) {
		.overlay {
			position: fixed;
			inset: 0;
			border-radius: 0;
			padding: 40px 28px;
			z-index: 1000;
			/* opaque on mobile so the board behind doesn't show through fullscreen */
			background: var(--bg);
		}
		.inner {
			max-width: 420px;
		}
		.cta {
			width: 100%;
		}
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	.close {
		position: absolute;
		top: 10px;
		right: 14px;
		background: none;
		border: none;
		color: var(--solved-text);
		font-size: 26px;
		line-height: 1;
		opacity: 0.6;
		cursor: pointer;
		padding: 4px;
	}
	.close:hover {
		opacity: 1;
	}
	.inner {
		text-align: center;
		max-width: 320px;
	}
	.title {
		font-family: var(--font-ui);
		font-size: 44px;
		font-weight: normal;
		letter-spacing: -0.8px;
		color: var(--solved-text);
		margin: 0;
	}
	.flavour {
		font-size: 16px;
		color: var(--text-secondary);
		margin: 8px 0 0;
		letter-spacing: -0.2px;
	}
	.stats {
		display: flex;
		justify-content: center;
		gap: 28px;
		margin: 22px 0 4px;
	}
	.stat {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.stat-label {
		font-size: 16px;
		color: var(--text-secondary);
		letter-spacing: -0.2px;
	}
	.stat-value {
		font-size: 18px;
		color: var(--solved-text);
		letter-spacing: -0.2px;
	}
	.cta {
		display: flex;
		flex-direction: column;
		gap: 20px; /* kSolvedButtonGap */
		margin-top: 28px;
	}
	.btn {
		border-radius: var(--radius);
		padding: 18px 24px;
		font-family: var(--font-ui);
		font-size: 15px;
		letter-spacing: -0.3px;
		cursor: pointer;
		border: none;
		transition: transform 80ms ease, filter 120ms ease;
	}
	.btn:active {
		transform: translateY(1px);
	}
	.btn-primary {
		background: var(--button-fill);
		color: var(--chip-sel-label);
	}
	.btn-primary:hover {
		filter: brightness(1.06);
	}
</style>
