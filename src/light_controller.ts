import { LightSource } from "./light_source";
import { ShaderProgram } from "./shader_program";

export class LightController {
  gl: WebGL2RenderingContext;
  lightSources: LightSource[];
  constantAttenuation: number = 0;
  linearAttenuation: number = 0;
  quadraticAttenuation: number = 0;

  ambientLightEnabledLocation!: WebGLUniformLocation;
  pointLightEnabledLocation!: WebGLUniformLocation;
  spotLightEnabledLocation!: WebGLUniformLocation;
  numPointLightsLocation!: WebGLUniformLocation;

  constructor(public program: ShaderProgram, readonly lightSource: LightSource) {
    this.gl = program.gl;

    const useGlobalLightUniform = program.getUniformLocation("useAmbientLight");
    if (useGlobalLightUniform)
      this.ambientLightEnabledLocation = useGlobalLightUniform;

    const usePointLightUniform = program.getUniformLocation("usePointLight");
    if (usePointLightUniform)
      this.pointLightEnabledLocation = usePointLightUniform;

    const useSpotlightUniform = program.getUniformLocation("useSpotLight");
    if (useSpotlightUniform)
      this.spotLightEnabledLocation = useSpotlightUniform;

    const numPointLightsUniform = program.getUniformLocation("numPointLights")
    if (numPointLightsUniform)
      this.numPointLightsLocation = numPointLightsUniform;

    this.lightSources = [];
    this.addLightSource(lightSource);
  }

  addLightSource(lightSource: LightSource) {
    this.lightSources.push(lightSource);
  }

  setActiveLights(useAmbient: boolean, usePoint: boolean, useSpotLight: boolean) {
    const ambient = useAmbient ? 1 : 0;
    const point = usePoint ? 1 : 0;
    const spotlight = useSpotLight ? 1 : 0;
    this.gl.uniform1i(this.ambientLightEnabledLocation, ambient);
    this.gl.uniform1i(this.pointLightEnabledLocation, point);
    // this.gl.uniform1i(this.spotLightEnabledLocation, spotlight);
  }

  updateUniforms() {
    this.gl.uniform1i(this.numPointLightsLocation, this.lightSources.length);
    this.lightSources.forEach((_, index) => {this.updatePointLight(index);})
    this.updateAttenuation();
  }

  private updatePointLight(index: number) {
    const lightSource = this.lightSources[index];
    console.log(lightSource);

    const positionLocation = this.program.getUniformLocation(`pointLightPositions[${index}]`);
    if (positionLocation) {
      this.gl.uniform3fv(positionLocation, lightSource.transformator.position());
    } 
    const ambientColorLocation = this.program.getUniformLocation(`pointLightAmbientColors[${index}]`);
    if (ambientColorLocation) {
      this.gl.uniform3fv(ambientColorLocation, lightSource.ambientColor);
    } 
    const diffuseColorLocation = this.program.getUniformLocation(`pointLightDiffuseColors[${index}]`);
    if (diffuseColorLocation) {
      this.gl.uniform3fv(diffuseColorLocation, lightSource.diffuseColor);
    } 
    const specularColorLocation = this.program.getUniformLocation(`pointLightSpecularColors[${index}]`);
    if (specularColorLocation) {
      this.gl.uniform3fv(specularColorLocation, lightSource.ambientColor);
    }  
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