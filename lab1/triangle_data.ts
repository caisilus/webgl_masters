import DrawData from "../src/draw_data";
import VertexAttribute from "../src/vertex_attribute";

export default class TriangleData implements DrawData {
  get vertices(): Float32Array {
    return new Float32Array([
      0.0, 1.0, 0.0, 1.0, 0.0,
      -1.0, -1.0, 1.0, 0.0, 0.0,
      1.0, -1.0, 0.0, 0.0, 1.0
    ]);
  }

  get verticesCount(): number {
    return 3;
  }

  get indices(): Uint16Array | null {
    return null;
  }

  vertexAttributes(gl: WebGL2RenderingContext): VertexAttribute[] {
    return VertexAttribute.attributesFor2DColoredVertex(gl);
  }
}