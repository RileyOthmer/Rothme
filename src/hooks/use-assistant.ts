import { useEffect, useState } from "react";

type OpenPayload = {
  seedMessage?: string;
  threadKey?: string; // stable id for per-context thread (e.g. "growth-card")
};

type Listener = (payload: OpenPayload | null) => void;

const listeners = new Set<Listener>();
let current: OpenPayload | null = null;

export function openAssistant(payload: OpenPayload = {}) {
  current = payload;
  listeners.forEach((l) => l(payload));
}

export function closeAssistant() {
  current = null;
  listeners.forEach((l) => l(null));
}

export function useAssistantPanel() {
  const [state, setState] = useState<OpenPayload | null>(current);
  useEffect(() => {
    const l: Listener = (p) => setState(p);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return { open: state !== null, payload: state, close: closeAssistant };
}
