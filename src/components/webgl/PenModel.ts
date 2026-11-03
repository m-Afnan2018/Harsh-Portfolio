import * as THREE from "three";

/**
 * Geometry + materials for the 3D pen-tool nib (the designer's signature object).
 * Built in local space with the tip pointing +Y; the scene rotates it to the
 * classic "pen tool" diagonal.
 */

function roundedPolygon(pts: [number, number][], r: number, shape: THREE.Shape | THREE.Path) {
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n];
    const d1 = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
    const d2 = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
    const rr = Math.min(r, d1 / 2, d2 / 2);
    const a: [number, number] = [p1[0] + ((p0[0] - p1[0]) / d1) * rr, p1[1] + ((p0[1] - p1[1]) / d1) * rr];
    const b: [number, number] = [p1[0] + ((p2[0] - p1[0]) / d2) * rr, p1[1] + ((p2[1] - p1[1]) / d2) * rr];
    if (i === 0) shape.moveTo(a[0], a[1]);
    else shape.lineTo(a[0], a[1]);
    shape.quadraticCurveTo(p1[0], p1[1], b[0], b[1]);
  }
  shape.closePath();
}

export const PEN = {
  tipY: 1.7,
  bottomY: -0.55,
  holeY: -0.02,
  holeR: 0.2,
  slotW: 0.07,
  slotTop: 1.38,
  collarH: 0.62,
};

export function buildPenGeometry(lite: boolean) {
  const { tipY, bottomY, holeY, holeR, slotW, slotTop, collarH } = PEN;
  const curve = lite ? 6 : 14;

  // --- nib body with keyhole (breather hole + slit)
  const nib = new THREE.Shape();
  roundedPolygon(
    [
      [0, tipY],
      [0.92, 0.25],
      [0.56, bottomY],
      [-0.56, bottomY],
      [-0.92, 0.25],
    ],
    0.08,
    nib,
  );
  const hw = slotW / 2;
  const yI = holeY + Math.sqrt(holeR * holeR - hw * hw);
  const a0 = Math.atan2(yI - holeY, hw);
  const key = new THREE.Path();
  key.moveTo(hw, slotTop);
  key.lineTo(hw, yI);
  key.absarc(0, holeY, holeR, a0, Math.PI - a0, true);
  key.lineTo(-hw, slotTop);
  key.quadraticCurveTo(0, slotTop + hw * 1.6, hw, slotTop);
  nib.holes.push(key);
  const depth = 0.3;
  const nibGeo = new THREE.ExtrudeGeometry(nib, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.07,
    bevelSize: 0.05,
    bevelSegments: lite ? 3 : 6,
    curveSegments: curve,
  });
  nibGeo.translate(0, 0, -depth / 2);
  nibGeo.computeVertexNormals();

  // --- collar (pale square block under the nib)
  const cw = 1.18, ch = collarH;
  const collar = new THREE.Shape();
  roundedPolygon(
    [
      [-cw / 2, ch / 2],
      [cw / 2, ch / 2],
      [cw / 2, -ch / 2],
      [-cw / 2, -ch / 2],
    ],
    0.1,
    collar,
  );
  const cd = 0.42;
  const collarGeo = new THREE.ExtrudeGeometry(collar, {
    depth: cd,
    bevelEnabled: true,
    bevelThickness: 0.06,
    bevelSize: 0.05,
    bevelSegments: lite ? 3 : 6,
    curveSegments: curve,
  });
  collarGeo.translate(0, bottomY - ch / 2 - 0.06, -cd / 2);
  collarGeo.computeVertexNormals();

  // --- pearl inlays: breather "pearl" + slit line
  const pearlGeo = new THREE.SphereGeometry(holeR * 0.82, lite ? 24 : 48, lite ? 16 : 32);
  pearlGeo.scale(1, 1, 0.75);
  pearlGeo.translate(0, holeY, 0);
  const slitLen = slotTop - yI - 0.02;
  const slitGeo = new THREE.CapsuleGeometry(slotW * 0.3, slitLen, 4, 12);
  slitGeo.translate(0, yI + slitLen / 2, 0);

  return { nibGeo, collarGeo, pearlGeo, slitGeo };
}

const vert = /* glsl */ `
varying vec3 vN; varying vec3 vV; varying vec3 vP;
void main(){
  vP = position;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;

const frag = /* glsl */ `
uniform vec3 uA; uniform vec3 uB; uniform vec3 uRim;
uniform float uTime, uGlow, uAlpha, uSpec, uFrost, uYMin, uYMax;
uniform vec2 uMouse;
varying vec3 vN; varying vec3 vV; varying vec3 vP;
void main(){
  vec3 n = normalize(vN); vec3 v = normalize(vV);
  float ndv = max(dot(n, v), 0.0);
  float fres = pow(1.0 - ndv, 3.0);
  // diagonal gradient (tip = uA, base = uB), like the icon
  float t = clamp((vP.y + vP.x * 0.35 - uYMin) / (uYMax - uYMin), 0.0, 1.0);
  vec3 base = mix(uB, uA, smoothstep(0.0, 1.0, t));
  vec3 L = normalize(vec3(uMouse.x * 1.3 + 0.5, uMouse.y * 1.1 + 0.9, 1.1));
  vec3 L2 = normalize(vec3(-0.9, -0.4, 0.6));
  vec3 r = reflect(-v, n);
  float diff = max(dot(n, L), 0.0);
  float spec = pow(max(dot(r, L), 0.0), mix(90.0, 30.0, uFrost));
  float spec2 = pow(max(dot(r, L2), 0.0), 18.0);
  // studio softbox reflections sweeping over the surface
  float band = smoothstep(0.82, 1.0, sin(r.y * 3.2 + r.x * 2.4 + uTime * 0.35) * 0.5 + 0.5);
  vec3 col = base * (0.5 + 0.55 * diff + 0.15 * uFrost);
  col += vec3(1.0) * (spec * uSpec + band * 0.28 * (1.0 - uFrost * 0.5));
  col += uRim * spec2 * 0.35;
  col += uRim * fres * (0.45 + uGlow * 1.1);
  col = mix(col, vec3(1.0), fres * uFrost * 0.35);
  gl_FragColor = vec4(col, uAlpha);
}`;

export type PenUniforms = Record<string, THREE.IUniform>;

export function penMaterial(o: { a: string; b: string; rim: string; spec: number; frost: number; yMin: number; yMax: number }) {
  const uniforms: PenUniforms = {
    uA: { value: new THREE.Color(o.a) },
    uB: { value: new THREE.Color(o.b) },
    uRim: { value: new THREE.Color(o.rim) },
    uTime: { value: 0 },
    uGlow: { value: 0.3 },
    uAlpha: { value: 1 },
    uSpec: { value: o.spec },
    uFrost: { value: o.frost },
    uYMin: { value: o.yMin },
    uYMax: { value: o.yMax },
    uMouse: { value: new THREE.Vector2() },
  };
  const m = new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms, transparent: true });
  return m;
}
