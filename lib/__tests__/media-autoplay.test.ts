import assert from "node:assert/strict";
import test from "node:test";

import { playWhenAllowed } from "../media-autoplay.ts";

class FakeVideo {
  attempts = 0;
  private readonly outcomes: boolean[];
  constructor(outcomes: boolean[]) {
    this.outcomes = outcomes;
  }
  play(): Promise<void> {
    const allowed = this.outcomes[this.attempts] ?? true;
    this.attempts += 1;
    return allowed ? Promise.resolve() : Promise.reject(new DOMException("blocked", "NotAllowedError"));
  }
}

class SpyTarget extends EventTarget {
  listeners = 0;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: AddEventListenerOptions | boolean) {
    this.listeners += 1;
    super.addEventListener(type, listener, options);
  }
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: EventListenerOptions | boolean) {
    this.listeners -= 1;
    super.removeEventListener(type, listener, options);
  }
}

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

test("plays straight away when the browser allows autoplay and never listens for a gesture", async () => {
  const video = new FakeVideo([true]);
  const gestureTarget = new SpyTarget();

  playWhenAllowed({ video, gestureTarget });
  await settle();

  assert.equal(video.attempts, 1);
  assert.equal(gestureTarget.listeners, 0);
});

test("waits for the first touch when autoplay is refused, then plays and stops listening", async () => {
  const video = new FakeVideo([false, true]);
  const gestureTarget = new SpyTarget();

  playWhenAllowed({ video, gestureTarget });
  await settle();
  assert.equal(video.attempts, 1);
  assert.ok(gestureTarget.listeners > 0, "should be waiting for a gesture");

  gestureTarget.dispatchEvent(new Event("touchend"));
  await settle();

  assert.equal(video.attempts, 2);
  assert.equal(gestureTarget.listeners, 0);
});

test("keeps waiting when a gesture-triggered attempt is also refused", async () => {
  const video = new FakeVideo([false, false, true]);
  const gestureTarget = new SpyTarget();

  playWhenAllowed({ video, gestureTarget });
  await settle();
  gestureTarget.dispatchEvent(new Event("pointerup"));
  await settle();
  assert.equal(video.attempts, 2);
  assert.ok(gestureTarget.listeners > 0, "still waiting after the second refusal");

  gestureTarget.dispatchEvent(new Event("keydown"));
  await settle();

  assert.equal(video.attempts, 3);
  assert.equal(gestureTarget.listeners, 0);
});

test("cleanup stops listening so an unmounted film never plays", async () => {
  const video = new FakeVideo([false, true]);
  const gestureTarget = new SpyTarget();

  const stop = playWhenAllowed({ video, gestureTarget });
  await settle();
  stop();
  gestureTarget.dispatchEvent(new Event("touchend"));
  await settle();

  assert.equal(video.attempts, 1);
  assert.equal(gestureTarget.listeners, 0);
});
