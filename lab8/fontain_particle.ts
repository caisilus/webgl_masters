import { mat4, vec3 } from "gl-matrix";
import { ShaderProgram } from "../src/shader_program";
import { Transformator } from "../src/transformator"
import VertexAttribute from "../src/vertex_attribute";
import { ParticlesMode } from "./particles_mode";

export class FontainParticle {
  transform: Transformator;
  programSpark!: ShaderProgram;

  private gl!: WebGL2RenderingContext;

  private sparkVao!: WebGLVertexArrayObject;
  vaoInitialized: boolean;

  private sparkVertexBuffer!: WebGLBuffer;

  currentLife: number;
  texture!: WebGLTexture;
  bengalMode!: ParticlesMode;

  g: number;

  constructor(readonly position: [number, number, number], 
              private velocity: [number, number, number], 
              private lifeTime: number) {

    this.currentLife = lifeTime;
    this.transform = new Transformator();
    this.transform.setdDefaultScaling();
    this.transform.setDefaultTranslation();
    this.vaoInitialized = false;
    this.transform.translate(position[0], position[1], position[2]);
    this.g = -0.001;
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

  setPrograms(programSpark: ShaderProgram) {
    this.programSpark = programSpark;

    if (!this.vaoInitialized) {
      this.setupVao(this.programSpark.gl);
    }
  }

  setupVao(gl: WebGL2RenderingContext) {
    this.gl = gl;

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
  }

  move() {
    this.transform.translate(this.velocity[0], this.velocity[1], this.velocity[2]);
    this.currentLife--;
    
    this.velocity[1] += this.g;

    if (this.currentLife < 0) {
      this.bengalMode.reset();
    }
  }

  invertVelocity() {
    this.velocity[0] *= -1;
    // this.velocity[1] *= -1;
    // this.velocity[2] *= -1;
  }
}