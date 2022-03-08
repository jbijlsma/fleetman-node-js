export class Vehicle {
  driverName: string;
  speed: number;
  hasStopped: boolean;
  color: string;
  positions: number[][];

  constructor(
    driverName: string,
    speed: number,
    hasStopped: boolean,
    color: string,
    positions: number[][]
  ) {
    this.driverName = driverName;
    this.speed = speed;
    this.hasStopped = hasStopped;
    this.color = color;
    this.positions = positions;
  }
}
