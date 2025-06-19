import { useEffect, useRef, useState } from "react";
import Grid from "./grid/components/Grid/Grid";
import { Model } from "./ai/Model";
import { Action, CellType } from "./grid/interface";
import { impactMap, surroundingMap } from "./grid/consts";
import { createInitialGrid } from "./grid/helpers";

const model = new Model("survival");

const stepTime = 300;

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

const initialPosition = { x: 2, y: 2 };
const initialHealth = 5;

function App() {
  const [run, setRun] = useState(false);

  const [grid, setGrid] = useState(createInitialGrid());
  const [position, setPosition] = useState(initialPosition);
  const [health, setHealth] = useState(initialHealth);

  const stepRef = useRef<() => Promise<void>>(async () => {});

  const restart = () => {
    setGrid(createInitialGrid());
    setPosition(initialPosition);
    setHealth(initialHealth);
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

    const dead = newHealth < 1;
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

  const handleStart = () => {
    setRun(!run);
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const step = async () => {
      if (!run) return;

      await stepRef.current();
      timeoutId = setTimeout(step, stepTime);
    };

    step();

    return () => clearTimeout(timeoutId);
  }, [run]);

  return (
    <div className="App">
      <Grid field={grid} botPosition={position} />
      <div>{health > 0 ? `Health: ${health}` : "Dead"}</div>
      <button style={{ fontSize: 26 }} onClick={handleStart}>
        {run ? "Stop" : "Start"}
      </button>
    </div>
  );
}

export default App;
