import {Shader} from "./shader"

interface HashMap<V> {
    [key: string]: V
}

export class ShaderProgram {
    public readonly gl: WebGL2RenderingContext;
    private linked: boolean
    private cachedUniformLocations: HashMap<WebGLUniformLocation> = {};
    readonly program: WebGLProgram;

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
        let program = this.gl.createProgram();
        if (program == null){
            throw new Error("Connot create program");
        }

        this.program = program;
        this.linked = false;
    }

    attachShader(shader: Shader) {
        if (!shader.isCompiled()) {
            throw new Error(`${shader.shaderType} Shader should be compiled before attaching to program`);
        }
        this.gl.attachShader(this.program, shader.glShader);
    }

    compileAndLink(debug: boolean) {
        this.link();
        if (debug) {
            this.validate();
        }
    }

    link() {
        this.gl.linkProgram(this.program);
        // link errors
        if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
            throw new Error("Link error in program:\n" + this.gl.getProgramInfoLog(this.program));
        }

        this.linked = true;
    }

    validate() {
        this.gl.validateProgram(this.program);
        if (!this.gl.getProgramParameter(this.program, this.gl.VALIDATE_STATUS)) {
            throw new Error("Program validation error in program:\n" + 
                            this.gl.getProgramInfoLog(this.program));
        }
    }

    isLinked() {
        return this.linked;
    }

    getUniformLocation(name: string): WebGLUniformLocation | null {
        if (name in this.cachedUniformLocations) {
            return this.cachedUniformLocations[name];
        }
        
        const location = this.gl.getUniformLocation(this.program, name);
        
        if (location == null) {
            return null;
        }

        this.cachedUniformLocations[name] = location;
        return location;
    }
}