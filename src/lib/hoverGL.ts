"use client";
/**
 * One shared WebGL canvas that is re-parented into whichever image is hovered.
 * Avoids one GL context per card. Draws the same image (object-fit: cover) with a
 * liquid ripple + RGB shift driven by the cursor and its velocity.
 */
import gsap from "gsap";

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main(){ vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uMouse;      // 0..1, y up
uniform vec2 uVel;
uniform float uHover;
uniform float uTime;
uniform vec2 uRes;        // element px size
uniform vec2 uImg;        // image px size
uniform float uStrength;

vec2 cover(vec2 uv){
  float rs = uRes.x / uRes.y, ri = uImg.x / uImg.y;
  vec2 s = rs < ri ? vec2(rs / ri, 1.0) : vec2(1.0, ri / rs);
  return (uv - 0.5) * s + 0.5;
}
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
}
void main(){
  vec2 asp = vec2(uRes.x / uRes.y, 1.0);
  vec2 d = (vUv - uMouse) * asp;
  float dist = length(d);
  float h = uHover * uStrength;
  // liquid ripple around the cursor
  float ripple = sin(dist * 34.0 - uTime * 5.0) * exp(-dist * 5.5) * 0.012 * h;
  vec2 dir = normalize(d + 1e-5) / asp;
  // slow liquid noise
  float n = noise(vUv * 4.0 + uTime * 0.35) - 0.5;
  vec2 uv = vUv;
  uv = (uv - 0.5) * (1.0 - 0.05 * uHover) + 0.5; // gentle zoom
  uv += dir * ripple + vec2(n, -n) * 0.012 * h;
  uv += uVel * 0.07 * exp(-dist * 3.0) * h;
  vec2 tuv = cover(uv);
  float shift = (0.0025 + length(uVel) * 0.06) * h;
  vec2 sh = vec2(shift, 0.0);
  vec4 c;
  c.r = texture2D(uTex, tuv + sh).r;
  c.g = texture2D(uTex, tuv).g;
  c.b = texture2D(uTex, tuv - sh).b;
  c.a = 1.0;
  // faint electric-blue light following the cursor
  c.rgb += vec3(0.18, 0.42, 1.0) * exp(-dist * 7.0) * 0.12 * h;
  gl_FragColor = c;
}`;

type Opts = { strength?: number };

class HoverGL {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext | null;
  prog: WebGLProgram | null = null;
  u: Record<string, WebGLUniformLocation | null> = {};
  tex = new Map<string, { t: WebGLTexture; w: number; h: number }>();
  host: HTMLElement | null = null;
  current: { t: WebGLTexture; w: number; h: number } | null = null;
  mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, vx: 0, vy: 0 };
  hover = { v: 0 };
  strength = 1;
  raf = 0;
  t0 = performance.now();

  constructor() {
    this.canvas = document.createElement("canvas");
    this.canvas.setAttribute("aria-hidden", "true");
    Object.assign(this.canvas.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      pointerEvents: "none",
      opacity: "0",
      zIndex: "1",
    } as CSSStyleDeclaration);
    this.gl = this.canvas.getContext("webgl", { premultipliedAlpha: false, antialias: false });
    if (!this.gl) return;
    const gl = this.gl;
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const p = gl.createProgram()!;
    gl.attachShader(p, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(p, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      this.gl = null;
      return;
    }
    this.prog = p;
    gl.useProgram(p);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(p, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    for (const n of ["uTex", "uMouse", "uVel", "uHover", "uTime", "uRes", "uImg", "uStrength"]) this.u[n] = gl.getUniformLocation(p, n);
  }

  private load(src: string) {
    const hit = this.tex.get(src);
    if (hit) return Promise.resolve(hit);
    return new Promise<{ t: WebGLTexture; w: number; h: number }>((res, rej) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        const gl = this.gl!;
        const t = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, t);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        const v = { t, w: img.naturalWidth, h: img.naturalHeight };
        this.tex.set(src, v);
        res(v);
      };
      img.onerror = rej;
      img.src = src;
    });
  }

  async enter(host: HTMLElement, src: string, e?: PointerEvent, opts: Opts = {}) {
    if (!this.gl) return;
    this.strength = opts.strength ?? 1;
    this.host = host;
    this.move(e);
    this.mouse.x = this.mouse.tx;
    this.mouse.y = this.mouse.ty;
    const tex = await this.load(src).catch(() => null);
    if (!tex || this.host !== host) return;
    this.current = tex;
    host.appendChild(this.canvas);
    this.resize();
    this.canvas.style.opacity = "1";
    gsap.to(this.hover, { v: 1, duration: 0.9, ease: "power3.out", overwrite: true });
    if (!this.raf) this.loop();
  }

  leave(host: HTMLElement) {
    if (this.host !== host) return;
    gsap.to(this.hover, {
      v: 0,
      duration: 0.6,
      ease: "power2.out",
      overwrite: true,
      onComplete: () => {
        if (this.host !== host) return;
        this.canvas.style.opacity = "0";
        this.canvas.remove();
        this.host = null;
        cancelAnimationFrame(this.raf);
        this.raf = 0;
      },
    });
  }

  move(e?: PointerEvent) {
    if (!e || !this.host) return;
    const r = this.host.getBoundingClientRect();
    this.mouse.tx = (e.clientX - r.left) / r.width;
    this.mouse.ty = 1 - (e.clientY - r.top) / r.height;
  }

  resize() {
    if (!this.host) return;
    const dpr = Math.min(window.devicePixelRatio, 1.75);
    const r = this.host.getBoundingClientRect();
    this.canvas.width = Math.max(1, Math.round(r.width * dpr));
    this.canvas.height = Math.max(1, Math.round(r.height * dpr));
    this.gl?.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  loop = () => {
    this.raf = requestAnimationFrame(this.loop);
    const gl = this.gl;
    if (!gl || !this.current || !this.host) return;
    const m = this.mouse;
    const px = m.x, py = m.y;
    m.x += (m.tx - m.x) * 0.12;
    m.y += (m.ty - m.y) * 0.12;
    m.vx += (m.x - px - m.vx) * 0.2;
    m.vy += (m.y - py - m.vy) * 0.2;
    const r = this.host.getBoundingClientRect();
    if (Math.abs(r.width * Math.min(devicePixelRatio, 1.75) - this.canvas.width) > 2) this.resize();
    gl.bindTexture(gl.TEXTURE_2D, this.current.t);
    gl.uniform1i(this.u.uTex, 0);
    gl.uniform2f(this.u.uMouse, m.x, m.y);
    gl.uniform2f(this.u.uVel, m.vx * 4, m.vy * 4);
    gl.uniform1f(this.u.uHover, this.hover.v);
    gl.uniform1f(this.u.uStrength, this.strength);
    gl.uniform1f(this.u.uTime, (performance.now() - this.t0) / 1000);
    gl.uniform2f(this.u.uRes, r.width, r.height);
    gl.uniform2f(this.u.uImg, this.current.w, this.current.h);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
}

let instance: HoverGL | null = null;
export const hoverGL = () => {
  if (typeof window === "undefined") return null;
  if (window.matchMedia("(hover: none), (prefers-reduced-motion: reduce)").matches) return null;
  instance ??= new HoverGL();
  return instance;
};
