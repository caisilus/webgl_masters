export default class VertexAttribute {
  constructor(readonly attributeName: string, readonly size: number, 
              readonly type: number, readonly normalized: boolean, 
              readonly stride: number, readonly offset: number) {

              }

  public static attributesFor2DColoredVertex(gl: WebGL2RenderingContext) {
    return [
      new VertexAttribute("vertPosition", 2, gl.FLOAT, false, 
                          5 * Float32Array.BYTES_PER_ELEMENT, 
                          0),
      new VertexAttribute("vertColor", 3, gl.FLOAT, false, 
                          5 * Float32Array.BYTES_PER_ELEMENT, 
                          2 * Float32Array.BYTES_PER_ELEMENT)
    ]
  }

  public static attributesFor2DVertex(gl: WebGL2RenderingContext) {
    return [
      new VertexAttribute("vertPosition", 2, gl.FLOAT, false, 
                          2 * Float32Array.BYTES_PER_ELEMENT, 
                          0),
    ]
  }

  public static attributesFor3DVertex(gl: WebGL2RenderingContext) {
    return [
      new VertexAttribute("vertPosition", 3, gl.FLOAT, false, 
                          3 * Float32Array.BYTES_PER_ELEMENT, 
                          0),
    ]
  }

  public static attributesFor3DColoredVertex(gl: WebGL2RenderingContext) {
    return [
      new VertexAttribute("vertPosition", 3, gl.FLOAT, false, 
                          6 * Float32Array.BYTES_PER_ELEMENT, 
                          0),
      new VertexAttribute("vertColor", 3, gl.FLOAT, false, 
                          6 * Float32Array.BYTES_PER_ELEMENT, 
                          3 * Float32Array.BYTES_PER_ELEMENT)
    ]
  }

  public static attributesForVertexWithNormals(gl: WebGL2RenderingContext) {
    return [
      new VertexAttribute("vertPosition", 3, gl.FLOAT, false, 
                          9 * Float32Array.BYTES_PER_ELEMENT, 
                          0),
      new VertexAttribute("vertColor", 3, gl.FLOAT, false, 
                          9 * Float32Array.BYTES_PER_ELEMENT, 
                          3 * Float32Array.BYTES_PER_ELEMENT),
      new VertexAttribute("vertNormal", 3, gl.FLOAT, false, 
                          9 * Float32Array.BYTES_PER_ELEMENT, 
                          6 * Float32Array.BYTES_PER_ELEMENT)
    ]
  }

  public static attributesForVertexWithTexCoords(gl: WebGL2RenderingContext) {
    return [
      new VertexAttribute("vertPosition", 3, gl.FLOAT, false, 
                          11 * Float32Array.BYTES_PER_ELEMENT, 
                          0),
      new VertexAttribute("vertColor", 3, gl.FLOAT, false, 
                          11 * Float32Array.BYTES_PER_ELEMENT, 
                          3 * Float32Array.BYTES_PER_ELEMENT),
      new VertexAttribute("vertTexCoord", 2, gl.FLOAT, false, 
                          11 * Float32Array.BYTES_PER_ELEMENT, 
                          6 * Float32Array.BYTES_PER_ELEMENT),
      new VertexAttribute("vertNormal", 3, gl.FLOAT, false, 
                          11 * Float32Array.BYTES_PER_ELEMENT, 
                          8 * Float32Array.BYTES_PER_ELEMENT),
    ]
  }
}