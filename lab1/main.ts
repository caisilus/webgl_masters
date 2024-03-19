import fragmentShader from "./shaders/shader.frag";
import vertexShader from "./shaders/shader.vert";
import { ProgramBuilder } from "../src/program_builder";
import { ShaderProgram } from "../src/shader_program";
import { Transformator } from "../src/transformator";
import Camera from "../src/camera";
import TriangleData from "./triangle_data";
import VertexAttribute from "../src/vertex_attribute";
import SquareData from "./square_data";

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
  vertexBuffer!: WebGLBuffer;
  colorsBuffer!: WebGLBuffer;
  indicesBuffer!: WebGLBuffer;
  vertices!: Float32Array;
  colors!: Float32Array;
  indices!: Uint16Array;
  drawData: TriangleData;

  constructor(canvas: HTMLCanvasElement) {
    this.gl = getGl(canvas);
    const programBuilder = new ProgramBuilder(this.gl);
    this.program = programBuilder.buildProgram(vertexShader, fragmentShader);
    this.drawData = new SquareData();
    this.createBuffers();

    this.start();
    this.update();
  }

  createBuffers() {
    this.createVertexBuffer();
  }

  createVertexBuffer() {
    const vBuff = this.gl.createBuffer();
    if (vBuff == null) throw "Cannot create vertex buffer";

    this.vertexBuffer = vBuff;
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      this.drawData.vertices,
      this.gl.STATIC_DRAW
    );

    this.drawData.vertexAttributes(this.gl).forEach(vertexAttribute => {
      console.log(vertexAttribute.attributeName);
      const location = this.gl.getAttribLocation(this.program.program, vertexAttribute.attributeName);
      this.gl.vertexAttribPointer(location, vertexAttribute.size, 
                                            vertexAttribute.type, 
                                            vertexAttribute.normalized, 
                                            vertexAttribute.stride, 
                                            vertexAttribute.offset);
      this.gl.enableVertexAttribArray(location);
    });
  }

  useProgram() {
    this.gl.useProgram(this.program.program);
  }

  start() {
    this.useProgram();

    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);
  }

  update() {
    this.clearBackground();

    this.gl.drawArrays(this.drawData.drawMode(this.gl), 0, this.drawData.verticesCount);

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
}

main();
