import DrawData from "../src/draw_data";
import { ProgramBuilder } from "../src/program_builder";
import { ShaderProgram } from "../src/shader_program";
import { getGl } from "../src/utils";
import fragmentShader from "./shaders/square.frag";
import vertexShader from "./shaders/square.vert";
import SquareData from "./square_data";

export default class SquareMode {
  gl: WebGL2RenderingContext;
  program: ShaderProgram;
  vertexBuffer!: WebGLBuffer;
  colorsBuffer!: WebGLBuffer;
  indicesBuffer!: WebGLBuffer;
  vertices!: Float32Array;
  colors!: Float32Array;
  indices!: Uint16Array;
  drawData!: DrawData;

  constructor(canvas: HTMLCanvasElement) {
    this.gl = getGl(canvas);
    const programBuilder = new ProgramBuilder(this.gl);
    this.program = programBuilder.buildProgram(vertexShader, fragmentShader);
    this.drawData = new SquareData();

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

  start() {
    this.useProgram();

    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);
  }

  useProgram() {
    this.gl.useProgram(this.program.program);
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