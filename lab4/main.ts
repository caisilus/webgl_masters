import guroFragmentShader from "./shaders/guro.frag";
import guroVertexShader from "./shaders/guro.vert";
import phongFragmentShader from "./shaders/phong.frag";
import phongVertexShader from "./shaders/phong.vert";
import { ProgramBuilder } from "../src/program_builder";
import { ShaderProgram } from "../src/shader_program";
import { Transformator } from "../src/transformator";
import Camera from "../src/camera";
import GameObject from "../src/game_object";
import Cube from "./cube";
import { LightSource } from "../src/light_source";
import { LightController } from "../src/light_controller";

function getGl(canvas: HTMLCanvasElement) {
  if (canvas == null) {
    throw "canvas not found";
  }

  const gl = canvas.getContext("webgl2");

  if (gl == null) {
    throw "GL is not supported";
  }

  return gl;
}
interface KeyDownDictionary {
  [key: string]: boolean;
}

class Main {
  gl: WebGL2RenderingContext;
  program: ShaderProgram;
  guroProgram: ShaderProgram;
  phongProgram: ShaderProgram;
  camera!: Camera;
  gameObjects!: GameObject[];
  keyHold: KeyDownDictionary = { "a": false, "d": false }
  pedestalInitialPosition: [number, number, number] = [2, 0, 0]
  lightSource!: LightSource;
  lightController!: LightController;

  constructor(readonly canvas: HTMLCanvasElement, readonly rotationSelect: HTMLSelectElement,
              readonly shadingSelect: HTMLSelectElement, readonly lightModelSelect: HTMLSelectElement, 
              readonly linearSlider: HTMLInputElement, readonly quadraticSlider: HTMLInputElement) {
    this.setupUI();

    this.gl = getGl(canvas);
    const programBuilder = new ProgramBuilder(this.gl);
    this.guroProgram = programBuilder.buildProgram(guroVertexShader, guroFragmentShader);
    this.phongProgram = programBuilder.buildProgram(phongVertexShader, phongFragmentShader);
    this.program = this.guroProgram;

    this.setupObjects();

    this.start();
    this.update();
  }

  setupUI() {
    this.shadingSelect.addEventListener('change', (e) => {this.onShadingChanged()});
    this.lightModelSelect.addEventListener('change', (e) => {this.onLightModelChanged()});
    this.linearSlider.addEventListener('input', (e) => {this.onLinearAttenuationChanged()});
    this.quadraticSlider.addEventListener('input', (e) => {this.onQuadraticAttenuationChanged()});
  }

  setupObjects() {
    this.gameObjects = [
      new Cube([0, 0, 0], [1.0, 1.0, 1.0], [1.0, 1.0, 0.0]),
      new Cube([0, 2.0, 0], [1.0, 1.0, 1.0], [1.0, 1.0, 0.0]),
      new Cube([2.0, 0, 0], [1.0, 1.0, 1.0], [1.0, 0.1, 0.1]),
      new Cube([-2.0, 0, 0], [1.0, 1.0, 1.0], [0.9, 0.9, 0.9]),
    ]

    this.gameObjects.forEach(object => object.setProgram(this.program));
    this.gameObjects.forEach(object => 
      object.transform.translate(this.pedestalInitialPosition[0], this.pedestalInitialPosition[1], 
        this.pedestalInitialPosition[2]));

    this.camera = new Camera(this.canvas.clientWidth, this.canvas.clientHeight);
    this.lightSource = new LightSource([0, 20, 10]);
    this.lightController = new LightController(this.program, this.lightSource);
  }

  useProgram() {
    this.gl.useProgram(this.program.program);
  }

  start() {
    this.camera.position = new Float32Array([4, 3, 10])
    this.camera.setupView();

    this.useProgram();
    this.setUniforms();

    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.frontFace(this.gl.CCW);
    this.gl.cullFace(this.gl.BACK);

    this.gameObjects.forEach(object => object.start());

    document.addEventListener('keydown', (e) => { this.keyDown(e); }, false);
    document.addEventListener('keyup', (e) => { this.keyUp(e); }, false);
  }

  setUniforms() {
    this.updateViewUniform();
    this.updateProjUniform();
    this.lightController.updateUniforms();
    this.updateConstantAttenuation(1);
    this.updateLinearAttenuation(this.linearSlider.valueAsNumber);
    this.updateQuadraticAttenuation(this.quadraticSlider.valueAsNumber);
    this.updateLightModel(this.lightModelSelect.selectedIndex);
  }

  updateViewUniform() {
    const viewMatrixUniform = this.program.getUniformLocation("mView");
    if (viewMatrixUniform)
      this.gl.uniformMatrix4fv(viewMatrixUniform, false, this.camera.view);
  }

