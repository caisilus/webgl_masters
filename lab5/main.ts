import guroFragmentShader from "./shaders/guro.frag";
import guroVertexShader from "./shaders/guro.vert";
import { ProgramBuilder } from "../src/program_builder";
import { ShaderProgram } from "../src/shader_program";
import { Transformator } from "../src/transformator";
import Camera from "../src/camera";
import GameObject from "../src/game_object";
import Cube from "./cube";
import { LightSource } from "../src/light_source";
import { LightController } from "../src/light_controller";
import Goodman from "../static/images/goodman.png";
import Cat from "../static/images/cat.png";
import Wood from "../static/images/WoodTex.jpg";
import First from "../static/images/tex_cube_1.png";
import Second from "../static/images/tex_cube_2.png";
import Third from "../static/images/tex_cube_3.png";

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
  camera!: Camera;
  gameObjects!: GameObject[];
  keyHold: KeyDownDictionary = { "a": false, "d": false }
  pedestalInitialPosition: [number, number, number] = [2, 0, 0]
  lightSource!: LightSource;
  lightController!: LightController;

  constructor(readonly canvas: HTMLCanvasElement, readonly rotationSelect: HTMLSelectElement,
              readonly shadingSelect: HTMLSelectElement, readonly lightModelSelect: HTMLSelectElement, 
              readonly linearSlider: HTMLInputElement, readonly quadraticSlider: HTMLInputElement,
              readonly numberTextureSlider: HTMLInputElement) {
    this.setupUI();

    this.gl = getGl(canvas);
    const programBuilder = new ProgramBuilder(this.gl);
    this.program = programBuilder.buildProgram(guroVertexShader, guroFragmentShader);

    this.setupObjects();

    this.start();
    this.update();
  }

  setupUI() {
    this.shadingSelect.addEventListener('change', (e) => {this.onShadingChanged()});
    this.lightModelSelect.addEventListener('change', (e) => {this.onLightModelChanged()});
    this.linearSlider.addEventListener('input', (e) => {this.onLinearAttenuationChanged()});
    this.quadraticSlider.addEventListener('input', (e) => {this.onQuadraticAttenuationChanged()});
    this.numberTextureSlider.addEventListener('input', (e) => {this.onNumberTextureMixChanged()});

    document.addEventListener('keydown', (e) => { this.keyDown(e); }, false);
    document.addEventListener('keyup', (e) => { this.keyUp(e); }, false);
  }

  setupObjects() {
    this.gameObjects = [
      new Cube([0, 0, 0], [1.0, 1.0, 1.0], [1.0, 1.0, 0.0], First, Goodman), // First place
      new Cube([0, 2.0, 0], [1.0, 1.0, 1.0], [1.0, 1.0, 0.0], First, Goodman), // First place
      new Cube([2.0, 0, 0], [1.0, 1.0, 1.0], [1.0, 0.1, 0.1], Third, Wood), // Third place
      new Cube([-2.0, 0, 0], [1.0, 1.0, 1.0], [0.9, 0.9, 0.9], Second, Cat), // Second place
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
    // this.gl.enable(this.gl.BLEND);
    // this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

    this.gameObjects.forEach(object => object.start());

  }

  setUniforms() {
    this.updateViewUniform();
    this.updateProjUniform();
    this.lightController.constantAttenuation = 1;
    this.lightController.linearAttenuation = this.linearSlider.valueAsNumber;
    this.lightController.quadraticAttenuation = this.quadraticSlider.valueAsNumber;
    this.lightController.updateUniforms();
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
    console.log("new value: " + selectedValue);
  }

  onLightModelChanged() {
    const selectedValue = this.lightModelSelect.selectedIndex;
    this.updateLightModel(selectedValue);
  }

  onLinearAttenuationChanged() {
    const newValue = this.linearSlider.valueAsNumber / 100.0;
    this.lightController.linearAttenuation = newValue;
    this.lightController.updateAttenuation();
  }

  onQuadraticAttenuationChanged() {
    const newValue = this.quadraticSlider.valueAsNumber / 100.0;
    this.lightController.quadraticAttenuation = newValue;
    this.lightController.updateAttenuation();
  }

  onNumberTextureMixChanged() {
    const newValue = this.numberTextureSlider.valueAsNumber / 100.0;
    console.log(newValue);
    this.gameObjects.forEach((gameObject) => {
      const cube = gameObject as Cube;
      if (cube) {
        cube.textureController.textures_mix = newValue;
        cube.textureController.bind_textures();
      }
    })
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

  const numberTextureSlider = document.querySelector("input#numberTextureSlider") as HTMLInputElement;

  const mainObj = new Main(canvas, rotationSelect, shadingSelect, lightModelSelect, 
    linearSlider, quadraticSlider, numberTextureSlider);
}

main();
