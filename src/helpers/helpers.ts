import { CellType } from "../interface/interface";

export function createInitialGrid(): CellType[][] {
  const size = 5;
  const footAmount = 3;
  const cactusAmount = 3;

  const totalCells = size * size;
  const centerIndex = Math.floor(totalCells / 2); // 12, то есть ячейка (2,2)

  const grid: CellType[] = Array(totalCells).fill(CellType.empty);

  // Не заполняем центр
  const availableIndices = Array.from(Array(totalCells).keys()).filter((i) => i !== centerIndex);

  // Размещаем кактусы
  placeRandomItems(grid, CellType.cactus, cactusAmount, availableIndices);

  // Размещаем еду
  placeRandomItems(grid, CellType.food, footAmount, availableIndices);

  // Преобразуем в 2D
  const result: CellType[][] = [];
  for (let i = 0; i < size; i++) {
    result.push(grid.slice(i * size, (i + 1) * size));
  }

  return result;
}

function placeRandomItems(grid: CellType[], type: CellType, count: number, availableIndices: number[]) {
  let placed = 0;
  while (placed < count) {
    const randomIdx = Math.floor(Math.random() * availableIndices.length);
    const index = availableIndices[randomIdx];
    if (grid[index] === CellType.empty) {
      grid[index] = type;
      placed++;
    }
  }
}
