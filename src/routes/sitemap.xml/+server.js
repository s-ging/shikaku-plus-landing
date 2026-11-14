// sitemap.xml — every public page plus every published blog post, so Google,
// Bing and AI crawlers find pages without guessing. Built from the request's
// own origin (like the canonical tags in +layout.svelte), so it stays correct
// when the landing page moves from go.shikaku.plus to shikaku.plus.
// /admin is left out on purpose. If Supabase isn't configured, the static
// pages still list.

const STATIC_PATHS = ['/', '/about', '/blog', '/privacy-policy', '/terms-of-service', '/data-deletion'];

/** @param {string} s */
const esc = (s) =>
	s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** @param {string | null | undefined} d */
const day = (d) => (d ? new Date(d).toISOString().slice(0, 10) : null);

export async function GET({ url, locals: { supabase } }) {
	const origin = url.origin;

	/** @type {{ loc: string, lastmod: string | null }[]} */
	const entries = STATIC_PATHS.map((p) => ({ loc: origin + p, lastmod: null }));

	if (supabase) {
		const { data: posts } = await supabase
			.from('posts')
			.select('slug, created_at, updated_at')
			.eq('published', true)
			.order('created_at', { ascending: false });
		for (const p of posts ?? []) {
			entries.push({
				loc: `${origin}/blog/${encodeURIComponent(p.slug)}`,
				lastmod: day(p.updated_at ?? p.created_at)
			});
		}
	}

	const body =
		'<?xml version="1.0" encoding="UTF-8"?>\n' +
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
		entries
			.map(
				(e) =>
					`  <url><loc>${esc(e.loc)}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ''}</url>`
			)
			.join('\n') +
		'\n</urlset>\n';

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			// An hour at the edge: a new post shows up within the hour, and a
			// crawler storm never reaches Supabase more than once an hour.
			'Cache-Control': 'public, max-age=3600'
		}
	});
}
