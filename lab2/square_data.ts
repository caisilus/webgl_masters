import DrawData from "../src/draw_data";
import VertexAttribute from "../src/vertex_attribute";

export default class SquareData implements DrawData {
  get vertices(): Float32Array {
    const scale = 0.4;

    return new Float32Array([
      scale, scale,
      -scale, scale,
      scale, -scale,
      -scale, -scale
    ]);
  }

  get verticesCount(): number {
    return 4;
  }

  get indices(): Uint16Array | null {
    return null;
  }

  drawMode(gl: WebGL2RenderingContext): number {
    return gl.TRIANGLE_STRIP;
  }

  vertexAttributes(gl: WebGL2RenderingContext): VertexAttribute[] {
    return VertexAttribute.attributesFor2DVertex(gl);
  }
}