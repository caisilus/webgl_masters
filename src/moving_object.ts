import { TexturedObject } from "./textured_object";

export class MovingObject extends TexturedObject {
  velocity: Array<number>;

  constructor(position: Array<number>, scale: Array<number>, color: Array<number>,
    objUrl: string, texUrl: string, velocity: Array<number>) {

    super(position, scale, color, objUrl, texUrl);
    this.velocity = velocity;
  }

  protected beforeUpdate(): void {
    super.beforeUpdate();
    this.move();
  }

  private move(): void {
    this.transform.translate(this.velocity[0], this.velocity[1], this.velocity[2]);
  }
}
