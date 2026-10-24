# LSTM Interactive Visualizer

An educational, interactive web-based visualizer for Long Short-Term Memory (LSTM) neural networks designed to teach sequence modeling and internal gate mechanics from intuitive and mathematical perspectives.

---

## Architecture & Features

1. **Interactive SVG Schematic**:
   - **Cell State Line ($C_t$):** Horizontal conveyor belt running across the top.
   - **Forget Gate ($f_t$):** Sigmoid-activated valve filtering prior memory ($f_t \in [0, 1]$).
   - **Input Gate ($i_t$):** Sigmoid-activated gate throttling new information ($i_t \in [0, 1]$).
   - **Candidate Gate ($\tilde{C}_t$):** Hyperbolic tangent transformation creating candidate signals ($\tilde{C}_t \in [-1, 1]$).
   - **Memory Cell Hub ($\oplus$):** Pointwise linear accumulator blending $(f_t \odot C_{t-1}) + (i_t \odot \tilde{C}_t)$.
   - **Output Gate ($o_t$):** Sigmoid-activated filter controlling emission to short-term memory.
   - **Hidden State ($h_t$):** Output loop emitting current prediction and feeding into step $t+1$.

2. **Live Math Inspector**:
   - Displays exact formulas, output ranges, step-by-step arithmetic substitutions, and plain-English explanations for any selected node.

3. **Sandbox Override Deck**:
   - Sliders for $f_t, i_t, \tilde{C}_t, o_t$ with one-click presets ("Total Amnesia", "Pure Preservation", "Total Overwrite", "Max Readout").

4. **Simulation Player & Memory Trajectory**:
   - Step through presets ("The clouds are in the ... sky", "wonderful but terrible", etc.) or custom sentences.
   - Time-series plot of $C_t$ and $h_t$ trajectories over sequence length.

5. **Glossary & RNN Comparison**:
   - Explains Sigmoid, Tanh, Hadamard Product ($\odot$), Concatenation $[h_{t-1}, x_t]$, and the Vanishing Gradient problem.

---

## Vercel Deployment Guide

The repository includes a production-ready `vercel.json` configuration configured specifically for Vite Single-Page Applications (SPA), with catch-all rewrites to `/index.html`, immutable asset caching, and HTTP security headers.

### Method 1: Deploy with Vercel CLI

```bash
# 1. Install the Vercel CLI globally
npm install -g vercel

# 2. Login to your Vercel account
vercel login

# 3. Deploy to preview
vercel

# 4. Deploy directly to production
vercel --prod
```

### Method 2: Deploy via GitHub / GitLab / Bitbucket

1. Push your repository to your Git provider (GitHub, GitLab, or Bitbucket).
2. Go to the [Vercel Dashboard](https://vercel.com/new).
3. Click **"Add New..."** → **"Project"** and import your repository.
4. Vercel will automatically detect **Vite** from `package.json` and configure:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install --legacy-peer-deps`
5. Click **"Deploy"**. The site will deploy instantly with a live `.vercel.app` URL and automatic SSL.

### Peer Dependency Handling (React 19 & ERESOLVE Fix)

To prevent `npm error code ERESOLVE` during Vercel's automated `npm install` phase, the project includes:
1. `.npmrc` configured with `legacy-peer-deps=true`
2. `vercel.json` configured with `"installCommand": "npm install --legacy-peer-deps"`

This ensures npm resolves React 19 peer dependencies smoothly without throwing build-time dependency tree conflicts.

### Vercel Routing & SPA Catch-All (`vercel.json`)

The included `vercel.json` ensures client-side routing works seamlessly on deep link reloads:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## Security Directives & Secret Management

The application enforces zero-hardcoding hygiene and OWASP Top 10 security standards.

### Secret Manager Configuration

Store sensitive credentials (such as `GEMINI_API_KEY`) securely within Google Cloud Secret Manager:

```bash
# Create and populate the secret
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
echo -n "YOUR_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# Grant the default Cloud Run service account access to read the secret
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:YOUR_PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### Cloud Firestore Security Rules

When persistent session or interaction state storage is enabled, enforce owner-bound isolation:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/interactions/{interactionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## Cloud Run Deployment Flow

### Prerequisites
- Google Cloud SDK (`gcloud`) installed and authenticated.
- Google Cloud Project with Cloud Run, Secret Manager, and Artifact Registry enabled.

```bash
# Enable required APIs
gcloud services enable run.googleapis.com secretmanager.googleapis.com

# Build and deploy container to Cloud Run
gcloud run deploy lstm-visualizer \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest"
```

### Verification Binding
Apply the mandatory resource label for campaign validation:

```bash
gcloud run services update lstm-visualizer \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=us-central1
```
