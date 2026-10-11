# Interactive AR Digital Electronics Laboratory
### Implementation of Boolean Functions Using Logic Gates in SOP and POS Forms

[![CI - AR-Lab Quality & Test Automation](https://github.com/ameydongre10/AR-lab/actions/workflows/ci.yml/badge.svg)](https://github.com/ameydongre10/AR-lab/actions/workflows/ci.yml)
**Target Platform:** Android (ARCore) & Unity Editor (Simulated XR)  
**Unity Version:** `6000.0.32f1` (Unity 6 LTS)  
**AR Framework:** AR Foundation 6.4.3 / ARCore XR Plugin 6.4.3  

---

## 📌 Project Overview

The **Interactive AR Digital Electronics Laboratory** is an augmented reality educational application built with **Unity 6** and **AR Foundation**. It allows engineering students to construct, simulate, and verify digital electronic circuits in an immersive spatial environment using virtual breadboards, TTL integrated circuits (7400-series), jumper wires, power supplies, and logic indicators.

The primary laboratory experiment focuses on the **implementation and verification of Boolean functions in both Sum-of-Products (SOP) and Product-of-Sums (POS) forms** using standard TTL logic gates:
- **7404** (Hex Inverter)
- **7408** (Quad 2-Input AND Gate)
- **7432** (Quad 2-Input OR Gate)

Unlike typical static demonstrations, this application features a **deterministic 3-valued digital logic solver** (LOW, HIGH, UNDEFINED) evaluating real graph connectivity on the breadboard netlist to a topological fixpoint.

---

## 🔬 System Architecture & Verified Implementation

### 1. High-Level Architecture

```text
                                  ┌─────────────────────────────┐
                                  │      AR Session & XR        │
                                  │   (Plane & Raycast Detect)  │
                                  └──────────────┬──────────────┘
                                                 │
                                                 ▼
┌─────────────────────────────┐   ┌─────────────────────────────┐   ┌─────────────────────────────┐
│          Lab HUD            │◄──┤        GameManager          ├──►│      LaboratoryManager      │
│  (UI, Controls, Validator)  │   │     (Lifecycle Master)      │   │   (Rig, Breadboard, Bench)  │
└─────────────────────────────┘   └─────────────────────────────┘   └──────────────┬──────────────┘
                                                 │                                 │
                                                 ▼                                 ▼
                                  ┌─────────────────────────────┐   ┌─────────────────────────────┐
                                  │      ConnectionGraph        │◄──┤      ElectronicComponent    │
                                  │   (Union-Find Terminals)    │   │      (ICs, Pins, Sockets)   │
                                  └──────────────┬──────────────┘   └─────────────────────────────┘
                                                 │
                                                 ▼
                                  ┌─────────────────────────────┐
                                  │    DigitalLogicSimulator    │
                                  │   (3-Valued Fixpoint Eval)  │
                                  └─────────────────────────────┘
```

### 2. Core Subsystems

- **AR & Spatial Lifecycle (`ARLab.AR`):**
  - Managed by `ARSessionController`, `ARPlacementManager`, and `ArPlaneVisualizer`.
  - Cold-launch availability check with runtime ARCore installer handling (`ARSession.CheckAvailability()` & `ARSession.Install()`).
  - Procedural AR plane mesh generation with tracked planar boundaries.
  - Plane raycasting with surface normal orientation and unconstrained horizontal placement (`minVerticalAngle = 0f`).
  - Robust touch gesture routing (`ArInteractionManager`) using `EventSystem.RaycastAll` with pointer event data to prevent touch pass-through to background 3D objects.

- **Virtual Laboratory Hardware (`ARLab.Laboratory`):**
  - **Breadboard (`Breadboard`, `BreadboardGrid`):** 63 columns, rows A–J, top and bottom split power rails.
  - **Socket & Pin Mapping:** Real 3D local coordinate space mapping column $X$ and row $Z$ offsets with 2D fallback.
  - **DIP Package Seating:** Dual in-line package IC pins automatically seat into breadboard sockets upon drop (`LaboratoryManager.SeatIc`), creating authoritative electrical ties (`BreadboardTie`) and unseating cleanly via reference cleanup (`RemoveTiesByRef`).
  - **Component Pin Colliders:** Sized to 1.2mm radius (`0.0012f`) to respect standard 2.54mm (0.1") DIP pitch without overlapping neighboring pin colliders.
  - **Leak-Free Material System:** `LabMaterials` employs cached procedural materials and `MaterialPropertyBlock` instances for wire/LED state tinting without GPU memory leakage.

- **Digital Logic Simulation (`ARLab.Electronics`, `ARLab.Simulation`):**
  - **Three-Valued Logic:** All nets use `LogicValue` (`Low`, `High`, `Undefined`). Floating terminals evaluate to `Undefined`, preventing false-positive validations.
  - **Fixpoint Evaluation:** Propagates signals across gate topologies until convergence or reports cycle/oscillation, output contention, and floating nets.
  - **Boolean Algebra Engine:** `BooleanExpression` tokenizes and parses expressions, supports negation normal form (`NormalizeNot`) using De Morgan's laws, and exports canonical SOP and POS representations.
  - **Canonical Truth Table Generation:** `TruthTableEvaluator` computes binary valuations in standard MSB-first order ($00, 01, 10, 11$) and validates against the live circuit netlist.

---

## 🛠️ Prerequisites & Environment Setup

### Required Tools
- **Unity Version:** `Unity 6000.0.32f1` (Unity 6 LTS)
- **Unity Modules:**
  - Android Build Support
  - Android SDK & NDK Tools
  - OpenJDK
- **Target Device (for Mobile AR):**
  - Android 10.0+ (API level 29 or higher, recommended API level 31+)
  - Google Play Services for AR (ARCore) supported device
  - Camera access permissions
- **Development Workstation:**
  - Windows 10/11, macOS, or Ubuntu Linux
  - .NET 8.0 or .NET 9.0 SDK (for running standalone unit test runner and CI checks)

### Package Manifest Dependencies (`Packages/manifest.json`)
- `com.unity.xr.arfoundation`: `6.4.3`
- `com.unity.xr.arcore`: `6.4.3`
- `com.unity.xr.management`: `4.5.1`
- `com.unity.inputsystem`: `1.14.2`
- `com.unity.test-framework`: `1.4.6`
- `com.unity.ugui`: `2.0.0`
- `com.unity.textmeshpro`: `3.2.0-pre.6`

---

## 🚀 Steps to Open, Run, and Build

### 1. Opening the Project in Unity Editor
1. Clone the repository:
   ```bash
   git clone https://github.com/ameydongre10/AR-lab.git
   cd AR-lab
   ```
2. Launch **Unity Hub**, click **Add** > **Add project from disk**, and select the cloned `AR-lab` folder.
3. Open the project using **Unity 6000.0.32f1**.
4. Allow Unity to import and compile packages.

### 2. Running in Unity Editor (Simulated XR Mode)
1. Open the primary scene at `Assets/Scenes/Main.unity`.
2. Press the **Play** button in the Unity Editor.
3. The application will initialize `GameManager`, generate the laboratory rig and HUD, and simulate AR plane detection.
4. Left-click to place the virtual laboratory onto the simulated plane surface.
5. Use the on-screen HUD to browse components, seat ICs onto the breadboard, run jumper wires, toggle power, and switch between SOP and POS experiments.

### 3. Building for Android (APK)
1. In Unity, go to **File** > **Build Profiles** (or **Build Settings**).
2. Switch platform to **Android**.
3. Verify that `Assets/Scenes/Main.unity` is included in **Scenes In Build**.
4. Navigate to **Edit** > **Project Settings** > **Player**:
   - **Minimum API Level:** Android 10.0 (API Level 29)
   - **Target API Level:** Android 14 (API Level 34) or Automatic Highest Installed
   - **Scripting Backend:** IL2CPP
   - **Target Architectures:** ARM64 enabled (ARMv7 disabled)
5. Navigate to **Project Settings** > **XR Plug-in Management**:
   - Under the **Android** tab, ensure **Google ARCore** is enabled.
6. Click **Build** and choose an output location (e.g., `Builds/ARLab.apk`).
7. Install the APK to a connected ARCore-supported Android device:
   ```bash
   adb install -r Builds/ARLab.apk
   ```

---

## 🧪 Test Automation & Quality Assurance

The project employs automated tests across EditMode, PlayMode, and standalone CI harnesses.

### 1. Standalone / CI Test Runner (.NET 9)
All pure-logic simulation engines, expression parsers, geometry calculations, and connection graphs run independently of the Unity Editor binary:
```bash
# Execute standalone test suite from repo root
dotnet run --project .github/workflows/support/CiRunner.csproj
```
**Current Status:** **82 / 82 Unit Tests PASSED (0 Failures, 100% Pass Rate)**

Test suites covered:
- `BooleanExpressionTests`: Tokenization, AST evaluation, SOP/POS generation, De Morgan normalization.
- `TruthTableEvaluatorTests`: Canonical MSB-first row ordering, undefined net handling, parity checks.
- `DigitalLogicSimulatorTests`: 7404, 7408, 7432 behavior, split-rail isolation, floating nets, contention, XOR loop fixpoint.
- `BreadboardGeometryTests`: 3D local Z-axis hole coordinates, 2D fallback, union-find socket ties, `RemoveTiesByRef`.
- `ComponentPinTests`: DIP package pin spacing, 1.2mm sphere collider verification, pin-to-pin clearance.
- `ConnectionGraphTests`: Disjoint set union-find, net bridging, cycle independence.
- `IcDefinitionTests`: TTL 7400 pin configurations, power/ground assignments.
- `LogicValueTests`: Tristate logic propagation ($0, 1, X$).

### 2. Unity Test Framework (EditMode & PlayMode)
Within the Unity Editor:
1. Open **Window** > **General** > **Test Runner**.
2. Run **EditMode** tests to validate scene assembly and component factories.
3. Run **PlayMode** tests (`Assets/Tests/PlayMode/LabPlayModeTests.cs`) to validate:
   - Full scene lifecycle and manager initialization.
   - IC placement and breadboard socket seating.
   - Wire creation, node connection, and state propagation.
   - Surface placement tilt angle clamping.

---

## 🔍 Audit & Defect Resolution Summary

During our engineering audit, the following critical defects were identified, diagnosed to root cause, and repaired:

| Defect / Subsystem | Root Cause | Engineering Correction |
|---|---|---|
| **AR Cold Launch Blocker** (`ARSessionController`) | Called non-blocking `IsArSupported()` without awaiting ARCore runtime availability checks. | Implemented coroutine `yield return ARSession.CheckAvailability()` with fallback to prompt `ARSession.Install()`. |
| **Component Pin Collider Scale** (`ComponentFactory`) | Sphere collider radius set to `0.9f` (0.9 meters!), causing all pins to overlap each other and blocking wire raycasts. | Reduced collider radius to `0.0012f` (1.2mm), respecting standard 2.54mm DIP pitch. |
| **Breadboard Coordinate Inversion** (`BreadboardGrid`, `Breadboard`) | Socket world position mapped row offsets along Y instead of Z, drifting picking away from 3D deck geometry. | Corrected `SocketWorldPosition` to map row offset along Z axis (`0.002f, RowY(row)`) with 2D backward compatibility. |
| **DIP Pin-to-Socket Seating** (`LaboratoryManager`, `ConnectionGraph`) | Placed ICs did not create electrical connections to breadboard column sockets, causing `ExperimentValidator` to fail. | Implemented `LaboratoryManager.SeatIc` with `BreadboardTie` mappings and reference-based unseating (`RemoveTiesByRef`). |
| **Truth Table Row Order** (`TruthTableEvaluator`) | Generated inputs LSB-first (`00, 10, 01, 11`), violating standard academic truth table order. | Fixed bit-masking to standard MSB-first order (`00, 01, 10, 11`). |
| **Boolean Expression Negation** (`BooleanExpression`) | Nested negations and POS forms failed to simplify or parse properly. | Added `NormalizeNot` (De Morgan's laws), `ToPos()` generator, and canonical product-of-sums parser. |
| **Touch Pass-Through** (`ArInteractionManager`) | Used `IsPointerOverGameObject(0)`, which fails on multi-touch mobile devices and allows touches to bleed into 3D. | Switched to `EventSystem.RaycastAll` with `PointerEventData` checking all active UI raycast targets. |
| **Placement Surface Pitch Tilt** (`ARPlacementManager`) | `minVerticalAngle = 10f` forced a 10-degree tilt when placing the rig on flat horizontal surfaces. | Set `minVerticalAngle = 0f` to ensure laboratory rests perfectly flat on horizontal tables. |
| **Material Memory Leak** (`LabMaterials`, `Wire`) | Instantiated dynamic `new Material()` per wire and overlay call without caching or disposal. | Added overlay cache dictionary and switched wire tinting to `MaterialPropertyBlock`. |
| **UI Overlap & Experiment Mode** (`LabHud`, `GameManager`) | Library panel title and subtitle overlapped; no interactive switcher for SOP vs POS mode. | Split text into dedicated layout bands, formatted subtitles, and added interactive SOP/POS toggle in ActionBar. |

---

## ⚠️ Known Limitations & Troubleshooting

### Known Limitations
- **Digital Combinational Logic Only:** The simulation engine models TTL digital gate states ($0, 1, X$). It does not simulate analog characteristics (rise/fall times, propagation delays, thermal dissipation, or analog voltage thresholds).
- **Physical AR Tracking Validation:** While AR Foundation 6.4.3 APIs, plane generation, and touch routing have been validated via code inspection and mock execution, real-world AR tracking relies on physical device sensors (IMU, camera) and requires deployment to physical hardware.

### Troubleshooting Guide

#### 1. AR Plane Detection Does Not Appear on Device
- Ensure the physical testing area has adequate lighting and surface textures (plain white surfaces or reflective tables make feature-point tracking difficult).
- Verify that Camera permissions were granted upon startup. If denied, open Android **Settings** > **Apps** > **AR Lab** > **Permissions** and allow **Camera**.
- Confirm that **Google Play Services for AR** is installed and updated on the target device via the Google Play Store.

#### 2. Touch Taps Not Registering on Breadboard or Pins
- If placing wires or selecting components fails, ensure the touch does not originate within active UI panels.
- Check that the bench has been placed firmly on the detected plane and is within reasonable camera range ($0.3\text{m} - 1.5\text{m}$).

#### 3. Build Fails on Android Export
- Verify that **Scripting Backend** is set to **IL2CPP** and **ARM64** is checked in Player Settings. Unity 6 does not support Mono on 64-bit Android targets.
- Ensure Android SDK platform tools matching API Level 34 (Android 14) are installed via Unity Hub or Android Studio.

#### 4. AppLocker / WDAC Issues Running .NET Tests Locally
- If executing `dotnet test` fails due to local Windows security policies preventing dynamic test assembly execution, run tests directly using the in-process runner:
  ```powershell
  dotnet run --project .github/workflows/support/CiRunner.csproj
  ```

---

## 📜 References & Educational Standards
1. M. Morris Mano & Michael D. Ciletti, *Digital Design: With an Introduction to the Verilog HDL*, Pearson.
2. R. P. Jain, *Modern Digital Electronics*, McGraw-Hill Education.
3. Texas Instruments TTL Logic Data Books (SN7400, SN7404, SN7408, SN7432 Series).
4. Unity Technologies, *AR Foundation 6.0 Documentation*.
5. Google Developers, *ARCore SDK for Unity Guides*.

---

## 📄 License
This project is open-source under the MIT License for educational and research purposes.
