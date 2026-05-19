"use client";

import { useEffect } from "react";

export function PublicThemeReset() {
  useEffect(() => {
    document.documentElement.classList.remove("dark-premium");
  }, []);

  return null;
}
