"use client";

const FINGERPRINT_KEY = "user_fingerprint";

export function getFingerprint(): string {
  if (typeof window === "undefined") return "";

  let fingerprint = localStorage.getItem(FINGERPRINT_KEY);
  if (!fingerprint) {
    fingerprint = crypto.randomUUID();
    localStorage.setItem(FINGERPRINT_KEY, fingerprint);
  }
  return fingerprint;
}
