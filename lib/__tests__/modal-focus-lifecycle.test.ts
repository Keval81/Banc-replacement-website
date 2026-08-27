import assert from "node:assert/strict";
import test from "node:test";

import {
  startModalFocusLifecycle,
  type ModalFocusKeyEvent,
} from "../property-search/modal-focus-lifecycle.ts";

test("traps modal focus and restores the opener and environment on cleanup", () => {
  const focusEvents: string[] = [];
  const opener = { focus: () => { activeElement = opener; focusEvents.push("opener"); } };
  const first = { focus: () => { activeElement = first; focusEvents.push("first"); } };
  const last = { focus: () => { activeElement = last; focusEvents.push("last"); } };
  const outside = { focus: () => { activeElement = outside; focusEvents.push("outside"); } };
  let activeElement: unknown = opener;
  let bodyOverflow = "auto";
  let keydownListener: ((event: ModalFocusKeyEvent) => void) | undefined;
  let frameCallback: (() => void) | undefined;
  let cancelledFrame: unknown;
  let removedListener: unknown;
  let closes = 0;

  const cleanup = startModalFocusLifecycle({
    getActiveElement: () => activeElement,
    getBodyOverflow: () => bodyOverflow,
    setBodyOverflow: (value) => { bodyOverflow = value; },
    getFocusableElements: () => [first, last],
    containerContains: (element) => element === first || element === last,
    addKeydownListener: (listener) => { keydownListener = listener; },
    removeKeydownListener: (listener) => { removedListener = listener; },
    requestFrame: (callback) => { frameCallback = callback; return 17; },
    cancelFrame: (frame) => { cancelledFrame = frame; },
    onClose: () => { closes += 1; },
  });

  assert.equal(bodyOverflow, "hidden");
  assert.deepEqual(focusEvents, []);
  frameCallback?.();
  assert.deepEqual(focusEvents, ["first"]);

  let prevented = 0;
  activeElement = last;
  keydownListener?.({ key: "Tab", shiftKey: false, preventDefault: () => { prevented += 1; } });
  activeElement = first;
  keydownListener?.({ key: "Tab", shiftKey: true, preventDefault: () => { prevented += 1; } });
  activeElement = outside;
  keydownListener?.({ key: "Tab", shiftKey: false, preventDefault: () => { prevented += 1; } });
  keydownListener?.({ key: "Escape", shiftKey: false, preventDefault: () => { prevented += 1; } });

  assert.deepEqual(focusEvents, ["first", "first", "last", "first"]);
  assert.equal(prevented, 4);
  assert.equal(closes, 1);

  cleanup();
  assert.equal(bodyOverflow, "auto");
  assert.equal(cancelledFrame, 17);
  assert.equal(removedListener, keydownListener);
  assert.deepEqual(focusEvents, ["first", "first", "last", "first", "opener"]);
});

test("keeps Tab contained when a modal has no focusable controls", () => {
  let keydownListener: ((event: ModalFocusKeyEvent) => void) | undefined;
  let prevented = 0;
  const cleanup = startModalFocusLifecycle({
    getActiveElement: () => null,
    getBodyOverflow: () => "",
    setBodyOverflow: () => undefined,
    getFocusableElements: () => [],
    containerContains: () => false,
    addKeydownListener: (listener) => { keydownListener = listener; },
    removeKeydownListener: () => undefined,
    requestFrame: () => 1,
    cancelFrame: () => undefined,
    onClose: () => undefined,
  });

  keydownListener?.({ key: "Tab", shiftKey: false, preventDefault: () => { prevented += 1; } });
  assert.equal(prevented, 1);
  cleanup();
});

test("cleans up safely when the previous active element cannot be focused", () => {
  const cleanup = startModalFocusLifecycle({
    getActiveElement: () => ({ nodeName: "svg" }),
    getBodyOverflow: () => "clip",
    setBodyOverflow: () => undefined,
    getFocusableElements: () => [],
    containerContains: () => false,
    addKeydownListener: () => undefined,
    removeKeydownListener: () => undefined,
    requestFrame: () => 2,
    cancelFrame: () => undefined,
    onClose: () => undefined,
  });

  assert.doesNotThrow(cleanup);
});
