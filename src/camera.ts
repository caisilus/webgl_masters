import { glMatrix, vec3, mat3, mat4 } from "gl-matrix";

export default class Camera {
  view = new Float32Array(16);
  proj = new Float32Array(16);

  // For view matrix
  position = new Float32Array([0, 0, -2]);
  lookAt = new Float32Array([0, 0, 0]);
  up = new Float32Array([0, 1, 0]);

  // For proj matrix
  fovDegrees = 45;
  aspect: number;
  zNear = 0.1;
  zFar = 1000;

  constructor(screen_width: number, screen_height: number) {
    this.aspect = screen_width / screen_height;
    this.setupView();
    this.setupProj();
  }

  setupView() {
    this.view = new Float32Array(16)
    mat4.lookAt(this.view, this.position, this.lookAt, this.up);
  }

  setupProj() {
    mat4.perspective(
      this.proj,
      glMatrix.toRadian(this.fovDegrees),
      this.aspect,
      this.zNear,
      this.zFar
    );
  }
}
