import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

// Polyfill FileReader for Node.js
if (typeof FileReader === 'undefined') {
  globalThis.FileReader = class FileReader {
    readAsArrayBuffer(blob) {
      blob.arrayBuffer().then(buf => {
        this.result = buf;
        if (this.onload) this.onload({ target: this });
        if (this.onloadend) this.onloadend({ target: this });
      }).catch(err => {
        if (this.onerror) this.onerror(err);
      });
    }
  };
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputDir = path.resolve(__dirname, '../public/models');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function saveGLB(scene, filename) {
  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter();
    exporter.parse(
      scene,
      (gltf) => {
        const filePath = path.join(outputDir, filename);
        fs.writeFileSync(filePath, Buffer.from(gltf));
        console.log(`Generated ${filename} (${(fs.statSync(filePath).size / 1024).toFixed(1)} KB)`);
        resolve(filePath);
      },
      (error) => {
        console.error(`Error exporting ${filename}:`, error);
        reject(error);
      },
      { binary: true }
    );
  });
}

// 1. Create IC DIP-14 Model
function createIcModel(partNumber, labelText, markColor = 0x38bdf8) {
  const scene = new THREE.Scene();

  // IC Body (Black epoxy package)
  const bodyGeo = new THREE.BoxGeometry(0.19, 0.035, 0.07);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.7,
    metalness: 0.1
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.04;
  scene.add(body);

  // Pin 1 Notch
  const notchGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.01, 16);
  const notchMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.9 });
  const notch = new THREE.Mesh(notchGeo, notchMat);
  notch.position.set(-0.085, 0.055, 0);
  scene.add(notch);

  // IC Label strip
  const labelGeo = new THREE.PlaneGeometry(0.12, 0.03);
  const labelMat = new THREE.MeshStandardMaterial({
    color: markColor,
    roughness: 0.4,
    metalness: 0.2
  });
  const labelMesh = new THREE.Mesh(labelGeo, labelMat);
  labelMesh.rotation.x = -Math.PI / 2;
  labelMesh.position.set(0.01, 0.058, 0);
  scene.add(labelMesh);

  // 14 Metallic Pins (7 on each side)
  const pinGeo = new THREE.BoxGeometry(0.008, 0.045, 0.012);
  const pinMat = new THREE.MeshStandardMaterial({
    color: 0xd4d4d8,
    metalness: 0.85,
    roughness: 0.25
  });

  const pinSpacing = 0.0254; // Standard 0.1" pitch = ~2.54mm scaled to scene
  const startX = -0.076;

  for (let i = 0; i < 7; i++) {
    const x = startX + i * pinSpacing;
    // Bottom row (Pins 1-7)
    const pinBottom = new THREE.Mesh(pinGeo, pinMat);
    pinBottom.position.set(x, 0.02, 0.04);
    scene.add(pinBottom);

    // Top row (Pins 14-8)
    const pinTop = new THREE.Mesh(pinGeo, pinMat);
    pinTop.position.set(x, 0.02, -0.04);
    scene.add(pinTop);
  }

  return scene;
}

// 2. Create Solderless Breadboard Model
function createBreadboardModel() {
  const scene = new THREE.Scene();

  // Main white plastic base
  const baseGeo = new THREE.BoxGeometry(0.42, 0.02, 0.16);
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0xf4f4f5,
    roughness: 0.6,
    metalness: 0.05
  });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.01;
  scene.add(base);

  // Center trough divider
  const troughGeo = new THREE.BoxGeometry(0.40, 0.006, 0.012);
  const troughMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, roughness: 0.8 });
  const trough = new THREE.Mesh(troughGeo, troughMat);
  trough.position.set(0, 0.021, 0);
  scene.add(trough);

  // Power rails (Red + Blue strip markers)
  const redMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5 });
  const blueMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.5 });

  const railGeo = new THREE.PlaneGeometry(0.38, 0.003);

  // Top rails
  const topRed = new THREE.Mesh(railGeo, redMat);
  topRed.rotation.x = -Math.PI / 2;
  topRed.position.set(0, 0.021, -0.068);
  scene.add(topRed);

  const topBlue = new THREE.Mesh(railGeo, blueMat);
  topBlue.rotation.x = -Math.PI / 2;
  topBlue.position.set(0, 0.021, -0.056);
  scene.add(topBlue);

  // Bottom rails
  const btmBlue = new THREE.Mesh(railGeo, blueMat);
  btmBlue.rotation.x = -Math.PI / 2;
  btmBlue.position.set(0, 0.021, 0.056);
  scene.add(btmBlue);

  const btmRed = new THREE.Mesh(railGeo, redMat);
  btmRed.rotation.x = -Math.PI / 2;
  btmRed.position.set(0, 0.021, 0.068);
  scene.add(btmRed);

  // Sockets matrix (represented by socket row strips)
  const socketMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.9 });
  const socketStripGeo = new THREE.BoxGeometry(0.005, 0.002, 0.035);

  for (let c = -18; c <= 18; c += 2) {
    const x = c * 0.009;
    // Top terminal strip (Rows A-E)
    const topStrip = new THREE.Mesh(socketStripGeo, socketMat);
    topStrip.position.set(x, 0.021, -0.028);
    scene.add(topStrip);

    // Bottom terminal strip (Rows F-J)
    const btmStrip = new THREE.Mesh(socketStripGeo, socketMat);
    btmStrip.position.set(x, 0.021, 0.028);
    scene.add(btmStrip);
  }

  return scene;
}

