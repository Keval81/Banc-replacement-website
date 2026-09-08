"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { subscribeToNewsletter } from "@/lib/newsletter-subscribe";

export function NewsletterSignupBox() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email) return;
    setStatus("loading");
    const result = await subscribeToNewsletter(email);
    setMessage(result.message);
    setStatus(result.ok ? "success" : "error");
    if (result.ok) setEmail("");
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Enter your email"
          aria-label="Email address"
          className="flex-1 rounded-lg bg-white/10 px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-banc-sky"
        />
        <Button
          type="submit"
          disabled={status === "loading"}
          className="bg-banc-focus px-6 py-3 text-sm font-semibold text-white hover:bg-banc-sky-dark"
        >
          {status === "loading" ? "Sending…" : "Subscribe"}
        </Button>
      </div>
      {status === "success" && <p className="text-sm text-green-300" role="status">{message}</p>}
      {status === "error" && <p className="text-sm text-red-300" role="alert">{message}</p>}
    </form>
  );
}
