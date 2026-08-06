"use client";

import type { KeyboardEvent, MouseEvent } from "react";

/**
 * Table rows open their record on click. Cells holding their own controls must
 * spread `stopRowActivation` so a menu or switch does not also open the record.
 */
export function rowActivationProps(open: () => void) {
  return {
    className: "cursor-pointer hover:bg-muted/70",
    onClick: open,
    onKeyDown: (event: KeyboardEvent<HTMLTableRowElement>) => {
      if (event.target !== event.currentTarget) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    },
    tabIndex: 0,
  };
}

export const stopRowActivation = {
  onClick: (event: MouseEvent) => event.stopPropagation(),
};
