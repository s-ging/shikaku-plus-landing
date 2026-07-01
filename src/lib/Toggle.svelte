<script>
	let { checked = false, onchange, label = '', disabled = false } = $props();
</script>

<label class="toggle" class:disabled>
	{#if label}<span class="label">{label}</span>{/if}
	<button
		type="button"
		role="switch"
		aria-checked={checked}
		aria-label={label || 'Toggle'}
		class="switch"
		class:on={checked}
		{disabled}
		onclick={() => onchange?.(!checked)}
	>
		<span class="knob"></span>
	</button>
</label>

<style>
	.toggle {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		cursor: pointer;
	}
	.toggle.disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}
	.label {
		font-size: 14px;
		color: var(--text-secondary);
		font-family: var(--font-ui);
	}
	.switch {
		position: relative;
		width: 38px;
		height: 22px;
		padding: 0;
		border: none;
		border-radius: var(--radius);
		background: color-mix(in srgb, var(--text-primary) 16%, transparent);
		cursor: pointer;
		transition: background 140ms ease;
		flex-shrink: 0;
	}
	.switch.on {
		background: var(--button-fill);
	}
	.switch:disabled {
		cursor: not-allowed;
	}
	.knob {
		position: absolute;
		top: 2px;
		left: 2px;
		width: 18px;
		height: 18px;
		border-radius: var(--radius);
		background: var(--text-primary);
		transition: transform 140ms ease;
	}
	.switch.on .knob {
		transform: translateX(16px);
		background: var(--chip-sel-label);
	}
	.switch:focus-visible {
		outline: 2px solid var(--button-fill);
		outline-offset: 2px;
	}
</style>
