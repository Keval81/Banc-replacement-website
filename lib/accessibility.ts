/**
 * Accessibility utilities for Banc Property Group
 * WCAG 2.1 AA compliance helpers
 */

// Focus management utilities
export function trapFocus(element: HTMLElement, event: KeyboardEvent) {
  if (event.key !== "Tab") return;

  const focusableElements = element.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (event.shiftKey) {
    if (document.activeElement === firstElement) {
      lastElement.focus();
      event.preventDefault();
    }
  } else {
    if (document.activeElement === lastElement) {
      firstElement.focus();
      event.preventDefault();
    }
  }
}

// Skip to content link
export function createSkipLink(targetId: string = "main-content") {
  const skipLink = document.createElement("a");
  skipLink.href = `#${targetId}`;
  skipLink.className = 
    "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[1000] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg";
  skipLink.textContent = "Skip to main content";
  return skipLink;
}

// Announce to screen readers
export function announce(message: string, priority: "polite" | "assertive" = "polite") {
  const announcement = document.createElement("div");
  announcement.setAttribute("role", "status");
  announcement.setAttribute("aria-live", priority);
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only";
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// Reduced motion check
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// High contrast mode check
export function prefersHighContrast(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-contrast: high)").matches;
}

// Color scheme preference
export function prefersColorScheme(): "light" | "dark" | "no-preference" {
  if (typeof window === "undefined") return "no-preference";
  
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  if (window.matchMedia("(prefers-color-scheme: light)").matches) {
    return "light";
  }
  return "no-preference";
}

// Keyboard navigation detection
let isKeyboardUser = false;

export function initKeyboardDetection() {
  if (typeof window === "undefined") return;

  document.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      isKeyboardUser = true;
      document.body.classList.add("keyboard-user");
    }
  });

  document.addEventListener("mousedown", () => {
    isKeyboardUser = false;
    document.body.classList.remove("keyboard-user");
  });
}

export function isKeyboardNavigation(): boolean {
  return isKeyboardUser;
}

// ARIA helpers
export function generateAriaId(prefix: string = "aria"): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}

// Form validation announcements
export function announceFormError(fieldName: string, error: string) {
  announce(`${fieldName} error: ${error}`, "assertive");
}

export function announceFormSuccess(message: string) {
  announce(message, "polite");
}

// Touch target size validation (for debugging)
export function validateTouchTargets(minSize: number = 44) {
  if (typeof window === "undefined" || process.env.NODE_ENV === "production") {
    return;
  }

  const interactiveElements = document.querySelectorAll(
    'button, a, input, select, textarea, [role="button"], [role="link"]'
  );

  interactiveElements.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.width < minSize || rect.height < minSize) {
      console.warn(
        "Touch target too small:",
        el,
        `Size: ${rect.width}x${rect.height}px`,
        `Minimum: ${minSize}x${minSize}px`
      );
      // Add visual indicator in development
      (el as HTMLElement).style.outline = "2px solid red";
    }
  });
}
