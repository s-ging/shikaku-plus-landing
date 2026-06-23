<script>
	// About.svelte — "About Shikaku+" section (mockup).
</script>

<section class="about">
	<div class="card">
		<h2 class="heading">About Shikaku+</h2>
		<p>
			Shikaku+ is a cooperative and competitive puzzle platform built on the Nikoli puzzle,
			Shikaku.
		</p>
		<p>
			The core mechanic is simple: partition a grid into rectangles so each rectangle contains
			exactly one number, and the rectangle&rsquo;s area matches that number.
		</p>
	</div>
</section>

<style>
	.heading {
		font-family: var(--font-ui);
		font-size: 22px;
		font-weight: normal;
		letter-spacing: -0.8px;
		color: var(--text-primary);
		margin: 0 0 16px;
	}
	.card {
		background: color-mix(in srgb, var(--text-primary) 4%, transparent);
		border: 1px solid color-mix(in srgb, var(--text-primary) 6%, transparent);
		border-radius: var(--radius);
		padding: 16px 20px;
	}
	.card p {
		font-size: 16px;
		line-height: 1.55;
		color: var(--text-secondary);
		letter-spacing: -0.2px;
		margin: 0;
	}
	.card p + p {
		margin-top: 1.1em;
	}
</style>
