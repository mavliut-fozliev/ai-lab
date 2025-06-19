import { CellType } from "./interface";

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
