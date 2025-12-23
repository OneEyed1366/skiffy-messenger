import { useState } from "react";

export function A() {
  const [state, setState] = useState(1);
  const doubled = state * 2;

  return <>{doubled}</>;
}
