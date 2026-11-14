// GET /api/geo — an exact copy of the app's Cloudflare Pages Function
// (s-ging/shikaku-plus, functions/api/geo.ts). Echoes the visitor's
// CF-IPCountry header as {"country_code": "PH"} or {"country_code": null}.
//
// Why it lives here too: native app builds call the absolute URL
// https://shikaku.plus/api/geo (lib/country_geo_stub.dart). When the landing
// page takes over shikaku.plus (domain swap, info repo decision 0024), that
// call lands here instead of on the app's project, so this must answer the
// same way. Keep both copies identical. Touches no data.

export function GET({ request }) {
	const country = request.headers.get('CF-IPCountry') ?? null;
	// 'XX' = unknown, 'T1' = Tor exit node: neither is a real ISO country.
	const valid =
		country && country.length === 2 && country !== 'XX' && country !== 'T1'
			? country.toUpperCase()
			: null;

	return new Response(JSON.stringify({ country_code: valid }), {
		status: 200,
		headers: {
			'Content-Type': 'application/json',
			// Per-request, per-edge data: never cache.
			'Cache-Control': 'no-store'
		}
	});
}
