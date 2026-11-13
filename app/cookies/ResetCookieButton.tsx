"use client";

import { actionPrimary } from "@/components/ui/form-styles";

export default function ResetCookieButton() {
  return (
    <button
      onClick={() => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('banc-cookie-consent');
          localStorage.removeItem('banc-cookie-preferences');
          window.location.reload();
        }
      }}
      className={actionPrimary}
    >
      Reset Cookie Preferences
    </button>
  );
}
