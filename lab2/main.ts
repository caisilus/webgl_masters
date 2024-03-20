import fragmentShader from "./shaders/shader.frag";
import vertexShader from "./shaders/shader.vert";
import { ProgramBuilder } from "../src/program_builder";
import { ShaderProgram } from "../src/shader_program";
import VertexAttribute from "../src/vertex_attribute";
import PentagonData from "./pentagon_data";
import DrawData from "../src/draw_data";

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
  drawData!: DrawData;

  constructor(canvas: HTMLCanvasElement, readonly select: HTMLSelectElement) {
    this.gl = getGl(canvas);
    const programBuilder = new ProgramBuilder(this.gl);
    this.program = programBuilder.buildProgram(vertexShader, fragmentShader);

    this.renderSelection();
    this.select.addEventListener('change', (e) => { this.renderSelection(); });
  }

  renderSelection() {
    const selectedValue = this.select.options[this.select.selectedIndex].value;
    this.drawData = selectedValue == "pentagon" ? new PentagonData() : new PentagonData();
    this.createBuffers();
    this.start();
    this.draw();
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

  draw() {
    this.clearBackground();

    this.gl.drawArrays(this.drawData.drawMode(this.gl), 0, this.drawData.verticesCount);
  }

  clearBackground() {
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }
}
function main() {
  const canvas = document.querySelector("canvas#mycanvas") as HTMLCanvasElement;
  const select = document.querySelector("select#figure") as HTMLSelectElement;

  canvas.setAttribute("width", "600");
  canvas.setAttribute("height", "600");
  const mainObj = new Main(canvas, select);
}

main();
