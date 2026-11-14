// robots.txt — same rule as the old static/robots.txt (allow everything),
// plus a Sitemap line. Generated instead of static because the Sitemap line
// needs an absolute URL on whichever domain the landing page is served from
// (go.shikaku.plus today, shikaku.plus after the domain swap).
// Cloudflare's Bot Preference Sync prepends its own lines on top of this.

export function GET({ url }) {
	const body = `# allow crawling everything by default
User-agent: *
Disallow:

Sitemap: ${url.origin}/sitemap.xml
`;
	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
}
