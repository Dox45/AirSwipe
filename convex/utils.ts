import React from "react";

export function generateUniqueCode(): string {
  const timestamp = Date.now().toString(36); // Base36 timestamp
  const randomPart = Math.random().toString(36).substring(2, 6); // 4-char random string
  return `${timestamp}-${randomPart}`; // Example: "lxk8hf-z3e9"
}
