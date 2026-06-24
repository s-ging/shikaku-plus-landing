<script>
	import PostForm from '$lib/PostForm.svelte';
	let { data } = $props();
</script>

<svelte:head><title>Admin · Edit</title></svelte:head>

{#key data.post.id}
	<PostForm supabase={data.supabase} post={data.post} />
{/key}
