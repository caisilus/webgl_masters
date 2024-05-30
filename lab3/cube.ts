import { Transformator } from "../src/transformator"
import GameObject from "../src/game_object"
import MonocolorCubeData from "./monocolor_cube_data"

export default class Cube extends GameObject {
  constructor(position: Array<number>, scale: Array<number>, color: Array<number>) {
    super(new MonocolorCubeData(color), new Transformator());
    this.transform.translate(position[0], position[1], position[2]);
    this.transform.scale(scale[0], scale[1], scale[2]);
  } 
}