import { describe, it, expect } from 'vitest';
import { parseCopy, inline, blocks, pair, pairs, faqPairs } from './parse.js';
import text from './support.txt?raw';
import home from './home.txt?raw';

describe('copy files', () => {
	it('reads sections, skips notes, trims', () => {
		const c = parseCopy('# note\n[a]\nHello\n# hidden\n\n[b.c]\n- x\n- y\n');
		expect(c).toEqual({ a: 'Hello', 'b.c': '- x\n- y' });
	});
	it('support.txt has every key the pages and emails use', () => {
		const c = parseCopy(text);
		for (const k of [
			'page.intro', 'foundation.body', 'supporter.body', 'how.points', 'thanks.body',
			'email.paid.subject', 'email.paid.foundation', 'email.paid.supporter',
			'email.unmatched.subject', 'email.unmatched.body'
		]) expect(c[k], k).toBeTruthy();
	});
	it('links only safe targets and escapes HTML', () => {
		expect(inline('[t](/x) [m](mailto:a@b.c) [e](javascript:alert(1)) <b>')).toBe(
			'<a href="/x">t</a> <a href="mailto:a@b.c">m</a> [e](javascript:alert(1)) &lt;b&gt;'
		);
	});
	it('turns paragraphs and bullets into HTML', () => {
		expect(blocks('One\ntwo\n\n- a\n- b')).toBe('<p>One<br/>two</p><ul><li>a</li><li>b</li></ul>');
	});
	it('home.txt: pairs, goals and questions read as expected', () => {
		const c = parseCopy(home);
		expect(pair(c['modes.zen'])).toEqual(['Zen', 'No clock']);
		expect(pairs(c['foundation.goals'])[0]).toEqual(['$25', 'Google Play Store launch']);
		const faq = faqPairs(c['faq']);
		expect(faq.length).toBe(8);
		expect(faq[0]).toEqual({ q: 'Is Shikaku+ free?', a: 'Yes. Free to play, with no ads.' });
		for (const k of ['hero.tagline', 'changelog.left.points', 'help.body', 'vs.body', 'foundation.title', 'about.body'])
			expect(c[k], k).toBeTruthy();
	});
});
