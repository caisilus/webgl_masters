import { mat4, vec3 } from "gl-matrix";
import { ShaderProgram } from "../src/shader_program";
import { Transformator } from "../src/transformator"
import VertexAttribute from "../src/vertex_attribute";
import { ParticlesMode } from "./particles_mode";

export class Particle {
  transform: Transformator;
  programTrack!: ShaderProgram;
  programSpark!: ShaderProgram;

  private gl!: WebGL2RenderingContext;

  private trackVao!: WebGLVertexArrayObject;
  private sparkVao!: WebGLVertexArrayObject;
  vaoInitialized: boolean;

  private sparkVertexBuffer!: WebGLBuffer;
  private trackVertexBuffer!: WebGLBuffer;

  currentLife: number;
  texture!: WebGLTexture;
  bengalMode!: ParticlesMode;

  constructor(readonly position: [number, number, number], 
              private velocity: [number, number, number], 
              private lifeTime: number) {

    this.currentLife = lifeTime;
    this.transform = new Transformator();
    this.transform.setdDefaultScaling();
    this.transform.setDefaultTranslation();
    this.vaoInitialized = false;
    this.transform.translate(position[0], position[1], position[2]);
  }

  reset(position: [number, number, number], 
        velocity: [number, number, number], 
        lifeTime: number) {

    this.currentLife = lifeTime;
    this.lifeTime = lifeTime;
    this.velocity = velocity;
    this.transform.setdDefaultScaling();
    this.transform.setDefaultTranslation();
    this.transform.translate(position[0], position[1], position[2]);
  }

  setTexture(texture: WebGLTexture) {
    this.texture = texture;
  }

  setPrograms(programSpark: ShaderProgram, programTrack: ShaderProgram) {
    this.programSpark = programSpark;
    this.programTrack = programTrack;

    if (!this.vaoInitialized) {
      this.setupVao(this.programSpark.gl);
    }
  }

  setupVao(gl: WebGL2RenderingContext) {
    this.gl = gl;

    this.gl.useProgram(this.programTrack.program);
    const vao1 = this.gl.createVertexArray(); 
    if (vao1 == null) {
        throw new Error("Could not create vertex array for object");
    }
    this.trackVao = vao1;

    this.gl.useProgram(this.programSpark.program);
    const vao2 = this.gl.createVertexArray(); 
    if (vao2 == null) {
        throw new Error("Could not create vertex array for object");
    }
    this.sparkVao = vao2;
    this.vaoInitialized = true;
  }

  start() {
    this.startSpark();
    this.startTrack();
  }

  startSpark() {
    this.gl.useProgram(this.programSpark.program);

    this.gl.bindVertexArray(this.sparkVao);

    this.transform.buildWorldMatrix();
    this.updateModelUniform(this.programSpark);

    this.createSparkVertexBuffer();
    this.setupSparkVertexAttributes();
  }

  private createSparkVertexBuffer() {
    const vertexBuffer = this.gl.createBuffer();

    if (vertexBuffer == null) throw "Cannot create vertex buffer";

    this.sparkVertexBuffer = vertexBuffer;
    this.updateBuffer(this.sparkVertexBuffer, this.transform.position());
  }

  private updateBuffer(buffer: WebGLBuffer, data: number[] | vec3) {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(data),
      this.gl.STATIC_DRAW
    );
  }

  private setupSparkVertexAttributes() {
    VertexAttribute.attributesFor3DVertex(this.gl).forEach(vertexAttribute => {
      const location = this.programSpark.getAttributeLocation(vertexAttribute.attributeName);

      this.gl.vertexAttribPointer(location, vertexAttribute.size, 
                                            vertexAttribute.type, 
                                            vertexAttribute.normalized, 
                                            vertexAttribute.stride, 
                                            vertexAttribute.offset);
      this.gl.enableVertexAttribArray(location);
    });
  }


  startTrack() {
    this.gl.useProgram(this.programTrack.program);

    this.gl.bindVertexArray(this.trackVao);

    this.transform.buildWorldMatrix();
    this.updateModelUniform(this.programTrack);

    this.createTrackVertexBuffer();
    this.setupTrackVertexAttributes();
  }

  private createTrackVertexBuffer() {

    const vertexBuffer = this.gl.createBuffer();

    if (vertexBuffer == null) throw "Cannot create vertex buffer";

    this.trackVertexBuffer = vertexBuffer;

    const position = this.transform.position();
    const data = [
      0, 0, 0, 1, 1, 1, // center
      position[0], position[1], position[2], 0.47, 0.31, 0.24
    ]
    this.updateBuffer(this.trackVertexBuffer, data)
  }

  private setupTrackVertexAttributes() {
    VertexAttribute.attributesFor3DColoredVertex(this.gl).forEach(vertexAttribute => {
      const location = this.programTrack.getAttributeLocation(vertexAttribute.attributeName);

      this.gl.vertexAttribPointer(location, vertexAttribute.size, 
                                            vertexAttribute.type, 
                                            vertexAttribute.normalized, 
                                            vertexAttribute.stride, 
                                            vertexAttribute.offset);
      this.gl.enableVertexAttribArray(location);
    });
  }

  private updateModelUniform(program: ShaderProgram) {
    this.gl.useProgram(program.program);
    const modelMatrixUniform = program.getUniformLocation("mModel");

    let modelMatrix = new Float32Array(16);
    mat4.identity(modelMatrix);

    if (modelMatrixUniform)
      this.gl.uniformMatrix4fv(modelMatrixUniform, false, modelMatrix);
  }

  update() {
    this.move();

    const position = this.transform.position();

    this.gl.useProgram(this.programSpark.program);
    this.gl.bindVertexArray(this.sparkVao);
    this.updateBuffer(this.sparkVertexBuffer, position);

    this.gl.drawArrays(this.gl.POINTS, 0, 1); // Draw sparks

    this.gl.useProgram(this.programTrack.program);
    this.gl.bindVertexArray(this.trackVao);
    const data = [
      0, 0, 0, 1, 1, 1, // center
      position[0], position[1], position[2], 0.47, 0.31, 0.24
    ]
    this.updateBuffer(this.trackVertexBuffer, data);

    this.gl.drawArrays(this.gl.LINES, 0, 2); // Draw tracks
  }

  move() {
    this.transform.translate(this.velocity[0], this.velocity[1], this.velocity[2]);
    this.currentLife--;
    if (this.currentLife < 0) {
      // this.currentLife = this.lifeTime;
      // this.velocity[0] *= -1;
      // this.velocity[1] *= -1;
      // this.velocity[2] *= -1;
      this.bengalMode.reset();
    }
  }
}