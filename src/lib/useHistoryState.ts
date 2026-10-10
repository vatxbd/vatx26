import { useState, useCallback, useMemo } from 'react';

export function useHistoryState<T>(initialState: T) {
  const [state, _setState] = useState(initialState);
  const [past, setPast] = useState<T[]>([]);
  const [future, setFuture] = useState<T[]>([]);

  const setState = useCallback((nextState: T | ((curr: T) => T)) => {
    _setState(curr => {
      const actualNext = typeof nextState === 'function' ? (nextState as any)(curr) : nextState;
      
      // If the state is effectively the same, don't record history
      if (JSON.stringify(actualNext) === JSON.stringify(curr)) {
        return curr;
      }

      setPast(prev => [...prev, curr]);
      setFuture([]);
      return actualNext;
    });
  }, []);

  const undo = useCallback(() => {
    if (past.length === 0) return;

    setPast(prev => {
      const newPast = [...prev];
      const previous = newPast.pop()!;
      setFuture(f => [state, ...f]);
      _setState(previous);
      return newPast;
    });
  }, [past, state]);

  const redo = useCallback(() => {
    if (future.length === 0) return;

    setFuture(prev => {
      const newFuture = [...prev];
      const next = newFuture.shift()!;
      setPast(p => [...p, state]);
      _setState(next);
      return newFuture;
    });
  }, [future, state]);

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  return [state, setState, { undo, redo, canUndo, canRedo }] as const;
}
