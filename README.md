# Klik Boutique demo shopping app
Node/Express PWA. `npm install && npm start` (set PORT and ADMIN_PIN env vars; if ADMIN_PIN is unset a random PIN is printed in the server log at startup). Admin at /admin.
Products live in `data.json` (committed = the seed). On hosts with ephemeral disk (Render free), changes made in admin reset on restart/redeploy: download a backup from /api/backup?pin=PIN and commit it as data.json to make them permanent.

## Stripe Checkout
Set `STRIPE_SECRET_KEY` to your Stripe **secret** key (`sk_test_...` for test mode; never the `pk_` publishable key). Optional `SHIPPING_FLAT_CENTS` (default 800 = $8.00); free "Local pickup" is always offered. Without a secret key the app keeps the demo checkout.
Paid orders appear in Admin › Orders (read from Stripe); stock in data.json is decreased once per paid session when the customer reaches the success page.
Test card: 4242 4242 4242 4242, any future date, any CVC.
