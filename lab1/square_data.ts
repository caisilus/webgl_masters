import DrawData from "../src/draw_data";
import VertexAttribute from "../src/vertex_attribute";

export default class SquareData implements DrawData {
  get vertices(): Float32Array {
    const color = [99, 242, 240].map(c => c / 255.0);
    const scale = 0.4;

    return new Float32Array([
      scale, scale, color[0], color[1], color[2],
      -scale, scale, color[0], color[1], color[2],
      scale, -scale, color[0], color[1], color[2],
      -scale, -scale, color[0], color[1], color[2],
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
    return VertexAttribute.attributesFor2DColoredVertex(gl);
  }
}