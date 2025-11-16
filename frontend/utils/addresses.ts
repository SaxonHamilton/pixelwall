"use client";

export function normalizeAddress(address?: string | null) {
  return address ? address.toLowerCase() : "";
}

