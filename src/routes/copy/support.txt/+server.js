// Serves src/lib/copy/support.txt so the polar-webhook edge function reads the
// same email words Kris edits for the site.
import text from '$lib/copy/support.txt?raw';

export const prerender = true;

export function GET() {
	return new Response(text, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=60' }
	});
}
