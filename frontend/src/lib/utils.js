import { clsx } from "clsx";
// Import `clsx`, a utility for conditionally joining classNames.

import { twMerge } from "tailwind-merge";
// Import `twMerge`, a utility for merging conflicting Tailwind CSS classes.

export function cn(...inputs) {
  return twMerge(clsx(inputs));
  // Combines class names using `clsx` and resolves conflicts with `twMerge`.
}
