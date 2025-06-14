import { CellType } from "../../interface/interface";
import Bot from "../Bot/Bot";
import Cell from "../Cell/Cell";

function Grid({ field, botPosition }: { field: CellType[][]; botPosition: { x: number; y: number } }) {
  return (
    <div>
      {field.map((line, lineIndex) => (
        <div key={lineIndex} style={{ display: "flex" }}>
          {line.map((cell, cellIndex) => (
            <Cell key={cellIndex} type={cell} bot={botPosition.y === lineIndex && botPosition.x === cellIndex ? <Bot /> : undefined} />
          ))}
        </div>
      ))}
    </div>
  );
}

export default Grid;
