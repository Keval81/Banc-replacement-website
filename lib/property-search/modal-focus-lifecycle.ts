export interface ModalFocusableElement {
  focus: () => void;
}

export const MODAL_FOCUSABLE_SELECTOR = [
  "button:not([disabled]):not([tabindex='-1'])",
  "input:not([disabled]):not([tabindex='-1'])",
  "select:not([disabled]):not([tabindex='-1'])",
  "textarea:not([disabled]):not([tabindex='-1'])",
  "a[href]:not([disabled]):not([aria-disabled='true']):not([tabindex='-1'])",
  "[tabindex]:not([disabled]):not([aria-disabled='true']):not([tabindex='-1'])",
].join(",");

export interface ModalFocusKeyEvent {
  key: string;
  shiftKey: boolean;
  preventDefault: () => void;
}

interface ModalFocusLifecycleDependencies {
  getActiveElement: () => unknown;
  getBodyOverflow: () => string;
  setBodyOverflow: (value: string) => void;
  getFocusableElements: () => ModalFocusableElement[];
  getInitialFocusElement?: () => ModalFocusableElement | null;
  containerContains: (element: unknown) => boolean;
  addKeydownListener: (listener: (event: ModalFocusKeyEvent) => void) => void;
  removeKeydownListener: (listener: (event: ModalFocusKeyEvent) => void) => void;
  requestFrame: (callback: () => void) => unknown;
  cancelFrame: (frame: unknown) => void;
  onClose: () => void;
  restoreFocus?: () => void;
}

function isFocusableElement(value: unknown): value is ModalFocusableElement {
  return typeof value === "object" &&
    value !== null &&
    "focus" in value &&
    typeof value.focus === "function";
}

export function startModalFocusLifecycle(
  dependencies: ModalFocusLifecycleDependencies,
): () => void {
  const activeElement = dependencies.getActiveElement();
  const opener = isFocusableElement(activeElement) ? activeElement : null;
  const previousBodyOverflow = dependencies.getBodyOverflow();
  dependencies.setBodyOverflow("hidden");

  const frame = dependencies.requestFrame(() => {
    const initialFocus = dependencies.getInitialFocusElement?.();
    (initialFocus ?? dependencies.getFocusableElements()[0])?.focus();
  });
  let closeRequested = false;

  const handleKeydown = (event: ModalFocusKeyEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      if (closeRequested) return;
      closeRequested = true;
      dependencies.onClose();
      return;
    }
    if (event.key !== "Tab") return;

    const elements = dependencies.getFocusableElements();
    if (elements.length === 0) {
      event.preventDefault();
      return;
    }

    const activeElement = dependencies.getActiveElement();
    const first = elements[0];
    const last = elements[elements.length - 1];
    if (event.shiftKey && activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && activeElement === last) {
      event.preventDefault();
      first.focus();
    } else if (!dependencies.containerContains(activeElement)) {
      event.preventDefault();
      first.focus();
    }
  };

  dependencies.addKeydownListener(handleKeydown);
  let cleanedUp = false;
  return () => {
    if (cleanedUp) return;
    cleanedUp = true;
    dependencies.cancelFrame(frame);
    dependencies.removeKeydownListener(handleKeydown);
    dependencies.setBodyOverflow(previousBodyOverflow);
    if (dependencies.restoreFocus) {
      dependencies.restoreFocus();
    } else {
      opener?.focus();
    }
  };
}
