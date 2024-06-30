import { MovingObject } from "./moving_object";

export class ControlledObject extends MovingObject {
  constructor(position: Array<number>, scale: Array<number>, color: Array<number>,
    objUrl: string, texUrl: string, velocity: Array<number>) {

    super(position, scale, color, objUrl, texUrl, velocity);
    this.velocity = [0,0,0];
    this.setupKeyboardControls();
  }

  private setupKeyboardControls(): void {
    window.addEventListener('keydown', (event) => {
      switch (event.key) {
        case 'ArrowUp':
          this.velocity[2] = 0.1; 
          break;
        case 'ArrowDown':
          this.velocity[2] = -0.1; 
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
}