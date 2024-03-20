import DrawData from "../src/draw_data";
import VertexAttribute from "../src/vertex_attribute";

export default class CubeData implements DrawData {
  get vertices(): Float32Array {
    const color = [252, 248, 3].map(c => c / 255.0);
    const colors = {
      top: color,
      left: color,
      right: color,
      front: color,
      back: color,
      bottom: color
    }

    return new Float32Array(
      [ // X, Y, Z           R, G, B
        // Top
        1.0, 1.0, -1.0,    colors.top,
        1.0, 1.0, 1.0,     colors.top,
        -1.0, 1.0, 1.0,    colors.top,
        -1.0, 1.0, -1.0,   colors.top,

        // Left
        -1.0, 1.0, 1.0,    colors.left,
        -1.0, -1.0, 1.0,   colors.left,
        -1.0, -1.0, -1.0,  colors.left,
        -1.0, 1.0, -1.0,   colors.left,

        // Right
        1.0, 1.0, 1.0,    colors.right,
        1.0, -1.0, 1.0,   colors.right,
        1.0, -1.0, -1.0,  colors.right,
        1.0, 1.0, -1.0,   colors.right,

        // Front
        1.0, 1.0, 1.0,    colors.front,
        1.0, -1.0, 1.0,   colors.front,
        -1.0, -1.0, 1.0,  colors.front,
        -1.0, 1.0, 1.0,   colors.front,

        // Back
        1.0, 1.0, -1.0,   colors.back,
        1.0, -1.0, -1.0,  colors.back,
        -1.0, -1.0, -1.0, colors.back,
        -1.0, 1.0, -1.0,  colors.back,

        // Bottom
        -1.0, -1.0, -1.0, colors.bottom,
        -1.0, -1.0, 1.0,  colors.bottom,
        1.0, -1.0, 1.0,   colors.bottom,
        1.0, -1.0, -1.0,  colors.bottom,
      ].flat()
    )
  }

  get verticesCount(): number {
    return -1;
  }

  get indices(): Uint16Array | null {
    return new Uint16Array([
      // Top
      1, 0, 2,
      3, 2, 0,

      // Left
      5, 4, 6,
      6, 4, 7,

      // Right
      8, 9, 10,
      8, 10, 11,

      // Front
      13, 12, 14,
      15, 14, 12,

      // Back
      16, 17, 18,
      16, 18, 19,

      // Bottom
      21, 20, 22,
      22, 20, 23
    ]);
  }

  drawMode(gl: WebGL2RenderingContext): number {
    return gl.TRIANGLES;
  }

  vertexAttributes(gl: WebGL2RenderingContext): VertexAttribute[] {
    return VertexAttribute.attributesFor3DColoredVertex(gl);
  }
}