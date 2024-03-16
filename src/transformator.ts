import { glMatrix, mat4, vec3 } from "gl-matrix";
import { ShaderProgram } from "./shader_program";

export class Transformator{
    private matWorld = new Float32Array(16);

    private xRotationMatrix = new Float32Array(16);
	private yRotationMatrix = new Float32Array(16);
    private zRotationMatrix = new Float32Array(16);

    private translationMatrix = new Float32Array(16);
    private scalingMatrix = new Float32Array(16);
    private rotateMatrix = new Float32Array(16);

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

    buildWorldMatrix(){
        var scaleTranslateMatrix = new Float32Array(16);
        mat4.mul(scaleTranslateMatrix, this.scalingMatrix, this.translationMatrix);
        mat4.mul(this.matWorld, scaleTranslateMatrix, this.rotateMatrix);
    }

    position() {
        let newPosition = vec3.fromValues(0, 0, 0);
        vec3.transformMat4(newPosition, newPosition, this.translationMatrix);
        return newPosition;
    }
    
    get worldMatrix(): Float32Array {
        return this.matWorld;
    }
}
