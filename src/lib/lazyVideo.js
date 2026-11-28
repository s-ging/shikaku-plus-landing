// lazyVideo: a muted looping clip that loads only when it comes near the
// screen and pauses when it leaves, so the homepage costs nothing until then.
// `base` is a path without extension: "<base>.webm" (VP9) where the browser
// plays it, else "<base>.mp4" (H.264). People who ask for less motion get the
// still poster ("<base>.jpg") and a play control instead.

/** @param {HTMLVideoElement} video @param {string} base */
export function lazyVideo(video, base) {
	const webm = video.canPlayType('video/webm; codecs="vp9"') !== '';
	const src = `${base}.${webm ? 'webm' : 'mp4'}`;
	const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
	if (reduce) {
		video.autoplay = false;
		video.controls = true;
		video.preload = 'none';
		video.src = src;
		return {};
	}
	let loaded = false;
	const io = new IntersectionObserver(
		(entries) => {
			for (const e of entries) {
				if (e.isIntersecting) {
					if (!loaded) {
						loaded = true;
						video.src = src;
					}
					video.play().catch(() => {});
				} else if (loaded) {
					video.pause();
				}
			}
		},
		{ rootMargin: '200px' }
	);
	io.observe(video);
	return { destroy: () => io.disconnect() };
}
