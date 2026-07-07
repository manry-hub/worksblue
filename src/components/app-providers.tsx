"use client";

import type { ReactNode } from "react";

export function AppProviders({ children }: { children: ReactNode }) {
  // Simplest provider since we removed Astryx. 
  // You can add React Contexts, TRPC providers, or ThemeProviders here in the future.
  return <>{children}</>;
}
