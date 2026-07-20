import { seedTasks, teamMembers } from "../../data/seed-data.js";
import { loadState, saveState } from "./storage.js";

const fallbackState = {
  tasks: seedTasks,
  teamMembers,
};

let appState = loadState(fallbackState);

export function getState() {
  return appState;
}

export function setState(nextState) {
  appState = nextState;
  saveState(appState);
}

export function updateTasks(updater) {
  const nextTasks = updater(appState.tasks);
  setState({
    ...appState,
    tasks: nextTasks,
  });
}

export function resetState() {
  appState = structuredClone(fallbackState);
  saveState(appState);
  return appState;
}
