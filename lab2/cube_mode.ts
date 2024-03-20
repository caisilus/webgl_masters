import Camera from "../src/camera";
import DrawData from "../src/draw_data";
import { ProgramBuilder } from "../src/program_builder";
import { ShaderProgram } from "../src/shader_program";
import { Transformator } from "../src/transformator";
import { getGl } from "../src/utils";
import CubeData from "./cube_data";
import PentagonData from "./pentagon_data";
import fragmentShader from "./shaders/cube.frag";
import vertexShader from "./shaders/cube.vert";

export default class CubeMode {
  gl: WebGL2RenderingContext;
  program: ShaderProgram;
  vertexBuffer!: WebGLBuffer;
  colorsBuffer!: WebGLBuffer;
  indicesBuffer!: WebGLBuffer;
  vertices!: Float32Array;
  colors!: Float32Array;
  indices!: Uint16Array;
  drawData!: DrawData;
  camera: Camera;
  transformator: Transformator;

  constructor(canvas: HTMLCanvasElement) {
    this.gl = getGl(canvas);

    const programBuilder = new ProgramBuilder(this.gl);
    this.program = programBuilder.buildProgram(vertexShader, fragmentShader);
    this.drawData = new CubeData();
    this.camera = new Camera(canvas.clientWidth, canvas.clientHeight);
    this.transformator = new Transformator();

    this.createBuffers();
    this.start();
    this.draw();
  }

  createBuffers() {
    this.createVertexBuffer();
    this.createIndexBuffer();
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
      console.log(vertexAttribute.size);
      const location = this.gl.getAttribLocation(this.program.program, vertexAttribute.attributeName);
      this.gl.vertexAttribPointer(location, vertexAttribute.size, 
                                            vertexAttribute.type, 
                                            vertexAttribute.normalized, 
                                            vertexAttribute.stride, 
                                            vertexAttribute.offset);
      this.gl.enableVertexAttribArray(location);
    });
  }

  createIndexBuffer() {
    if (!this.drawData.indices) return;

    const indBuff = this.gl.createBuffer();
    if (indBuff == null) throw "Cannot create vertex buffer";

    this.indicesBuffer = indBuff;
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.drawData.indices), this.gl.STATIC_DRAW);
  }

  start() {
    this.transformator.setdDefaultScaling();
    this.transformator.setDefaultTranslation();
    this.transformator.buildWorldMatrix();

    this.camera.position = new Float32Array([15, 10, 10])
    this.camera.setupView();

    this.useProgram();

    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.frontFace(this.gl.CCW);
    this.gl.cullFace(this.gl.BACK);

    this.setUniforms();
  }

  useProgram() {
    this.gl.useProgram(this.program.program);
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

  draw() {
    this.clearBackground();

    if (this.drawData.indices) {
      this.gl.drawElements(this.drawData.drawMode(this.gl), this.drawData.indices.length, 
                           this.gl.UNSIGNED_SHORT, 0)
    }
    else {
      this.gl.drawArrays(this.drawData.drawMode(this.gl), 0, this.drawData.verticesCount);
    }
  }

  clearBackground() {
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }
}