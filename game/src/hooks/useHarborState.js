import { useCallback, useEffect, useRef, useState } from "react";
import { getState, sendAction, subscribeToState } from "../lib/api.js";

const FALLBACK_POLL_MS = 10_000;

export function useHarborState() {
  const [state, setState] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const actionQueue = useRef(Promise.resolve());
  const pendingActions = useRef(0);
  const refreshInFlight = useRef(null);
  const stateRef = useRef(null);

  const acceptState = useCallback((next) => {
    if (!next || typeof next !== "object") return stateRef.current;
    const current = stateRef.current;
    const currentWorld = current?.multiplayer?.world?.id;
    const nextWorld = next.multiplayer?.world?.id;
    const currentRevision = Number(current?.multiplayer?.revision ?? -1);
    const nextRevision = Number(next.multiplayer?.revision ?? -1);
    if (current && currentWorld === nextWorld && nextRevision < currentRevision) return current;
    stateRef.current = next;
    setState(next);
    return next;
  }, []);

  const refresh = useCallback(async () => {
    if (refreshInFlight.current) return refreshInFlight.current;
    refreshInFlight.current = getState()
      .then((next) => {
        acceptState(next);
        setError("");
        return next;
      })
      .catch((caught) => setError(caught.message))
      .finally(() => {
        refreshInFlight.current = null;
      });
    return refreshInFlight.current;
  }, [acceptState]);

  useEffect(() => {
    refresh();
    const unsubscribe = subscribeToState((event) => {
      const current = stateRef.current;
      if (!event || event.worldId !== current?.multiplayer?.world?.id || Number(event.revision) > Number(current?.multiplayer?.revision ?? -1)) {
        refresh();
      }
    });
    const timer = window.setInterval(refresh, FALLBACK_POLL_MS);
    return () => {
      unsubscribe();
      window.clearInterval(timer);
    };
  }, [refresh]);

  const act = useCallback((action) => {
    pendingActions.current += 1;
    setBusy(true);
    const request = actionQueue.current
      .catch(() => null)
      .then(() => {
        const current = stateRef.current;
        if (!current?.multiplayer?.world?.id || !Number.isInteger(current.multiplayer.revision)) {
          throw new Error("Harbor state is not ready.");
        }
        return sendAction(action, {
          worldId: current.multiplayer.world.id,
          baseRevision: current.multiplayer.revision
        });
      });
    actionQueue.current = request;
    return request
      .then((next) => {
        acceptState(next);
        setError("");
        return next;
      })
      .catch(async (caught) => {
        if (caught.status === 409) await refresh();
        setError(caught.message);
        return null;
      })
      .finally(() => {
        pendingActions.current -= 1;
        if (pendingActions.current === 0) setBusy(false);
      });
  }, [acceptState, refresh]);

  return { state, error, busy, act, dismissError: () => setError("") };
}
