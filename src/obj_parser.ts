export class ParsedVertex {
  constructor (readonly position: number[], readonly color: number[], 
               readonly texCoords: number[], readonly normal: number[]) {}
}

export interface ObjData {
  vertices: ParsedVertex[];
  indices: number[]
}

export class ObjParser {
  vertices: number[][] = [[0, 0, 0]];
  texCoords: number[][] = [[0, 0]];
  normals: number[][] = [[0, 0, 0]];
  
  reorderedVertices: number[][] = [];
  reorderedTexCoords: number[][] = [];
  reorderedNormals: number[][] = [];
  reorderedColors: number[][] = [];

  parse(text: string) : ObjData {
    this.vertices = [[0, 0, 0]];
    this.texCoords = [[0, 0]];
    this.normals = [[0, 0, 0]];

    this.reorderedVertices = [];
    this.reorderedTexCoords = [];
    this.reorderedNormals = [];

    const lines = text.split("\n");
    lines.forEach((line) => this.parseLine(line));

    let vertices: ParsedVertex[] = [];
    let indices: number[] = [];
    for (let i = 0; i < this.reorderedVertices.length; i++) {
      vertices.push(new ParsedVertex(
                                     this.reorderedVertices[i], 
                                     [255, 255, 255], 
                                     this.reorderedTexCoords[i], 
                                     this.reorderedNormals[i] 
                                    ));
      indices.push(i);
    }

    return { vertices: vertices, indices: indices }
  }

  parseLine(line: string) {
    line = line.trim();
    if (line === "" || line.startsWith("#")) {
      return;
    }
    const keyword = line.split(/\s+/)[0];
    const parts = line.split(/\s+/).slice(1);

    switch (keyword) {
      case "v":
        console.log(this.vertices);
        this.vertices.push(parts.map(parseFloat));
        break;
      case "vn":
        this.normals.push(parts.map(parseFloat));
        break;
      case "vt":
        this.texCoords.push(parts.map(parseFloat));
        break;
      case "f":
        const numTriangles = parts.length - 2;
        for (let tri = 0; tri < numTriangles; tri++) {
          this.addVertex(parts[0]);
          this.addVertex(parts[tri + 1]);
          this.addVertex(parts[tri + 2]);
        }

        break;
      default:
        console.warn("unhandled keyword:", keyword); 
        break;
    }
  }

  addVertex(vert: string) {
    const ptn = vert.split('/');
    
    let index = parseInt(ptn[0]);
    this.reorderedVertices.push(this.vertices[index]);

    index = parseInt(ptn[1]);
    this.reorderedTexCoords.push(this.texCoords[index]);

    index = parseInt(ptn[2]);
    this.reorderedNormals.push(this.normals[index]);
  }
}