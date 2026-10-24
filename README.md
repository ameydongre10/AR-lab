# Interactive AR Digital Electronics Laboratory
### Implementation and Verification of Boolean Functions in SOP and POS Forms

[![CI - AR-Lab Quality & Test Automation](https://github.com/ameydongre10/AR-lab/actions/workflows/ci.yml/badge.svg)](https://github.com/ameydongre10/AR-lab/actions/workflows/ci.yml)
**Web Platform:** React 19, TypeScript, Vite 8, Tailwind CSS, Express, WebXR, Google `<model-viewer>` 4.4, Three.js  
**Mobile XR Engine:** Android (ARCore), Unity 6 LTS (`6000.0.32f1`), AR Foundation 6.4.3  
**Simulation Engine:** Deterministic 3-Valued Fixpoint Logic Solver ($0, 1, X$), TTL 7400-Series ICs  
**Persistence & API:** REST API with Persistent Relational Document Store, SQLite compatibility  

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
- **Automated Truth Table Verification:** Evaluates input rows in standard MSB-first order ($00, 01, 10, 11$), displays row-by-row simulation results, calculates percentage pass rate, and logs verified lab runs to the database.
- **Cross-Platform Augmented Reality:**
  - Android Chrome via **WebXR `immersive-ar`** and **Google Scene Viewer**.
  - iOS Safari via **Apple AR Quick Look** (`.usdz` and `.glb` anchor).
  - Desktop fallback with full 3D orbital controls (rotate, zoom, pan, reset) and **instant Mobile QR Code handoff**.
- **Complete End-to-End CRUD:**
  - **Experiments:** Full authoring with live Boolean expression parsing, auto-generated truth tables, required IC selectors, and step-by-step procedure builders.
  - **3D Spatial Assets:** Upload, preview, update, and safe deletion with dependency referencing.
  - **Lab Sessions:** Persists student names, test run timestamps, pass rates, and truth table results.
  - **Categories & Metrics:** Dynamic curriculum categories and aggregate stats.

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
npm install --legacy-peer-deps
```

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

## 🧪 Automated Testing & Verification

The project includes automated verification across both the Web platform and the C# simulation engine.

### 1. Web Platform Automated Tests
Run unit, logic parser, and CRUD API integration tests:
```bash
npm test
```
**Test Coverage:**
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

### 2. Standalone C# .NET Simulation Tests
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

## 🚢 Production Deployment

### 1. Docker Deployment
```bash
docker build -t ar-lab:latest .
docker run -d -p 3001:3001 -v ar_lab_data:/app/data ar-lab:latest
```

### 2. Render Deployment (`render.yaml`)
A ready-to-deploy blueprint is included in `render.yaml`:
1. Connect your GitHub repository to [Render](https://render.com).
2. Create a new **Blueprint Instance**.
3. Render automatically provisions the web service, builds the client and server, and attaches persistent disk storage at `/app/data`.

### 3. Vercel Deployment (`vercel.json`)
Configured with automatic single-page application fallback routing in `vercel.json`:
```bash
vercel --prod
```

---

## 🔍 Audit & Engineering Defect Resolution

| Area | Discovered Defect | Engineering Correction |
|---|---|---|
| **Platform Scope** | Repository only targeted native Android APK; inaccessible to web students | Built complete, responsive Web AR platform with React 19, TypeScript, Express, and Google `<model-viewer>`. |
| **Persistence & CRUD** | No persistent storage or database for curriculum experiments | Implemented ACID atomic database store with full CRUD for experiments, models, sessions, and categories. |
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
