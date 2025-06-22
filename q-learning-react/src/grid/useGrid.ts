import { useState } from "react";
import { CellType, Position } from "./interface";

export function useGrid() {
  const [grid, setGrid] = useState<CellType[][]>([]);

  const size = 8;
  const footAmount = 30;
  const cactusAmount = 10;

  const totalCells = size * size;

  // Не заполняем центр
  const centerIndex = Math.floor(totalCells / 2); // 12, то есть ячейка (2,2)
  const availableIndices = Array.from(Array(totalCells).keys()).filter((i) => i !== centerIndex);

  function recreateGrid() {
    const oneLineGrid = Array(totalCells).fill(CellType.empty);

    placeRandomItems(oneLineGrid, CellType.cactus, cactusAmount);
    placeRandomItems(oneLineGrid, CellType.food, footAmount);

    // Преобразуем в 2D
    const newGrid = [];
    for (let i = 0; i < size; i++) {
      newGrid.push(oneLineGrid.slice(i * size, (i + 1) * size));
      setGrid(newGrid);
    }
  }

  function placeRandomItems(oneLineGrid: CellType[], type: CellType, count: number) {
    let placed = 0;

    while (placed < count) {
      const randomIdx = Math.floor(Math.random() * availableIndices.length);
      const index = availableIndices[randomIdx];

      if (oneLineGrid[index] === CellType.empty) {
        oneLineGrid[index] = type;
        placed++;
      }
    }
  }

  function getGridCell(x: number, y: number) {
    return grid[y]?.[x] || CellType.fail;
  }

  function getSurroundings(position: Position) {
    const x = position.x;
    const y = position.y;

    const surroundings = [
      getGridCell(x - 1, y - 1),
      getGridCell(x, y - 1),
      getGridCell(x + 1, y - 1),
      getGridCell(x - 1, y),
      getGridCell(x + 1, y),
      getGridCell(x - 1, y + 1),
      getGridCell(x, y + 1),
      getGridCell(x + 1, y + 1),
    ];

    const surroundingMap: { [key in CellType]: number[] } = {
      [CellType.cactus]: [0, 1, 0],
      [CellType.food]: [1, 0, 0],
      [CellType.empty]: [0, 0, 1],
      [CellType.fail]: [0, 0, 0],
    };

    return surroundings.flatMap((s) => surroundingMap[s]);
  }

  function getCellImpact(x: number, y: number) {
    const impactMap: { [key in CellType]: number } = {
      [CellType.cactus]: -2,
      [CellType.food]: +3,
      [CellType.empty]: -1,
      [CellType.fail]: -10,
    };

    const cell = getGridCell(x, y);
    return impactMap[cell];
  }

  function updateCell(x: number, y: number) {
    const cell = getGridCell(x, y);

    if (cell === CellType.food) {
      const newGrid = grid.map((row) => [...row]);
      newGrid[y][x] = CellType.empty;
      setGrid(newGrid);
    }
  }

  return { grid, recreateGrid, getSurroundings, getCellImpact, updateCell };
}
