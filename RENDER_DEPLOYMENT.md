# EduPath AI Render Deployment Guide

## Project type
- Backend: Node.js / Express
- Frontend: Static HTML/CSS/JS
- No Vite or React detected
- The `backend` server now serves `frontend` static files, so Render can deploy the full app as one web service

## Render service settings
1. Create a new **Web Service** on Render.
2. Connect the repository: `https://github.com/joshkigs8-design/edupath-ai`
3. Branch: `main`
4. Environment: `Node`
5. Root directory: `/` (project root)

## Build command
```bash
npm install
```

## Start command
```bash
npm start
```

## Important Render environment variables
Set these in the Render dashboard under the service's Environment section.
- `DATABASE_URL`
- `PAYSTACK_SECRET_KEY`
- `PAYSTACK_PUBLIC_KEY`
- `GMAIL_USER`
- `GMAIL_APP_PASSWORD`
- `JWT_SECRET`
- `FRONTEND_URL` (for CORS origin, e.g. `https://your-render-service.onrender.com`)
- `ADMIN_EMAIL`
- `ADMIN_PIN`
- `NODE_ENV=production`

## What was updated for Render
- Added `.gitignore` to exclude `node_modules`, `.env`, logs, editor files, and build artifacts.
- Added `frontend/favicon.svg` and linked it in HTML pages.
- Added root `npm start` and `npm run dev` scripts in `package.json`.
- Updated `backend/server.js` to serve static frontend files from `../frontend`.
- Sanitized `backend/.env.example` so the repository does not contain real secrets.

## Mobile responsiveness
- All HTML pages already include a responsive viewport meta tag.
- The frontend CSS uses fluid layouts, `clamp()`, and `auto-fit` grid patterns for mobile-friendly rendering.

## Optional Render YAML
If you want a deploy config file, add a `render.yaml` instead of manual setup:

```yaml
services:
  - type: web
    name: edupath-ai
    env: node
    branch: main
    buildCommand: npm install
    startCommand: npm start
```

## Testing locally before Render
1. From project root:
   ```bash
   npm install
   npm start
   ```
2. Open `http://localhost:3001` and confirm the frontend loads.
3. Use `backend/.env.example` as a template for your local `.env` file.
