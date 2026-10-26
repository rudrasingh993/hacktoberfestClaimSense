# Vercel Deployment Guide for ClaimSense

ClaimSense is architected as a hybrid application:
- **Frontend**: High-performance React 19 + TypeScript + Vite Single Page Application.
- **Backend API**: Python FastAPI application served serverlessly via `@vercel/python` through [`api/index.py`](file:///c:/Users/murli/Pictures/hacktopefestsubmit/api/index.py).
- **Calculation Engine**: 100% deterministic arithmetic (integer paise with `ROUND_HALF_UP`) that runs identically offline, locally, or in cloud serverless containers.

---

## 🚀 Quick Deployment Options

### Option A: Deploy via GitHub (Recommended)
1. Push this repository to your GitHub account:
   ```bash
   git add .
   git commit -m "ClaimSense Hacktoberfest 2026 Production Release"
   git push origin main
   ```
2. Go to [vercel.com/new](https://vercel.com/new) and import your repository.
3. Vercel automatically detects the root [`vercel.json`](file:///c:/Users/murli/Pictures/hacktopefestsubmit/vercel.json) and [`package.json`](file:///c:/Users/murli/Pictures/hacktopefestsubmit/package.json):
   - **Framework Preset**: Other / Vite
   - **Build Command**: `npm --prefix frontend install && npm --prefix frontend run build`
   - **Output Directory**: `frontend/dist`
4. Click **Deploy**. Vercel will install Python dependencies from [`requirements.txt`](file:///c:/Users/murli/Pictures/hacktopefestsubmit/requirements.txt), compile the React application, and expose the FastAPI backend at `/api/*`.

---

### Option B: Deploy via Vercel CLI
If you have the Vercel CLI installed:
```bash
npm install -g vercel
vercel login
vercel
```
Follow the interactive prompts:
- Link to existing project? `N`
- Project name: `claimsense`
- Directory: `./`
- Want to modify settings? `N`

Deploy to production:
```bash
vercel --prod
```

---

## ⚙️ Environment Variables (Optional)

In your Vercel Project Dashboard under **Settings > Environment Variables**, you can configure:

| Variable | Default | Description |
|---|---|---|
| `APP_ENV` | `production` | Sets application mode. |
| `AI_PROVIDER` | `auto` | `auto`, `ollama`, `gemini`, or `offline`. In cloud serverless, `auto` safely utilizes offline heuristics or cloud Gemini if key is provided. |
| `GEMINI_API_KEY` | *(None)* | *(Optional)* Google Gemini API key if you wish to use Gemini for cloud-based document extraction and reasoning. |
| `MAX_UPLOAD_SIZE_MB` | `10` | Maximum bill/policy image upload size. |

> [!NOTE]
> **No Ollama Daemon in Serverless**:
> Local Ollama runs on your local workstation (`localhost:11434`). On Vercel's serverless environment, ClaimSense automatically utilizes its **Deterministic Reasoning & Policy Rules Fallback** (or Google Gemini if `GEMINI_API_KEY` is set). All calculations (room rent haircut, proportionate ratio, co-pay) remain 100% accurate and mathematically verified!

---

## 🧪 Verifying Your Vercel Deployment
Once deployed, test the following endpoints:
1. **Health Check**: `https://<your-app>.vercel.app/api/health`
2. **Policy Configuration**: `https://<your-app>.vercel.app/api/policies`
3. **Core Calculation**: `https://<your-app>.vercel.app/api/estimates/calculate`
4. **AI Copilot**: Click the floating **Ask ClaimSense AI** copilot button on the bottom right of any page to test real-time explanations!
