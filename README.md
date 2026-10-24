# Interactive AR Digital Electronics Laboratory
### Implementation and Verification of Boolean Functions in SOP and POS Forms

[![CI - AR-Lab Quality & Test Automation](https://github.com/ameydongre10/AR-lab/actions/workflows/ci.yml/badge.svg)](https://github.com/ameydongre10/AR-lab/actions/workflows/ci.yml)
[![Deploy AR Lab to GitHub Pages](https://github.com/ameydongre10/AR-lab/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/ameydongre10/AR-lab/actions/workflows/deploy-pages.yml)

**Web Platform:** React 19, TypeScript, Vite 8, Tailwind CSS, Express, WebXR, Google `<model-viewer>` 4.4, Three.js  
**Mobile XR Engine:** Android (ARCore), Unity 6 LTS (`6000.0.32f1`), AR Foundation 6.4.3  
**Simulation Engine:** Deterministic 3-Valued Fixpoint Logic Solver ($0, 1, X$), TTL 7400-Series ICs  
**Persistence & API:** Dual-Engine Persistence (ACID Document Store / SQLite for Node.js & Serverless, plus automatic LocalStorage client fallback for GitHub Pages & static CDN)  
**Supported Hosting:** GitHub Pages (Static / CDN), Vercel (Serverless Fullstack), Render (Persistent Node.js), Docker Containers  

---

## 📌 Project Overview

The **Interactive AR Digital Electronics Laboratory** is a comprehensive educational platform that bridges augmented reality with hardware-accurate digital electronics simulation. Engineering students and educators can author, design, simulate, and verify digital electronic circuits in 3D and immersive spatial AR on web browsers and mobile devices.

The primary laboratory focus is the **implementation, synthesis, and verification of Boolean functions in both Sum-of-Products (SOP) and Product-of-Sums (POS) forms** using standard TTL logic gates:
- **SN7404** (Hex Inverter — 6 independent NOT gates)
- **SN7408** (Quad 2-Input AND Gate — 4 independent gates)
- **SN7432** (Quad 2-Input OR Gate — 4 independent gates)

Unlike static flashcards or mockups, this platform features an authoritative **deterministic 3-valued digital logic solver** (LOW, HIGH, UNDEFINED). Floating terminals, unpowered ICs, and output contention are properly evaluated rather than concealed with false positives.

---

## 🔬 Dual-Engine Architecture

```text
                                  ┌────────────────────────────────────────────────────────┐
                                  │           AR LAB UNIFIED APPLICATION PLATFORM          │
                                  └───────────────────────────┬────────────────────────────┘
                                                              │
                                ┌─────────────────────────────┴─────────────────────────────┐
                                ▼                                                           ▼
                ┌───────────────────────────────┐                           ┌───────────────────────────────┐
                │   Web AR & Simulation Suite   │                           │     Unity Mobile XR Engine    │
                │  (React 19, Vite, TypeScript) │                           │   (Unity 6 LTS, AR Foundation)│
                └───────────────┬───────────────┘                           └───────────────┬───────────────┘
                                │                                                           │
        ┌───────────────────────┼───────────────────────┐                                   │
        ▼                       ▼                       ▼                                   ▼
┌────────────────┐      ┌────────────────┐      ┌────────────────┐                  ┌────────────────┐
│   REST API &   │      │ 3-Valued Logic │      │  WebXR / AR    │                  │ Android ARCore │
│ Database Store │      │Fixpoint Solver │      │ Model Viewer   │                  │  Runtime APK   │
└────────────────┘      └────────────────┘      └────────────────┘                  └────────────────┘
```

### 1. Web AR Platform (`/src`)
- **Interactive Virtual Breadboard Studio:** Real-time breadboard wiring schematic, IC seating, input toggles (A, B, C, S), VCC/GND DC power switch, and live output indicator LED.
- **Automated Truth Table Verification:** Evaluates input rows in standard MSB-first order ($00, 01, 10, 11$), displays row-by-row simulation results, calculates percentage pass rate, and logs verified lab runs to persistent storage.
- **Cross-Platform Augmented Reality:**
  - Android Chrome via **WebXR `immersive-ar`** and **Google Scene Viewer**.
  - iOS Safari via **Apple AR Quick Look** (`.usdz` and `.glb` anchor).
  - Desktop fallback with full 3D orbital controls (rotate, zoom, pan, reset) and **instant Mobile QR Code handoff**.
- **Complete End-to-End CRUD:**
  - **Experiments:** Full authoring with live Boolean expression parsing, auto-generated truth tables, required IC selectors, and step-by-step procedure builders.
  - **3D Spatial Assets:** Upload, preview, update, and safe deletion with dependency referencing.
  - **Lab Sessions:** Persists student names, test run timestamps, pass rates, and truth table results.
  - **Categories & Metrics:** Dynamic curriculum categories and aggregate stats.
- **Dual-Mode Persistence (Zero-Config Portability):**
  - **Server / Serverless Mode:** Backed by persistent ACID atomic JSON store with SQLite compatibility and `/tmp` support for Vercel lambdas.
  - **Static / GitHub Pages Mode:** Automatically switches to high-speed `localStorage` persistence when no server exists. All CRUD actions, sessions, and edits persist in the browser with 0ms server latency.

### 2. Unity Mobile Engine (`/Assets`)
- Standalone Android APK build leveraging **Unity 6 LTS** and **AR Foundation 6.4.3**.
- Plane detection, surface-normal horizontal placement (`minVerticalAngle = 0f`), touch pass-through prevention (`ArInteractionManager`), and 1.2mm sphere colliders respecting standard 2.54mm DIP pitch.

---

## 🚀 Quick Start & Local Development

### Prerequisites
- **Node.js:** `v20.x`, `v22.x`, or `v26.x`
- **npm:** `v10.x` or `v11.x`
- **.NET SDK:** `9.0.x` (optional, for standalone C# test runner)
- **Unity Hub / Unity 6000.0.32f1:** (optional, only for building native Android APKs)

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/ameydongre10/AR-lab.git
cd AR-lab
npm install
```
*(The repository includes `.npmrc` configured with `legacy-peer-deps=true` so package installation succeeds cleanly in all environments).*

### 2. Generate 3D AR Assets
Generate valid, optimized binary `.glb` 3D models for all lab components:
```bash
npm run generate:models
```
*Generated models placed in `public/models/`:*
- `breadboard.glb` (830-tie-point solderless breadboard)
- `ic-7404.glb` (SN7404 Hex Inverter DIP-14)
- `ic-7408.glb` (SN7408 Quad AND DIP-14)
- `ic-7432.glb` (SN7432 Quad OR DIP-14)
- `ar-lab-station.glb` (Full AR laboratory workbench)

### 3. Run Development Server
```bash
npm run dev
```
- Client runs on `http://localhost:3000`
- API server runs on `http://localhost:3001` (proxied by Vite)

### 4. Build and Run Production Server
```bash
npm run build
npm start
```
- Production bundle created in `dist/client/` and `dist/server/index.js`
- Serves application and REST API at `http://localhost:3001`

---

## 🌐 Production Deployment Options

The application is engineered to deploy seamlessly across static hosts, serverless platforms, persistent application servers, and Docker containers:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DEPLOYMENT COMPATIBILITY                           │
├──────────────────┬─────────────────┬───────────────────┬────────────────────┤
│ GitHub Pages     │ Vercel          │ Render / Railway  │ Docker / Cloud Run │
│ (Static CDN)     │ (Serverless)    │ (Persistent Node) │ (Containerized)    │
├──────────────────┼─────────────────┼───────────────────┼────────────────────┤
│ Zero-server      │ Instant build   │ Full Express      │ Multi-stage Alpine │
│ LocalStorage DB  │ Serverless /api │ Attached disk     │ /app/data volume   │
│ Fastly CDN (0ms) │ SPA rewrites    │ Auto health-check │ Portable image     │
└──────────────────┴─────────────────┴───────────────────┴────────────────────┘
```

### 1. GitHub Pages (1-Click Automated Deployment)

The AR Lab platform runs 100% in the browser on GitHub Pages with zero server overhead. The 3-valued logic solver, Boolean parser, 3D model viewer, and WebXR spatial AR execute natively in client-side TypeScript.

**Setup Instructions:**
1. Push or merge changes to your `main` branch.
2. In your GitHub repository, navigate to **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, choose **GitHub Actions**.
4. GitHub Actions will automatically execute `.github/workflows/deploy-pages.yml` and publish your site at:
   ```
   https://<your-username>.github.io/AR-lab/
   ```

*Features on GitHub Pages:*
- Relative asset pathing (`base: './'`) prevents subpath 404s.
- Automatic LocalStorage persistence preserves custom experiments, edits, and student lab verification scores across page reloads.

### 2. Vercel Deployment

Pre-configured for Vercel with zero configuration via `vercel.json` and `.npmrc`:

1. Import your repository into [Vercel](https://vercel.com).
2. Vercel auto-detects the Vite configuration and uses:
   - **Build Command:** `npm run build:client` (automatically generates models and bundles Vite).
   - **Output Directory:** `dist/client`.
   - **Serverless API:** Routes `/api/*` to `api/index.ts`.
3. Click **Deploy**.

*Vercel Optimizations Included:*
- `.npmrc` with `legacy-peer-deps=true` eliminates npm dependency resolution errors.
- Database writes route to `/tmp/ar-lab-data` to prevent serverless read-only filesystem errors (`EROFS`).
- `app.listen()` is bypassed in serverless mode to prevent cold-start hanging.
- Built-in client fallback guarantees instant UI loading even during serverless cold starts.

### 3. Docker Container Deployment

A multi-stage production container is provided in `Dockerfile`:
```bash
# Build production image
docker build -t ar-lab:latest .

# Run with persistent data volume mounted
docker run -d -p 3001:3001 -v ar_lab_data:/app/data --name ar-lab ar-lab:latest
```
Access the application at `http://localhost:3001`. Includes automated Docker health checks on `/api/health`.

### 4. Render Deployment (`render.yaml`)

A complete Render Blueprint is included in `render.yaml`:
1. Connect your repository to [Render](https://render.com).
2. Select **New** > **Blueprint**.
3. Render creates the Node.js web service, mounts a 1GB persistent disk at `/app/data`, and configures health probes on `/api/health`.

---

## 🧪 Automated Testing & Verification

The project includes dual-test-suite verification across the Web platform and the C# simulation engine.

### 1. Web Platform Automated Tests
Run unit, logic parser, and CRUD API integration tests:
```bash
npm test
```
**Test Coverage (11 / 11 PASSED):**
- `DatabaseStore: Experiments CRUD Operations` (Create, Read with filters, Update, Cascade Delete)
- `DatabaseStore: 3D Models CRUD and Safety Constraints` (Blocks deletion of in-use models)
- `DatabaseStore: Lab Sessions CRUD and Pass Rate Calculation`
- `3-Valued Logic: Fundamental Operations` (Dominant Low in AND, Dominant High in OR, Inversion, Undefined propagation)
- `TTL IC Definitions: 7404, 7408, 7432 Pinout Specifications` (DIP-14 signal-to-pin mapping)
- `BooleanExpression: Tokenization, Parsing, and AST Evaluation`
- `BooleanExpression: Error Handling for Malformed Expressions`
- `Circuit Simulator: Fixpoint Solve and Power Isolation`
- `API Router: Health & Diagnostics Route`
- `API Router: Validate Expression Endpoint`
- `API Router: Circuit Simulation Route`

### 2. Standalone C# .NET Simulation Tests (Preserved Engine)
Run the 82-test C# simulation suite:
```bash
npm run test:unity
# Or via dotnet CLI:
dotnet run --project .github/workflows/support/CiRunner.csproj
```
**Status: 82 / 82 Unit Tests PASSED (100% Pass Rate)**

---

## 📡 REST API Reference

| Method | Endpoint | Description | Request Body / Params |
|---|---|---|---|
| `GET` | `/api/health` | System health, uptime, and platform metrics | None |
| `GET` | `/api/stats` | Aggregated laboratory stats & recent activity | None |
| `GET` | `/api/experiments` | List experiments with search and filters | `?search=&categoryId=&difficulty=&canonicalForm=&page=&limit=` |
| `GET` | `/api/experiments/:id` | Get single experiment with relations | None |
| `POST` | `/api/experiments` | Create new experiment with validation | `{ title, description, categoryId, targetExpression, canonicalForm, ... }` |
| `PUT` | `/api/experiments/:id` | Update experiment details | Partial experiment fields |
| `DELETE` | `/api/experiments/:id` | Delete experiment and cascade sessions | None |
| `GET` | `/api/models` | List all 3D spatial models | `?search=` |
| `POST` | `/api/models` | Register new 3D model asset | `{ name, fileUrl, format, polyCount, arPlacement, dimensions }` |
| `DELETE` | `/api/models/:id` | Delete model (blocked if referenced) | None |
| `GET` | `/api/categories` | List all curriculum categories | None |
| `GET` | `/api/sessions` | List recorded student lab sessions | `?experimentId=` |
| `POST` | `/api/sessions` | Record verified lab run | `{ experimentId, studentName, truthTableResults, notes }` |
| `POST` | `/api/simulate` | Solve circuit netlist using 3-valued fixpoint | `{ powerOn, inputs, chips, wires }` |
| `POST` | `/api/validate-expression`| Parse Boolean algebra into SOP/POS & truth table | `{ expression, customVars }` |

---

## 📱 Augmented Reality (AR) Device & Browser Compatibility

| Platform / Device | AR Technology | Launch Behavior | Camera Permissions |
|---|---|---|---|
| **Android (ARCore supported)** | WebXR / Google Scene Viewer | Native AR spatial surface tracking with 1:1 scale placement | Requested on first launch via browser prompt |
| **iOS (iPhone / iPad)** | Apple AR Quick Look | Native USDZ / Quick Look modal with plane detection | Native iOS system prompt |
| **Desktop / Laptop** | Three.js / WebGL + QR Code | High-fidelity 3D OrbitControls (rotate, zoom, pan) + Instant Mobile Handoff QR Code | Camera not required on desktop |

### Camera Permission Protocol
- Camera access is requested **only when the user explicitly clicks "Launch Spatial AR"**.
- Camera data is processed entirely in hardware on-device by WebXR / ARCore / ARKit for planar feature tracking; video streams are never transmitted or persisted.

---

## 🔍 Audit & Engineering Defect Resolution

| Area | Discovered Defect | Engineering Correction |
|---|---|---|
| **Platform Scope** | Repository only targeted native Android APK; inaccessible to web students | Built complete, responsive Web AR platform with React 19, TypeScript, Express, and Google `<model-viewer>`. |
| **Vercel Peer Dependencies** | `npm install` failed with `ERESOLVE` due to `@google/model-viewer` peer dependencies | Added `.npmrc` setting `legacy-peer-deps=true`. |
| **Vercel Lambda Filesystem** | Serverless functions crashed on write attempts (`EROFS: read-only file system`) | Configured `DatabaseStore` to route writes to `/tmp/ar-lab-data` in serverless mode. |
| **GitHub Pages Subpath** | Asset URLs and 3D models broke with 404s when hosted under repository subpaths | Configured `base: './'` and universal `getAssetUrl` helper. |
| **Persistence & CRUD** | No persistent storage or database for curriculum experiments | Implemented dual-engine persistence: ACID atomic database for Node/Vercel and LocalStorage for GitHub Pages. |
| **AR Assets** | Missing standalone GLB models for web 3D rendering | Procedurally generated 5 high-fidelity binary `.glb` models matching physical Texas Instruments component specs. |
| **Circuit Simulation** | Simulation logic existed only in C# Unity assemblies | Ported and verified the exact 3-valued fixpoint solver and recursive-descent Boolean parser to TypeScript. |
| **Mobile AR Handoff** | Desktop users had no bridge to experience spatial AR | Implemented real-time QR code generator for instant mobile handoff to iOS Quick Look and Android Scene Viewer. |
| **Collider Sizing** (`ComponentFactory.cs`) | Pin sphere radius set to 0.9m, causing overlapping colliders | Set radius to 1.2mm (`0.0012f`), respecting standard 2.54mm DIP pitch. |
| **Coordinate System** (`BreadboardGrid.cs`) | Row offsets mapped along Y instead of Z, breaking 3D picking | Corrected 3D socket mapping along the Z axis with backward compatibility. |
| **Truth Table Order** (`TruthTableEvaluator.cs`) | Generated rows LSB-first (`00, 10, 01, 11`) | Corrected bit-masking to standard academic MSB-first order (`00, 01, 10, 11`). |

---

## 📜 References & Educational Standards
1. M. Morris Mano & Michael D. Ciletti, *Digital Design: With an Introduction to the Verilog HDL*, Pearson.
2. R. P. Jain, *Modern Digital Electronics*, McGraw-Hill Education.
3. Texas Instruments TTL Logic Data Books (SN7400, SN7404, SN7408, SN7432 Series).
4. W3C WebXR Device API Specification.
5. Google `<model-viewer>` Specification.

---

## 📄 License
This project is open-source under the MIT License for educational and research purposes.
