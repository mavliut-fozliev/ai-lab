import React, { ReactNode } from "react";
import { CellType } from "../../interface/interface";

function Cell({ type, bot }: { type: CellType; bot?: ReactNode }) {
  const color = {
    empty: "cyan",
    cactus: "orange",
    food: "green",
    fail: "",
  };

  return (
    <div
      style={{
        width: 100,
        height: 100,
        backgroundColor: color[type],
        borderWidth: 1,
        borderColor: "black",
        borderStyle: "solid",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {bot}
    </div>
  );
}

export default Cell;
