<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1zGww_8Hw6WpU4HnMF_IX1xbNSl55P8B5

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env` and set `GEMINI_API_KEY`. Keep this file only on the server.
3. Run the AI server:
   `npm run ai`
4. Run the app:
   `npm run dev`
5. Configure admin login only on server env:
   `ADMIN_LOGIN_EMAIL`, `ADMIN_LOGIN_PASSWORD` (or `ADMIN_USERS_JSON`)

## Security notes

- Do not expose `GEMINI_API_KEY` in Vite variables. Browser variables must not contain secrets.
- In production, set `ALLOWED_ORIGINS` to the public site URL, for example `https://seudominio.com`.
- If the AI API runs on another domain, set `VITE_AI_API_URL` to that public API URL and add it to the `connect-src` rule in `public/_headers`.
- Never keep admin credentials in frontend code. Keep them only in server env variables.
