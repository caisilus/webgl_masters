import fragmentShader from "./shaders/shader.frag";
import vertexShader from "./shaders/shader.vert";
import { ProgramBuilder } from "../src/program_builder";
import { ShaderProgram } from "../src/shader_program";
import { Transformator } from "../src/transformator";
import Camera from "../src/camera";

function getGl(canvas: HTMLCanvasElement) {
  if (canvas == null) {
    throw "canvas not found";
  }

  const gl = canvas.getContext("webgl2");

  if (gl == null) {
    throw "GL is not supported";
  }

  return gl;
}

class Main {
  gl: WebGL2RenderingContext;
  program: ShaderProgram;
  transformator: Transformator;
  camera: Camera;
  vertexBuffer!: WebGLBuffer;
  colorsBuffer!: WebGLBuffer;
  indicesBuffer!: WebGLBuffer;
  vertices!: Float32Array;
  colors!: Float32Array;
  indices!: Uint16Array;

  constructor(canvas: HTMLCanvasElement) {
    this.gl = getGl(canvas);
    const programBuilder = new ProgramBuilder(this.gl);
    this.program = programBuilder.buildProgram(vertexShader, fragmentShader);
    this.generateCubeData();
    this.createBuffers();

    this.camera = new Camera(canvas.clientWidth, canvas.clientHeight);
    this.transformator = new Transformator();

    this.start();
    this.update();
  }

  generateCubeData() {
    this.vertices = new Float32Array(
      [ // X, Y, Z           R, G, B
        // Top
        1.0, 1.0, -1.0,    0.8, 0.8, 0.8,
        1.0, 1.0, 1.0,     0.8, 0.8, 0.8,
        -1.0, 1.0, 1.0,    0.8, 0.8, 0.8,
        -1.0, 1.0, -1.0,   0.8, 0.8, 0.8,

        // Left
        -1.0, 1.0, 1.0,    0.75, 0.25, 0.5,
        -1.0, -1.0, 1.0,   0.75, 0.25, 0.5,
        -1.0, -1.0, -1.0,  0.75, 0.25, 0.5,
        -1.0, 1.0, -1.0,   0.75, 0.25, 0.5,

        // Right
        1.0, 1.0, 1.0,    0.25, 0.25, 0.75,
        1.0, -1.0, 1.0,   0.25, 0.25, 0.75,
        1.0, -1.0, -1.0,  0.25, 0.25, 0.75,
        1.0, 1.0, -1.0,   0.25, 0.25, 0.75,

        // Front
        1.0, 1.0, 1.0,    1.0, 0.0, 0.15,
        1.0, -1.0, 1.0,    1.0, 0.0, 0.15,
        -1.0, -1.0, 1.0,    1.0, 0.0, 0.15,
        -1.0, 1.0, 1.0,    1.0, 0.0, 0.15,

        // Back
        1.0, 1.0, -1.0,    0.0, 1.0, 0.15,
        1.0, -1.0, -1.0,    0.0, 1.0, 0.15,
        -1.0, -1.0, -1.0,    0.0, 1.0, 0.15,
        -1.0, 1.0, -1.0,    0.0, 1.0, 0.15,

        // Bottom
        -1.0, -1.0, -1.0,   0.5, 0.5, 1.0,
        -1.0, -1.0, 1.0,    0.5, 0.5, 1.0,
        1.0, -1.0, 1.0,     0.5, 0.5, 1.0,
        1.0, -1.0, -1.0,    0.5, 0.5, 1.0,
      ]
    );

    this.indices = new Uint16Array([
      // Top
      1, 0, 2,
      3, 2, 0,

      // Left
      5, 4, 6,
      6, 4, 7,

      // Right
      8, 9, 10,
      8, 10, 11,

      // Front
      13, 12, 14,
      15, 14, 12,

      // Back
      16, 17, 18,
      16, 18, 19,

      // Bottom
      21, 20, 22,
      22, 20, 23
    ]);
  }

  createBuffers() {
    this.createVertexBuffer();
    this.createIndicesBuffer();
  }

  createVertexBuffer() {
    const vBuff = this.gl.createBuffer();
    if (vBuff == null) throw "Cannot create vertex buffer";

    this.vertexBuffer = vBuff;
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      this.vertices,
      this.gl.STATIC_DRAW
    );

    const position = this.gl.getAttribLocation(this.program.program, "vertPosition");
    this.gl.vertexAttribPointer(position, 3, this.gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 0);

    const color = this.gl.getAttribLocation(this.program.program, "vertColor");
    this.gl.vertexAttribPointer(color, 3, this.gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);

    this.gl.enableVertexAttribArray(position);
    this.gl.enableVertexAttribArray(color);
  }

  createIndicesBuffer() {
    const indBuff = this.gl.createBuffer();
    if (indBuff == null) throw "Cannot create vertex buffer";

    this.indicesBuffer = indBuff;
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), this.gl.STATIC_DRAW);
  }

  useProgram() {
    this.gl.useProgram(this.program.program);
  }

  start() {
    this.transformator.setdDefaultScaling();
    this.transformator.setDefaultTranslation();
    this.transformator.buildWorldMatrix();

    this.camera.position = new Float32Array([0, 0, 10])
    this.camera.setupView();

    this.useProgram();

    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.frontFace(this.gl.CCW);
    this.gl.cullFace(this.gl.BACK);

    this.setUniforms();
  }

  setUniforms() {
    this.updateModelUniform();
    this.updateViewUniform();
    this.updateProjUniform();
  }

  updateModelUniform() {
    const modelMatrixUniform = this.program.getUniformLocation("mModel");
    if (modelMatrixUniform)
      this.gl.uniformMatrix4fv(modelMatrixUniform, false, this.transformator.worldMatrix);
  }

  updateViewUniform() {
    const viewMatrixUniform = this.program.getUniformLocation("mView");
    if (viewMatrixUniform)
      this.gl.uniformMatrix4fv(viewMatrixUniform, false, this.camera.view);
  }

  updateProjUniform() {
    const projMatrixUniform = this.program.getUniformLocation("mProj");
    if (projMatrixUniform)
      this.gl.uniformMatrix4fv(projMatrixUniform, false, this.camera.proj);
  }

  update() {
    this.clearBackground();

    this.transformator.rotate([1, 1, 1]);
    this.transformator.buildWorldMatrix();
    this.updateModelUniform();

    this.gl.drawElements(this.gl.TRIANGLES, this.indices.length, this.gl.UNSIGNED_SHORT, 0)

    requestAnimationFrame(() => {
      this.update();
    });
  }

  clearBackground() {
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }
}
function main() {
  const canvas = document.querySelector("canvas#mycanvas") as HTMLCanvasElement;
  canvas.setAttribute("width", "600");
  canvas.setAttribute("height", "600");
  const mainObj = new Main(canvas)
  console.log("hello!");
}

main();
