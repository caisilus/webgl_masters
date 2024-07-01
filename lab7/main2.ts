import guroFragmentShader from "./shaders/guro.frag";
import guroVertexShader from "./shaders/guro.vert";
import { ProgramBuilder } from "../src/program_builder";
import { ShaderProgram } from "../src/shader_program";
import { Transformator } from "../src/transformator";
import Camera from "../src/camera";
import GameObject from "../src/game_object";
import { LightSource } from "../src/light_source";
import { LightController } from "../src/light_controller";
import { AssetLoader } from "../src/asset_loader";
import BumpTexture from "../static/images/bump0.jpeg";
import TreeTexture from "../static/lab7/Tree.png";
import BarrelTexture from "../static/lab7/Barrel.png";
import BarrelObj from "../static/lab7/Barrel.obj";
import TreeObj from "../static/lab7/Tree.obj";
import { TexturedObject } from "../src/textured_object";
import { MovingObject } from "../src/moving_object";
import { ControlledObject } from "../src/controlled_object";
import FieldObj from "../static/lab7/Field.obj"
import FieldTexture from "../static/lab7/Field.png"
import TankObj from "../static/lab7/plant.obj"
import TankTexture from "../static/lab7/Tank.png"
import RockGround from "../static/lab7/rock_ground_2.obj"
import TombObj from "../static/lab7/tomb_4.obj"
import Tree1Obj from "../static/lab7/tree_1.obj"
import Tree2Obj from "../static/lab7/tree_2.obj"
import WoodenLadderObj from "../static/lab7/wooden_ladder.obj"
import LowPolyTextures from "../static/lab7/mtl.png"

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
  lightSource!: LightSource;
  lightController!: LightController;
  assetLoader: AssetLoader;
  ambientCheckBox!: HTMLInputElement;
  pointLightCheckBox!: HTMLInputElement;
  projectorCheckBox!: HTMLInputElement;

  constructor(readonly canvas: HTMLCanvasElement) {
    this.setupUI();

    this.gl = getGl(canvas);
    const programBuilder = new ProgramBuilder(this.gl);
    this.program = programBuilder.buildProgram(guroVertexShader, guroFragmentShader);

    this.assetLoader = new AssetLoader();
    this.assetLoader.loadObjs([BarrelObj, TreeObj, FieldObj, TankObj, RockGround, WoodenLadderObj, TombObj, Tree1Obj, Tree2Obj]).then(() => {
      this.assetLoader.loadImages([TreeTexture, BarrelTexture, FieldTexture, TankTexture, LowPolyTextures]).then(() => {
        console.log("Assets loaded!");
        this.setupObjects();

        this.start();
        this.update();
      })
    });
  }

  setupUI() {
    this.ambientCheckBox = document.querySelector("input#ambientCheckbox") as HTMLInputElement;
    this.pointLightCheckBox = document.querySelector("input#pointLightCheckbox") as HTMLInputElement;
    this.projectorCheckBox = document.querySelector("input#projectorCheckbox") as HTMLInputElement;
    document.addEventListener('keydown', (e) => { this.keyDown(e); }, false);
    document.addEventListener('keyup', (e) => { this.keyUp(e); }, false);
  }

  setupObjects() {
    // let color = [245, 164, 66]
    let color = [217, 123, 9]

    color = color.map(c => c / 255.0);
    this.gameObjects = [new ControlledObject([0, -1.5, -50], [1.0, 1.0, 1.0], color,
      TankObj, TankTexture
    ),new TexturedObject([-7.4, -1, -20], [1.0, 1.0, 1.0], color,
      RockGround, LowPolyTextures
    )
    ,new TexturedObject([-3.7, -1, -20], [1.0, 1.0, 1.0], color,
      RockGround, LowPolyTextures
    ),new TexturedObject([0, -1, -20], [1.0, 1.0, 1.0], color,
      RockGround, LowPolyTextures
    ),new TexturedObject([3.7, -1, -20], [1.0, 1.0, 1.0], color,
      RockGround, LowPolyTextures
    ),new TexturedObject([7.4, -1, -20], [1.0, 1.0, 1.0], color,
      RockGround, LowPolyTextures
    ),new TexturedObject([0, -1.5, -40], [1.0, 1.0, 1.0], color,
      WoodenLadderObj, LowPolyTextures
    ),new TexturedObject([8, -1.5, -40], [1.0, 1.0, 1.0], color,
      TombObj, LowPolyTextures
    ),new MovingObject([8, -1.5, -40], [1.0, 1.0, 1.0], color,
      Tree1Obj, LowPolyTextures,[-0.1,0,0]
    ),new MovingObject([8, -1.5, -40], [1.0, 1.0, 1.0], color,
      Tree2Obj, LowPolyTextures,[0.1,0,0]
    )

  ]

  this.gameObjects[6].transform.rotate([0, 90, 0]);
  this.gameObjects[7].transform.rotate([0, 90, 0]);


    this.gameObjects.forEach(object => object.setProgram(this.program));

    this.camera = new Camera(this.canvas.clientWidth, this.canvas.clientHeight);
    this.lightSource = new LightSource([10, 10, 10]);
    this.lightController = new LightController(this.program);
    this.lightController.addLightSource(new LightSource([10, 10, 10]))
  }

  useProgram() {
    this.gl.useProgram(this.program.program);
  }

  start() {
    this.camera.position = new Float32Array([0, 0, 5])
    this.camera.setupView();

    this.useProgram();
    this.setUniforms();

    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.frontFace(this.gl.CCW);
    this.gl.cullFace(this.gl.BACK);

    this.gameObjects.forEach(object => object.start());
  }

  setUniforms() {
    this.updateViewUniform();
    this.updateProjUniform();
    this.lightController.constantAttenuation = 1.0;
    this.lightController.linearAttenuation = 0.02;
    this.lightController.quadraticAttenuation = 0.0;
    this.lightController.updateUniforms();
    this.updateImageSize();
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

  updateImageSize() {
    const image = AssetLoader.getImage(BumpTexture);

    if (!image) return;

    console.log(image.width);
    console.log(image.height);
    // const uniform = this.program.getUniformLocation("textureSize");
    // if (uniform)
    //   this.gl.uniform2i(uniform, image.width, image.height);
  }

  update() {
    this.clearBackground();

    this.updateActiveLightSources();

    this.rotateEach();
    this.gameObjects.forEach(object => object.update());

    requestAnimationFrame(() => {
      this.update();
    });
  }

  clearBackground() {
    this.gl.clearColor(0.3, 0.3, 0.3, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }

  rotateEach() {
    let rotation: [number, number, number] | null = null;

    if (this.keyHold["a"]) {
      rotation = [0, 1, 0]
    } else if (this.keyHold["d"]) {
      rotation = [0, -1, 0]
    } 
    if (rotation == null) return;

    this.gameObjects.forEach(object => object.transform.rotate(rotation));
  }

  keyDown(e: KeyboardEvent): void {
    this.keyHold[e.key] = true;
  }

  keyUp(e: KeyboardEvent) {
    this.keyHold[e.key] = false;
  }

  private updateActiveLightSources() {    
    this.lightController.setActiveLights(this.ambientCheckBox.checked, 
      this.pointLightCheckBox.checked, this.projectorCheckBox.checked);
  }
}

function main() {
  const canvas = document.querySelector("canvas#mycanvas") as HTMLCanvasElement;
  canvas.setAttribute("width", "600");
  canvas.setAttribute("height", "600");

  const mainObj = new Main(canvas);
}

main();
