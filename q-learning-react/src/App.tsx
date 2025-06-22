import { useEffect, useRef, useState } from "react";
import Grid from "./grid/components/Grid/Grid";
import { CellType } from "./grid/interface";
import { useGrid } from "./grid/useGrid";
import { Model } from "./ai/Model";
import { Action } from "./ai/interface";

const model = new Model("training");

const stepTime = 300;

const initialPosition = { x: 2, y: 2 };
const initialHealth = 5;

function App() {
  const [run, setRun] = useState(false);

  const { grid, getSurroundings, recreateGrid, getCellImpact, updateCell } = useGrid();

  const [position, setPosition] = useState(initialPosition);
  const [health, setHealth] = useState(initialHealth);

  const stepRef = useRef<() => Promise<void>>(async () => {});

  const restart = () => {
    recreateGrid();
    setPosition(initialPosition);
    setHealth(initialHealth);
  };

  // step
  stepRef.current = async () => {
    const haveFood = grid.some((line) => line.some((cell) => cell === CellType.food));

    if (!haveFood) {
      return restart();
    }

    const surroundings = getSurroundings(position);
    const state = [...surroundings, health / 10];

    const action = await model.selectAction(state);

    const newPosition = { ...position };
    if (action === Action.Up) newPosition.y--;
    else if (action === Action.Down) newPosition.y++;
    else if (action === Action.Left) newPosition.x--;
    else if (action === Action.Right) newPosition.x++;

    const impact = getCellImpact(newPosition.x, newPosition.y);
    const newHealth = health + impact > 10 ? 10 : health + impact;

    const dead = newHealth < 1;
    if (dead) {
      return restart();
    }

    setPosition(newPosition);
    setHealth(newHealth);
    updateCell(newPosition.x, newPosition.y);

    const newSurroundings = getSurroundings(newPosition);
    const nextState = [...newSurroundings, newHealth / 10];

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

  useEffect(() => {
    recreateGrid();
  }, []);

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
