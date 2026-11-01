# Klik Clothing demo shopping app
Node/Express PWA. `npm install && npm start` (PORT, ADMIN_PIN env vars; PIN defaults to 2468). Admin at /admin.
Products live in `data.json` (committed = the seed). On hosts with ephemeral disk (Render free), changes made in admin reset on restart/redeploy: download a backup from /api/backup?pin=PIN and commit it as data.json to make them permanent.
