# Klik Boutique demo shopping app
Node/Express PWA. `npm install && npm start` (set PORT and ADMIN_PIN env vars; if ADMIN_PIN is unset a random PIN is printed in the server log at startup). Admin at /admin.
Products live in `data.json` (committed = the seed). On hosts with ephemeral disk (Render free), changes made in admin reset on restart/redeploy: download a backup from /api/backup?pin=PIN and commit it as data.json to make them permanent.
