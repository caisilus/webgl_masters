import { ProgramBuilder } from "../src/program_builder";
import { ShaderProgram } from "../src/shader_program";
import VertexAttribute from "../src/vertex_attribute";
import { getGl } from "../src/utils";
import { BengalMode } from "./bengal_mode";
import { FireworkMode } from "./firework_mode";
import { SteamMode } from "./steam_mode";

class Main {
  canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement, readonly select: HTMLSelectElement) {
    this.canvas = canvas;
    this.updateMode();
    this.select.addEventListener('change', (e) => { this.updateMode(); });
  }

  updateMode() {
    const selectedValue = this.select.options[this.select.selectedIndex].value;
    switch (selectedValue) {
      case "bengal":
        new BengalMode(this.canvas);
        break;
      case "firework":
        new FireworkMode(this.canvas);
        break;
      case "steam":
        new SteamMode(this.canvas);
        break;
    }
  }
}
function main() {
  const canvas = document.querySelector("canvas#mycanvas") as HTMLCanvasElement;
  const select = document.querySelector("select#figure") as HTMLSelectElement;

  canvas.setAttribute("width", "600");
  canvas.setAttribute("height", "600");
  const mainObj = new Main(canvas, select);
}

main();
