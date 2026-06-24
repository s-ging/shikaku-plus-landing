# Live donation tracking — setup

How the four payment methods feed the **Support Us** bar in real time.

```
PayMongo ─ webhook ─┐
Crypto   ─ Alchemy ─┤→  /api/webhooks/*  → recordDonation() → Supabase `donations` table
PayPal   ─ webhook ─┤                                              │
Wise     ─ webhook ─┘                                              ▼  Realtime (websocket)
                                                        $lib/donations.js → the bar ticks up, no refresh
```

The code is wired and ready. What's left is **provisioning accounts + registering webhook URLs + pasting secrets into `.env`** (see `.env.example`). Until Supabase is configured the bar falls back to the old CSV / static value, so nothing breaks while you set this up.

---

## 0. Hosting (Cloudflare Pages — already set up)

The webhook routes run as Cloudflare Pages Functions. `@sveltejs/adapter-auto`
already resolves to the Cloudflare adapter on Pages builds, so **no adapter
change is needed**. Signature verification uses the Web Crypto API, so you do
**NOT** need the `nodejs_compat` flag either.

**Secrets live in the Cloudflare dashboard, not a committed file:**
Pages project → Settings → *Environment variables & secrets* → add every var
from `.env.example` (mark the non-`PUBLIC_` ones as **encrypted/Secret**). Add
them to **both** Production and Preview if you want previews to work. `.env` is
only for local `npm run dev`.

Your public webhook base URL is: `https://YOURDOMAIN/api/webhooks/<provider>`

---

## 1. Supabase (the tally) — required

You already have a Supabase project — **reuse it**. Add donations as their own
table; don't bolt them onto player rows (a donation isn't 1:1 with a player,
and this table needs public read while your player tables presumably don't).
If you later want to credit a player, join on the email the modal captures.

1. SQL editor (in your existing project) → run:

   ```sql
   create table donations (
     id          bigint generated always as identity primary key,
     provider    text        not null,         -- 'paymongo' | 'paypal' | 'wise' | 'crypto'
     amount      numeric     not null,         -- original gross amount
     currency    text        not null default 'USD',
     usd_amount  numeric     not null,         -- normalised, what the bar sums
     ref         text        not null,         -- provider's payment/tx id (idempotency)
     confirmed   boolean     not null default true,  -- only confirmed rows count (see §6)
     created_at  timestamptz not null default now(),
     unique (provider, ref)
   );

   alter table donations enable row level security;

   -- Anyone may READ the totals (it's a public fundraiser). No insert/update/
   -- delete policy => writes only via the service-role key (the webhooks).
   create policy "public read donations" on donations
     for select to anon using (true);

   -- Let Realtime broadcast changes to the browser.
   alter publication supabase_realtime add table donations;
   ```

   > Already created the table from an earlier version? Just add the column:
   > `alter table donations add column confirmed boolean not null default true;`

3. Settings → API → copy into Cloudflare env vars (and `.env` for local dev):
   - Project URL → `PUBLIC_SUPABASE_URL` **and** `SUPABASE_URL`
   - `anon` public key → `PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` secret key → `SUPABASE_SERVICE_ROLE_KEY` (Secret — server only!)

That alone makes the bar live for whatever lands in the table. You already have
these keys from your existing project.

---

## 2. PayMongo (QR Ph / cards)

1. Dashboard → Developers → Webhooks → add `https://YOURDOMAIN/api/webhooks/paymongo`.
2. Subscribe to event `payment.paid` (and/or `link.payment.paid`).
3. Copy the webhook's signing secret → `PAYMONGO_WEBHOOK_SECRET`; set `PAYMONGO_WEBHOOK_MODE` to `test` or `live`.

Verified via HMAC-SHA256 of `"<t>.<rawBody>"`. Amounts arrive in **centavos** (handled).

---

## 3. Crypto (USDC/USDT on Ethereum) via Alchemy

> 🔴 **Currently OFF.** Crypto is removed from the payment options on the page,
> and the Alchemy handler records nothing (`CRYPTO_ENABLED = false` in
> `src/routes/api/webhooks/alchemy/+server.js`) — because the shared address also
> receives client payments. To re-enable: move to a **dedicated donation wallet**,
> then flip `CRYPTO_ENABLED` to `true` and restore the accordion item in
> `src/lib/SupportPayments.svelte`.

1. alchemy.com → create an app on **Ethereum Mainnet**.
2. Notify → **Address Activity** webhook → watch `DONATION_ETH_ADDRESS`, URL `https://YOURDOMAIN/api/webhooks/alchemy`.
3. Copy the webhook **signing key** → `ALCHEMY_SIGNING_KEY`.

Only `USDC` / `USDT` transfers **to** your address are recorded; stablecoins are treated 1:1 with USD. Idempotent on `txHash:logIndex`.

