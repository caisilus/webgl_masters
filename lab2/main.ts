import { ProgramBuilder } from "../src/program_builder";
import { ShaderProgram } from "../src/shader_program";
import VertexAttribute from "../src/vertex_attribute";
import PentagonData from "./pentagon_data";
import DrawData from "../src/draw_data";
import { getGl } from "../src/utils";
import PentagonMode from "./pentagon_mode";
import CubeMode from "./cube_mode";
import SquareMode from "./square_mode";

class Main {
  canvas: HTMLCanvasElement;
  pentagonMode!: PentagonMode;

  constructor(canvas: HTMLCanvasElement, readonly select: HTMLSelectElement) {
    this.canvas = canvas;
    this.renderSelection();
    this.select.addEventListener('change', (e) => { this.renderSelection(); });
  }

  renderSelection() {
    const selectedValue = this.select.options[this.select.selectedIndex].value;
    switch (selectedValue) {
      case "pentagon":
        const pentagonMode = new PentagonMode(this.canvas);
        break;
      case "cube":
        const cubeMode = new CubeMode(this.canvas);
        break;
      case "square":
        const squareMode = new SquareMode(this.canvas);
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
