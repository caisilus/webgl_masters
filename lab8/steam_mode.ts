import Camera from "../src/camera";
import { ProgramBuilder } from "../src/program_builder";
import { ShaderProgram } from "../src/shader_program";
import { getGl } from "../src/utils";
import { Particle } from "./particle";
import { ParticlesMode } from "./particles_mode";

import sparksFrag from "./shaders/bengal.frag";
import sparksVert from "./shaders/bengal.vert";

import tracksFrag from "./shaders/tracks.frag";
import tracksVert from "./shaders/tracks.vert";

import SmokeImage from "./images/smoke.png";

export class SteamMode implements ParticlesMode {
  gl: WebGL2RenderingContext;
  tracksProgram: ShaderProgram;
  sparksProgram: ShaderProgram;
  particles: Particle[];
  camera: Camera;
  texture!: WebGLTexture;

  constructor(canvas: HTMLCanvasElement) {
    this.gl = getGl(canvas);
    const programBuilder = new ProgramBuilder(this.gl);
    this.sparksProgram = programBuilder.buildProgram(sparksVert, sparksFrag);
    this.tracksProgram = programBuilder.buildProgram(tracksVert, tracksFrag);

    this.camera = new Camera(canvas.clientWidth, canvas.clientHeight);
    this.camera.position = new Float32Array([0, 0, 5]);

    this.particles = this.generateParticles(200);
    this.particles.forEach((particle) => particle.setPrograms(this.sparksProgram, this.tracksProgram));

    this.loadImage();
  }

  generateParticlesData(count: number) {
    const particles = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * 360;
      const ttl = 7;
      const radius = Math.random() * 0.3;
      const xMax = Math.cos(angle) * radius;
      const yMax = Math.sin(angle) * radius;
      const dx = xMax / ttl;
      const dy = yMax / ttl;
      const x = (dx * 1000) % xMax;
      const y = (dy * 1000) % yMax;
      particles.push(
        {
          position: [x, y, 0], 
          velocity: [dx, dy, 0],
          ttl: ttl
        }
      );
    }

    return particles;
  }

  generateParticles(count: number) {
    const particles = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * 360;
      const ttl = 7;
      const radius = Math.random() * 0.3;
      const xMax = Math.cos(angle) * radius;
      const yMax = Math.sin(angle) * radius;
      const dx = xMax / ttl;
      const dy = yMax / ttl;
      const x = (dx * 1000) % xMax;
      const y = (dy * 1000) % yMax;
      particles.push(new Particle([x, y, 0], [dx, dy, 0], ttl));
    }

    return particles;
  }

  loadImage() {
    const texture = this.gl.createTexture();
    if (!texture) throw "Cannot create texture";
    this.texture = texture;

    var image = new Image();
    image.crossOrigin = "anonymous";
    image.src = SmokeImage;
    image.addEventListener('load', () => {
      this.gl.useProgram(this.sparksProgram.program);
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
      this.gl.generateMipmap(this.gl.TEXTURE_2D);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
      this.gl.activeTexture(this.gl.TEXTURE0);
      // this.gl.bindTexture(this.gl.TEXTURE_2D, null);
      // отрисовку сцены начинаем только после загрузки изображения
      this.start();
    });
  }

  start() {
    this.updateViewUniform();
    this.updateProjUniform();
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE);
    this.particles.forEach((particle) => {
      particle.start();
      particle.bengalMode = this;
    });
    requestAnimationFrame(() => this.update());
  }
  
  updateViewUniform() {
    this.gl.useProgram(this.sparksProgram.program);
    const viewMatrixUniformSpark = this.sparksProgram.getUniformLocation("mView");
    if (viewMatrixUniformSpark)
      this.gl.uniformMatrix4fv(viewMatrixUniformSpark, false, this.camera.view);

    this.gl.useProgram(this.tracksProgram.program);
    const viewMatrixUniformTrack = this.tracksProgram.getUniformLocation("mView");
    if (viewMatrixUniformTrack)
      this.gl.uniformMatrix4fv(viewMatrixUniformTrack, false, this.camera.view);
  }

  updateProjUniform() {
    this.gl.useProgram(this.sparksProgram.program);
    const viewMatrixUniformSpark = this.sparksProgram.getUniformLocation("mProj");
    if (viewMatrixUniformSpark)
      this.gl.uniformMatrix4fv(viewMatrixUniformSpark, false, this.camera.view);

    this.gl.useProgram(this.tracksProgram.program);
    const viewMatrixUniformTrack = this.tracksProgram.getUniformLocation("mProj");
    if (viewMatrixUniformTrack)
      this.gl.uniformMatrix4fv(viewMatrixUniformTrack, false, this.camera.view);
  }

  update() {
    console.log("update");
    this.clearBackground();
    this.particles.forEach((particle) => particle.update());
    requestAnimationFrame(() => this.update());
  }

  clearBackground() {
    // this.gl.useProgram(this.sparksProgram.program);
    this.gl.clearColor(0.3, 0.3, 0.3, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    // this.gl.useProgram(this.tracksProgram.program);
    // this.gl.clearColor(0.3, 0.3, 0.3, 1.0);
    // this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }

  reset() {
    // requestAnimationFrame(() => {});
    // this.particles = this.generateParticles(10);
    // this.particles.forEach((particle) => particle.setPrograms(this.sparksProgram, this.tracksProgram));
    // this.start();

    const particlesData = this.generateParticlesData(this.particles.length);
    this.particles.forEach((particle, i) => {
      const data = particlesData[i];
      const position : [number, number, number] = [data.position[0], data.position[1], data.position[2]];
      const velocity : [number, number, number] = [data.velocity[0], data.velocity[1], data.velocity[2]];
      particle.reset(position, velocity, data.ttl);
    })
  }
}