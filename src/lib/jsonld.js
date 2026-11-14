// Structured data (JSON-LD): a block of labelled facts in the page's HTML so
// Google, Bing and AI tools don't have to guess what a page is about.
// Render with {@html jsonLd(obj)} inside <svelte:head>. `<` is escaped so no
// value can ever close the <script> tag early.

/** @param {object} data */
export function jsonLd(data) {
	const json = JSON.stringify(data).replace(/</g, '\\u003c');
	return `<script type="application/ld+json">${json}</script>`;
}

export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=plus.shikaku.app';
