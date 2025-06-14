import { useEffect, useRef, useState } from "react";
import Grid from "./components/Grid/Grid";
import { Model } from "./ai/Model";
import { Action, CellType } from "./interface/interface";
import { epsilon, gamma, impactMap, initialGird, surroundingMap } from "./consts/consts";

const model = new Model(epsilon, gamma);

const getGridCell = (grid: CellType[][], x: number, y: number) => grid[y]?.[x] || CellType.fail;

const getSurroundings = (grid: CellType[][], position: { x: number; y: number }) => [
  getGridCell(grid, position.x - 1, position.y - 1),
  getGridCell(grid, position.x, position.y - 1),
  getGridCell(grid, position.x + 1, position.y - 1),
  getGridCell(grid, position.x - 1, position.y),
  getGridCell(grid, position.x + 1, position.y),
  getGridCell(grid, position.x - 1, position.y + 1),
  getGridCell(grid, position.x, position.y + 1),
  getGridCell(grid, position.x + 1, position.y + 1),
];

function App() {
  const [grid, setGrid] = useState(initialGird);
  const [position, setPosition] = useState({ x: 2, y: 2 });
  const [health, setHealth] = useState(5);

  const stepRef = useRef<() => Promise<void>>(async () => {});

  const restart = () => {
    setGrid(initialGird);
    setPosition({ x: 2, y: 2 });
    setHealth(5);
  };

  // step
  stepRef.current = async () => {
    const haveFood = grid.some((line) => line.some((cell) => cell === CellType.food));

    if (!haveFood) {
      return restart();
    }

    const surroundings = getSurroundings(grid, position);
    const surroundingsState = surroundings.flatMap((s) => surroundingMap[s]);
    const state = [...surroundingsState, health / 10];

    const action = await model.selectAction(state);

    const newPosition = { ...position };
    if (action === Action.Up) newPosition.y--;
    else if (action === Action.Down) newPosition.y++;
    else if (action === Action.Left) newPosition.x--;
    else if (action === Action.Right) newPosition.x++;

    const cell = getGridCell(grid, newPosition.x, newPosition.y);
    const impact = impactMap[cell];
    const newHealth = health + impact > 10 ? 10 : health + impact;

    const dead = health < 1;
    if (dead) {
      return restart();
    }

    setPosition(newPosition);
    setHealth(newHealth);

    if (cell === CellType.food) {
      const newGrid = grid.map((row) => [...row]);
      newGrid[newPosition.y][newPosition.x] = CellType.empty;
      setGrid(newGrid);
    }

    const newSurroundings = getSurroundings(grid, newPosition);
    const newSurroundingsState = newSurroundings.flatMap((s) => surroundingMap[s]);
    const nextState = [...newSurroundingsState, newHealth / 10];

    await model.trainStep(state, action, impact, nextState);
  };

  useEffect(() => {
    let isCancelled = false;

    const loop = async () => {
      while (!isCancelled) {
        await stepRef.current();
        await new Promise((r) => setTimeout(r, 500));
      }
    };

    loop();

    return () => {
      isCancelled = true; // чтобы не продолжал после размонтирования
    };
  }, []);

  return (
    <div className="App">
      <Grid field={grid} botPosition={position} />
      <div>{health > 0 ? `Health: ${health}` : "Dead"}</div>
    </div>
  );
}

export default App;
