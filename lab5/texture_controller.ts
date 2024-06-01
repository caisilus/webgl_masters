import {Texture} from "../src/texture";
import { ShaderProgram } from "../src/shader_program";

export class TextureController{
    private texturesMixLocation: WebGLUniformLocation | null;

    public texture1: Texture;
    public texture2: Texture;

    public textures_mix: number;

    private gl: WebGL2RenderingContext;

    constructor(readonly program: ShaderProgram) {
      this.gl = program.gl;
      this.program = program;
      this.texturesMixLocation = this.program.getUniformLocation("texturesMix");
      this.texture1 = new Texture(this.program, "u_texture1", 0);
      this.texture2 = new Texture(this.program, "u_texture2", 1);
      this.textures_mix = 1.0;
      this.set_textures_mix();
    }

    set_textures_mix(){
      if (this.texturesMixLocation == null) {
        throw "texturesMixLocation is null";
      }

      this.gl.uniform1f(this.texturesMixLocation, this.textures_mix);
    }

    load_textures(url: string, url2: string){
      let img1 = new Image();
      img1.crossOrigin = 'anonymous'
      img1.src = url;
      img1.onload =() => {
        return this.texture1.loadImage(img1);
      };

      let img2 = new Image();
      img2.crossOrigin = 'anonymous'
      img2.src = url2;
      img2.onload =() => {
        return this.texture2.loadImage(img2);
      };
    }

    bind_textures(){
      this.texture1.bind();
      this.texture2.bind();
      this.set_textures_mix();
    }

    disable_textures(){
      this.textures_mix = 0.0;
      this.set_textures_mix();
    }
}