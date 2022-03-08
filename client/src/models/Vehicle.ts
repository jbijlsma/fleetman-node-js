export class Vehicle {
  driverName: string;
  speed: number;
  color: string;
  positions: number[][];

  constructor(
    driverName: string,
    speed: number,
    color: string,
    positions: number[][]
  ) {
    this.driverName = driverName;
    this.speed = speed;
    this.color = color;
    this.positions = positions;
  }
}
