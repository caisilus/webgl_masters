import { LightSource } from "./light_source";
import { ShaderProgram } from "./shader_program";

export class LightController {
  gl: WebGL2RenderingContext;

  constructor(readonly program: ShaderProgram, readonly lightSource: LightSource) {
    this.gl = program.gl;
  }

  updateUniforms() {
    this.updatePosition();
    this.updateAmbient();
    this.updateDiffuse();
    this.updateSpecular();
  }

  private updatePosition() {
    const uniform = this.program.getUniformLocation("lightPosition");
    if (uniform) {
      
      this.gl.uniform3fv(uniform, this.lightSource.transformator.position());
    }
  }

  private updateAmbient() {
    const uniform = this.program.getUniformLocation("ambientLightColor");
    if (uniform)
      this.gl.uniform3fv(uniform, this.lightSource.ambientColor);
  }

  private updateDiffuse() {
    const uniform = this.program.getUniformLocation("diffuseLightColor");
    if (uniform)
      this.gl.uniform3fv(uniform, this.lightSource.diffuseColor);
  }

  private updateSpecular() {
    const uniform = this.program.getUniformLocation("specularLightColor");
    if (uniform)
      this.gl.uniform3fv(uniform, this.lightSource.specularColor);
  }
}