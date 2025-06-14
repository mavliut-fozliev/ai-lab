import { CellType } from "../interface/interface";

export const impactMap: { [key in CellType]: number } = {
  [CellType.cactus]: -2,
  [CellType.food]: +3,
  [CellType.empty]: -1,
  [CellType.fail]: -10,
};

export const surroundingMap: { [key in CellType]: number[] } = {
  [CellType.cactus]: [0, 1, 0],
  [CellType.food]: [1, 0, 0],
  [CellType.empty]: [0, 0, 1],
  [CellType.fail]: [0, 0, 0],
};

export const epsilon = 0.2;
export const gamma = 0.9;

export const initialGird = [
  [CellType.cactus, CellType.empty, CellType.empty, CellType.cactus, CellType.empty],
  [CellType.empty, CellType.food, CellType.empty, CellType.empty, CellType.empty],
  [CellType.empty, CellType.empty, CellType.empty, CellType.food, CellType.empty],
  [CellType.empty, CellType.empty, CellType.cactus, CellType.empty, CellType.empty],
  [CellType.food, CellType.empty, CellType.empty, CellType.empty, CellType.empty],
];
