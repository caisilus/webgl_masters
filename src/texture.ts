import { ShaderProgram } from "./shader_program";

export class Texture{
    texNumber: number;
    texture: WebGLTexture | null;
    private imageLocation: WebGLUniformLocation | null;
    private gl: WebGL2RenderingContext;

    constructor(readonly program: ShaderProgram, 
                samplerName: string, num: number){
      this.gl = program.gl;
      this.imageLocation = program.getUniformLocation(samplerName);
      this.texNumber = num;
      this.texture = null;
    }
    
    loadImage(image: HTMLImageElement, colored = true){
      this.gl.activeTexture(this.gl.TEXTURE0 + this.texNumber);
      this.texture = this.gl.createTexture();
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
      // Set the parameters so we don't need mips
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
      // Upload the image into the texture.
      let mipLevel = 0;               // the largest mip
      let internalFormat : number = this.gl.RGBA;   // format we want in the texture
      let srcFormat : number = this.gl.RGBA;        // format of data we are supplying
      if (!colored) {
        internalFormat = this.gl.LUMINANCE;
        srcFormat = this.gl.LUMINANCE;
      }
      let srcType = this.gl.UNSIGNED_BYTE; // type of data we are supplying
      this.gl.texImage2D(this.gl.TEXTURE_2D,
                    mipLevel,
                    internalFormat,
                    srcFormat,
                    srcType,
                    image);
    }

    bind(){
      this.gl.activeTexture(this.gl.TEXTURE0 + this.texNumber);
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
      this.gl.uniform1i(this.imageLocation, this.texNumber);
    }
}