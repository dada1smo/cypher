/** 1308843 → "1.3M words". */
export const formatWords = (n: number) => `${(n / 1e6).toFixed(1)}M words`;

/** 483975168 → "484 MB" (decimal megabytes, as iOS shows storage). */
export const formatSize = (bytes: number) => `${Math.round(bytes / 1e6)} MB`;
