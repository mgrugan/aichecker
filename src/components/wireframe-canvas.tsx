import { useEffect, useRef } from "react";

// Wireframe polyhedra shader (user-supplied), adapted for transparent
// rendering (alpha output + u_dim) so shapes can sit over the app theme.
const fragmentShader = `
#ifdef GL_ES
precision highp float;
#endif

uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform float u_time;
uniform float u_dim;
uniform int u_shape;

#define PI 3.1415926535897932384626433832795
#define TWO_PI 6.2831853071795864769252867665590

mat3 rotateX(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c);
}

mat3 rotateY(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c);
}

mat3 rotateZ(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat3(c, -s, 0.0, s, c, 0.0, 0.0, 0.0, 1.0);
}

vec2 coord(in vec2 p) {
    p = p / u_resolution.xy;
    if (u_resolution.x > u_resolution.y) {
        p.x *= u_resolution.x / u_resolution.y;
        p.x += (u_resolution.y - u_resolution.x) / u_resolution.y / 2.0;
    } else {
        p.y *= u_resolution.y / u_resolution.x;
        p.y += (u_resolution.x - u_resolution.y) / u_resolution.x / 2.0;
    }
    p -= 0.5;
    return p;
}

vec2 project(vec3 p) {
    float perspective = 2.0 / (2.0 - p.z);
    return p.xy * perspective;
}

float distToSegment(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h);
}

float drawLine(vec2 p, vec2 a, vec2 b, float thickness, float blur) {
    float d = distToSegment(p, a, b);
    return smoothstep(thickness + blur, thickness - blur, d);
}

void getCubeVertices(out vec3 v[8]) {
    float s = 0.7;
    v[0] = vec3(-s, -s, -s);
    v[1] = vec3( s, -s, -s);
    v[2] = vec3( s,  s, -s);
    v[3] = vec3(-s,  s, -s);
    v[4] = vec3(-s, -s,  s);
    v[5] = vec3( s, -s,  s);
    v[6] = vec3( s,  s,  s);
    v[7] = vec3(-s,  s,  s);
}

void getTetrahedronVertices(out vec3 v[4]) {
    float a = 1.0 / sqrt(3.0);
    v[0] = vec3( a,  a,  a);
    v[1] = vec3( a, -a, -a);
    v[2] = vec3(-a,  a, -a);
    v[3] = vec3(-a, -a,  a);
}

void getOctahedronVertices(out vec3 v[6]) {
    v[0] = vec3( 1.0,  0.0,  0.0);
    v[1] = vec3(-1.0,  0.0,  0.0);
    v[2] = vec3( 0.0,  1.0,  0.0);
    v[3] = vec3( 0.0, -1.0,  0.0);
    v[4] = vec3( 0.0,  0.0,  1.0);
    v[5] = vec3( 0.0,  0.0, -1.0);
}

void getIcosahedronVertices(out vec3 v[12]) {
    float t = (1.0 + sqrt(5.0)) / 2.0;
    float s = 1.0 / sqrt(1.0 + t * t);
    v[0] = vec3(-s, t * s, 0);
    v[1] = vec3( s, t * s, 0);
    v[2] = vec3(-s, -t * s, 0);
    v[3] = vec3( s, -t * s, 0);
    v[4] = vec3(0, -s, t * s);
    v[5] = vec3(0,  s, t * s);
    v[6] = vec3(0, -s, -t * s);
    v[7] = vec3(0,  s, -t * s);
    v[8] = vec3( t * s, 0, -s);
    v[9] = vec3( t * s, 0,  s);
    v[10] = vec3(-t * s, 0, -s);
    v[11] = vec3(-t * s, 0,  s);
}

float drawWireframe(vec2 p, int shape, mat3 rotation, float scale, float thickness, float blur) {
    float result = 0.0;

    if (shape == 0) {
        vec3 v[8];
        getCubeVertices(v);
        for (int i = 0; i < 8; i++) { v[i] = rotation * (v[i] * scale); }
        result += drawLine(p, project(v[0]), project(v[1]), thickness, blur);
        result += drawLine(p, project(v[1]), project(v[2]), thickness, blur);
        result += drawLine(p, project(v[2]), project(v[3]), thickness, blur);
        result += drawLine(p, project(v[3]), project(v[0]), thickness, blur);
        result += drawLine(p, project(v[4]), project(v[5]), thickness, blur);
        result += drawLine(p, project(v[5]), project(v[6]), thickness, blur);
        result += drawLine(p, project(v[6]), project(v[7]), thickness, blur);
        result += drawLine(p, project(v[7]), project(v[4]), thickness, blur);
        result += drawLine(p, project(v[0]), project(v[4]), thickness, blur);
        result += drawLine(p, project(v[1]), project(v[5]), thickness, blur);
        result += drawLine(p, project(v[2]), project(v[6]), thickness, blur);
        result += drawLine(p, project(v[3]), project(v[7]), thickness, blur);
    } else if (shape == 1) {
        vec3 v[4];
        getTetrahedronVertices(v);
        for (int i = 0; i < 4; i++) { v[i] = rotation * (v[i] * scale); }
        result += drawLine(p, project(v[0]), project(v[1]), thickness, blur);
        result += drawLine(p, project(v[0]), project(v[2]), thickness, blur);
        result += drawLine(p, project(v[0]), project(v[3]), thickness, blur);
        result += drawLine(p, project(v[1]), project(v[2]), thickness, blur);
        result += drawLine(p, project(v[1]), project(v[3]), thickness, blur);
        result += drawLine(p, project(v[2]), project(v[3]), thickness, blur);
    } else if (shape == 2) {
        vec3 v[6];
        getOctahedronVertices(v);
        for (int i = 0; i < 6; i++) { v[i] = rotation * (v[i] * scale); }
        result += drawLine(p, project(v[2]), project(v[0]), thickness, blur);
        result += drawLine(p, project(v[2]), project(v[1]), thickness, blur);
        result += drawLine(p, project(v[2]), project(v[4]), thickness, blur);
        result += drawLine(p, project(v[2]), project(v[5]), thickness, blur);
        result += drawLine(p, project(v[3]), project(v[0]), thickness, blur);
        result += drawLine(p, project(v[3]), project(v[1]), thickness, blur);
        result += drawLine(p, project(v[3]), project(v[4]), thickness, blur);
        result += drawLine(p, project(v[3]), project(v[5]), thickness, blur);
        result += drawLine(p, project(v[0]), project(v[4]), thickness, blur);
        result += drawLine(p, project(v[4]), project(v[1]), thickness, blur);
        result += drawLine(p, project(v[1]), project(v[5]), thickness, blur);
        result += drawLine(p, project(v[5]), project(v[0]), thickness, blur);
    } else if (shape == 3) {
        vec3 v[12];
        getIcosahedronVertices(v);
        for (int i = 0; i < 12; i++) { v[i] = rotation * (v[i] * scale); }
        result += drawLine(p, project(v[0]), project(v[1]), thickness, blur);
        result += drawLine(p, project(v[0]), project(v[5]), thickness, blur);
        result += drawLine(p, project(v[0]), project(v[7]), thickness, blur);
        result += drawLine(p, project(v[0]), project(v[10]), thickness, blur);
        result += drawLine(p, project(v[0]), project(v[11]), thickness, blur);
        result += drawLine(p, project(v[1]), project(v[5]), thickness, blur);
        result += drawLine(p, project(v[1]), project(v[7]), thickness, blur);
        result += drawLine(p, project(v[1]), project(v[8]), thickness, blur);
        result += drawLine(p, project(v[1]), project(v[9]), thickness, blur);
        result += drawLine(p, project(v[2]), project(v[3]), thickness, blur);
        result += drawLine(p, project(v[2]), project(v[4]), thickness, blur);
        result += drawLine(p, project(v[2]), project(v[6]), thickness, blur);
        result += drawLine(p, project(v[2]), project(v[10]), thickness, blur);
        result += drawLine(p, project(v[2]), project(v[11]), thickness, blur);
        result += drawLine(p, project(v[3]), project(v[4]), thickness, blur);
        result += drawLine(p, project(v[3]), project(v[6]), thickness, blur);
        result += drawLine(p, project(v[3]), project(v[8]), thickness, blur);
        result += drawLine(p, project(v[3]), project(v[9]), thickness, blur);
        result += drawLine(p, project(v[4]), project(v[5]), thickness, blur);
        result += drawLine(p, project(v[4]), project(v[11]), thickness, blur);
        result += drawLine(p, project(v[5]), project(v[11]), thickness, blur);
        result += drawLine(p, project(v[6]), project(v[7]), thickness, blur);
        result += drawLine(p, project(v[6]), project(v[8]), thickness, blur);
        result += drawLine(p, project(v[6]), project(v[10]), thickness, blur);
        result += drawLine(p, project(v[7]), project(v[10]), thickness, blur);
        result += drawLine(p, project(v[8]), project(v[9]), thickness, blur);
        result += drawLine(p, project(v[9]), project(v[11]), thickness, blur);
        result += drawLine(p, project(v[10]), project(v[11]), thickness, blur);
    } else if (shape == 4) {
        vec3 v[5];
        float s = 0.7;
        v[0] = vec3(-s, 0.0, -s);
        v[1] = vec3( s, 0.0, -s);
        v[2] = vec3( s, 0.0,  s);
        v[3] = vec3(-s, 0.0,  s);
        v[4] = vec3( 0.0, 1.0,  0.0);
        for (int i = 0; i < 5; i++) { v[i] = rotation * (v[i] * scale); }
        result += drawLine(p, project(v[0]), project(v[1]), thickness, blur);
        result += drawLine(p, project(v[1]), project(v[2]), thickness, blur);
        result += drawLine(p, project(v[2]), project(v[3]), thickness, blur);
        result += drawLine(p, project(v[3]), project(v[0]), thickness, blur);
        result += drawLine(p, project(v[0]), project(v[4]), thickness, blur);
        result += drawLine(p, project(v[1]), project(v[4]), thickness, blur);
        result += drawLine(p, project(v[2]), project(v[4]), thickness, blur);
        result += drawLine(p, project(v[3]), project(v[4]), thickness, blur);
    } else if (shape == 5) {
        vec3 v[6];
        float s = 0.6;
        v[0] = vec3(-s, 0.0, -s);
        v[1] = vec3( s, 0.0, -s);
        v[2] = vec3( s, 0.0,  s);
        v[3] = vec3(-s, 0.0,  s);
        v[4] = vec3( 0.0,  1.0,  0.0);
        v[5] = vec3( 0.0, -1.0,  0.0);
        for (int i = 0; i < 6; i++) { v[i] = rotation * (v[i] * scale); }
        result += drawLine(p, project(v[0]), project(v[1]), thickness, blur);
        result += drawLine(p, project(v[1]), project(v[2]), thickness, blur);
        result += drawLine(p, project(v[2]), project(v[3]), thickness, blur);
        result += drawLine(p, project(v[3]), project(v[0]), thickness, blur);
        result += drawLine(p, project(v[0]), project(v[4]), thickness, blur);
        result += drawLine(p, project(v[1]), project(v[4]), thickness, blur);
        result += drawLine(p, project(v[2]), project(v[4]), thickness, blur);
        result += drawLine(p, project(v[3]), project(v[4]), thickness, blur);
        result += drawLine(p, project(v[0]), project(v[5]), thickness, blur);
        result += drawLine(p, project(v[1]), project(v[5]), thickness, blur);
        result += drawLine(p, project(v[2]), project(v[5]), thickness, blur);
        result += drawLine(p, project(v[3]), project(v[5]), thickness, blur);
    } else if (shape == 6) {
        vec3 v[12];
        float angleStep = TWO_PI / 6.0;
        v[0] = vec3(cos(0.0 * angleStep), -1.0, sin(0.0 * angleStep));
        v[1] = vec3(cos(1.0 * angleStep), -1.0, sin(1.0 * angleStep));
        v[2] = vec3(cos(2.0 * angleStep), -1.0, sin(2.0 * angleStep));
        v[3] = vec3(cos(3.0 * angleStep), -1.0, sin(3.0 * angleStep));
        v[4] = vec3(cos(4.0 * angleStep), -1.0, sin(4.0 * angleStep));
        v[5] = vec3(cos(5.0 * angleStep), -1.0, sin(5.0 * angleStep));
        v[6] = vec3(cos(0.0 * angleStep), 1.0, sin(0.0 * angleStep));
        v[7] = vec3(cos(1.0 * angleStep), 1.0, sin(1.0 * angleStep));
        v[8] = vec3(cos(2.0 * angleStep), 1.0, sin(2.0 * angleStep));
        v[9] = vec3(cos(3.0 * angleStep), 1.0, sin(3.0 * angleStep));
        v[10] = vec3(cos(4.0 * angleStep), 1.0, sin(4.0 * angleStep));
        v[11] = vec3(cos(5.0 * angleStep), 1.0, sin(5.0 * angleStep));
        for (int i = 0; i < 12; i++) { v[i] = rotation * (v[i] * scale); }
        result += drawLine(p, project(v[0]), project(v[1]), thickness, blur);
        result += drawLine(p, project(v[1]), project(v[2]), thickness, blur);
        result += drawLine(p, project(v[2]), project(v[3]), thickness, blur);
        result += drawLine(p, project(v[3]), project(v[4]), thickness, blur);
        result += drawLine(p, project(v[4]), project(v[5]), thickness, blur);
        result += drawLine(p, project(v[5]), project(v[0]), thickness, blur);
        result += drawLine(p, project(v[6]), project(v[7]), thickness, blur);
        result += drawLine(p, project(v[7]), project(v[8]), thickness, blur);
        result += drawLine(p, project(v[8]), project(v[9]), thickness, blur);
        result += drawLine(p, project(v[9]), project(v[10]), thickness, blur);
        result += drawLine(p, project(v[10]), project(v[11]), thickness, blur);
        result += drawLine(p, project(v[11]), project(v[6]), thickness, blur);
        result += drawLine(p, project(v[0]), project(v[6]), thickness, blur);
        result += drawLine(p, project(v[1]), project(v[7]), thickness, blur);
        result += drawLine(p, project(v[2]), project(v[8]), thickness, blur);
        result += drawLine(p, project(v[3]), project(v[9]), thickness, blur);
        result += drawLine(p, project(v[4]), project(v[10]), thickness, blur);
        result += drawLine(p, project(v[5]), project(v[11]), thickness, blur);
    } else {
        float t = u_time * 0.5;
        float morph = sin(t) * 0.5 + 0.5;
        vec3 cube[8];
        getCubeVertices(cube);
        vec3 octa[6];
        getOctahedronVertices(octa);
        vec3 v[8];
        for (int i = 0; i < 8; i++) {
            if (i < 6) {
                v[i] = mix(cube[i], octa[i] * 1.5, morph);
            } else {
                v[i] = cube[i] * (1.0 - morph * 0.3);
            }
            v[i] = rotation * (v[i] * scale);
        }
        float alpha = 1.0 - morph * 0.5;
        result += drawLine(p, project(v[0]), project(v[1]), thickness, blur) * alpha;
        result += drawLine(p, project(v[1]), project(v[2]), thickness, blur) * alpha;
        result += drawLine(p, project(v[2]), project(v[3]), thickness, blur) * alpha;
        result += drawLine(p, project(v[3]), project(v[0]), thickness, blur) * alpha;
        result += drawLine(p, project(v[4]), project(v[5]), thickness, blur) * alpha;
        result += drawLine(p, project(v[5]), project(v[6]), thickness, blur) * alpha;
        result += drawLine(p, project(v[6]), project(v[7]), thickness, blur) * alpha;
        result += drawLine(p, project(v[7]), project(v[4]), thickness, blur) * alpha;
        result += drawLine(p, project(v[0]), project(v[6]), thickness, blur) * morph;
        result += drawLine(p, project(v[1]), project(v[7]), thickness, blur) * morph;
        result += drawLine(p, project(v[2]), project(v[4]), thickness, blur) * morph;
        result += drawLine(p, project(v[3]), project(v[5]), thickness, blur) * morph;
    }

    return clamp(result, 0.0, 1.0);
}

vec3 render(vec2 st, vec2 mouse) {
    float mouseDistance = length(st - mouse);
    float mouseInfluence = 1.0 - smoothstep(0.0, 0.5, mouseDistance);

    float time = u_time * 0.2;
    mat3 rotation = rotateY(time + (mouse.x - 0.5) * mouseInfluence * 1.0) *
                    rotateX(time * 0.7 + (mouse.y - 0.5) * mouseInfluence * 1.0) *
                    rotateZ(time * 0.1);

    float scale = 0.35;
    float blur = mix(0.0001, 0.05, mouseInfluence);
    float thickness = mix(0.002, 0.003, mouseInfluence);

    float shape = drawWireframe(st, u_shape, rotation, scale, thickness, blur);

    vec3 color = vec3(0.9, 0.95, 1.0);
    float dimming = 1.0 - mouseInfluence * 0.3;
    color *= shape * dimming;

    float vignette = 1.0 - length(st) * 0.2;
    color *= vignette;

    color = pow(color, vec3(0.9));

    return color;
}

void main() {
    vec2 st = coord(gl_FragCoord.xy);
    vec2 mouse = coord(u_mouse * u_pixelRatio) * vec2(1., -1.);

    vec3 color = render(st, mouse) * u_dim;
    float a = max(max(color.r, color.g), color.b);

    gl_FragColor = vec4(color, a);
}
`;

