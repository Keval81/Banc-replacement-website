import assert from "node:assert/strict";
import test from "node:test";

import { startHeroVideoLifecycle } from "../hero-video-lifecycle.ts";

test("pauses the hero film while hidden and resumes it when visible again", async () => {
  const documentTarget = new EventTarget();
  const windowTarget = new EventTarget();
  let visibilityState: "hidden" | "visible" = "visible";
  const actions: string[] = [];

  const stop = startHeroVideoLifecycle({
    documentTarget,
    windowTarget,
    getVisibilityState: () => visibilityState,
    pause: () => actions.push("pause"),
    resume: async () => { actions.push("resume"); },
  });

  visibilityState = "hidden";
  documentTarget.dispatchEvent(new Event("visibilitychange"));
  visibilityState = "visible";
  documentTarget.dispatchEvent(new Event("visibilitychange"));
  await Promise.resolve();

  assert.deepEqual(actions, ["pause", "resume"]);
  stop();
});

test("recovers visible playback after page restoration or focus and cleans up", async () => {
  const documentTarget = new EventTarget();
  const windowTarget = new EventTarget();
  let visibilityState: "hidden" | "visible" = "visible";
  const actions: string[] = [];

  const stop = startHeroVideoLifecycle({
    documentTarget,
    windowTarget,
    getVisibilityState: () => visibilityState,
    pause: () => actions.push("pause"),
    resume: async () => { actions.push("resume"); },
  });

  windowTarget.dispatchEvent(new Event("pageshow"));
  windowTarget.dispatchEvent(new Event("focus"));
  visibilityState = "hidden";
  windowTarget.dispatchEvent(new Event("pageshow"));
  windowTarget.dispatchEvent(new Event("focus"));
  await Promise.resolve();

  assert.deepEqual(actions, ["resume", "resume"]);

  stop();
  visibilityState = "visible";
  documentTarget.dispatchEvent(new Event("visibilitychange"));
  windowTarget.dispatchEvent(new Event("pageshow"));
  windowTarget.dispatchEvent(new Event("focus"));
  await Promise.resolve();

  assert.deepEqual(actions, ["resume", "resume"]);
});
