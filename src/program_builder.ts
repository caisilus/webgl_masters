import { ShaderProgram } from "./shader_program";
import { Shader } from "./shader";

export class ProgramBuilder {
  private gl: WebGL2RenderingContext;
  private vertexShader: Shader | null;
  private fragmentShader: Shader | null;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.vertexShader = null;
    this.fragmentShader = null;
  }

  buildProgram(
    vertexShaderText: string,
    fragmentShaderText: string
  ): ShaderProgram {
    let program = new ShaderProgram(this.gl);
    this.vertexShader = new Shader(
      this.gl,
      vertexShaderText,
      this.gl.VERTEX_SHADER
    );
    this.fragmentShader = new Shader(
      this.gl,
      fragmentShaderText,
      this.gl.FRAGMENT_SHADER
    );

    this.compileShaders();
    this.attachShadersToProgram(program);

    program.compileAndLink(true);

    return program;
  }

  compileShaders() {
    if (this.vertexShader != null) {
      this.vertexShader.compile();
    }
    if (this.fragmentShader != null) {
      this.fragmentShader.compile();
    }
  }

  attachShadersToProgram(program: ShaderProgram) {
    if (this.vertexShader != null) {
      program.attachShader(this.vertexShader);
    }
    if (this.fragmentShader != null) {
      program.attachShader(this.fragmentShader);
    }
  }
}