> This address **also receives client payments**. List the client's sender
> wallet(s) in `CRYPTO_IGNORE_FROM` (comma-separated) and those transfers are
> skipped — everything else auto-counts as a donation. Get the address from any
> past payment on Etherscan. Only reliable if the client pays from a fixed
> self-custody wallet (exchanges rotate addresses — then prefer a dedicated
> donation wallet, see §6).

> No-backend alternative: the same data is readable client-side from the free Etherscan API. Ask and I'll wire a browser poller instead — but don't run both or crypto double-counts.

---

## 4. PayPal (needs a **business** account)

A personal `paypal.me` link can't emit webhooks. To automate:

1. Upgrade to a Business account.
2. developer.paypal.com → create a REST app → copy client id/secret → `PAYPAL_CLIENT_ID`, `PAYPAL_SECRET`.
3. Add a webhook `https://YOURDOMAIN/api/webhooks/paypal`, subscribe to `PAYMENT.CAPTURE.COMPLETED`, copy its **Webhook ID** → `PAYPAL_WEBHOOK_ID`.
4. Set `PAYPAL_ENV` to `sandbox` or `live`.

Verified by calling PayPal's `verify-webhook-signature` API.
**If you stay on personal PayPal:** skip this and instead forward PayPal's "you've got money" emails → Zapier → an HTTP POST to a small custom endpoint (or insert into Supabase directly).

---

## 5. Wise

Wise has no dashboard toggle for personal webhooks — you create the subscription
via its (free) API. One-time setup with `curl`:

**a. Get an API token.** Wise app/site → Settings → **API tokens** → create one
(read scope is enough). This token is only used now, to create the subscription;
it is NOT needed at runtime.

**b. Find your profile id:**

```bash
curl https://api.wise.com/v2/profiles \
  -H "Authorization: Bearer YOUR_API_TOKEN"
# grab the "id" of your personal profile
```

**c. Create the balance-credit subscription** (use schema `4.0.0` for ms timestamps):

```bash
curl -X POST https://api.wise.com/v3/profiles/PROFILE_ID/subscriptions \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Shikaku+ donations",
    "trigger_on": "balances#credit",
    "delivery": { "version": "4.0.0", "url": "https://YOURDOMAIN/api/webhooks/wise" }
  }'
```

Creating it **sends a test event** to your endpoint right away — good for
confirming reachability. (Our handler ignores the test's sample amount, so it
won't add a row.)

**d. Add the public key.** Copy Wise's **production** RSA public key (the full
`-----BEGIN PUBLIC KEY----- … -----END PUBLIC KEY-----` block) from the Wise docs
→ Cloudflare env `WISE_PUBLIC_KEY`. Multi-line paste is fine; the verifier strips
whitespace. Verified via RSA-SHA256, base64, header `X-Signature-SHA256`.

> ⚠️ **`balances#credit` reports ALL money entering that Wise balance** — client
> invoices, refunds, transfers from friends, not just donations. So Wise rows are
> stored **unconfirmed and don't count** until you approve them — see §6.

---

## 6. Telling donations apart from your other income

Two different mechanisms keep non-donation money off the bar:

**Crypto — filtered at source.** The client who pays at your donation address is
listed in `CRYPTO_IGNORE_FROM` (§3); their transfers are skipped and everything
else auto-counts. Zero manual steps.

**Wise — manual confirm.** Wise can't filter by sender, so it's in `NEEDS_REVIEW`
in `src/lib/server/donations.js`: its credits are inserted with
`confirmed = false` and **excluded from the bar** until you approve them.
Donation-only channels (the PayMongo link) and crypto auto-confirm.

**To approve a Wise donation:** Supabase → Table editor → `donations` → tick
`confirmed` on the row. The bar re-reads and ticks up live the moment you save.

- Add `'paypal'` to `NEEDS_REVIEW` if/when your personal PayPal also gets work pay.
- If the crypto client ever switches to an **exchange** (rotating addresses),
  `CRYPTO_IGNORE_FROM` won't catch them — switch to a **dedicated donation
  wallet** (fresh ETH address used only on the site; update `DONATION_ETH_ADDRESS`,
  the QR images, and the address in `src/lib/SupportPayments.svelte`).

---

## Currency / FX

The bar is in USD. `src/lib/server/donations.js` holds a small static FX table
(`USD_RATES`) — PHP, EUR, GBP, etc. → USD. Keep it roughly current, or swap
`toUsd()` for a live FX feed if exactness matters. Stablecoins are 1:1.

## Testing without real money

- Supabase: insert a row by hand in the table editor → the bar should jump instantly.
- PayMongo / PayPal / Alchemy: each dashboard has a **"send test event"** button.
- Re-send the same test event twice → total must **not** change (idempotency).

## What I couldn't do for you

Create the accounts, register the webhook URLs, or run the live endpoints (they
need your secrets). Everything else — endpoints, signature verification,
idempotency, the realtime bar — is in place.
