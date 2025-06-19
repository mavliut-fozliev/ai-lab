export enum Action {
  Up,
  Down,
  Left,
  Right,
}

export type StateVector = number[]; // длина 25 (24 признака + здоровье)

export enum CellType {
  cactus = "cactus",
  food = "food",
  empty = "empty",
  fail = "fail",
}

export type Position = { x: number; y: number };
