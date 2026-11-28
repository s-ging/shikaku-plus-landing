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
	it('colours {name|word} and {#hex|word}, leaves unknown names alone', () => {
		expect(inline('{violet|VERSUS} {#C5956B|ASCENT} {nope|x}')).toBe(
			'<span style="color:#a090c0">VERSUS</span> <span style="color:#C5956B">ASCENT</span> {nope|x}'
		);
	});
	it('turns paragraphs and bullets into HTML', () => {
		expect(blocks('One\ntwo\n\n- a\n- b')).toBe('<p>One<br/>two</p><ul><li>a</li><li>b</li></ul>');
	});
	it('home.txt: pairs, goals and questions are well formed (any wording)', () => {
		const c = parseCopy(home);
		for (const k of ['modes.zen', 'modes.time_attack', 'modes.blitz']) {
			const [name, sub] = pair(c[k] ?? '');
			expect(name, k).toBeTruthy();
			expect(sub, k).toBeTruthy();
		}
		expect(pairs(c['foundation.goals'] ?? '').every(([a, b]) => a && b)).toBe(true);
		const faq = faqPairs(c['faq'] ?? '');
		expect(faq.length).toBeGreaterThan(0);
		expect(faq.every((p) => p.q && p.a)).toBe(true);
		for (const k of ['hero.tagline', 'help.title', 'vs.body', 'about.body'])
			expect(c[k], k).toBeTruthy();
	});
});
