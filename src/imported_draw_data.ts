import DrawData from "./draw_data";
import { ObjData } from "./obj_parser";
import VertexAttribute from "./vertex_attribute";

export class ImportedDrawData implements DrawData {
  constructor(readonly objData: ObjData, readonly color: Array<number>) {
  }

  get vertices(): Float32Array {
    return new Float32Array(this.objData.vertices.map((vertex) => 
      [vertex.position, this.color, vertex.texCoords, vertex.normal]).flat(2));
  }

  get verticesCount(): number {
    return this.objData.vertices.length;
  }

  get indices(): Uint16Array | null {
    return new Uint16Array(this.objData.indices);
  }

  drawMode(gl: WebGL2RenderingContext): number {
    return gl.TRIANGLES;
  }

  vertexAttributes(gl: WebGL2RenderingContext): VertexAttribute[] {
    return VertexAttribute.attributesForVertexWithTexCoords(gl);
  }

}