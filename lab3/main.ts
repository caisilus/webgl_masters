import fragmentShader from "./shaders/shader.frag";
import vertexShader from "./shaders/shader.vert";
import { ProgramBuilder } from "../src/program_builder";
import { ShaderProgram } from "../src/shader_program";
import { Transformator } from "../src/transformator";
import Camera from "../src/camera";
import GameObject from "./game_object";
import Cube from "./cube";

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
  camera: Camera;
  gameObjects: GameObject[];
  keyHold: KeyDownDictionary = { "a": false, "d": false }
  pedestalInitialPosition: [number, number, number] = [2, 0, 0]

  constructor(canvas: HTMLCanvasElement, readonly select: HTMLSelectElement) {
    this.gl = getGl(canvas);
    const programBuilder = new ProgramBuilder(this.gl);
    this.program = programBuilder.buildProgram(vertexShader, fragmentShader);

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

    this.camera = new Camera(canvas.clientWidth, canvas.clientHeight);

    this.start();
    this.update();
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
    const selectedValue = this.select.options[this.select.selectedIndex].value;
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
}
function main() {
  const canvas = document.querySelector("canvas#mycanvas") as HTMLCanvasElement;
  canvas.setAttribute("width", "600");
  canvas.setAttribute("height", "600");
  const select = document.querySelector("select#rotationMode") as HTMLSelectElement;
  const mainObj = new Main(canvas, select);
}

main();
