import assert from "node:assert/strict";
import test from "node:test";

import { lockBodyScroll, type BodyLockStyle } from "../scroll-lock.ts";

function fakeEnvironment(scrollY: number) {
  const styles: BodyLockStyle[] = [];
  const scrolls: number[] = [];
  const env = {
    getScrollY: () => scrollY,
    setBodyStyle: (style: BodyLockStyle) => { styles.push(style); },
    scrollTo: (y: number) => { scrolls.push(y); },
  };
  return { env, styles, scrolls };
}

test("locking pins the body at the current scroll position", () => {
  const { env, styles, scrolls } = fakeEnvironment(640);

  lockBodyScroll(env);

  assert.deepEqual(styles, [{ position: "fixed", top: "-640px", width: "100%" }]);
  assert.deepEqual(scrolls, []);
});

test("releasing restores the body and scrolls back to where the lock was taken", () => {
  const { env, styles, scrolls } = fakeEnvironment(640);

  const release = lockBodyScroll(env);
  release();

  assert.deepEqual(styles.at(-1), { position: "", top: "", width: "" });
  assert.deepEqual(scrolls, [640]);
});

test("releasing twice does nothing the second time", () => {
  const { env, styles, scrolls } = fakeEnvironment(120);

  const release = lockBodyScroll(env);
  release();
  release();

  assert.equal(styles.length, 2);
  assert.deepEqual(scrolls, [120]);
});

test("a lock taken on a new page never inherits an earlier page's position", () => {
  const first = fakeEnvironment(900);
  const releaseFirst = lockBodyScroll(first.env);
  releaseFirst();

  const second = fakeEnvironment(0);
  const releaseSecond = lockBodyScroll(second.env);
  releaseSecond();

  assert.deepEqual(first.scrolls, [900]);
  assert.deepEqual(second.scrolls, [0]);
});

test("releasing for a navigation unpins the body without scrolling the old position back", () => {
  const { env, styles, scrolls } = fakeEnvironment(900);

  const release = lockBodyScroll(env);
  release({ restoreScroll: false });

  assert.deepEqual(styles.at(-1), { position: "", top: "", width: "" });
  assert.deepEqual(scrolls, []);
});
