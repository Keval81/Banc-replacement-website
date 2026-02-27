"use client";

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
      className="rounded-xl bg-[#1DBFDD] px-6 py-3 font-medium text-white transition-colors hover:bg-[#0E8CAB]"
    >
      Reset Cookie Preferences
    </button>
  );
}
