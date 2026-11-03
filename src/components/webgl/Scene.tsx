"use client";
import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { sceneState } from "@/lib/sceneState";
import { useStore } from "@/lib/store";
import { SNOISE } from "./noise.glsl";
import { buildPenGeometry, penMaterial, PEN } from "./PenModel";

const mouse = { x: 0, y: 0, sx: 0, sy: 0 };

/* ------------------------------------------------------------- Particles */
const ptsVert = /* glsl */ `
uniform float uTime, uAmp, uFreq, uScatter, uAttract, uSize, uDpr, uScale;
uniform vec3 uPos, uMouse; uniform mat3 uRot;
attribute vec3 aFrame; attribute vec4 aRand;
varying float vA; varying float vMix;
${SNOISE}
void main(){
  vec3 sp = normalize(position);
  float n = snoise(sp * uFreq + vec3(uTime * 0.22, uTime * 0.17, 0.0));
  float drift = fract(uTime * 0.05 * (0.5 + aRand.x) + aRand.y) * uAttract;
  sp = sp * (1.75 + n * uAmp * 0.8 + aRand.w * 0.55 + drift * 1.4);
  sp = uRot * sp * uScale + uPos;
  float s = smoothstep(aRand.x * 0.45, aRand.x * 0.45 + 0.55, uScatter);
  vec3 fp = aFrame + vec3(sin(uTime * 0.6 + aRand.y * 6.28), cos(uTime * 0.5 + aRand.z * 6.28), sin(uTime * 0.3 + aRand.x * 6.28)) * 0.035;
  vec3 p = mix(sp, fp, s);
  p += normalize(position) * sin(s * 3.14159) * (0.4 + aRand.w * 1.6) * uScale * 0.6;
  vec3 toM = uMouse - p; float d = length(toM);
  p += toM * uAttract * (0.15 + aRand.y * 0.45) * smoothstep(3.5, 0.0, d);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = uSize * (0.4 + aRand.z * 1.2) * uDpr * (6.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
  vA = 0.35 + aRand.y * 0.65 - drift * 0.6; vMix = aRand.z;
}`;
const ptsFrag = /* glsl */ `
uniform float uAlpha;
varying float vA; varying float vMix;
void main(){
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  vec3 col = mix(vec3(0.184, 0.420, 1.0), vec3(0.75, 0.88, 1.0), vMix * vMix);
  gl_FragColor = vec4(col, a * vA * uAlpha);
}`;

