import type { Preferences, Scenario } from "../domain/types";
import { recover } from "../engine/recover";

/** Authored requests demonstrate a future model adapter; no language model is called. */
export const demoRequests = [
  {
    id: "concert",
    label: "Keep my concert",
    prompt: "Keep my 4 PM concert and find a way for under ₹2,500.",
    preferences: { protectOriginal: true, budget: 250000 },
  },
  {
    id: "budget",
    label: "Spend less",
    prompt: "I can move the concert, but I only have ₹1,000 extra to spend.",
    preferences: { protectOriginal: false, budget: 100000 },
  },
  {
    id: "conflict",
    label: "Challenge the budget",
    prompt:
      "I must make the 4 PM concert, and I cannot spend more than ₹2,000.",
    preferences: { protectOriginal: true, budget: 200000 },
  },
] as const;
export type DemoRequest = (typeof demoRequests)[number];
export function previewRequest(request: DemoRequest, scenario: Scenario) {
  const nextScenario = scenario === "original" ? "delay" : scenario;
  const preferences: Preferences = { ...request.preferences };
  return {
    scenario: nextScenario,
    preferences,
    recovery: recover(nextScenario, preferences),
  };
}
