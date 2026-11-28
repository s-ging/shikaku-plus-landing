// The homepage's Changelog cards: the four newest published blog posts.
// Never holds the page up: if Supabase isn't configured (preview builds) or is
// slow, the cards fall back to the words in src/lib/copy/home.txt.
const TIMEOUT_MS = 1500;

export async function load({ locals: { supabase } }) {
	if (!supabase) return { posts: [] };
	const query = supabase
		.from('posts')
		.select('title, slug, excerpt, created_at, post_type')
		.eq('published', true)
		.order('created_at', { ascending: false })
		.limit(4)
		.then(({ data }) => data ?? []);
	const timeout = new Promise((resolve) => setTimeout(() => resolve([]), TIMEOUT_MS));
	try {
		return { posts: await Promise.race([query, timeout]) };
	} catch {
		return { posts: [] };
	}
}