function buildFrame(count: number, w: number, h: number) {
  // points distributed along a rounded-rectangle outline + a faint inner field
  const out = new Float32Array(count * 3);
  const r = Math.min(w, h) * 0.08;
  const per = 2 * (w + h - 4 * r) + 2 * Math.PI * r;
  for (let i = 0; i < count; i++) {
    const inner = Math.random() < 0.18;
    let x: number, y: number;
    if (inner) {
      x = (Math.random() - 0.5) * w * 1.15;
      y = (Math.random() - 0.5) * h * 1.15;
    } else {
      let t = Math.random() * per;
      const sw = w - 2 * r, sh = h - 2 * r, arc = (Math.PI * r) / 2;
      const segs: [number, (u: number) => [number, number]][] = [
        [sw, (u) => [-w / 2 + r + u, h / 2]],
        [arc, (u) => { const a = Math.PI / 2 - u / r; return [w / 2 - r + Math.cos(a) * r, h / 2 - r + Math.sin(a) * r]; }],
        [sh, (u) => [w / 2, h / 2 - r - u]],
        [arc, (u) => { const a = -u / r; return [w / 2 - r + Math.cos(a) * r, -h / 2 + r + Math.sin(a) * r]; }],
        [sw, (u) => [w / 2 - r - u, -h / 2]],
        [arc, (u) => { const a = -Math.PI / 2 - u / r; return [-w / 2 + r + Math.cos(a) * r, -h / 2 + r + Math.sin(a) * r]; }],
        [sh, (u) => [-w / 2, -h / 2 + r + u]],
        [arc, (u) => { const a = Math.PI - u / r; return [-w / 2 + r + Math.cos(a) * r, h / 2 - r + Math.sin(a) * r]; }],
      ];
      let pt: [number, number] = [0, 0];
      for (const [len, f] of segs) {
        if (t <= len) { pt = f(t); break; }
        t -= len;
      }
      const j = 0.06 * Math.pow(Math.random(), 2) * (Math.random() < 0.5 ? -1 : 1);
      x = pt[0] + j; y = pt[1] + j;
    }
    out[i * 3] = x; out[i * 3 + 1] = y; out[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
  }
  return out;
}

function Organism({ lite }: { lite: boolean }) {
  const group = useRef<THREE.Group>(null);
  const { viewport, size, gl } = useThree();
  const count = lite ? 1800 : 5200;

  const pen = useMemo(() => {
    const g = buildPenGeometry(lite);
    const yMin = PEN.bottomY - PEN.collarH, yMax = PEN.tipY;
    return {
      ...g,
      nib: penMaterial({ a: "#19C3FF", b: "#4B4DFF", rim: "#7FC4FF", spec: 1.3, frost: 0, yMin: -0.9, yMax: 1.9 }),
      collar: penMaterial({ a: "#E6F3FF", b: "#9FCDFF", rim: "#DDEEFF", spec: 0.5, frost: 1, yMin, yMax: PEN.bottomY + 0.2 }),
      pearl: penMaterial({ a: "#FFFFFF", b: "#D8ECFF", rim: "#FFFFFF", spec: 1.6, frost: 0.6, yMin: -0.3, yMax: 1.6 }),
    };
  }, [lite]);
  const parts = useRef<{ root: THREE.Group | null; nib: THREE.Group | null; collar: THREE.Mesh | null; inlay: THREE.Group | null }>({ root: null, nib: null, collar: null, inlay: null });

  const ptsUniforms = useMemo(
    () => ({
      uTime: { value: 0 }, uAmp: { value: 0.2 }, uFreq: { value: 1.4 }, uScatter: { value: 0 }, uAttract: { value: 0 },
      uSize: { value: lite ? 3.2 : 2.6 }, uDpr: { value: 1 }, uScale: { value: 1 }, uAlpha: { value: 0.4 },
      uPos: { value: new THREE.Vector3() }, uMouse: { value: new THREE.Vector3() }, uRot: { value: new THREE.Matrix3() },
    }),
    [lite],
  );

  const ptsGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const rnd = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      const u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2, s = Math.sqrt(1 - u * u);
      pos.set([s * Math.cos(th), s * Math.sin(th), u], i * 3);
      rnd.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aRand", new THREE.BufferAttribute(rnd, 4));
    g.setAttribute("aFrame", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 100);
    return g;
  }, [count]);

  // frame target follows viewport size
  useEffect(() => {
    const w = viewport.width * (size.width < 768 ? 0.92 : 0.86);
    const h = viewport.height * (size.width < 768 ? 0.62 : 0.66);
    const attr = ptsGeo.getAttribute("aFrame") as THREE.BufferAttribute;
    attr.set(buildFrame(count, w, h));
    attr.needsUpdate = true;
  }, [viewport.width, viewport.height, size.width, count, ptsGeo]);

  const cur = useRef({ ...sceneState });
  const m3 = useMemo(() => new THREE.Matrix3(), []);
  const m4 = useMemo(() => new THREE.Matrix4(), []);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const k = 1 - Math.pow(0.0015, dt); // frame-rate independent smoothing
    const c = cur.current;
    for (const key of Object.keys(sceneState) as (keyof typeof sceneState)[]) c[key] += (sceneState[key] - c[key]) * k;
    mouse.sx += (mouse.x - mouse.sx) * k;
    mouse.sy += (mouse.y - mouse.sy) * k;

    const base = Math.min(viewport.width, viewport.height) * (size.width < 768 ? 0.3 : 0.27);
    const intro = c.intro;
    const sc = base * c.scale * (0.2 + 0.8 * intro);
    g.position.set(c.x * viewport.width * 0.5 + mouse.sx * 0.25, c.y * viewport.height * 0.5 + mouse.sy * 0.18, 0);
    g.scale.setScalar(sc);
    // idle float + mouse tilt (the pen sways rather than spinning)
    const aim = c.aim;
    g.rotation.y += ((Math.sin(t * 0.45) * 0.55 * (1 - aim) + mouse.sx * 0.6) - g.rotation.y) * k;
    g.rotation.x += ((-mouse.sy * 0.45 + Math.sin(t * 0.32) * 0.12) - g.rotation.x) * k;
    g.rotation.z = 0;
    g.position.y += Math.sin(t * 0.8) * 0.06 * sc;
    g.updateMatrix();

    const P = parts.current;
    if (P.root) {
      // pen-tool diagonal (tip up-right) → flips to point down-left at the CTA in Contact
      P.root.rotation.z = THREE.MathUtils.lerp(-Math.PI / 4, (Math.PI * 3) / 4, aim) + Math.sin(t * 0.6) * 0.04;
      const fade = 0.35 + 0.65 * c.blob;
      P.root.scale.setScalar(0.62 * fade);
      const ex = c.explode;
      P.nib!.position.set(0, ex * 0.35, 0);
      P.collar!.position.set(0, -ex * 0.55, ex * 0.15);
      P.collar!.rotation.set(ex * 0.35, ex * -0.4, ex * 0.18);
      P.inlay!.position.set(0, ex * 0.35, ex * 0.75);
      P.inlay!.rotation.y = ex * t * 0.8;
      P.root.visible = c.blob * intro > 0.01;
    }
    for (const m of [pen.nib, pen.collar, pen.pearl]) {
      m.uniforms.uTime.value = t;
      m.uniforms.uGlow.value = c.glow;
      m.uniforms.uAlpha.value = Math.min(1, c.blob * intro * 1.2);
      (m.uniforms.uMouse.value as THREE.Vector2).set(mouse.sx, mouse.sy);
      m.depthWrite = c.blob * intro > 0.98;
    }

    ptsUniforms.uTime.value = t;
    ptsUniforms.uAmp.value = c.amp;
    ptsUniforms.uFreq.value = c.freq;
    ptsUniforms.uScatter.value = c.scatter;
    ptsUniforms.uAttract.value = c.attract;
    ptsUniforms.uAlpha.value = c.points * intro;
    ptsUniforms.uScale.value = sc;
    ptsUniforms.uDpr.value = gl.getPixelRatio();
    ptsUniforms.uPos.value.copy(g.position);
    m4.makeRotationFromEuler(g.rotation);
    ptsUniforms.uRot.value.copy(m3.setFromMatrix4(m4));
    ptsUniforms.uMouse.value.set(mouse.sx * viewport.width * 0.5, mouse.sy * viewport.height * 0.5, 0.5);
  });

  return (
    <>
      <group ref={group}>
        <group ref={(r) => { parts.current.root = r; }} position={[0, 0, 0]}>
          <group position={[0, -0.32, 0]}>
            <group ref={(r) => { parts.current.nib = r; }}>
              <mesh geometry={pen.nibGeo} material={pen.nib} renderOrder={1} />
            </group>
            <group ref={(r) => { parts.current.inlay = r; }}>
              <mesh geometry={pen.pearlGeo} material={pen.pearl} renderOrder={1} />
              <mesh geometry={pen.slitGeo} material={pen.pearl} renderOrder={1} />
            </group>
            <mesh ref={(r) => { parts.current.collar = r; }} geometry={pen.collarGeo} material={pen.collar} renderOrder={1} />
          </group>
        </group>
      </group>
      <points geometry={ptsGeo} renderOrder={2} frustumCulled={false}>
        <shaderMaterial
          vertexShader={ptsVert}
          fragmentShader={ptsFrag}
          uniforms={ptsUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  );
}

export default function Scene() {
  const project = useStore((s) => s.project);
  const lite = typeof window !== "undefined" && (window.innerWidth < 768 || (navigator.hardwareConcurrency ?? 8) <= 4);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <Canvas
        dpr={[1, lite ? 1.5 : 2]}
        camera={{ position: [0, 0, 6], fov: 35 }}
        gl={{ antialias: !lite, alpha: true, powerPreference: "high-performance" }}
        frameloop={project ? "never" : "always"}
      >
        <Organism lite={lite} />
      </Canvas>
    </div>
  );
}