// 3. Complete AR Lab Station Model
function createArLabStationModel() {
  const scene = new THREE.Scene();

  // Bench surface plate
  const tableGeo = new THREE.BoxGeometry(0.56, 0.02, 0.34);
  const tableMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6, metalness: 0.2 });
  const table = new THREE.Mesh(tableGeo, tableMat);
  table.position.y = 0.01;
  scene.add(table);

  // Breadboard on bench
  const bb = createBreadboardModel();
  bb.position.set(0, 0.02, 0.02);
  scene.add(bb);

  // Seated 7404 Inverter
  const ic7404 = createIcModel('7404', '7404 HEX INV', 0x06b6d4);
  ic7404.position.set(-0.10, 0.04, 0.02);
  scene.add(ic7404);

  // Seated 7408 AND Gate
  const ic7408 = createIcModel('7408', '7408 QUAD AND', 0x3b82f6);
  ic7408.position.set(0.04, 0.04, 0.02);
  scene.add(ic7408);

  // Seated 7432 OR Gate
  const ic7432 = createIcModel('7432', '7432 QUAD OR', 0x10b981);
  ic7432.position.set(0.16, 0.04, 0.02);
  scene.add(ic7432);

  // Power Supply Module (VCC/GND + Switch)
  const psuGeo = new THREE.BoxGeometry(0.10, 0.04, 0.08);
  const psuMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5, metalness: 0.3 });
  const psu = new THREE.Mesh(psuGeo, psuMat);
  psu.position.set(-0.20, 0.04, -0.10);
  scene.add(psu);

  // LED Output Indicator
  const ledGeo = new THREE.SphereGeometry(0.012, 16, 16);
  const ledMat = new THREE.MeshStandardMaterial({
    color: 0x22c55e,
    emissive: 0x22c55e,
    emissiveIntensity: 0.8,
    roughness: 0.2
  });
  const led = new THREE.Mesh(ledGeo, ledMat);
  led.position.set(0.20, 0.05, -0.06);
  scene.add(led);

  // Colored Jumper Wires
  const wireMat1 = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 });
  const wireMat2 = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 });

  const curve1 = new THREE.CubicBezierCurve3(
    new THREE.Vector3(-0.06, 0.05, 0.05),
    new THREE.Vector3(-0.02, 0.10, 0.05),
    new THREE.Vector3(0.01, 0.10, 0.05),
    new THREE.Vector3(0.04, 0.05, 0.05)
  );
  const wireGeo1 = new THREE.TubeGeometry(curve1, 16, 0.003, 8, false);
  scene.add(new THREE.Mesh(wireGeo1, wireMat1));

  const curve2 = new THREE.CubicBezierCurve3(
    new THREE.Vector3(0.08, 0.05, 0.05),
    new THREE.Vector3(0.12, 0.11, 0.02),
    new THREE.Vector3(0.16, 0.11, -0.02),
    new THREE.Vector3(0.20, 0.05, -0.06)
  );
  const wireGeo2 = new THREE.TubeGeometry(curve2, 16, 0.003, 8, false);
  scene.add(new THREE.Mesh(wireGeo2, wireMat2));

  return scene;
}

async function main() {
  console.log('Generating AR 3D assets in GLB format...');
  await saveGLB(createIcModel('7404', '7404 HEX INV', 0x06b6d4), 'ic-7404.glb');
  await saveGLB(createIcModel('7408', '7408 QUAD AND', 0x3b82f6), 'ic-7408.glb');
  await saveGLB(createIcModel('7432', '7432 QUAD OR', 0x10b981), 'ic-7432.glb');
  await saveGLB(createBreadboardModel(), 'breadboard.glb');
  await saveGLB(createArLabStationModel(), 'ar-lab-station.glb');
  console.log('Successfully generated all 5 GLB 3D models!');
}

main().catch(err => {
  console.error('Failed to generate 3D assets:', err);
  process.exit(1);
});
