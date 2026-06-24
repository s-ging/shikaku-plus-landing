// verify.js — webhook signature checks using the Web Crypto API.
//
// Deliberately uses the global `crypto.subtle` (NOT node:crypto) so it runs
// natively on the Cloudflare Workers runtime that backs Cloudflare Pages — no
// `nodejs_compat` flag required — as well as on Node 18+.
const enc = new TextEncoder();

/** @param {string} hex @returns {Uint8Array | null} */
function hexToBytes(hex) {
	if (!hex || hex.length % 2) return null;
	const out = new Uint8Array(hex.length / 2);
	for (let i = 0; i < out.length; i++) {
		const b = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
		if (Number.isNaN(b)) return null;
		out[i] = b;
	}
	return out;
}

/** @param {string} b64 @returns {Uint8Array} */
function b64ToBytes(b64) {
	const bin = atob(b64.replace(/\s+/g, ''));
	const out = new Uint8Array(bin.length);
	for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
	return out;
}

/**
 * Verify an HMAC-SHA256 signature (hex) over `body`. Constant-time.
 * @param {string | undefined} secret
 * @param {string} body
 * @param {string | undefined} hexSig
 * @returns {Promise<boolean>}
 */
export async function hmacValid(secret, body, hexSig) {
	const sig = hexToBytes(hexSig ?? '');
	if (!secret || !sig) return false;
	try {
		const key = await crypto.subtle.importKey(
			'raw',
			enc.encode(secret),
			{ name: 'HMAC', hash: 'SHA-256' },
			false,
			['verify']
		);
		return await crypto.subtle.verify('HMAC', key, /** @type {BufferSource} */ (sig), enc.encode(body));
	} catch {
		return false;
	}
}

/**
 * Verify an RSA-SHA256 (RSASSA-PKCS1-v1_5) signature (base64) over `body`,
 * given a PEM SPKI public key.
 * @param {string | undefined} pemPublicKey
 * @param {string} body
 * @param {string | undefined} base64Sig
 * @returns {Promise<boolean>}
 */
export async function rsaValid(pemPublicKey, body, base64Sig) {
	if (!pemPublicKey || !base64Sig) return false;
	try {
		const der = b64ToBytes(pemPublicKey.replace(/-----[^-]+-----/g, '').replace(/\s+/g, ''));
		const key = await crypto.subtle.importKey(
			'spki',
			/** @type {BufferSource} */ (der),
			{ name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
			false,
			['verify']
		);
		return await crypto.subtle.verify(
			'RSASSA-PKCS1-v1_5',
			key,
			/** @type {BufferSource} */ (b64ToBytes(base64Sig)),
			enc.encode(body)
		);
	} catch {
		return false;
	}
}
