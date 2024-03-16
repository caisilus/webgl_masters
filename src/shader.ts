export enum ShaderType {
    Vertex,
    Fragment
}

export function glTypeToShaderType(gl: WebGLRenderingContext, glShaderType: number): ShaderType {
    switch(glShaderType) {
        case gl.VERTEX_SHADER: {
            return ShaderType.Vertex;
        }
        case gl.FRAGMENT_SHADER: {
            return ShaderType.Fragment;
        }
        default: {
            throw new Error("Unsupported shader type: " + glShaderType);
        }
    }
}

export class Shader {
    private gl: WebGL2RenderingContext
    readonly text: string;
    readonly shaderType: ShaderType;
    readonly glShader: WebGLShader;
    private compiled: boolean;

    constructor(gl: WebGL2RenderingContext, shaderText: string, glShaderType: number) {
        this.gl = gl;
        this.text = shaderText;
        this.shaderType = glTypeToShaderType(gl, glShaderType);
        let glShader = gl.createShader(glShaderType);
        if (glShader == null) {
            throw new Error(`Cannot create ${this.shaderType} shader`);
        }

        this.glShader = glShader;
        this.compiled = false;
    }

    compile() {
        // set shader sources
        this.gl.shaderSource(this.glShader, this.text);
        
        // check shader compilation errors
        this.gl.compileShader(this.glShader);
        if (!this.gl.getShaderParameter(this.glShader, this.gl.COMPILE_STATUS)) {
            throw new Error(`Compilation error in ${this.shaderType} shader:` +
                            this.gl.getShaderInfoLog(this.glShader));
        }
        this.compiled = true;
    }

    isCompiled() {
        return this.compiled;
    }
}