import { Transformator } from "./transformator";

export class LightSource {
  transformator: Transformator;

  constructor(position: [number, number, number],
              public readonly ambientColor: [number, number, number] = [0.1, 0.1, 0.1],
              public readonly diffuseColor: [number, number, number] = [0.7, 0.7, 0.7],
              public readonly specularColor: [number, number, number] = [1.0, 1.0, 1.0]
  ) {
    this.transformator = new Transformator();
    this.transformator.translate(position[0], position[1], position[2])
  }
}