export class Vehicle {
  driverName: string;
  speed: number;
  totalDistance: number;
  kmsLeft: number;
  hasStopped: boolean;
  color: string;
  positions: number[][];

  constructor(
    driverName: string,
    speed: number,
    totalDistance: number,
    kmsLeft: number,
    hasStopped: boolean,
    color: string,
    positions: number[][]
  ) {
    this.driverName = driverName;
    this.speed = speed;
    this.totalDistance = totalDistance;
    this.kmsLeft = kmsLeft;
    this.hasStopped = hasStopped;
    this.color = color;
    this.positions = positions;
  }
}
