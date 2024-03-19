import VertexAttribute from "./vertex_attribute";

export default interface DrawData {
  get vertices(): Float32Array;
  get verticesCount(): number;
  get indices(): Uint16Array | null;
  drawMode(gl: WebGL2RenderingContext): number
  vertexAttributes(gl: WebGL2RenderingContext): Array<VertexAttribute>;
}