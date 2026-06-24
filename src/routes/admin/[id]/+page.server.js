import { error } from '@sveltejs/kit';

export async function load({ params, locals: { supabase } }) {
	if (!supabase) throw error(503, 'Supabase not configured');
	const { data: post } = await supabase.from('posts').select('*').eq('id', params.id).single();
	if (!post) throw error(404, 'Post not found');
	return { post };
}
