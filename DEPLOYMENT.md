# Frontend Deployment — Vercel

## Stack
- **Framework** — Angular 18
- **Hosting** — Vercel (free, global CDN, auto SSL)

---

## Prerequisites

- GitHub account
- Vercel account → [vercel.com](https://vercel.com)
- Backend already deployed on Render and URL is known ✅

---

## Step 1 — Update production environment

Open `src/environments/environment.prod.ts` and replace the placeholders with your real Render backend URL:

```ts
export const environment = {
  production: true,
  apiUrl: 'https://<your-backend>.onrender.com/api',
  wsUrl: 'wss://<your-backend>.onrender.com',
};
```

Commit and push to GitHub.

---

## Step 2 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your `SOCIAL-MEDIA-FRONTEND` GitHub repo
3. Vercel auto-detects Angular — verify these settings:
   - Framework Preset: **Angular**
   - Build Command: `npm run build`
   - Output Directory: `dist/frontend`
4. Click **Deploy**
5. Wait ~1 minute for the build to finish
6. Visit your Vercel URL and test login/register

> **`vercel.json`** is already in the repo root — it handles Angular client-side routing
> so direct URL access and page refreshes don't return 404.

---

## Step 3 — Update backend CORS

After getting your Vercel URL (e.g. `https://social-media-app.vercel.app`):

1. Go to Render → your backend service → **Environment**
2. Update these two vars:
   ```
   CORS_ORIGIN=https://social-media-app.vercel.app
   FRONTEND_URL=https://social-media-app.vercel.app
   ```
3. Click **Manual Deploy** on Render to apply

Without this step, login and OAuth redirects will fail due to CORS errors.

---

## Quick Reference

| Service | URL |
|---|---|
| Frontend | `https://<your-app>.vercel.app` |
| Backend API | `https://<your-backend>.onrender.com/api` |

---

## Checklist

- [ ] `environment.prod.ts` updated with real backend URL
- [ ] Pushed to GitHub
- [ ] Deployed on Vercel — app loads correctly
- [ ] Login and register work
- [ ] `CORS_ORIGIN` and `FRONTEND_URL` updated on Render
- [ ] WebSocket (messages + notifications) working in production
