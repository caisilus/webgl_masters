import DrawData from "../src/draw_data";
import { ShaderProgram } from "../src/shader_program";
import { Transformator } from "../src/transformator";

export default class GameObject {
  private program!: ShaderProgram;
  private gl!: WebGL2RenderingContext;
  private vao!: WebGLVertexArrayObject;

  constructor(readonly drawData: DrawData, readonly transform: Transformator) {
    this.transform.setdDefaultScaling();
    this.transform.setDefaultTranslation();
  }

  public setProgram(program: ShaderProgram) {
    this.program = program;
    this.gl = program.gl;

    const vao = this.gl.createVertexArray(); 
    if (vao == null) {
        throw new Error("Could not create vertex array for object");
    }
    this.vao = vao;
  }

  public start() {
    this.gl.useProgram(this.program.program);

    this.gl.bindVertexArray(this.vao);

    this.transform.buildWorldMatrix();
    this.updateModelUniform();

    this.createVertexBuffer();
    this.setupVertexAttributes();
    this.createIndicesBuffer();
    // For children to implement. Like Unity's "Start" method
    this.onStart();

    this.gl.bindVertexArray(null);
  }

  private createVertexBuffer() {
    const vertexBuffer = this.gl.createBuffer();
    if (vertexBuffer == null) throw "Cannot create vertex buffer";

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      this.drawData.vertices,
      this.gl.STATIC_DRAW
    );
  }

  private setupVertexAttributes() {
    this.drawData.vertexAttributes(this.gl).forEach(vertexAttribute => {
      const location = this.program.getAttributeLocation(vertexAttribute.attributeName);

      this.gl.vertexAttribPointer(location, vertexAttribute.size, 
                                            vertexAttribute.type, 
                                            vertexAttribute.normalized, 
                                            vertexAttribute.stride, 
                                            vertexAttribute.offset);
      this.gl.enableVertexAttribArray(location);
    });
  }

  private createIndicesBuffer() {
    console.log(this.drawData.indices);
    if (this.drawData.indices == null) return;

    const indexBuffer = this.gl.createBuffer();
    if (indexBuffer == null) throw "Cannot create vertex buffer";

    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.drawData.indices), this.gl.STATIC_DRAW);
  }

  public update() {
    this.gl.useProgram(this.program.program);
    this.gl.bindVertexArray(this.vao);
    this.updateModelUniform();
    this.draw();
    // For children to implement. Like Unity's "Update" method
    this.onUpdate();
    this.gl.bindVertexArray(null);
  }

  private updateModelUniform() {
    const modelMatrixUniform = this.program.getUniformLocation("mModel");
    if (modelMatrixUniform)
      this.gl.uniformMatrix4fv(modelMatrixUniform, false, this.transform.worldMatrix);
  }

  private draw() {
    if (this.drawData.indices) {
      this.gl.drawElements(this.drawData.drawMode(this.gl), this.drawData.indices.length, 
                      this.gl.UNSIGNED_SHORT, 0)
    }
    else {
      this.gl.drawArrays(this.drawData.drawMode(this.gl), 0, this.drawData.verticesCount);
    }
  }

  protected onStart() {}
  protected onUpdate() {}
}