import { vec3 } from "gl-matrix";
import { LightSource } from "./light_source";
import { ShaderProgram } from "./shader_program";
import { SpotLight } from "./spot_light";

export class LightController {
  gl: WebGL2RenderingContext;
  lightSources: LightSource[];
  spotLights: SpotLight[];
  constantAttenuation: number = 0;
  linearAttenuation: number = 0;
  quadraticAttenuation: number = 0;

  ambientLightEnabledLocation!: WebGLUniformLocation;
  pointLightEnabledLocation!: WebGLUniformLocation;
  spotLightEnabledLocation!: WebGLUniformLocation;
  numPointLightsLocation!: WebGLUniformLocation;
  numSpotLightsLocation!: WebGLUniformLocation;
  numSpotLightsVLocation!: WebGLUniformLocation;

  constructor(public program: ShaderProgram) {
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

    const numSpotLights = program.getUniformLocation("numSpotLights")
    if (numSpotLights)
      this.numSpotLightsLocation = numSpotLights;

    const numSpotLightsV = program.getUniformLocation("numSpotLightsV")
    if (numSpotLightsV)
      this.numSpotLightsVLocation = numSpotLightsV;

    this.lightSources = [];
    this.spotLights = [];
  }

  addLightSource(lightSource: LightSource) {
    this.lightSources.push(lightSource);
  }

  addSpotLight(spotlight: SpotLight) {
    this.spotLights.push(spotlight);
  }

  setActiveLights(useAmbient: boolean, usePoint: boolean, useSpotLight: boolean) {
    const ambient = useAmbient ? 1 : 0;
    const point = usePoint ? 1 : 0;
    const spotlight = useSpotLight ? 1 : 0;
    this.gl.uniform1i(this.ambientLightEnabledLocation, ambient);
    this.gl.uniform1i(this.pointLightEnabledLocation, point);
    this.gl.uniform1i(this.spotLightEnabledLocation, spotlight);
  }

  updateUniforms() {
    this.gl.uniform1i(this.numPointLightsLocation, this.lightSources.length);
    this.gl.uniform1i(this.numSpotLightsLocation, this.spotLights.length);
    this.gl.uniform1i(this.numSpotLightsVLocation, this.spotLights.length);
    this.lightSources.forEach((_, index) => {this.updatePointLight(index);})
    this.spotLights.forEach((_, index) => {this.updateSpotLight(index);})
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

  private updateSpotLight(index: number) {
    const spotLight = this.spotLights[index];
    console.log(spotLight);

    const positionLocation = this.program.getUniformLocation(`slPosition[${index}]`);
    if (positionLocation) {
      this.gl.uniform3fv(positionLocation, spotLight.position);
    } 

    const directionLocation = this.program.getUniformLocation(`slDirection[${index}]`);
    if (directionLocation) {
      this.gl.uniform3fv(directionLocation, spotLight.direction);
    } 
    const limitLocation = this.program.getUniformLocation(`slLimit[${index}]`);
    if (limitLocation) {
      this.gl.uniform1f(limitLocation, spotLight.limit);
    } 

    const ambientColorLocation = this.program.getUniformLocation(`slAmbient[${index}]`);
    if (ambientColorLocation) {
      this.gl.uniform3fv(ambientColorLocation, spotLight.ambientColor);
    } 
    const diffuseColorLocation = this.program.getUniformLocation(`slDiffuse[${index}]`);
    if (diffuseColorLocation) {
      this.gl.uniform3fv(diffuseColorLocation, spotLight.diffuseColor);
    } 
    const specularColorLocation = this.program.getUniformLocation(`slSpecular[${index}]`);
    if (specularColorLocation) {
      this.gl.uniform3fv(specularColorLocation, spotLight.ambientColor);
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