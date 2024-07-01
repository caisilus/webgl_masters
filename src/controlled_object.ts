import { MovingObject } from "./moving_object";
import { SpotLight } from "./spot_light";

export class ControlledObject extends MovingObject {
  spotLights: SpotLight[];

  constructor(position: Array<number>, scale: Array<number>, color: Array<number>,
    objUrl: string, texUrl: string) {

    super(position, scale, color, objUrl, texUrl, [0,0,0]);
    this.setupKeyboardControls();
    this.spotLights = [];
  }

  addSpotlight(spotLight: SpotLight) {
    this.spotLights.push(spotLight);
  }

  private setupKeyboardControls(): void {
    window.addEventListener('keydown', (event) => {
      switch (event.key) {
        case 'ArrowUp':
          this.velocity[2] = - 0.1; 
          break;
        case 'ArrowDown':
          this.velocity[2] = 0.1; 
          break;
        case 'ArrowLeft':
          this.velocity[0] = -0.1; 
          break;
        case 'ArrowRight':
          this.velocity[0] = 0.1; 
          break;
      }
    });

    window.addEventListener('keyup', (event) => {
      switch (event.key) {
        case 'ArrowUp':
        case 'ArrowDown':
          this.velocity[2] = 0; 
          break;
        case 'ArrowLeft':
        case 'ArrowRight':
          this.velocity[0] = 0; 
          break;
      }
    });
  }

  protected beforeUpdate(): void {
    super.beforeUpdate();
  }

  protected move() {
    super.move();
    this.spotLights.forEach((sp) => {
      sp.moveBy([this.velocity[0], this.velocity[1], this.velocity[2]]);
    });
  }
}