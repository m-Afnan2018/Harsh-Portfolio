"use client";
import { useSyncExternalStore } from "react";

export type AppState = {
  loaded: boolean; // preloader finished
  menuOpen: boolean;
  project: string | null; // slug of open project overlay
  sound: boolean;
};

let state: AppState = { loaded: false, menuOpen: false, project: null, sound: false };
const listeners = new Set<() => void>();

export const getState = () => state;
export const setState = (patch: Partial<AppState>) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
};
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

const serverState: AppState = { ...state };
export function useStore<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(serverState),
  );
}
export const subscribeStore = subscribe;
