import { LightSource } from "./light_source";
import { ShaderProgram } from "./shader_program";

export class LightController {
  gl: WebGL2RenderingContext;
  constantAttenuation: number = 0;
  linearAttenuation: number = 0;
  quadraticAttenuation: number = 0;

  constructor(public program: ShaderProgram, readonly lightSource: LightSource) {
    this.gl = program.gl;
  }

  updateUniforms() {
    this.updatePosition();
    this.updateAmbient();
    this.updateDiffuse();
    this.updateSpecular();
    this.updateAttenuation();
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

  updateAttenuation() {
    const constantUnigorm = this.program.getUniformLocation("constantAttenuation");
    if (constantUnigorm)
      this.gl.uniform1f(constantUnigorm, this.constantAttenuation);

    const linearUniform = this.program.getUniformLocation("linearAttenuation");
    if (linearUniform) {
      this.gl.uniform1f(linearUniform, this.linearAttenuation);
    }

    const quadraticUniform = this.program.getUniformLocation("quadraticAttenuation");
    if (quadraticUniform) {
      this.gl.uniform1f(quadraticUniform, this.quadraticAttenuation);
    }
  }
}