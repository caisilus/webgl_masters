import DrawData from "../src/draw_data";
import VertexAttribute from "../src/vertex_attribute";

export default class CubeWithTexCoords implements DrawData {
  public color : Array<number>;

  constructor(color: Array<number>) {
    this.color = color;
  }

  get vertices(): Float32Array {
    const colors = {
      top: this.color,
      left: this.color,
      right: this.color,
      front: this.color,
      back: this.color,
      bottom: this.color
    }

    const faces = {
      top: [
        [1.0, 1.0, -1.0],
        [1.0, 1.0, 1.0],
        [-1.0, 1.0, 1.0],
        [-1.0, 1.0, -1.0],
      ],
      left: [
        [-1.0, 1.0, 1.0],
        [-1.0, -1.0, 1.0],
        [-1.0, -1.0, -1.0],
        [-1.0, 1.0, -1.0],
      ],
      right: [
        [1.0, 1.0, 1.0],
        [1.0, -1.0, 1.0],
        [1.0, -1.0, -1.0],
        [1.0, 1.0, -1.0],
      ],
      front: [
        [1.0, 1.0, 1.0],
        [1.0, -1.0, 1.0],
        [-1.0, -1.0, 1.0],
        [-1.0, 1.0, 1.0],
      ],
      back: [
        [1.0, 1.0, -1.0],
        [1.0, -1.0, -1.0],
        [-1.0, -1.0, -1.0],
        [-1.0, 1.0, -1.0],
      ],
      bottom: [
        [-1.0, -1.0, -1.0],
        [-1.0, -1.0, 1.0],
        [1.0, -1.0, 1.0],
        [1.0, -1.0, -1.0],
      ]
    } as const;

    // const facesNormals = Object.fromEntries(Object.entries(faces).map(([face, points]) => {
    //   const normal : [number, number, number] = [0, 0, 0]; 
    //   const vector1 = vec3.create();
    //   const vector2 = vec3.create();
    //   vec3.sub(vector1, points[0], points[1]);
    //   vec3.sub(vector2, points[2], points[1]);
    //   vec3.cross(normal, vector1, vector2);
    //   return [face, normal]; 
    // })) as Record<keyof typeof faces, [number, number, number]>;


    const facesNormals = {
      top: [0, 1, 0],
      left: [-1, 0, 0],
      right: [1, 0, 0],
      bottom: [0, -1, 0],
      front: [0, 0, 1],
      back: [0, 0, -1]
    }

    console.log(facesNormals);
    return new Float32Array(
      [ // X, Y, Z           R, G, B   U, V
        // Top
        1.0, 1.0, -1.0,    colors.top, 1.0, 0.0, facesNormals.top,
        1.0, 1.0, 1.0,     colors.top, 1.0, 1.0, facesNormals.top,
        -1.0, 1.0, 1.0,    colors.top, 0.0, 1.0, facesNormals.top,
        -1.0, 1.0, -1.0,   colors.top, 0.0, 0.0, facesNormals.top,

        // Left
        -1.0, 1.0, 1.0,    colors.left, 1.0, 0.0, facesNormals.left,
        -1.0, -1.0, 1.0,   colors.left, 1.0, 1.0, facesNormals.left,
        -1.0, -1.0, -1.0,  colors.left, 0.0, 1.0, facesNormals.left,
        -1.0, 1.0, -1.0,   colors.left, 0.0, 0.0, facesNormals.left,

        // Right
        1.0, 1.0, 1.0,    colors.right, 0.0, 0.0, facesNormals.right,
        1.0, -1.0, 1.0,   colors.right, 0.0, 1.0, facesNormals.right,
        1.0, -1.0, -1.0,  colors.right, 1.0, 1.0, facesNormals.right,
        1.0, 1.0, -1.0,   colors.right, 1.0, 0.0, facesNormals.right,

        // Front
        1.0, 1.0, 1.0,    colors.front, 1.0, 0.0, facesNormals.front,
        1.0, -1.0, 1.0,   colors.front, 1.0, 1.0, facesNormals.front,
        -1.0, -1.0, 1.0,  colors.front, 0.0, 1.0, facesNormals.front,
        -1.0, 1.0, 1.0,   colors.front, 0.0, 0.0, facesNormals.front,

        // Back
        1.0, 1.0, -1.0,   colors.back, 0.0, 0.0, facesNormals.back,
        1.0, -1.0, -1.0,  colors.back, 0.0, 1.0, facesNormals.back,
        -1.0, -1.0, -1.0, colors.back, 1.0, 1.0, facesNormals.back,
        -1.0, 1.0, -1.0,  colors.back, 1.0, 0.0, facesNormals.back,

        // Bottom
        -1.0, -1.0, -1.0, colors.bottom, 1.0, 1.0, facesNormals.bottom,
        -1.0, -1.0, 1.0,  colors.bottom, 1.0, 0.0, facesNormals.bottom,
        1.0, -1.0, 1.0,   colors.bottom, 0.0, 0.0, facesNormals.bottom,
        1.0, -1.0, -1.0,  colors.bottom, 0.0, 1.0, facesNormals.bottom,
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
    return VertexAttribute.attributesForVertexWithTexCoords(gl);
  }
}