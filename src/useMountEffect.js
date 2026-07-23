import { useEffect } from "react";

export function useMountEffect(effect) {
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(effect, []);
}
