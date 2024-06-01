import { Transformator } from "../src/transformator"
import GameObject from "../src/game_object"
import CubeWithTexCoords from "./cube_data";
import { TextureController } from "./texture_controller";
import { ShaderProgram } from "../src/shader_program";

export default class Cube extends GameObject {
  public textureController!: TextureController;

  constructor(position: Array<number>, scale: Array<number>, color: Array<number>, 
              readonly texture1: string, readonly texture2: string) {
    super(new CubeWithTexCoords(color), new Transformator());
    this.transform.translate(position[0], position[1], position[2]);
    this.transform.scale(scale[0], scale[1], scale[2]);
  } 

  public setProgram(program: ShaderProgram) {
    super.setProgram(program);
    this.textureController = new TextureController(program);
  }

  protected onStart(): void {
    this.textureController.load_textures(this.texture1, this.texture2);
    this.textureController.textures_mix = 0.0;
    this.textureController.bind_textures();
  }

  protected onUpdate(): void {
    this.textureController.bind_textures();
  }
}