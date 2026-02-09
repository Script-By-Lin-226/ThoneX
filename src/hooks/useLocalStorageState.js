import { useEffect, useRef, useState } from "react";
import { readJSON, writeJSON } from "../lib/storage.js";

export default function useLocalStorageState(key, fallback) {
  const initialRef = useRef(null);
  if (initialRef.current === null) {
    initialRef.current = readJSON(key, fallback);
  }
  const initial = initialRef.current;

  const [state, setState] = useState(initial.value);
  const [error, setError] = useState(initial.ok ? null : initial.error);

  const firstWrite = useRef(true);

  useEffect(() => {
    if (firstWrite.current) {
      firstWrite.current = false;
      if (initial.missing || !initial.ok) {
        writeJSON(key, state);
      }
      return;
    }
    const result = writeJSON(key, state);
    if (!result.ok) {
      setError(result.error || new Error("Failed to write localStorage"));
    }
  }, [key, state, initial.missing, initial.ok]);

  return [state, setState, error];
}