  updateProjUniform() {
    const projMatrixUniform = this.program.getUniformLocation("mProj");
    if (projMatrixUniform)
      this.gl.uniformMatrix4fv(projMatrixUniform, false, this.camera.proj);
  }

  updateConstantAttenuation(value: number) {
    const uniform = this.program.getUniformLocation("constantAttenuation");
    if (uniform)
      this.gl.uniform1f(uniform, value);
  }

  updateLinearAttenuation(value: number) {
    const uniform = this.program.getUniformLocation("linearAttenuation");
    if (uniform)
      this.gl.uniform1f(uniform, value);
  }

  updateQuadraticAttenuation(value: number) {
    const uniform = this.program.getUniformLocation("quadraticAttenuation");
    if (uniform)
      this.gl.uniform1f(uniform, value);
  }

  updateLightModel(index: number) {
    const uniform = this.program.getUniformLocation("lightModel");
    if (uniform)
      this.gl.uniform1i(uniform, index);
  }

  update() {
    this.clearBackground();

    this.computeRotation();
    this.gameObjects.forEach(object => object.update());

    requestAnimationFrame(() => {
      this.update();
    });
  }

  clearBackground() {
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }

  computeRotation() {
    const selectedValue = this.rotationSelect.options[this.rotationSelect.selectedIndex].value;
    switch (selectedValue) {
      case "eachCube":
        this.rotateEachCube();
        break;
      case "combined":
        this.rotateCombined();
        break;
      case "combinedY":
        this.rotateCombinedY();
        break;
    }
  }

  rotateEachCube() {
    let rotation: [number, number, number] | null = null;

    if (this.keyHold["a"]) {
      rotation = [0, 1, 0]
    } else if (this.keyHold["d"]) {
      rotation = [0, -1, 0]
    } 
    if (rotation == null) return;

    this.gameObjects.forEach(object => object.transform.rotate(rotation));
  }

  rotateCombined() {
    let angle = null;
    if (this.keyHold["a"]) {
      angle = 5
    } else if (this.keyHold["d"]) {
      angle = -5
    } 

    if (angle == null) return;

    this.gameObjects.forEach(object => object.transform.rotateAmongVerticalAxis(this.pedestalPosition, angle));
  }

  get pedestalPosition() : [number, number, number] {
    const pos = this.gameObjects[0].transform.position();
    return [pos[0], pos[1], pos[2]];
  }

  rotateCombinedY() {
    let angle = null;
    if (this.keyHold["a"]) {
      angle = 5
    } else if (this.keyHold["d"]) {
      angle = -5
    } 

    if (angle == null) return;

    this.gameObjects.forEach(object => object.transform.rotateAmongVerticalAxis([0, 0, 0], angle));
  }

  keyDown(e: KeyboardEvent): void {
    this.keyHold[e.key] = true;
  }

  keyUp(e: KeyboardEvent) {
    this.keyHold[e.key] = false;
  }

  onShadingChanged() {
    const selectedValue = this.shadingSelect.options[this.shadingSelect.selectedIndex].value;
    switch(selectedValue) {
      case "gouraud":
        this.program = this.guroProgram;
        break;
      case "phong":
        this.program = this.phongProgram;
        break;
    }
    this.gl.useProgram(this.program.program);
    this.gameObjects.forEach(obj => obj.setProgram(this.program));
    this.lightController.program = this.program;
    this.setUniforms();
  }

  onLightModelChanged() {
    const selectedValue = this.lightModelSelect.selectedIndex;
    console.log(selectedValue);
    this.updateLightModel(selectedValue);
  }

  onLinearAttenuationChanged() {
    const newValue = this.linearSlider.valueAsNumber / 100.0;
    this.updateLinearAttenuation(newValue);
  }

  onQuadraticAttenuationChanged() {
    const newValue = this.quadraticSlider.valueAsNumber / 100.0;
    this.updateQuadraticAttenuation(newValue);
  }
}
function main() {
  const canvas = document.querySelector("canvas#mycanvas") as HTMLCanvasElement;
  canvas.setAttribute("width", "600");
  canvas.setAttribute("height", "600");

  const rotationSelect = document.querySelector("select#rotationMode") as HTMLSelectElement;
  const shadingSelect = document.querySelector("select#shading") as HTMLSelectElement;
  const lightModelSelect = document.querySelector("select#lightModel") as HTMLSelectElement;

  const linearSlider = document.querySelector("input#linearSlider") as HTMLInputElement;
  const quadraticSlider = document.querySelector("input#quadraticSlider") as HTMLInputElement;

  const mainObj = new Main(canvas, rotationSelect, shadingSelect, lightModelSelect, 
    linearSlider, quadraticSlider);
}

main();
