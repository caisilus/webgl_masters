import { AssetLoader } from "./asset_loader";
import GameObject from "./game_object";
import { ImportedDrawData } from "./imported_draw_data";
import { ObjData } from "./obj_parser";
import { ShaderProgram } from "./shader_program";
import { Texture } from "./texture";
import { Transformator } from "./transformator";

export class TexturedObject extends GameObject{
  texture!: Texture;
  texUrl: string;

  constructor(position: Array<number>, scale: Array<number>, color: Array<number>,
    objUrl : string, texUrl: string) {

    const data = AssetLoader.getObj(objUrl);
    if (!data)
      throw new Error("asdsadasd");

    super(new ImportedDrawData(data, color), new Transformator());
    this.texUrl = texUrl;
    this.transform.translate(position[0], position[1], position[2]);
    this.transform.scale(scale[0], scale[1], scale[2]);
  }

  public setProgram(program: ShaderProgram) {
    super.setProgram(program);
    this.texture = new Texture(program, "u_texture", 0);
  }

  protected onStart(): void {
    console.log("on start cube");
    const image = AssetLoader.getImage(this.texUrl);
    if (!image)
      throw new Error("asdsadasd");

    this.texture.loadImage(image, true);
    this.texture.bind();
  }

  protected beforeUpdate(): void {
    this.texture.bind();
  }
}