import DrawData from "../src/draw_data";
import VertexAttribute from "../src/vertex_attribute";

export default class PentagonData implements DrawData {
  get vertices(): Float32Array {
    const color = [255, 0, 0].map(c => c / 255.0);
    const scale = 0.4;

    const nVerts = 5;
    const vertices = [{x: 0.0, y: 0.0}];
    const baseAngle = 2 * Math.PI / nVerts;

    for (let i = 0; i <= nVerts; i++) {
      let angle = i * baseAngle;

      let x = Math.cos(angle) * scale;
      let y = Math.sin(angle) * scale;

      vertices.push({ x: x, y: y });
    }

    return new Float32Array(vertices.map(v => [v.x, v.y, color]).flat(2));
  }

  get verticesCount(): number {
    return 7;
  }

  get indices(): Uint16Array | null {
    return null;
  }

  drawMode(gl: WebGL2RenderingContext): number {
    return gl.TRIANGLE_FAN;
  }

  vertexAttributes(gl: WebGL2RenderingContext): VertexAttribute[] {
    return VertexAttribute.attributesFor2DColoredVertex(gl);
  }
}