const vertexShader = `
attribute vec3 a_position;
attribute vec2 a_uv;
varying vec2 v_texcoord;

void main() {
    gl_Position = vec4(a_position, 1.0);
    v_texcoord = a_uv;
}
`;

export const SHAPE_COUNT = 8;

interface WireframeCanvasProps {
  shape?: number;
  /** 0..1 brightness multiplier */
  dim?: number;
  /** cycle through shapes every N ms */
  autoCycleMs?: number;
  className?: string;
}

export function WireframeCanvas({
  shape = 0,
  dim = 1,
  autoCycleMs,
  className,
}: WireframeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shapeRef = useRef(shape);

  useEffect(() => {
    shapeRef.current = shape;
  }, [shape]);

  useEffect(() => {
    if (!autoCycleMs) return;
    const id = setInterval(() => {
      shapeRef.current = (shapeRef.current + 1) % SHAPE_COUNT;
    }, autoCycleMs);
    return () => clearInterval(id);
  }, [autoCycleMs]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      antialias: true,
      alpha: true,
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
    });
    if (!gl) return;

    const compile = (type: number, source: string) => {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, source);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(s));
        gl.deleteShader(s);
        return null;
      }
      return s;
    };

    const vs = compile(gl.VERTEX_SHADER, vertexShader);
    const fs = compile(gl.FRAGMENT_SHADER, fragmentShader);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    const uniforms = {
      u_mouse: gl.getUniformLocation(program, "u_mouse"),
      u_resolution: gl.getUniformLocation(program, "u_resolution"),
      u_pixelRatio: gl.getUniformLocation(program, "u_pixelRatio"),
      u_time: gl.getUniformLocation(program, "u_time"),
      u_dim: gl.getUniformLocation(program, "u_dim"),
      u_shape: gl.getUniformLocation(program, "u_shape"),
    };

    const vertices = new Float32Array([-1, -1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0]);
    const uvs = new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

    const uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);
    const uvLocation = gl.getAttribLocation(program, "a_uv");
    gl.enableVertexAttribArray(uvLocation);
    gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 0, 0);

    const mouse = { x: 0, y: 0 };
    const mouseDamp = { x: 0, y: 0 };

    const onMouseMove = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0]?.clientX ?? 0 : e.clientX;
      const clientY = "touches" in e ? e.touches[0]?.clientY ?? 0 : e.clientY;
      mouse.x = clientX - rect.left;
      mouse.y = clientY - rect.top;
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onMouseMove);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const startTime = Date.now();
    let raf = 0;
    let lastTime = performance.now();

    const drawFrame = (time: number) => {
      const deltaTime = (time - lastTime) / 1000;
      lastTime = time;

      const dampingFactor = 8;
      mouseDamp.x += (mouse.x - mouseDamp.x) * dampingFactor * deltaTime;
      mouseDamp.y += (mouse.y - mouseDamp.y) * dampingFactor * deltaTime;

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      const dpr = Math.min(window.devicePixelRatio, 2);
      const elapsed = reduceMotion ? 1.5 : (Date.now() - startTime) / 1000;

      gl.uniform2f(uniforms.u_mouse, mouseDamp.x, mouseDamp.y);
      gl.uniform2f(uniforms.u_resolution, canvas.width, canvas.height);
      gl.uniform1f(uniforms.u_pixelRatio, dpr);
      gl.uniform1f(uniforms.u_time, elapsed);
      gl.uniform1f(uniforms.u_dim, dim);
      gl.uniform1i(uniforms.u_shape, shapeRef.current);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      if (!reduceMotion) raf = requestAnimationFrame(drawFrame);
    };
    raf = requestAnimationFrame(drawFrame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onMouseMove);
      window.removeEventListener("resize", resize);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [dim]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
