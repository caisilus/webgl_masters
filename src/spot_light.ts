import { vec3 } from "gl-matrix";
import { LightSource } from "./light_source";

export class SpotLight {
  constructor(public position: [number, number, number],
              public target: [number, number, number],
              public readonly limit: number,
              public readonly ambientColor: [number, number, number] = [0.2, 0.2, 0.2],
              public readonly diffuseColor: [number, number, number] = [0.7, 0.7, 0.7],
              public readonly specularColor: [number, number, number] = [1.0, 1.0, 1.0],
  ) {
  }

  moveTo(newPosition: [number, number, number]) {
    const currentPosition = vec3.fromValues(this.position[0], 
                                            this.position[1], 
                                            this.position[2]);
    const delta = vec3.create();
    vec3.sub(delta, newPosition, currentPosition);

    const target = vec3.fromValues(this.target[0], 
                                    this.target[1], 
                                    this.target[2]);
    vec3.add(target, target, delta);

    this.position = [newPosition[0], newPosition[1], newPosition[2]];
    this.target = [target[0], target[1], target[2]];
  }

  moveBy(delta: [number, number, number]) {
    const currentPosition = vec3.fromValues(this.position[0], 
                                            this.position[1], 
                                            this.position[2]);

    vec3.add(currentPosition, currentPosition, delta);

    const target = vec3.fromValues(this.target[0], 
                                    this.target[1], 
                                    this.target[2]);
    vec3.add(target, target, delta);

    this.position = [currentPosition[0], currentPosition[1], currentPosition[2]];
    this.target = [target[0], target[1], target[2]];
  }

  get direction() : [number, number, number] {
    const lightDirection : [number, number, number] = [0,0,0]

    lightDirection[0] = this.target[0] - this.position[0];
    lightDirection[1] = this.target[1] - this.position[1];
    lightDirection[2] = this.target[2] - this.position[2];

    return lightDirection;
  }
}