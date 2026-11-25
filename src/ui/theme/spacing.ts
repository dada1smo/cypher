// 4-pt scale: spacing[5] = 20 is the screen side margin (docs/design/DESIGN.md §1, Medidas).
export const spacing = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 7: 28 } as const;

export const radius = { badge: 5, tab: 9, button: 12, field: 14, pill: 22 } as const;

/** Minimum touch target, in pt. */
export const touchTarget = 44;
