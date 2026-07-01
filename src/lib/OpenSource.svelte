<script>
	const libraries = [
		{ name: 'Flutter SDK', license: 'BSD-3-Clause', href: 'https://flutter.dev' },
		{ name: 'cupertino_icons', license: 'MIT' },
		{ name: 'file_picker', license: 'MIT' },
		{ name: 'flutter_local_notifications', license: 'BSD-3-Clause' },
		{ name: 'flutter_svg', license: 'MIT' },
		{ name: 'flutter_timezone', license: 'Apache-2.0' },
		{ name: 'google_sign_in', license: 'BSD-3-Clause' },
		{ name: 'image', license: 'MIT' },
		{ name: 'pasteboard', license: 'Apache-2.0' },
		{ name: 'shared_preferences', license: 'BSD-3-Clause' },
		{ name: 'supabase_flutter', license: 'MIT' },
		{ name: 'timezone', license: 'BSD-style' },
		{ name: 'url_launcher', license: 'BSD-3-Clause' },
		{ name: 'web', license: 'BSD-3-Clause' },
		{ name: 'webview_flutter', license: 'BSD-3-Clause' }
	].map((lib) => ({ ...lib, href: lib.href ?? `https://pub.dev/packages/${lib.name}` }));
</script>

<section class="open-source">
	<div class="card">
		<h2 class="heading">Open-source libraries</h2>
		<div class="table-wrap">
			<table>
				<thead>
					<tr>
						<th>Package</th>
						<th>License</th>
					</tr>
				</thead>
				<tbody>
					{#each libraries as lib (lib.name)}
						<tr>
							<td><a href={lib.href} target="_blank" rel="noopener noreferrer">{lib.name}</a></td>
							<td>{lib.license}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<p class="note">
			Direct dependencies only. The full transitive and engine-level license list (including
			Flutter/Skia) is available in the app under Settings → About → Licenses.
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
	.table-wrap {
		overflow-x: auto;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 14px;
		letter-spacing: -0.2px;
	}
	th {
		text-align: left;
		font-weight: 700;
		color: var(--text-primary);
		padding: 0 0 8px;
		border-bottom: 1px solid color-mix(in srgb, var(--text-primary) 12%, transparent);
	}
	td {
		padding: 8px 0;
		color: var(--text-secondary);
		border-bottom: 1px solid color-mix(in srgb, var(--text-primary) 6%, transparent);
	}
	tr:last-child td {
		border-bottom: none;
	}
	td a {
		color: var(--button-fill);
		text-decoration: none;
	}
	td a:hover {
		text-decoration: underline;
	}
	th:last-child,
	td:last-child {
		padding-left: 16px;
	}
	.note {
		font-size: 13px;
		line-height: 1.5;
		color: var(--text-secondary);
		letter-spacing: -0.2px;
		margin: 16px 0 0;
	}
</style>
