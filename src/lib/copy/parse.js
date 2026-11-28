// Reads src/lib/copy/*.txt: "[name]" lines start a section, "#" lines are notes.
// The polar-webhook edge function (app repo) has the same parser: keep in step.

/** @param {string} text @returns {Record<string, string>} */
export function parseCopy(text) {
	/** @type {Record<string, string>} */
	const out = {};
	let key = '';
	/** @type {string[]} */
	let buf = [];
	const flush = () => {
		if (key) out[key] = buf.join('\n').trim();
	};
	for (const line of text.replace(/\r\n?/g, '\n').split('\n')) {
		const m = /^\[([a-z0-9._-]+)\]\s*$/i.exec(line);
		if (m) {
			flush();
			key = m[1];
			buf = [];
		} else if (!line.startsWith('#')) {
			buf.push(line);
		}
	}
	flush();
	return out;
}

const escapeHtml = (/** @type {string} */ s) =>
	s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Escapes, then turns [text](url) into links. Only https, relative and mailto. */
export function inline(/** @type {string} */ s) {
	return escapeHtml(s).replace(
		/\[([^\]]+)\]\(((?:https:\/\/|\/|mailto:)[^)\s]*)\)/g,
		(_, t, u) => `<a href="${u}">${t}</a>`
	);
}

/** Paragraphs as HTML: blank lines split; "- " lines become a list. */
export function blocks(/** @type {string} */ s) {
	return s
		.split(/\n\s*\n/)
		.map((para) => {
			const lines = para.split('\n').filter((l) => l.trim());
			if (lines.length && lines.every((l) => l.startsWith('- '))) {
				return `<ul>${lines.map((l) => `<li>${inline(l.slice(2).trim())}</li>`).join('')}</ul>`;
			}
			return `<p>${lines.map(inline).join('<br/>')}</p>`;
		})
		.join('');
}

/** "left | right" → [left, right] (right is '' when there is no "|"). */
export function pair(/** @type {string} */ s) {
	const i = s.indexOf('|');
	return i < 0 ? [s.trim(), ''] : [s.slice(0, i).trim(), s.slice(i + 1).trim()];
}

/** Non-empty lines, each split as a pair: "amount | label" lists. */
export function pairs(/** @type {string} */ s) {
	return s
		.split('\n')
		.map((l) => l.trim())
		.filter(Boolean)
		.map(pair);
}

/** "Q: …" / "A: …" blocks → [{ q, a }]. An answer may run over several lines. */
export function faqPairs(/** @type {string} */ s) {
	/** @type {{ q: string, a: string }[]} */
	const out = [];
	for (const line of s.split('\n')) {
		const t = line.trim();
		if (/^q:/i.test(t)) out.push({ q: t.slice(2).trim(), a: '' });
		else if (/^a:/i.test(t) && out.length) out[out.length - 1].a = t.slice(2).trim();
		else if (t && out.length) out[out.length - 1].a += (out[out.length - 1].a ? ' ' : '') + t;
	}
	return out.filter((p) => p.q);
}
