/**
 * Full-height admin tables scroll their own body so the surrounding page
 * chrome (toolbars, pagination) stays fixed. The scroll area owns both axes:
 * a separate horizontal scroll container would break the sticky header.
 */
export const tableLayout = {
  default: {
    root: "space-y-4",
    scrollArea: "",
    footer: "",
  },
  fullHeight: {
    root: "flex min-h-0 flex-1 flex-col gap-4",
    scrollArea: "min-h-0 flex-1 overflow-auto",
    footer: "shrink-0",
  },
} as const;

export function getTableLayout(fullHeight: boolean) {
  return fullHeight ? tableLayout.fullHeight : tableLayout.default;
}
