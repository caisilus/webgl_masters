import { glMatrix, mat4, mat3, vec3 } from "gl-matrix";
import { ShaderProgram } from "./shader_program";

export class Transformator{
    private matWorld = new Float32Array(16);

    private xRotationMatrix = new Float32Array(16);
	private yRotationMatrix = new Float32Array(16);
    private zRotationMatrix = new Float32Array(16);

    private translationMatrix = mat4.create();
    private scalingMatrix = new Float32Array(16);
    private rotateMatrix = new Float32Array(16);
    
    private normalMatrix: null | mat3 = null;

    private initialForward: [number, number, number];
    forward: [number, number, number];

    constructor() {
        mat4.identity(this.matWorld);
        mat4.identity(this.translationMatrix);
        mat4.identity(this.scalingMatrix);
        mat4.identity(this.rotateMatrix);
    
        this.initialForward = [0, 0, 0];
        this.forward = this.initialForward;
    }

    setForward(newForward: [number, number, number]) {
        this.initialForward = newForward;
        this.forward = newForward;
    }

    rotate(angle: [number, number, number]) {
        this.rotateX(angle[0]);
        this.rotateY(angle[1]);
        this.rotateZ(angle[2]);
        var rotateXYMatrix = new Float32Array(16);
        mat4.mul(rotateXYMatrix, this.xRotationMatrix, this.yRotationMatrix);
        var rotateXYZMatrix = new Float32Array(16);
        mat4.mul(rotateXYZMatrix, rotateXYMatrix, this.zRotationMatrix);
        mat4.mul(this.rotateMatrix, this.rotateMatrix, rotateXYZMatrix);
        this.updateForward();
        this.buildWorldMatrix();
    }

    rotateAbsolute(angle: [number, number, number]) {
        this.rotateX(angle[0]);
        this.rotateY(angle[1]);
        this.rotateZ(angle[2]);
        var rotateXYMatrix = new Float32Array(16);
        mat4.mul(rotateXYMatrix, this.xRotationMatrix, this.yRotationMatrix);
        mat4.mul(this.rotateMatrix, rotateXYMatrix, this.zRotationMatrix);
        this.updateForward();
        this.buildWorldMatrix();
    }

    rotateAmongVerticalAxis(axisPoint: [number, number, number], angle: number) {
        let dx = axisPoint[0] - this.position()[0];
        let dy = axisPoint[1] - this.position()[1];
        let dz = axisPoint[2] - this.position()[2];
        const delta = vec3.fromValues(dx, dy, dz);
        console.log("Radius before: " + delta.length);

        const finalTransformation = mat4.create();
        mat4.translate(finalTransformation, finalTransformation, [dx, dy, dz])
        mat4.rotateY(finalTransformation, finalTransformation, glMatrix.toRadian(angle))
        mat4.translate(finalTransformation, finalTransformation, [-dx, -dy, -dz])
        mat4.rotateY(finalTransformation, finalTransformation, -glMatrix.toRadian(angle))

        const resultPosition = vec3.create();
        vec3.transformMat4(resultPosition, this.position(), finalTransformation);

        mat4.identity(this.translationMatrix);
        mat4.translate(this.translationMatrix, this.translationMatrix, resultPosition);

        this.rotate([0, angle, 0]);
    }

    updateForward() {
        let newForward = vec3.fromValues(this.initialForward[0], 
                                         this.initialForward[1], 
                                         this.initialForward[2]);
        vec3.transformMat4(newForward, newForward, this.rotateMatrix);
        this.forward = [newForward[0], newForward[1], newForward[2]];
    }

    private rotateX(angle: number) {
        var identityMatrix = new Float32Array(16);
        mat4.identity(identityMatrix);
        mat4.rotateX(this.xRotationMatrix, identityMatrix, glMatrix.toRadian(angle));
    }

    private rotateY(angle: number) {
        var identityMatrix = new Float32Array(16);
        mat4.identity(identityMatrix);
        mat4.rotateY(this.yRotationMatrix, identityMatrix, glMatrix.toRadian(angle));
    }

    private rotateZ(angle: number) {
        var identityMatrix = new Float32Array(16);
        mat4.identity(identityMatrix);
        mat4.rotateZ(this.zRotationMatrix, identityMatrix, glMatrix.toRadian(angle));
    }

    translate(dx: number, dy: number, dz: number) {
        mat4.translate(this.translationMatrix, this.translationMatrix, [dx, dy, dz]);
        this.buildWorldMatrix();
    }

    moveForward(moveSpeed: number) {
        this.translate(this.forward[0] * moveSpeed, this.forward[1] * moveSpeed, this.forward[2] * moveSpeed);
    }

    scale(dx: number, dy: number, dz: number) {
        mat4.scale(this.scalingMatrix, this.scalingMatrix, [dx, dy, dz]);
        this.buildWorldMatrix();
    }

    setdDefaultScaling(){
        mat4.identity(this.scalingMatrix);
        this.buildWorldMatrix();
    }

    setDefaultTranslation() {
        mat4.identity(this.translationMatrix);
        this.buildWorldMatrix();
    }

    buildWorldMatrix() {
        // T * R * S
        var translateRotateMatrix = new Float32Array(16);
        mat4.mul(translateRotateMatrix, this.translationMatrix, this.rotateMatrix);
        mat4.mul(this.matWorld, translateRotateMatrix, this.scalingMatrix);
    }

    buildNormalMatrix() : mat3 {
        this.normalMatrix = mat3.create();
        mat3.normalFromMat4(this.normalMatrix, this.worldMatrix);

        return this.normalMatrix;
    }

    position() {
        let newPosition = vec3.fromValues(0, 0, 0);
        vec3.transformMat4(newPosition, newPosition, this.matWorld);
        return newPosition;
    }
    
    get worldMatrix(): Float32Array {
        return this.matWorld;
    }
}
