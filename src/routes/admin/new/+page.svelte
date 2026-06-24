<script>
	import PostForm from '$lib/PostForm.svelte';
	let { data } = $props();
</script>

<svelte:head><title>Admin · New post</title></svelte:head>

<PostForm supabase={data.supabase} />
